import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function VerifiedScreen() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Alert.alert('Email verified', 'Your email is verified. Please go back to the app and sign in.');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Email verified</Text>
        <Text style={styles.subtitle}>Your email has been verified. You can now sign in to continue.</Text>
        <TouchableOpacity style={styles.cta} onPress={() => router.replace('/auth/sign-in' as any)}>
          <Text style={styles.ctaText}>Go to Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { width: '100%', maxWidth: 340, backgroundColor: '#0f0f10', borderRadius: 16, borderWidth: 1, borderColor: '#1f1f22', padding: 18, alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  subtitle: { color: '#aab1b8', fontSize: 14, textAlign: 'center', marginBottom: 14 },
  cta: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center', width: '100%' },
  ctaText: { color: '#000', fontSize: 16, fontWeight: '800' },
});
