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
import { hapticManager } from "@/lib/sound";
import * as Haptics from 'expo-haptics';
import { colors } from "@/lib/colors";

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
  const { theme } = useStore();
  const t = colors[theme];
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
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -10], [1, 0], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [-SWIPE_THRESHOLD, -10], [1.2, 0.8], Extrapolation.CLAMP) }]
  }));

  const rightStampStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [10, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(translateX.value, [10, SWIPE_THRESHOLD], [0.8, 1.2], Extrapolation.CLAMP) }]
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={[styles.cardInner, { backgroundColor: t.card, borderColor: t.border }]}>
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
          <View style={[styles.cardInfo, { backgroundColor: t.card }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardTitle, { color: t.text }]} numberOfLines={1}>{post.title}</Text>
              {post.price !== undefined && (
                <Text style={[styles.cardPrice, { color: t.success }]}>₹{post.price}</Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.cardMeta, { color: theme === 'dark' ? '#aaa' : t.textMuted }]}>{post.category || 'General'}</Text>
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
  const opacity = useSharedValue(0.4);
  React.useEffect(() => {
    opacity.value = withRepeat(withTiming(1.0, { duration: 1200 }), -1, true);
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

const TutorialOverlay = () => {
  const handX = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    handX.value = withRepeat(
      withSequence(
        withTiming(-80, { duration: 1000 }),
        withDelay(300, withTiming(80, { duration: 1000 })),
        withDelay(300, withTiming(0, { duration: 600 }))
      ),
      -1,
      false
    );
  }, []);

  const handStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: handX.value }]
  }));

  const leftHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(handX.value, [-10, -50], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(handX.value, [-10, -50], [0.8, 1.2], Extrapolation.CLAMP) }]
  }));

  const rightHintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(handX.value, [10, 50], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(handX.value, [10, 50], [0.8, 1.2], Extrapolation.CLAMP) }]
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.tutorialContent}>
        <Animated.View style={[styles.tutorialHint, styles.tutorialHintLeft, leftHintStyle]}>
          <Text style={styles.tutorialHintText}>SKIP</Text>
        </Animated.View>
        <Animated.View style={[styles.tutorialHint, styles.tutorialHintRight, rightHintStyle]}>
          <Text style={styles.tutorialHintText}>VIEW</Text>
        </Animated.View>

        <Animated.View style={[styles.tutorialHand, handStyle]}>
          <Ionicons name="finger-print" size={60} color="rgba(255,255,255,0.8)" />
          <View style={styles.tutorialGlow} />
        </Animated.View>
        <Text style={styles.tutorialText}>Swipe cards to explore</Text>
      </View>
    </View>
  );
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { posts, theme } = useStore();
  const t = colors[theme];
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [visiblePosts, setVisiblePosts] = React.useState<Post[]>([]);
  const [showTutorial, setShowTutorial] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setShowTutorial(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    // Only initialize if we don't have posts yet
    if (visiblePosts.length === 0 && posts.length > 0) {
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
    }
  }, [posts, visiblePosts.length]);

  const handleSwipeLeft = () => {
    if (showTutorial) setShowTutorial(false);
    hapticManager.trigger(Haptics.ImpactFeedbackStyle.Light);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeRight = () => {
    if (showTutorial) setShowTutorial(false);
    const currentPost = visiblePosts[currentIndex];
    if (currentPost) {
      hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
      router.push(`/post/${currentPost.id}` as any);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 600);
    }
  };

  const handleReset = () => {
    hapticManager.trigger('selection');
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
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#020202' : t.background }]} edges={["top"]}>
        <TopSwipeGuide />
        <SparkleBackground />
        <View style={styles.cardStackContainer}>
          {visiblePosts.length === 0 || currentIndex >= visiblePosts.length ? (
            <View style={styles.emptyStack}>
              <View style={[styles.emptyIconCircle, { backgroundColor: theme === 'dark' ? '#111' : t.card, borderColor: theme === 'dark' ? '#222' : t.borderSubtle }]}>
                <Ionicons name="sparkles-outline" size={48} color="#ffd166" />
              </View>
              <Text style={[styles.emptyTitle, { color: t.text }]}>End of the Stack!</Text>
              <Text style={[styles.emptySubtitle, { color: theme === 'dark' ? '#555' : t.textMuted }]}>You've seen everything we found for now. Check back later for more!</Text>
              <TouchableOpacity style={[styles.resetBtn, { backgroundColor: t.text }]} onPress={handleReset}>
                <Ionicons name="refresh" size={18} color={t.background} />
                <Text style={[styles.resetBtnText, { color: t.background }]}>Refresh Discover</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {visiblePosts.slice(currentIndex, currentIndex + 3).reverse().map((post, sliceIdx, arr) => {
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
              })}
              {showTutorial && <TutorialOverlay />}
            </>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    // noticeable border for deck effect
    borderWidth: 2,
  },
  cardImage: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  cardInfo: {
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
    flex: 1,
    marginRight: 10,
  },
  cardPrice: {
    fontSize: 22,
    fontWeight: '900',
  },
  cardMeta: {
    fontSize: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 26, fontWeight: "900", textAlign: 'center' },
  emptySubtitle: { fontSize: 16, marginTop: 12, textAlign: 'center', lineHeight: 22 },
  resetBtn: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 16,
  },
  resetBtnText: { fontWeight: '800', fontSize: 16 },
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
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  stampContainer: {
    position: 'absolute',
    top: 60,
    borderWidth: 6,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.1)',
    // shadow for legibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 3,
  },
  stampTextRight: {
    color: '#7ddc7a',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 3,
  },
  sparkle: {
    position: 'absolute',
    zIndex: 1,
  },
  tutorialContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  tutorialHand: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tutorialGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: -1,
  },
  tutorialText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tutorialHint: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
    top: '35%',
  },
  tutorialHintLeft: {
    left: 40,
    borderColor: '#ff4d4d',
  },
  tutorialHintRight: {
    right: 40,
    borderColor: '#7ddc7a',
  },
  tutorialHintText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
});
