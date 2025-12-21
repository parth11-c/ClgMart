import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking, Platform, Image as RNImage } from "react-native";
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
// Removed SafeAreaView and insets
import { useStore } from "@/store";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { hapticManager } from "@/lib/sound";
import * as Haptics from 'expo-haptics';
import { colors } from "@/lib/colors";

export default function ProfileScreen() {
  const { currentUser, userPosts, deletePost, theme } = useStore();
  const t = colors[theme];
  const posts = userPosts(currentUser.id);

  /* ... skipping formatPhone ... */

  const confirmDelete = (postId: string) => {
    Alert.alert(
      'Delete sell',
      'Are you sure you want to delete this sell? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            const res = await deletePost(postId);
            if (res.ok) {
              hapticManager.trigger(Haptics.ImpactFeedbackStyle.Heavy);
            } else {
              Alert.alert('Error', res.reason || 'Failed to delete sell.');
            }
          }
        },
      ]
    );
  };

  const openWhatsApp = async () => {
    const raw = currentUser?.phone || '';
    const digits = raw.replace(/\D+/g, '');
    if (!digits) {
      Alert.alert('Phone required', 'Add your WhatsApp number in profile to chat.');
      return;
    }
    const url = `https://wa.me/${digits}`;
    try {
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Cannot open WhatsApp', e.message || 'Please ensure WhatsApp is installed or try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      <View style={styles.header}>
        {currentUser?.avatar ? (
          <Image source={{ uri: currentUser.avatar }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatar, { backgroundColor: t.card }]} />
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: t.text }]}>{currentUser.name}</Text>
          {currentUser.email && <Text style={{ color: t.textMuted, fontSize: 13, marginTop: 2 }}>{currentUser.email}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => {
            hapticManager.trigger('selection');
            router.push('/settings' as any);
          }}
          style={{ padding: 8 }}
        >
          <Ionicons name="settings-outline" size={24} color={t.text} />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: theme === 'dark' ? '#0f1b28' : '#f0f7ff', borderColor: theme === 'dark' ? '#2a5b86' : t.primary }]}
          onPress={() => {
            hapticManager.trigger('selection');
            router.push('/profile/edit' as any);
          }}
        >
          <Ionicons name="create-outline" size={16} color={t.primary} />
          <Text style={[styles.editBtnText, { color: t.primary }]}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.wpBtn, { backgroundColor: t.whatsapp, borderColor: theme === 'dark' ? '#199e4d' : '#2ecc71' }]}
          onPress={() => {
            hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
            openWhatsApp();
          }}
        >
          <Ionicons name="logo-whatsapp" size={16} color={theme === 'dark' ? '#1f3124' : '#fff'} />
          <Text style={[styles.wpBtnText, { color: theme === 'dark' ? '#1f3124' : '#fff' }]}>WhatsApp</Text>
        </TouchableOpacity>
      </View>

      {(!currentUser?.avatar || !currentUser?.name || currentUser?.name === 'User' || !currentUser?.phone) && (
        <TouchableOpacity style={styles.prompt} onPress={() => router.push('/profile/edit' as any)}>
          <Ionicons name="information-circle-outline" size={16} color="#ffd166" />
          <Text style={styles.promptText}>Complete your profile to build trust. Add your name, profile photo, and WhatsApp number.</Text>
        </TouchableOpacity>
      )}

      {/* Contact number hidden as requested */}

      <Text style={[styles.section, { color: t.text }]}>Your products</Text>
      {posts.length === 0 ? (
        <Text style={[styles.muted, { color: theme === 'dark' ? '#9aa0a6' : t.textMuted }]}>No sells yet.</Text>
      ) : (
        <FlatList
          key={'grid-2'}
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[styles.gridContent, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.gridItem, { backgroundColor: t.card, borderColor: t.borderSubtle }]}
              onPress={() => {
                hapticManager.trigger('selection');
                router.push(`/post/${item.id}` as any);
              }}
              onLongPress={() => {
                hapticManager.trigger(Haptics.ImpactFeedbackStyle.Heavy);
                confirmDelete(item.id);
              }}
            >
              <Image source={{ uri: item.imageUri }} style={styles.gridImage} contentFit="cover" transition={200} />
              {item.status === 'sold' && (
                <View style={[styles.soldBadgeSmall, { top: 6, left: 6, right: undefined }]}>
                  <Text style={styles.soldTextSmall}>SOLD</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
                  confirmDelete(item.id);
                }}
                hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
              >
                <View style={[styles.deleteBtnBg, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                  <Ionicons name="close" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12, paddingTop: 1 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 6, marginTop: 16 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  name: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  sub: { opacity: 0.7 },
  section: { fontSize: 16, fontWeight: "600", marginTop: 8, marginBottom: 6 },
  muted: { opacity: 0.6 },
  card: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 8 },
  cardTitle: { fontWeight: "600", marginBottom: 4 },
  mutedSmall: { fontSize: 12 },
  actions: { marginBottom: 16, gap: 10 },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  editBtnText: { fontWeight: '700' },
  phoneRow: { marginBottom: 14 },
  contactCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  countBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  countBadgeText: { fontSize: 12, fontWeight: '700' },
  phonePill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderWidth: 1, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, marginTop: 6 },
  phoneText: { fontSize: 13, fontWeight: '600' },
  wpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  wpBtnText: { fontWeight: '800' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', backgroundColor: '#c0392b', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#9e2f23' },
  logoutBtnText: { color: '#fff', fontWeight: '800' },
  deleteAccBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', backgroundColor: '#8b0000', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#5e0000' },
  deleteAccBtnText: { color: '#fff', fontWeight: '800' },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#161616', borderWidth: 1, borderColor: '#222', padding: 10, borderRadius: 10, marginBottom: 8 },
  promptText: { color: '#ddd', flex: 1, fontSize: 13 },
  gridContent: { paddingTop: 8 },
  gridRow: { justifyContent: 'space-between', marginBottom: 8 },
  gridItem: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    width: '49%',
    aspectRatio: 1,
  },
  gridImage: { width: '100%', height: '100%' },
  deleteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  deleteBtnBg: {
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  soldBadgeSmall: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.85)', borderColor: '#ff4d4d', borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  soldTextSmall: { color: '#ff4d4d', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
});
