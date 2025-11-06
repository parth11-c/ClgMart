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
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) router.replace('/(tabs)/home' as any);
        else router.replace('/auth/sign-in' as any);
      } catch (e: any) {
        if (!mounted) return;
        Alert.alert('Auth error', e?.message || 'Could not complete sign-in');
        router.replace('/auth/sign-in' as any);
      }
    };

    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) await handleUrl(initial);
      else {
        // Fallback: check session directly
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) router.replace('/(tabs)/home' as any);
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
