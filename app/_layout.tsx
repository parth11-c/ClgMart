import { Stack } from "expo-router";
import React from "react";
import * as WebBrowser from "expo-web-browser";
import { StoreProvider } from "@/store";
import { View, StyleSheet, Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

import { colors } from "@/lib/colors";
import { useStore } from "@/store";

function RootInner() {
  const { theme } = useStore();
  const t = colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <View style={styles.contentContainer}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <RootInner />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? 380 : "100%",
    overflow: "hidden",
    ...(Platform.OS === "web"
      ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      }
      : {}),
  },
});
