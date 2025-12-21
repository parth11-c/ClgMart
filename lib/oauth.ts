import React from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

// Helper to keep browser warm (Android)
export function useWarmUpBrowser() {
  React.useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

WebBrowser.maybeCompleteAuthSession();

function resolveRedirectUrl(): string | undefined {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return undefined;
    return `${window.location.origin}/auth/callback`;
  }
  // This automatically generates:
  // - exp://IP:PORT/--/auth/callback (in Development)
  // - travel://auth/callback (in Production)
  const url = Linking.createURL('/auth/callback');
  console.log('[OAuth] Redirect URL:', url);
  return url;
}

export async function startGoogleOAuth() {
  const redirectTo = resolveRedirectUrl();

  console.log('[OAuth] Starting Google Auth...');

  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    });
    if (error) throw error as any;
    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    } as any,
  });

  if (error) throw error as any;
  const url = (data as any)?.url as string | undefined;
  if (!url) throw new Error('No OAuth URL returned from Supabase');

  // Open the browser
  const res = await WebBrowser.openAuthSessionAsync(url, redirectTo ?? undefined);
  console.log('[OAuth] Browser Result:', res.type);

  // Handle the return
  if (res.type === 'success' && res.url) {
    const logUrl = res.url
      .replace(/code=[^&]+/, 'code=***')
      .replace(/access_token=[^&]+/, 'access_token=***')
      .replace(/refresh_token=[^&]+/, 'refresh_token=***');
    console.log('[OAuth] Success URL returned:', logUrl);

    try {
      const fullUrl = res.url;
      const parsed = Linking.parse(fullUrl);
      let queryParams = parsed.queryParams || {};

      // Robust extraction for both Query (?) and Fragment (#)
      // Some parsers lose the fragment, so we check the raw URL
      const getParam = (name: string) => {
        const regex = new RegExp(`[#?&]${name}=([^&]+)`);
        const match = fullUrl.match(regex);
        return match ? decodeURIComponent(match[1]) : undefined;
      };

      const code = queryParams.code as string || getParam('code');
      const accessToken = queryParams.access_token as string || getParam('access_token');
      const refreshToken = queryParams.refresh_token as string || getParam('refresh_token');

      if (accessToken || code) {
        console.log('[OAuth] Auth data detected in URL');
      }

      if (code) {
        console.log('[OAuth] Code found, exchanging for session...');
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        console.log('[OAuth] Code exchange successful');
      } else if (accessToken && refreshToken) {
        console.log('[OAuth] Tokens found directly, setting session...');
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });
        if (error) throw error;
        console.log('[OAuth] Session set successfully');
      } else {
        const errorParam = getParam('error');
        if (errorParam) {
          console.error('[OAuth] Auth Error from Provider:', errorParam, getParam('error_description'));
        } else {
          console.warn('[OAuth] No code or tokens found in Redirect URL. Raw URL:', fullUrl.split('#')[0] + '#MASKED');
        }
      }
    } catch (e) {
      console.error('[OAuth] Auth processing error:', e);
    }
  } else {
    console.log('[OAuth] Browser closed or cancelled:', res.type);
  }
}