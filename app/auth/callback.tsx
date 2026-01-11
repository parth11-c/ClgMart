import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackScreen() {
  useEffect(() => {
    let mounted = true;

    const handleUrl = async (url: string) => {
      console.log('[Callback] Processing URL:', url.substring(0, 100) + '...');

      try {
        // Extract params from both query (?) and fragment (#)
        const getParam = (name: string) => {
          const regex = new RegExp(`[#?&]${name}=([^&]+)`);
          const match = url.match(regex);
          return match ? decodeURIComponent(match[1]) : undefined;
        };

        const code = getParam('code');
        const accessToken = getParam('access_token');
        const refreshToken = getParam('refresh_token');
        const error = getParam('error');

        console.log('[Callback] Found:', {
          hasCode: !!code,
          hasTokens: !!(accessToken && refreshToken),
          hasError: !!error
        });

        if (error) {
          console.error('[Callback] OAuth error:', error, getParam('error_description'));
          if (mounted) router.replace('/auth/sign-in' as any);
          return;
        }

        // Try code exchange first
        if (code) {
          console.log('[Callback] Exchanging code for session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.log('[Callback] Exchange error:', exchangeError.message);
          } else {
            console.log('[Callback] Code exchange successful');
          }
        }

        // Or set session directly if we have tokens
        else if (accessToken && refreshToken) {
          console.log('[Callback] Setting session with tokens...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (sessionError) {
            console.error('[Callback] Session error:', sessionError.message);
          } else {
            console.log('[Callback] Session set successfully');
          }
        }

        // Give Supabase a moment to update the session
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check final session state
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        console.log('[Callback] Final session check:', !!session?.user);

        if (session?.user) {
          console.log('[Callback] Redirecting to home');
          router.replace('/(tabs)/home' as any);
        } else {
          console.log('[Callback] No session, redirecting to sign-in');
          router.replace('/auth/sign-in' as any);
        }
      } catch (e: any) {
        console.error('[Callback] Error:', e);
        if (mounted) router.replace('/auth/sign-in' as any);
      }
    };

    (async () => {
      console.log('[Callback] Component mounted');

      // Get the URL that opened this screen
      const initial = await Linking.getInitialURL();
      console.log('[Callback] Initial URL:', initial ? 'present' : 'none');

      if (initial) {
        await handleUrl(initial);
      } else {
        // Fallback: check if already signed in
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('[Callback] Already signed in');
          router.replace('/(tabs)/home' as any);
        } else {
          console.log('[Callback] No URL and no session, waiting for link event...');
          // Wait a bit for the link event to fire
          setTimeout(() => {
            if (mounted) {
              console.log('[Callback] Timeout - redirecting to sign-in');
              router.replace('/auth/sign-in' as any);
            }
          }, 3000);
        }
      }
    })();

    const sub = Linking.addEventListener('url', ({ url }) => {
      console.log('[Callback] Deep link received');
      handleUrl(url);
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator color="#fff" />
        <Text style={styles.text}>Finishing sign in…</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' },
  card: { alignItems: 'center', gap: 10 },
  text: { color: '#aab1b8' }
});
