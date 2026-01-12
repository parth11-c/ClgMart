import React from 'react';
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { supabase } from '@/lib/supabase';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '611547918208-vs6on405mveabih0lhonie8jp9384ib9.apps.googleusercontent.com', // Web client ID from Google Cloud Console
  iosClientId: '611547918208-vs6on405mveabih0lhonie8jp9384ib9.apps.googleusercontent.com',
  offlineAccess: false,
});

export function useWarmUpBrowser() {
  // Not needed for native sign-in, but kept for compatibility
  React.useEffect(() => { }, []);
}

export async function startGoogleOAuth() {
  console.log('[OAuth] Starting native Google Sign-In...');

  try {
    // Check if device supports Google Play Services (Android)
    await GoogleSignin.hasPlayServices();
    console.log('[OAuth] Play Services available');

    // Sign in and get user info + ID token
    const userInfo = await GoogleSignin.signIn();
    console.log('[OAuth] User signed in:', userInfo.data?.user.email);

    // Get the ID token
    const tokens = await GoogleSignin.getTokens();
    const idToken = tokens.idToken;

    if (!idToken) {
      throw new Error('No ID token received from Google');
    }

    console.log('[OAuth] ID token received, signing in to Supabase...');

    // Sign in to Supabase using the Google ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    if (error) {
      console.error('[OAuth] Supabase sign-in error:', error.message);
      throw error;
    }

    console.log('[OAuth] Successfully signed in to Supabase');
    console.log('[OAuth] User:', data.user?.email);

    return { success: true };
  } catch (error: any) {
    console.error('[OAuth] Error:', error);

    // Handle specific error cases
    if (error.code === 'SIGN_IN_CANCELLED') {
      console.log('[OAuth] User cancelled sign-in');
      return { success: false, cancelled: true };
    }

    if (error.code === 'IN_PROGRESS') {
      console.log('[OAuth] Sign-in already in progress');
      return { success: false, error: 'Sign-in already in progress' };
    }

    if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
      console.log('[OAuth] Play Services not available');
      return { success: false, error: 'Google Play Services not available' };
    }

    throw error;
  }
}

// Sign out from Google
export async function signOutGoogle() {
  try {
    await GoogleSignin.signOut();
    console.log('[OAuth] Signed out from Google');
  } catch (error) {
    console.error('[OAuth] Error signing out:', error);
  }
}