import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking, Image as RNImage } from "react-native";
import { Image } from 'expo-image';
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "@/store";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@/store/types";
import { colors } from "@/lib/colors";

export default function UserProfileViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userPosts, getUser, currentUser, theme } = useStore();
  const t = colors[theme];
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = React.useState<User | undefined>(undefined);
  const isOwnProfile = id === currentUser.id;

  /* Mask details helper */
  const maskEmail = (email?: string) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!name || !domain) return email;
    const maskedName = name.length > 3 ? name.slice(0, 3) + '****' : name + '****';
    return `${maskedName}@${domain}`;
  };

  const formatPhone = (raw?: string) => {
    if (!raw) return '';
    const m = raw.match(/^(\+\d{1,2})(\d{3,14})$/);
    if (!m) return raw;
    const cc = m[1];
    const digits = m[2];
    if (cc === '+91' && digits.length === 10) {
      return `${cc} ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return raw;
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return '';
    if (isOwnProfile) return formatPhone(phone);
    const formatted = formatPhone(phone);
    const parts = formatted.split(' ');
    if (parts.length < 2) return '****' + formatted.slice(-4);
    const newParts = [...parts];
    if (newParts.length >= 3) {
      newParts[newParts.length - 2] = '****';
    } else {
      newParts[newParts.length - 1] = '****';
    }
    return newParts.join(' ');
  };

  if (!id) {
    return (
      <View style={[styles.center, { backgroundColor: t.background }]}>
        <Text style={[styles.muted, { color: t.textMuted }]}>No user specified.</Text>
      </View>
    );
  }

  const posts = userPosts(id);

  React.useEffect(() => {
    let mounted = true;
    getUser(id).then((u) => {
      if (mounted) setProfile(u);
    });
    return () => { mounted = false; };
  }, [id, getUser]);

  const handleWhatsApp = () => {
    const message = `Hi, I found your profile on ClgMart.`;
    const raw = profile?.phone?.trim();
    if (!raw) {
      Alert.alert('WhatsApp unavailable', 'This user has not added a WhatsApp number yet.');
      return;
    }
    const digits = raw.replace(/\D+/g, '');
    if (!digits) {
      Alert.alert('Invalid number', 'The user phone number appears invalid.');
      return;
    }
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch((err) => Alert.alert('Error', 'Could not open WhatsApp'));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <View style={[styles.headerCard, { backgroundColor: t.card, borderColor: t.border }]}>
        <View style={styles.header}>
          {profile?.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, { backgroundColor: t.background }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: t.text }]}>{profile?.name || 'User'}</Text>
            <View style={{ gap: 2 }}>
              {profile?.email && <Text style={[styles.sub, { color: t.textMuted }]}>{maskEmail(profile.email)}</Text>}
              {profile?.phone && <Text style={[styles.sub, { color: t.textMuted }]}>{maskPhone(profile.phone)}</Text>}
              {!profile?.email && !profile?.phone && <Text style={[styles.sub, { color: t.textMuted }]}>No contact info</Text>}
            </View>
          </View>
        </View>

        {/* Actions (match profile page but Edit -> Message) */}
        {!isOwnProfile && (
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: theme === 'dark' ? '#0f1b28' : '#f0f7ff', borderColor: theme === 'dark' ? '#2a5b86' : t.primary }]} onPress={() => router.push(`/message/${id}` as any)}>
              <Ionicons name="chatbubble-ellipses" size={16} color={t.primary} />
              <Text style={[styles.editBtnText, { color: t.primary }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.wpBtn, { backgroundColor: t.whatsapp, borderColor: theme === 'dark' ? '#199e4d' : '#2ecc71' }]} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={16} color={theme === 'dark' ? '#1f3124' : '#fff'} />
              <Text style={[styles.wpBtnText, { color: theme === 'dark' ? '#1f3124' : '#fff' }]}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={[styles.divider, { backgroundColor: t.borderSubtle, borderBottomColor: t.borderSubtle }]} />

      <Text style={[styles.section, { color: t.text }]}>Products</Text>
      {posts.length === 0 ? (
        <Text style={[styles.muted, { color: theme === 'dark' ? '#9aa0a6' : t.textMuted }]}>No posts yet.</Text>
      ) : (
        <FlatList
          key={'grid-2'}
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[styles.gridContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.gridItem, { backgroundColor: t.card, borderColor: t.border }]} onPress={() => router.push(`/post/${item.id}` as any)}>
              <Image source={{ uri: item.imageUri }} style={styles.gridImage} contentFit="cover" transition={200} />
              {item.status === 'sold' && (
                <View style={styles.soldBadgeSmall}>
                  <Text style={styles.soldTextSmall}>SOLD</Text>
                </View>
              )}
              <View style={styles.gridFooter}>
                <Text style={[styles.gridTitle, { color: t.text }]} numberOfLines={1}>{(item as any).title || 'Product'}</Text>
                {!!(item as any).price && (
                  <Text style={[styles.gridPrice, { color: t.success }]}>₹{Number((item as any).price).toFixed(0)}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  avatarImage: { width: 64, height: 64, borderRadius: 32, marginRight: 12 },
  name: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  sub: { fontSize: 13 },
  section: { fontSize: 16, fontWeight: "600", marginTop: 8, marginBottom: 6 },
  muted: { fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 8 },
  cardTitle: { fontWeight: "600", marginBottom: 4 },
  mutedSmall: { fontSize: 12 },
  actions: { gap: 10 },
  divider: { height: 1, borderBottomWidth: 1, marginVertical: 8 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, marginBottom: 6 },
  countBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  countBadgeText: { fontSize: 12, fontWeight: '700' },
  editBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  editBtnText: { fontWeight: '700' },
  gridContent: { paddingTop: 8 },
  gridRow: { justifyContent: 'space-between', marginBottom: 8 },
  gridItem: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    width: '49%',
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  gridImage: { width: '100%', aspectRatio: 1 },
  gridFooter: { paddingHorizontal: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  gridTitle: { fontSize: 12, flex: 1, marginRight: 6, fontWeight: '600' },
  gridPrice: { fontSize: 12, fontWeight: '800' },
  wpBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  wpBtnText: { fontWeight: '800' },
  soldBadgeSmall: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.85)', borderColor: '#ff4d4d', borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  soldTextSmall: { color: '#ff4d4d', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  showText: {
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
