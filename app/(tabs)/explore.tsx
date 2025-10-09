import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useStore } from "@/store";

type Post = {
  id: string;
  title: string;
  imageUri: string;
};

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const { posts } = useStore();
  const [query, setQuery] = React.useState("");
  const [shuffled, setShuffled] = React.useState<Post[]>([]);

  // Shuffle posts once per session to keep the feed feeling random
  React.useEffect(() => {
    const randomized = posts
      .filter(Boolean)
      .map(({ id, title, imageUri }) => ({ id, title, imageUri }))
      .sort(() => Math.random() - 0.5);
    setShuffled(randomized);
  }, [posts]);

  const data = React.useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return shuffled;
    return shuffled.filter(post => post.title?.toLowerCase().includes(lower));
  }, [query, shuffled]);

  const renderItem = React.useCallback(({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push(`/post/${item.id}` as any)}>
      <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  ), []);

  const contentPaddingBottom = insets.bottom + 16;

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <View style={[styles.searchSection, { paddingTop: 12 }]}>
        <View style={styles.searchCard}>
          <Ionicons name="search" size={18} color="#7aa2ff" style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, categories, users..."
            placeholderTextColor="#7d8299"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#a2a9c4" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>Nothing found</Text>
          <Text style={styles.emptySubtitle}>Try a different keyword.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.grid, { paddingBottom: contentPaddingBottom }]}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.column}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  searchSection: { paddingHorizontal: 16, paddingBottom: 12, backgroundColor: "#050505" },
  searchCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101524",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1f2d4d",
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: "#1b3bff",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  searchIcon: { marginRight: 10 },
  searchInput: {
    flex: 1,
    color: "#e5ecff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  clearBtn: { marginLeft: 8 },
  grid: { paddingHorizontal: 10 },
  column: { gap: 8 },
  card: {
    flex: 1,
    marginBottom: 8,
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#1f1f1f",
  },
  image: { width: "100%", height: "100%" },
  emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  emptyTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  emptySubtitle: { color: "#777", fontSize: 14, marginTop: 6 },
});
