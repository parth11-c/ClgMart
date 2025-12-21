import React from "react";
import { View, Text, StyleSheet, Dimensions, TextInput, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useStore } from "@/store";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withDelay,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolation
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.63;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

type Post = {
  id: string;
  title: string;
  imageUri: string;
  status: string;
  price?: number;
  category?: string;
};

function AnimatedCard({
  post,
  index,
  onSwipeLeft,
  onSwipeRight
}: {
  post: Post;
  index: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Animated properties for stack position - more prominent deck
  const stackScale = useSharedValue(1 - index * 0.06);
  const stackTranslateY = useSharedValue(index * 22);
  const stackOpacity = useSharedValue(index === 0 ? 1 : 0.95 - index * 0.1);

  React.useEffect(() => {
    stackScale.value = withSpring(1 - index * 0.06);
    stackTranslateY.value = withSpring(index * 22);
    stackOpacity.value = withSpring(index === 0 ? 1 : 0.95 - index * 0.1);
  }, [index]);

  const gesture = Gesture.Pan()
    .enabled(index === 0)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = event.translationX / 15;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const isRight = event.translationX > 0;
        translateX.value = withTiming(isRight ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5, { duration: 300 });
        if (isRight) {
          runOnJS(onSwipeRight)();
        } else {
          runOnJS(onSwipeLeft)();
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + stackTranslateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: stackScale.value }
      ],
      opacity: stackOpacity.value,
      zIndex: 100 - index,
    };
  });

  const leftStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -30], [0.8, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-SWIPE_THRESHOLD, -30], [1, 0.5], Extrapolation.CLAMP) }]
  }));

  const rightStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [30, SWIPE_THRESHOLD], [0, 0.8], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [30, SWIPE_THRESHOLD], [0.5, 1], Extrapolation.CLAMP) }]
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.cardInner}>
          <Image
            source={{ uri: post.imageUri }}
            style={styles.cardImage}
            contentFit="cover"
          />
          {/* Reaction Stamps */}
          <Animated.View style={[styles.stampContainer, styles.stampLeft, leftStampStyle]}>
            <Text style={styles.stampTextLeft}>SKIP</Text>
          </Animated.View>
          <Animated.View style={[styles.stampContainer, styles.stampRight, rightStampStyle]}>
            <Text style={styles.stampTextRight}>OPEN</Text>
          </Animated.View>
          {post.status === 'sold' && (
            <View style={styles.soldBadgeSmall}>
              <Text style={styles.soldTextSmall}>SOLD</Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle} numberOfLines={1}>{post.title}</Text>
              {post.price !== undefined && (
                <Text style={styles.cardPrice}>₹{post.price}</Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.cardMeta}>{post.category || 'General'}</Text>
              <Ionicons name="heart" size={20} color="#ff4d4d" style={{ opacity: 0.1 }} />
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const Sparkle = ({ delay, x, y }: { delay: number; x: number; y: number }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    // Twinkle and move up
    opacity.value = withDelay(delay, withRepeat(withSequence(
      withTiming(0.6, { duration: 1500 }),
      withTiming(0, { duration: 1500 })
    ), -1));

    scale.value = withDelay(delay, withRepeat(withSequence(
      withTiming(1, { duration: 1500 }),
      withTiming(0.4, { duration: 1500 })
    ), -1));

    translateY.value = withDelay(delay, withRepeat(
      withTiming(-100, { duration: 3000 }),
      -1,
      false
    ));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    left: x,
    top: y,
  }));

  return (
    <Animated.View style={[styles.sparkle, animatedStyle]}>
      <Ionicons name="sparkles" size={10} color="#ffd166" />
    </Animated.View>
  );
};

const SparkleBackground = () => {
  const sparkles = React.useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 3000,
      x: Math.random() * SCREEN_WIDTH,
      y: (SCREEN_HEIGHT * 0.2) + (Math.random() * (SCREEN_HEIGHT * 0.6)),
    }));
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {sparkles.map((s) => (
        <Sparkle key={s.id} delay={s.delay} x={s.x} y={s.y} />
      ))}
    </View>
  );
};

