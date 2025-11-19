# ClgMart Architecture



## Overview
ClgMart follows a mobile-first architecture using React Native (Expo) on the client side and Supabase for backend services, authentication, and database storage.

## Components

1. **React Native App (Expo)**
   - UI built in React Native components
   - Handles login, product listing, uploads, filtering, navigation

2. **Supabase Backend**
   - PostgreSQL Database
   - Supabase Auth (Google OAuth)
   - Supabase Storage (product images)
   - Supabase Edge Functions (optional business logic)

3. **Google OAuth**
   - Sign-in via Google
   - Allows only verified student email domains (e.g., .edu)

4. **Data Flow**
   - User requests → Expo App → Supabase Auth → Supabase DB
   - Images uploaded to Supabase Storage
   - Listing fetch via auto-generated Supabase APIs

## Flow Summary
Login → Session stored in Supabase → Fetch Listings → Upload Product Info → Supabase stores metadata and images → Students browse & connect.
