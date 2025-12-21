import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { fontSizes, responsiveValue, buttonDimensions, shadows } from "../lib/responsive";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store";
import { colors } from "@/lib/colors";

export default function Index() {
  const { theme } = useStore();
  const t = colors[theme];
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;
        if (session?.user) {
          router.replace("/(tabs)/home" as any);
        } else {
          setChecking(false);
        }
      } catch (e) {
        setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (checking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: t.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={t.text} size="large" />
        <Text style={{ color: t.textMuted, marginTop: 12 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      {/* Hero card */}
      <View style={styles.center}>
        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
          <Text style={[styles.logo, { color: t.text }]}>ClgMart</Text>
          <Text style={[styles.title, { color: t.text }]}>Buy & Sell on Campus</Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>Discover great deals from students near you. Simple. Safe. Fast.</Text>

          <TouchableOpacity style={[styles.cta, { backgroundColor: t.text }]} onPress={() => router.replace("/auth/sign-in" as any)}>
            <Text style={[styles.ctaText, { color: t.background }]}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  star: { position: 'absolute', backgroundColor: '#ffffff', borderRadius: 2, opacity: 0.8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: responsiveValue(20, 28) },
  card: { width: '100%', maxWidth: 320, borderRadius: 18, borderWidth: 1, paddingVertical: responsiveValue(22, 28), paddingHorizontal: responsiveValue(18, 24), ...shadows.medium, alignItems: 'center' },
  logo: { fontSize: responsiveValue(fontSizes.xl, 28), fontWeight: "800", marginBottom: responsiveValue(6, 8), letterSpacing: -0.5 },
  title: { fontSize: responsiveValue(fontSizes.lg, 22), fontWeight: "700", marginBottom: responsiveValue(6, 8), textAlign: 'center' },
  subtitle: { fontSize: responsiveValue(fontSizes.md, 14), textAlign: "center", marginBottom: responsiveValue(14, 18) },
  cta: { borderRadius: 12, paddingVertical: 14, paddingHorizontal: 22, alignItems: 'center', width: '100%', marginBottom: responsiveValue(10, 14) },
  ctaText: { fontSize: responsiveValue(fontSizes.md, 16), fontWeight: '800' },
  features: { width: '100%', marginTop: responsiveValue(10, 12) },
  feature: { color: '#9aa0a6', fontSize: responsiveValue(fontSizes.sm, 12), textAlign: 'center', marginVertical: 2 },
});
