import { Stack } from "expo-router";
import React from "react";
import * as WebBrowser from "expo-web-browser";
import { StoreProvider } from "@/store";

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <StoreProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </StoreProvider>
  );
}
