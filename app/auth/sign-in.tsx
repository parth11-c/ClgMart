import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { fontSizes, responsiveValue, buttonDimensions, shadows } from "../../lib/responsive";
import { useStore } from "@/store";
import { supabase } from "@/lib/supabase";
import { Ionicons } from '@expo/vector-icons';
import { startGoogleOAuth } from "@/lib/oauth";

export default function SignInScreen() {
  const { signIn } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already signed in (or after OAuth completes), go to home
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) router.replace("/(tabs)/home" as any);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) router.replace("/(tabs)/home" as any);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleGoogleAuth = async () => {
    try {
      await startGoogleOAuth();
    } catch (e: any) {
      Alert.alert('OAuth error', e?.message || 'Could not start Google sign-in');
    }
  };

  const validateEmail = (value: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

  const handleSignIn = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill in all required fields");
    if (!validateEmail(email)) return Alert.alert("Error", "Please enter a valid email address");
    if (password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters long");

    try {
      setLoading(true);
      const res = await signIn(email, password);
      setLoading(false);
      if (!res.ok) return Alert.alert("Sign in failed", res.reason);
      router.replace("/(tabs)/home" as any);
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Error", e?.message ?? "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.centerWrap}>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.logo}>ClgMart</Text>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
              </View>

              {/* Email sign in */}
              <View style={styles.form}>
                <View style={styles.inputBlock}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#7a7a7a"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.inputBlock}>
                  <View style={styles.passwordRow}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Password"
                      placeholderTextColor="#7a7a7a"
                      value={password}
                      onChangeText={setPassword}
                      autoCapitalize="none"
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((s) => !s)}>
                      <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignIn} disabled={loading}>
                  {loading ? <ActivityIndicator color="#000" /> : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => router.replace("/auth/sign-up" as any)}>
                  <Text style={styles.linkText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* Bottom social (outside card) */}
            <View style={styles.bottomSocialWrap}>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity style={styles.googleOutlineBtn} onPress={handleGoogleAuth}>
                <Ionicons name="logo-google" size={18} color="#4285F4" style={{ marginRight: 10 }} />
                <Text style={styles.googleOutlineText}>Login with Google</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  kav: { flex: 1, paddingHorizontal: responsiveValue(16, 24), paddingVertical: responsiveValue(10, 20) },
  scroll: { flexGrow: 1 },
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: responsiveValue(20, 40) },
  card: { width: '100%', maxWidth: 420, backgroundColor: '#0f0f10', borderRadius: 16, borderWidth: 1, borderColor: '#1f1f22', padding: responsiveValue(18, 24), ...shadows.medium },
  header: { alignItems: "center", marginBottom: responsiveValue(18, 24) },
  logo: { fontSize: responsiveValue(fontSizes.xl, 26), fontWeight: "800", color: "#fff", marginBottom: responsiveValue(6, 10), letterSpacing: -0.5 },
  title: { fontSize: responsiveValue(fontSizes.lg, 22), color: "#fff", fontWeight: "700", marginBottom: responsiveValue(4, 6) },
  subtitle: { fontSize: responsiveValue(fontSizes.md, 14), color: "#9aa0a6", textAlign: "center" },
  socialWrap: { gap: 10, marginBottom: responsiveValue(12, 16) },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  googleIcon: { fontSize: 16 },
  googleText: { color: '#111827', fontWeight: '800' },
  auth0Btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#111', borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#333' },
  auth0Icon: { fontSize: 16 },
  auth0Text: { color: '#fff', fontWeight: '800' },
  bottomSocialWrap: { width: '100%', maxWidth: 420, marginTop: 12, paddingHorizontal: responsiveValue(16, 24) },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1f1f22' },
  dividerText: { color: '#6b7280', fontSize: 12, fontWeight: '700' },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12, backgroundColor: 'transparent', marginBottom: 10 },
  outlineIcon: { fontSize: 16 },
  outlineText: { color: '#e5ecff', fontWeight: '800' },
  googleOutlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingVertical: 12, backgroundColor: '#ffffff' },
  googleOutlineText: { color: '#1f2937', fontWeight: '800' },
  form: { marginBottom: responsiveValue(10, 16) },
  inputBlock: { marginBottom: responsiveValue(12, 16) },
  label: { fontSize: responsiveValue(fontSizes.sm, 12), color: "#a6b1b8", fontWeight: "600", marginBottom: responsiveValue(6, 8) },
  input: { backgroundColor: "#121417", borderWidth: 1, borderColor: "#1f2329", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: "#fff", fontSize: responsiveValue(fontSizes.md, 15) },
  passwordRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#121417", borderWidth: 1, borderColor: "#1f2329", borderRadius: 12 },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, color: "#fff", fontSize: responsiveValue(fontSizes.md, 15) },
  eyeButton: { paddingHorizontal: responsiveValue(12, 16), paddingVertical: 12 },
  eyeIcon: { fontSize: responsiveValue(16, 18), color: "#bbb" },
  button: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 14, alignItems: "center", width: '100%' },
  buttonDisabled: { backgroundColor: "#2a2a2a" },
  buttonText: { color: "#000", fontSize: responsiveValue(fontSizes.md, 16), fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: responsiveValue(12, 16) },
  footerText: { color: "#9aa0a6", fontSize: responsiveValue(fontSizes.sm, 12) },
  linkText: { color: "#fff", fontSize: responsiveValue(fontSizes.sm, 12), fontWeight: "700", marginLeft: 4 },
});
