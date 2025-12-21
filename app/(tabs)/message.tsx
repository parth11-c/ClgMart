import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "@/store";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/lib/colors";

type ChatMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

type Profile = { id: string; name?: string; avatar_url?: string };

type Conversation = {
  peerId: string;
  lastMessage: ChatMessage;
  peer?: Profile | null;
};

export default function MessagesTab() {
  const insets = useSafeAreaInsets();
  const { currentUser, theme } = useStore();
  const t = colors[theme];
  const myId = currentUser.id;
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [items, setItems] = React.useState<Conversation[]>([]);
  const fetchingPeersRef = React.useRef<Set<string>>(new Set());

  const load = React.useCallback(async () => {
    if (!myId) return;
    setLoading(true);
    try {
      // Load all messages involving me, newest first
      const { data, error } = await supabase
        .from('messages')
        .select('id, sender_id, recipient_id, body, created_at')
        .or(`sender_id.eq.${myId},recipient_id.eq.${myId}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data || []) as ChatMessage[];
      // Group by other user and take latest message
      const map = new Map<string, ChatMessage>();
      for (const m of rows) {
        const other = m.sender_id === myId ? m.recipient_id : m.sender_id;
        if (!map.has(other)) map.set(other, m);
      }
      const peers = Array.from(map.keys());
      let profiles: Record<string, Profile> = {};
      if (peers.length) {
        const { data: profs } = await supabase.from('profiles').select('id, name, avatar_url').in('id', peers);
        for (const p of (profs || []) as Profile[]) profiles[p.id] = p;
      }
      const conversations: Conversation[] = peers.map(pid => ({ peerId: pid, lastMessage: map.get(pid)!, peer: profiles[pid] || null }));
      setItems(conversations);
    } catch (e) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [myId]);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    if (!myId) return;
    const channel = supabase.channel(`messages-tab-${myId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload: any) => {
        const m = payload.new as ChatMessage;
        if (m.sender_id !== myId && m.recipient_id !== myId) return;
        const other = m.sender_id === myId ? m.recipient_id : m.sender_id;

        // Incrementally update list: move/update conversation to top
        setItems(prev => {
          const idx = prev.findIndex(c => c.peerId === other);
          const existing = idx >= 0 ? prev[idx] : undefined;
          const updated: Conversation = {
            peerId: other,
            lastMessage: m,
            peer: existing?.peer ?? null,
          };
          const next = [...prev];
          if (idx >= 0) next.splice(idx, 1);
          next.unshift(updated);
          return next;
        });

        const hasPeer = items.some(c => c.peerId === other && c.peer);
        if (!hasPeer && !fetchingPeersRef.current.has(other)) {
          fetchingPeersRef.current.add(other);
          try {
            const { data: prof } = await supabase.from('profiles').select('id, name, avatar_url').eq('id', other).single();
            if (prof) {
              setItems(prev => prev.map(c => (c.peerId === other ? { ...c, peer: prof as any } : c)));
            }
          } finally {
            fetchingPeersRef.current.delete(other);
          }
        }
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [myId, load]);

  const onRefresh = () => { setRefreshing(true); load(); };
  const renderItem = ({ item }: { item: Conversation }) => {
    const { peer, peerId, lastMessage } = item;
    const mine = lastMessage.sender_id === myId;
    const previewPrefix = mine ? 'You: ' : '';
    const time = new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity style={[styles.row, { borderBottomColor: theme === 'dark' ? '#151515' : t.borderSubtle }]} onPress={() => router.push(`/message/${peerId}` as any)}>
        {peer?.avatar_url ? (
          <Image source={{ uri: peer.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: theme === 'dark' ? '#222' : t.card }]} />
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.topRow}>
            <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>{peer?.name || 'User'}</Text>
            <Text style={[styles.time, { color: theme === 'dark' ? '#888' : t.textMuted }]}>{time}</Text>
          </View>
          <Text style={[styles.preview, { color: theme === 'dark' ? '#aaa' : t.textMuted }]} numberOfLines={1}>{previewPrefix}{lastMessage.body}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={theme === 'dark' ? '#777' : t.border} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.background }]} edges={[]}>
      <View style={[styles.header, { borderBottomColor: theme === 'dark' ? '#181818' : t.borderSubtle }]}>
        <Text style={[styles.headerTitle, { color: t.text }]}>Messages</Text>
      </View>
      <FlatList
        data={items}
        keyExtractor={(it) => it.peerId}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.text} />}
        ListEmptyComponent={!loading ? (
          <View style={styles.empty}><Text style={[styles.emptyText, { color: t.textMuted }]}>No conversations yet.</Text></View>
        ) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  list: { paddingHorizontal: 12, paddingTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1 },
  avatar: { width: 42, height: 42, borderRadius: 21, marginRight: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  name: { fontWeight: '700', flex: 1, marginRight: 8 },
  time: { fontSize: 12 },
  preview: { fontSize: 12 },
  empty: { paddingTop: 80, alignItems: 'center' },
  emptyText: {},
});
