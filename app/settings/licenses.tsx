import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock data for licenses - in a real app this might be generated
const LICENSES = [
    {
        name: 'react',
        version: '18.2.0',
        license: 'MIT',
        copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.'
    },
    {
        name: 'react-native',
        version: '0.74.0',
        license: 'MIT',
        copyright: 'Copyright (c) Meta Platforms, Inc. and affiliates.'
    },
    {
        name: 'expo',
        version: '51.0.0',
        license: 'MIT',
        copyright: 'Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)'
    },
    {
        name: '@expo/vector-icons',
        version: '14.0.0',
        license: 'MIT',
        copyright: 'Copyright (c) 2015-present 650 Industries, Inc. (aka Expo)'
    },
    {
        name: '@supabase/supabase-js',
        version: '2.43.0',
        license: 'MIT',
        copyright: 'Copyright (c) 2020 Supabase'
    },
    {
        name: 'expo-router',
        version: '3.5.0',
        license: 'MIT',
        copyright: 'Copyright (c) 2022-present 650 Industries, Inc. (aka Expo)'
    },
    {
        name: 'react-native-safe-area-context',
        version: '4.10.1',
        license: 'MIT',
        copyright: 'Copyright (c) 2019 Th3rd Wave'
    },
    {
        name: 'zustand',
        version: '4.5.0',
        license: 'MIT',
        copyright: 'Copyright (c) 2019 Paul Henschel'
    }
];

const LicenseItem = ({ item }: { item: typeof LICENSES[0] }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={styles.libName}>{item.name}</Text>
            <Text style={styles.libVersion}>v{item.version}</Text>
        </View>
        <Text style={styles.licenseType}>{item.license} License</Text>
        <Text style={styles.copyright}>{item.copyright}</Text>
        <View style={styles.licenseBody}>
            <Text style={styles.licenseText}>
                Permission is hereby granted, free of charge, to any person obtaining a copy of this software...
            </Text>
        </View>
    </View>
);

export default function LicensesScreen() {
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Open Source Licenses</Text>
            </View>

            <FlatList
                data={LICENSES}
                keyExtractor={item => item.name}
                renderItem={({ item }) => <LicenseItem item={item} />}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Text style={styles.intro}>
                        This application uses the following open source software:
                    </Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0a' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#222'
    },
    backBtn: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
    content: { padding: 16 },

    intro: { color: '#888', marginBottom: 16, fontSize: 14 },

    card: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    libName: { color: '#fff', fontSize: 16, fontWeight: '700' },
    libVersion: { color: '#666', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
    licenseType: { color: '#4da3ff', fontSize: 13, fontWeight: '600', marginBottom: 4 },
    copyright: { color: '#aaa', fontSize: 12, marginBottom: 8, fontStyle: 'italic' },
    licenseBody: { backgroundColor: '#0a0a0a', padding: 8, borderRadius: 6 },
    licenseText: { color: '#666', fontSize: 11, fontStyle: 'italic' }, // keeping it short for UI cleanliness
});