const TopSwipeGuide = () => {
  const opacity = useSharedValue(0.15);
  React.useEffect(() => {
    opacity.value = withRepeat(withTiming(0.4, { duration: 1200 }), -1, true);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.topGuideContainer}>
      <Animated.View style={[styles.guideIndicator, pulseStyle]}>
        <Ionicons name="chevron-back" size={14} color="#ff4d4d" />
        <Text style={styles.guideText}>Skip</Text>
      </Animated.View>
      <View style={styles.guideSpacer} />
      <Animated.View style={[styles.guideIndicator, pulseStyle]}>
        <Text style={styles.guideText}>Open</Text>
        <Ionicons name="chevron-forward" size={14} color="#7ddc7a" />
      </Animated.View>
    </View>
  );
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { posts } = useStore();
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [visiblePosts, setVisiblePosts] = React.useState<Post[]>([]);

  React.useEffect(() => {
    const randomized = posts
      .filter(p => !!p && p.status !== 'inactive')
      .map(p => ({
        id: p.id,
        title: p.title,
        imageUri: p.imageUri,
        status: p.status,
        price: p.price,
        category: p.category
      }))
      .sort(() => Math.random() - 0.5);
    setVisiblePosts(randomized as Post[]);
    setCurrentIndex(0);
  }, [posts]);

  const handleSwipeLeft = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    const currentPost = visiblePosts[currentIndex];
    if (currentPost) {
      router.push(`/post/${currentPost.id}` as any);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 600);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <TopSwipeGuide />
        <SparkleBackground />
        <View style={styles.cardStackContainer}>
          {visiblePosts.length === 0 || currentIndex >= visiblePosts.length ? (
            <View style={styles.emptyStack}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="sparkles-outline" size={48} color="#ffd166" />
              </View>
              <Text style={styles.emptyTitle}>End of the Stack!</Text>
              <Text style={styles.emptySubtitle}>You've seen everything we found for now. Check back later for more!</Text>
              <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                <Ionicons name="refresh" size={18} color="#000" />
                <Text style={styles.resetBtnText}>Refresh Discover</Text>
              </TouchableOpacity>
            </View>
          ) : (
            visiblePosts.slice(currentIndex, currentIndex + 3).reverse().map((post, sliceIdx, arr) => {
              // top card is index 0 in the swipe logic
              const relativeIndex = (arr.length - 1) - sliceIdx;
              return (
                <AnimatedCard
                  key={post.id}
                  post={post}
                  index={relativeIndex}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                />
              );
            })
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020202" },
  cardStackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -30, // Shifting the stack up so it grows from above
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 28,
  },
  cardInner: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    // noticeable border for deck effect
    borderWidth: 2,
    borderColor: '#222',
  },
  cardImage: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardInfo: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: -2,
    // minimal shadow on info part
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  cardPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ff4d4d',
  },
  cardMeta: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '600',
  },
  soldBadgeSmall: {
    position: 'absolute',
    top: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderColor: '#ff4d4d',
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  soldTextSmall: {
    color: '#ff4d4d',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
  emptyStack: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  emptyTitle: { color: "#fff", fontSize: 26, fontWeight: "900", textAlign: 'center' },
  emptySubtitle: { color: "#555", fontSize: 16, marginTop: 12, textAlign: 'center', lineHeight: 22 },
  resetBtn: {
    marginTop: 32,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 16,
  },
  resetBtnText: { color: '#000', fontWeight: '800', fontSize: 16 },
  topGuideContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 4,
    marginTop: -10, // Shifting it higher
    zIndex: 10,
  },
  guideIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  guideSpacer: {
    width: 40,
  },
  guideText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  stampContainer: {
    position: 'absolute',
    top: 50,
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 100,
  },
  stampLeft: {
    right: 20,
    borderColor: '#ff4d4d',
    transform: [{ rotate: '15deg' }],
  },
  stampRight: {
    left: 20,
    borderColor: '#7ddc7a',
    transform: [{ rotate: '-15deg' }],
  },
  stampTextLeft: {
    color: '#ff4d4d',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  stampTextRight: {
    color: '#7ddc7a',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 1,
  },
});
