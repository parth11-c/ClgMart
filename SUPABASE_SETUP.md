# Supabase OAuth Configuration for Mobile

The issue of redirecting to the website instead of the app occurs because **Supabase needs to whitelist your specific Redirect URL**.

## 1. Find your Redirect URL
Since you are using **Expo Go**, your redirect URL depends on your IP address. 
Run this command in a separate terminal to see your current URL:
```bash
npx expo start
```
Look for the URL under `> Metro waiting on ...` (e.g., `exp://192.168.1.35:8081`).

Your Redirect URL will be:
**`exp://192.168.1.35:8081/--/auth/callback`**
*(Replace `192.168.1.35` with your actual IP shown in the terminal)*

## 2. Update Supabase Dashboard
1. Go to your **Supabase Dashboard** > **Authentication** > **URL Configuration**.
2. Scroll down to **Redirect URLs**.
3. Click **Add URL**.
4. Paste the URL from step 1 (e.g., `exp://192.168.1.35:8081/--/auth/callback`).
5. **Also Add:** `travel://auth/callback` (This ensures it works when you build the standalone app later).
6. Click **Save**.

## 3. Test Again
1. Restart your app (`r` in terminal).
2. Tap "Login with Google".
3. It should now redirect back to the app!
