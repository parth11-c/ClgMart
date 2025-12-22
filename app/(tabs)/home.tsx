import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Linking, TextInput, Image as RNImage, Platform } from "react-native";
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "@/store";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { User } from "@/store/types";
import { hapticManager } from "@/lib/sound";
import * as Haptics from 'expo-haptics';
import { colors } from "@/lib/colors";

type Post = ReturnType<typeof useStore>["posts"][number];

const PostCard = React.memo(({ item }: { item: Post }) => {
  const { getUser, theme } = useStore();
  const t = colors[theme];
  const [seller, setSeller] = React.useState<User | undefined>(undefined);

  React.useEffect(() => {
    let mounted = true;
    getUser(item.userId).then((u) => {
      if (mounted) setSeller(u);
    });
    return () => { mounted = false; };
  }, [item.userId, getUser]);

  const handleWhatsApp = () => {
    hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
    const message = `Hi, I'm interested in your product: ${item.title}`;
    const raw = seller?.phone?.trim();
    if (!raw) {
      Alert.alert('WhatsApp unavailable', 'The seller has not added a WhatsApp number yet.');
      return;
    }
    const digits = raw.replace(/\D+/g, '');
    if (!digits) {
      Alert.alert('Invalid number', 'The seller phone number appears invalid.');
      return;
    }
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch((e) => Alert.alert('Cannot open WhatsApp', e?.message || 'Please try again.'));
  };

  // Theme-aware card colors with more contrast
  const cardBg = theme === 'dark' ? '#141414' : '#f3f3f3ff';
  const cardBorder = theme === 'dark' ? '#2a2a2a' : '#d5d5d5';
  const imageBg = theme === 'dark' ? '#0a0a0a' : '#ffffff';
  const priceBadgeBg = theme === 'dark' ? '#1f3d1f' : '#e8f5e8';
  const priceColor = theme === 'dark' ? '#7ddc7a' : '#2d8a2d';

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}
      onPress={() => {
        hapticManager.trigger('selection');
        router.push(`/post/${item.id}` as any);
      }}
      activeOpacity={0.9}
    >
      <View style={[styles.imageWrap, { backgroundColor: imageBg }]}>
        <Image
          source={{ uri: item.imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="disk"
        />
        {item.status === 'sold' && (
          <View style={styles.soldBadgeAcrossImage}>
            <Text style={styles.soldTextAcrossImage}>SOLD</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>{item.title}</Text>

        <View style={styles.priceRow}>
          <View style={[styles.priceBadge, { backgroundColor: priceBadgeBg }]}>
            <Text style={[styles.priceText, { color: priceColor }]}>₹{item.price?.toFixed?.(0) ?? item.price}</Text>
          </View>
          {item.status !== 'sold' && (
            <TouchableOpacity
              onPress={handleWhatsApp}
              style={[styles.wpButton, { backgroundColor: theme === 'dark' ? '#1a3d1a' : '#dcf8dc' }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="logo-whatsapp" size={16} color={theme === 'dark' ? '#25D366' : '#128C7E'} />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.sellerRow, { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#e0e0e0' }]}>
          {seller?.avatar ? (
            <Image source={{ uri: seller.avatar }} style={styles.sellerAvatar} contentFit="cover" cachePolicy="disk" />
          ) : (
            <View style={[styles.sellerAvatarPlaceholder, { backgroundColor: theme === 'dark' ? '#333' : '#ccc' }]}>
              <Ionicons name="person" size={8} color={theme === 'dark' ? '#666' : '#999'} />
            </View>
          )}
          <Text style={[styles.sellerName, { color: theme === 'dark' ? '#777' : '#666' }]} numberOfLines={1}>{seller?.name || 'Seller'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function HomeScreen() {
  const { posts, theme } = useStore();
  const t = colors[theme];
  const insets = useSafeAreaInsets();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredPosts = React.useMemo(() => {
    if (!searchQuery.trim()) return posts;
    return posts.filter((p: any) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <PostCard item={item} />
  ), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={['left', 'right']}>
      {/* Minimal Search Button Area */}
      <View style={[styles.headerActionRow, { backgroundColor: t.background }]}>
        {!isSearching ? (
          <TouchableOpacity
            style={[styles.minimalSearchBtn, { backgroundColor: t.card, borderColor: theme === 'dark' ? '#1a1a1a' : t.borderSubtle }]}
            onPress={() => {
              hapticManager.trigger('selection');
              setIsSearching(true);
            }}
          >
            <Ionicons name="search" size={18} color={theme === 'dark' ? '#888' : t.textMuted} />
            <Text style={[styles.searchPlaceholderText, { color: theme === 'dark' ? '#666' : t.textMuted }]}>Search...</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.activeSearchContainer, { backgroundColor: t.background, borderBottomColor: t.borderSubtle }]}>
            <Ionicons name="search" size={18} color={t.primary} style={{ marginRight: 10 }} />
            <TextInput
              autoFocus
              placeholder="Search..."
              placeholderTextColor={t.textMuted}
              style={[styles.activeSearchInput, { color: t.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              onPress={() => {
                hapticManager.trigger('selection');
                setIsSearching(false);
                setSearchQuery("");
              }}
            >
              <Ionicons name="close-circle" size={18} color={theme === 'dark' ? '#666' : t.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {filteredPosts.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.text}>
            {searchQuery ? `No results for "${searchQuery}"` : "No products yet. Be the first to list an item!"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[styles.list, { paddingBottom: 20 }]}
          renderItem={renderItem}
          initialNumToRender={8}
          maxToRenderPerBatch={10}
          windowSize={11}
          removeClippedSubviews={Platform.OS === 'android'}
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: 250, // Approx card height
            offset: 250 * Math.floor(index / 2),
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  text: { textAlign: "center", fontSize: 14, maxWidth: '80%' },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  list: { paddingHorizontal: 16, paddingTop: 4 },
  gridRow: { justifyContent: 'space-between' },

  headerActionRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  minimalSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  searchPlaceholderText: {
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  activeSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderBottomWidth: 1,
    paddingHorizontal: 4,
  },
  activeSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },

  // Card Styles - Elegant Design with Shadows
  card: {
    width: '48%',
    borderRadius: 20,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
    // Elegant shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: { width: "100%", height: "100%" },

  cardBody: {
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontWeight: '800',
    fontSize: 13,
  },
  wpButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },

  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  sellerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  sellerAvatarPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },

  soldBadgeAcrossImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderColor: '#ff4d4d',
    borderWidth: 1.5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    zIndex: 10,
  },
  soldTextAcrossImage: {
    color: '#ff4d4d',
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 1,
  },
});
