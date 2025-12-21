import { Stack } from "expo-router";
import React from "react";
import * as WebBrowser from "expo-web-browser";
import { StoreProvider } from "@/store";
import { View, StyleSheet, Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <StoreProvider>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </View>
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
