import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

function resolveRedirectUrl(): string | undefined {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') return undefined;
    return `${window.location.origin}/auth/callback`;
  }
  return Linking.createURL('/auth/callback');
}

export async function startGoogleOAuth() {
  const redirectTo = resolveRedirectUrl();

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
  const res = await WebBrowser.openAuthSessionAsync(url, redirectTo ?? undefined);
  if (res.type === 'success' && res.url) {
    try {
      const parsed = Linking.parse(res.url);
      const code = (parsed.queryParams?.code as string) || '';
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
      }
    } catch (e) {
      // swallow; sign-in screen listener will handle lack of session
    }
  }
}