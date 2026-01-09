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
      try {
        const parsed = Linking.parse(url);
        const code = (parsed.queryParams?.code as string) || '';

        // If we have a code, try to exchange it. 
        // We suppress errors here because lib/oauth.ts might have already exchanged it.
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) console.log('Callback exchange error (might be duplicate):', error.message);
        }

        // Check the session state
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          router.replace('/(tabs)/home' as any);
        } else {
          // If no session yet, wait a moment or redirect to sign-in
          setTimeout(async () => {
            const { data: { session: delayedSession } } = await supabase.auth.getSession();
            if (delayedSession?.user) {
              router.replace('/(tabs)/home' as any);
            } else {
              router.replace('/auth/sign-in' as any);
            }
          }, 1000);
        }
      } catch (e: any) {
        console.warn('Callback error:', e);
        if (mounted) router.replace('/auth/sign-in' as any);
      }
    };

    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) await handleUrl(initial);
      else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) router.replace('/(tabs)/home' as any);
        else {
          // No URL and no session found initially? Wait for listener or redirect
        }
      }
    })();

    const sub = Linking.addEventListener('url', ({ url }) => { handleUrl(url); });
    return () => { mounted = false; sub.remove(); };
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
