import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Linking, Alert, Image as RNImage } from "react-native";
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useStore } from "@/store";
import { Ionicons } from '@expo/vector-icons';
import { User } from "@/store/types";
import { hapticManager } from "@/lib/sound";
import * as Haptics from 'expo-haptics';
import { colors } from "@/lib/colors";

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPost, getUser, currentUser, updatePostStatus, theme } = useStore();
  const t = colors[theme];
  const post = id ? getPost(id) : undefined;
  const isOwnPost = post?.userId === currentUser.id;
  const insets = useSafeAreaInsets();

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [seller, setSeller] = React.useState<User | undefined>(undefined);

  React.useEffect(() => {
    let mounted = true;
    if (post?.userId) {
      getUser(post.userId).then(u => {
        if (mounted) setSeller(u);
      });
    }
    return () => { mounted = false; };
  }, [post?.userId, getUser]);

  const formatPhone = (raw?: string) => {
    if (!raw) return '';
    const m = raw.match(/^(\+\d{1,2})(\d{3,14})$/);
    if (!m) return raw;
    const cc = m[1];
    const digits = m[2];
    if (cc === '+91' && digits.length === 10) {
      return `${cc} ${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    if (cc === '+1' && digits.length === 10) {
      return `${cc} ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
    const parts: string[] = [];
    let rest = digits;
    while (rest.length > 4) {
      parts.push(rest.slice(0, 3));
      rest = rest.slice(3);
    }
    parts.push(rest);
    return `${cc} ${parts.join(' ')}`.trim();
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return '';
    if (isOwnPost) return formatPhone(phone);
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

  if (!post) {
    return (
      <View style={[styles.center, { backgroundColor: t.background }]}>
        <Text style={[styles.muted, { color: t.textMuted }]}>Product not found.</Text>
      </View>
    );
  }

  const handleShare = async () => {
    const message = `Hi, I'm interested in your product: ${post.title}`;
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

  const handleContactSeller = () => {
    const phoneNumber = seller?.phone?.replace(/\s+/g, '');
    if (!phoneNumber) {
      Alert.alert('No phone number', 'The seller has not added a phone number yet.');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in your product: ${post.title}`;
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

  const toggleSold = async () => {
    if (!post) return;
    const newStatus = post.status === 'sold' ? 'active' : 'sold';
    const confirmMsg = newStatus === 'sold'
      ? 'Mark this item as sold? It will still be visible but buyers will know it is no longer available.'
      : 'Mark this item as available again?';

    Alert.alert(
      newStatus === 'sold' ? 'Mark as Sold' : 'Mark as Available',
      confirmMsg,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const res = await updatePostStatus(post.id, newStatus);
            if (!res.ok) Alert.alert('Error', res.reason);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: post?.imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.imageOverlay} />

          {/* Top icon bar over image */}
          <View style={styles.topImageBar}>
            <TouchableOpacity
              onPress={() => {
                hapticManager.trigger('selection');
                router.back();
              }}
              style={styles.circleIconBtn}
            >
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </TouchableOpacity>
            {!isOwnPost && post.status !== 'sold' && (
              <TouchableOpacity
                onPress={() => {
                  hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
                  handleShare();
                }}
                style={styles.circleIconBtn}
              >
                <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          {/* Big SOLD overlay */}
          {post.status === 'sold' && (
            <View style={styles.soldOverlayBig}>
              <View style={styles.soldStamp}>
                <Text style={styles.soldStampText}>SOLD</Text>
              </View>
            </View>
          )}
          {/* Floating price badge */}
          <View style={[styles.priceBadge, { backgroundColor: t.background + 'cc' }]}>
            <Text style={[styles.priceBadgeText, { color: t.text }]}>₹{post.price?.toFixed(0) || '0'}</Text>
          </View>
          {/* Image Pagination Dots */}
          <View style={styles.imagePagination}>
            {[1, 2, 3].map((_: number, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.paginationDot,
                  idx === activeImageIndex ? styles.paginationDotActive : undefined,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productHeader}>
          <View>
            <Text style={[styles.title, { color: t.text }]} numberOfLines={2}>{post.title}</Text>
            <Text style={[styles.category, { color: theme === 'dark' ? '#a6b1b8' : t.textMuted }]}>{post.category || 'General'}</Text>
          </View>
        </View>

        {/* Price and chips */}
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: t.text }]}>₹{post.price?.toFixed(2) || '0.00'}</Text>
          <View style={styles.chipsRow}>
            {post.condition ? (
              <View style={[styles.chip, { backgroundColor: t.success + '15' }]}><Text style={[styles.chipText, { color: t.success }]}>{post.condition}</Text></View>
            ) : null}
            {post.category ? (
              <View style={[styles.chipSecondary, { backgroundColor: t.card, borderColor: t.border }]}><Text style={[styles.chipSecondaryText, { color: t.textMuted }]}>{post.category}</Text></View>
            ) : null}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Description */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Description</Text>
          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
            <Text style={[styles.description, { color: t.textMuted }]}>
              {post.description || 'No description provided.'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: t.borderSubtle }]} />

        {/* Seller Info */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Seller</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.sellerCard, { backgroundColor: t.card, borderColor: t.border }]}
            onPress={() => {
              hapticManager.trigger('selection');
              router.push(`/profile/${post.userId}` as any);
            }}
          >
            {seller?.avatar ? (
              <Image source={{ uri: seller.avatar }} style={styles.sellerAvatarImage} contentFit="cover" />
            ) : (
              <View style={[styles.sellerAvatar, { backgroundColor: t.background }]}>
                <Ionicons name="person" size={24} color={t.textMuted} />
              </View>
            )}
            <View style={styles.sellerDetails}>
              <Text style={[styles.sellerName, { color: t.text }]}>{seller?.name || 'Seller'}</Text>
              <Text style={[styles.sellerSub, { color: t.textMuted }]}>{maskPhone(seller?.phone) || 'WhatsApp not added'}</Text>
            </View>
            <View style={[styles.viewProfileBtn, { backgroundColor: theme === 'dark' ? '#0a0a0a' : t.background, borderColor: theme === 'dark' ? '#1f2329' : t.borderSubtle }]}>
              <Ionicons name="chevron-forward" size={18} color={theme === 'dark' ? '#a6b1b8' : t.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Owner Controls */}
        {isOwnPost && (
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Manage Listing</Text>
            <TouchableOpacity
              style={[
                styles.soldToggleBtn,
                { borderColor: post.status === 'sold' ? (theme === 'dark' ? '#555' : t.border) : t.danger },
                post.status === 'sold' ? { backgroundColor: theme === 'dark' ? '#333' : t.card } : undefined
              ]}
              onPress={() => {
                hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
                toggleSold();
              }}
            >
              <Ionicons
                name={post.status === 'sold' ? "checkmark-circle" : "close-circle-outline"}
                size={20}
                color={post.status === 'sold' ? t.success : t.danger}
              />
              <Text style={[
                styles.soldToggleText,
                { color: post.status === 'sold' ? (theme === 'dark' ? '#fff' : t.text) : t.danger }
              ]}>
                {post.status === 'sold' ? "Mark as Available" : "Mark as Sold"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muted: {
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.35)'
  },
  topImageBar: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  circleIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  priceBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  priceBadgeText: { fontWeight: '800' },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
  },
  shareButton: {
    padding: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    marginRight: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipSecondary: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipSecondaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  sectionContainer: {
    marginTop: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  sellerDetails: {
    flex: 1,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  sellerAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  sellerSub: {
    fontSize: 12,
  },
  sellerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  sellerMetaText: {
    fontSize: 12,
  },
  viewProfileBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sellerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  soldOverlayBig: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldStamp: {
    borderWidth: 4,
    borderColor: '#ff4d4d',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    transform: [{ rotate: '-15deg' }],
  },
  soldStampText: {
    color: '#ff4d4d',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
  },
  soldToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  soldToggleText: {
    fontWeight: '800',
    fontSize: 16,
  },
  showText: {
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
