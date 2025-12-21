import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useStore } from "@/store";

function SettingItem({
    icon,
    iconColor = "#fff",
    label,
    subLabel,
    onPress,
    showChevron = true,
}: {
    icon?: any,
    iconColor?: string,
    label: string,
    subLabel?: string,
    onPress?: () => void,
    showChevron?: boolean,
}) {
    return (
        <TouchableOpacity style={styles.item} onPress={onPress}>
            {icon && (
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
            )}
            <View style={styles.itemContent}>
                <Text style={styles.itemLabel}>{label}</Text>
                {subLabel && <Text style={styles.itemSubLabel}>{subLabel}</Text>}
            </View>
            {showChevron && (
                <Ionicons name="chevron-forward" size={18} color="#444" />
            )}
        </TouchableOpacity>
    );
}

function SectionLabel({ title }: { title: string }) {
    if (!title) return <View style={{ height: 16 }} />;
    return <Text style={styles.sectionLabel}>{title}</Text>;
}

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const { currentUser, signOut } = useStore();

    const onLogout = async () => {
        try {
            await signOut();
            router.replace('/auth/sign-in' as any);
        } catch (e) {
            console.error(e);
            router.replace('/auth/sign-in' as any);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>

                {/* Profile Card */}
                <TouchableOpacity style={styles.profileCard} onPress={() => router.push('/profile/edit' as any)}>
                    {currentUser.avatar ? (
                        <Image source={{ uri: currentUser.avatar }} style={styles.avatar} contentFit="cover" />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Ionicons name="person" size={24} color="#555" />
                        </View>
                    )}
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{currentUser.name || "User"}</Text>
                        <Text style={styles.profileSub}>{currentUser.phone || "No phone added"}</Text>
                    </View>
                    <Ionicons name="pencil" size={18} color="#4da3ff" />
                </TouchableOpacity>

                <SectionLabel title="Account Settings" />
                <View style={styles.section}>
                    <SettingItem
                        icon="person-outline"
                        label="Account"
                        subLabel="Security notifications, change name & number"
                        onPress={() => router.push('/settings/account' as any)}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon="lock-closed-outline"
                        label="Privacy"
                        subLabel="Block contacts, disappearing messages"
                        onPress={() => router.push('/settings/privacy' as any)}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon="notifications-outline"
                        label="Notifications"
                        subLabel="Message, group & call tones"
                        onPress={() => router.push('/settings/notifications' as any)}
                    />
                </View>

                <SectionLabel title="Support & Legal" />
                <View style={styles.section}>
                    <SettingItem
                        icon="help-circle-outline"
                        label="Help"
                        subLabel="Help centre, contact us, privacy policy"
                        onPress={() => router.push('/settings/privacy' as any)}
                    />
                    <View style={styles.separator} />
                    <SettingItem
                        icon="document-text-outline"
                        label="Open Source Licenses"
                        onPress={() => router.push('/settings/licenses' as any)}
                    />
                </View>

                <View style={styles.footerActions}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                        <Ionicons name="log-out-outline" size={16} color="#fff" />
                        <Text style={styles.logoutBtnText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerBrand}>ClgMart v1.0.0</Text>
                    <Text style={styles.footerText}>Made by Parth Bhende</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0a0a0a" },
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

    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#222',
        marginBottom: 24,
    },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    avatarPlaceholder: { backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
    profileInfo: { flex: 1, marginLeft: 16 },
    profileName: { color: '#fff', fontSize: 18, fontWeight: '700' },
    profileSub: { color: '#888', fontSize: 14, marginTop: 2 },

    sectionLabel: { color: '#888', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4, marginTop: 8 },
    section: {
        backgroundColor: '#111',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#222',
        overflow: 'hidden',
        marginBottom: 24,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#111',
    },
    separator: { height: 1, backgroundColor: '#222', marginLeft: 56 },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    itemContent: { flex: 1 },
    itemLabel: { color: '#fff', fontSize: 16, fontWeight: '500' },
    itemSubLabel: { color: '#888', fontSize: 13, marginTop: 2 },

    footerActions: { gap: 12, marginTop: 8 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', backgroundColor: '#c0392b', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#9e2f23' },
    logoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    footer: { alignItems: 'center', marginTop: 32, opacity: 0.5, marginBottom: 20 },
    footerBrand: { color: '#fff', fontSize: 14, fontWeight: '700' },
    footerText: { color: '#888', fontSize: 12, marginTop: 4 },
});
