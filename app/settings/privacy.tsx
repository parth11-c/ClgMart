import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PRIVACY_POLICY } from "@/lib/privacy_policy";

// Simple Markdown-ish renderer
function SimpleMarkdown({ content }: { content: string }) {
    const lines = content.split('\n');
    return (
        <View>
            {lines.map((line, i) => {
                if (line.startsWith('## ')) {
                    return <Text key={i} style={styles.h2}>{line.replace('## ', '')}</Text>;
                }
                if (line.startsWith('* ')) {
                    return (
                        <View key={i} style={styles.li}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.liText}>{line.replace('* ', '')}</Text>
                        </View>
                    );
                }
                if (line.trim().length === 0) {
                    return <View key={i} style={{ height: 10 }} />;
                }
                // Bold handling (very basic)
                const parts = line.split('**');
                if (parts.length > 1) {
                    return (
                        <Text key={i} style={styles.p}>
                            {parts.map((part, index) => (
                                <Text key={index} style={index % 2 === 1 ? styles.bold : undefined}>{part}</Text>
                            ))}
                        </Text>
                    )
                }

                return <Text key={i} style={styles.p}>{line}</Text>;
            })}
        </View>
    );
}

export default function PrivacyPolicyScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                <SimpleMarkdown content={PRIVACY_POLICY} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0b141a" },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1f2b32'
    },
    backBtn: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '500', color: '#e9edef' },
    content: { padding: 20, paddingBottom: 40 },

    h2: { fontSize: 18, fontWeight: '700', color: '#e9edef', marginTop: 16, marginBottom: 8 },
    p: { fontSize: 14, color: '#d1d7db', lineHeight: 22 },
    li: { flexDirection: 'row', marginBottom: 4, paddingLeft: 8 },
    bullet: { color: '#d1d7db', marginRight: 8, fontSize: 14, lineHeight: 22 },
    liText: { fontSize: 14, color: '#d1d7db', lineHeight: 22, flex: 1 },
    bold: { fontWeight: '700', color: '#fff' }
});
