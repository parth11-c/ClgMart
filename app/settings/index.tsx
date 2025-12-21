import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useStore } from "@/store";
import { hapticManager } from "@/lib/sound";
import * as Haptics from 'expo-haptics';
import { colors } from "@/lib/colors";

function SettingItem({
    icon,
    iconColor,
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
    const { theme } = useStore();
    const t = colors[theme];
    const finalIconColor = iconColor || t.text;

    return (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: t.card }]}
            onPress={() => {
                hapticManager.trigger('selection');
                onPress?.();
            }}
        >
            {icon && (
                <View style={[styles.iconContainer, { backgroundColor: finalIconColor + '15' }]}>
                    <Ionicons name={icon} size={20} color={finalIconColor} />
                </View>
            )}
            <View style={styles.itemContent}>
                <Text style={[styles.itemLabel, { color: t.text }]}>{label}</Text>
                {subLabel && <Text style={[styles.itemSubLabel, { color: t.textMuted }]}>{subLabel}</Text>}
            </View>
            {showChevron && (
                <Ionicons name="chevron-forward" size={18} color={t.border} />
            )}
        </TouchableOpacity>
    );
}

function SectionLabel({ title }: { title: string }) {
    const { theme } = useStore();
    const t = colors[theme];
    if (!title) return <View style={{ height: 16 }} />;
    return <Text style={[styles.sectionLabel, { color: t.textMuted }]}>{title}</Text>;
}

export default function SettingsScreen() {
    const insets = useSafeAreaInsets();
    const { currentUser, signOut, theme, setTheme } = useStore();
    const t = colors[theme];

    const onLogout = async () => {
        try {
            hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
            await signOut();
            router.replace('/auth/sign-in' as any);
        } catch (e) {
            console.error(e);
            router.replace('/auth/sign-in' as any);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: t.background }]}>
            <View style={[styles.header, { backgroundColor: t.background, borderBottomColor: t.borderSubtle }]}>
                <TouchableOpacity
                    onPress={() => {
                        hapticManager.trigger('selection');
                        router.back();
                    }}
                    style={styles.backBtn}
                >
                    <Ionicons name="chevron-back" size={24} color={t.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: t.text }]}>Settings</Text>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>

                {/* Profile Card */}
                <TouchableOpacity
                    style={[styles.profileCard, { backgroundColor: t.card, borderColor: t.borderSubtle }]}
                    onPress={() => {
                        hapticManager.trigger('selection');
                        router.push('/profile/edit' as any);
                    }}
                >
                    {currentUser.avatar ? (
                        <Image source={{ uri: currentUser.avatar }} style={styles.avatar} contentFit="cover" />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: t.background }]}>
                            <Ionicons name="person" size={24} color={t.textMuted} />
                        </View>
                    )}
                    <View style={styles.profileInfo}>
                        <Text style={[styles.profileName, { color: t.text }]}>{currentUser.name || "User"}</Text>
                        <Text style={[styles.profileSub, { color: t.textMuted }]}>{currentUser.phone || "No phone added"}</Text>
                    </View>
                    <Ionicons name="pencil" size={18} color={t.primary} />
                </TouchableOpacity>

                <SectionLabel title="Account Settings" />
                <View style={[styles.section, { backgroundColor: t.card, borderColor: t.borderSubtle }]}>
                    <SettingItem
                        icon="person-outline"
                        label="Account"
                        subLabel="Security notifications, change name & number"
                        onPress={() => router.push('/settings/account' as any)}
                    />
                    <View style={[styles.separator, { backgroundColor: t.borderSubtle }]} />
                    <SettingItem
                        icon="lock-closed-outline"
                        label="Privacy"
                        subLabel="Block contacts, disappearing messages"
                        onPress={() => router.push('/settings/privacy' as any)}
                    />
                    <View style={[styles.separator, { backgroundColor: t.borderSubtle }]} />
                    <SettingItem
                        icon="notifications-outline"
                        label="Notifications"
                        subLabel="Message, group & call tones"
                        onPress={() => router.push('/settings/notifications' as any)}
                    />
                </View>

                <SectionLabel title="Preferences" />
                <View style={[styles.section, { backgroundColor: t.card, borderColor: t.borderSubtle }]}>
                    <SettingItem
                        icon={theme === 'dark' ? "moon-outline" : "sunny-outline"}
                        iconColor={theme === 'dark' ? "#a29bfe" : "#fdcb6e"}
                        label="Theme"
                        subLabel={theme === 'dark' ? "Dark Mode" : "Light Mode"}
                        onPress={() => {
                            setTheme(theme === 'dark' ? 'light' : 'dark');
                        }}
                    />
                </View>

                <SectionLabel title="Support & Legal" />
                <View style={[styles.section, { backgroundColor: t.card, borderColor: t.borderSubtle }]}>
                    <SettingItem
                        icon="help-circle-outline"
                        label="Help"
                        subLabel="Help centre, contact us, privacy policy"
                        onPress={() => router.push('/settings/privacy' as any)}
                    />
                    <View style={[styles.separator, { backgroundColor: t.borderSubtle }]} />
                    <SettingItem
                        icon="document-text-outline"
                        label="Open Source Licenses"
                        onPress={() => router.push('/settings/licenses' as any)}
                    />
                </View>

                <View style={[styles.footerActions]}>
                    <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
                        <Ionicons name="log-out-outline" size={16} color="#fff" />
                        <Text style={styles.logoutBtnText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerBrand, { color: t.text }]}>ClgMart v1.0.0</Text>
                    <Text style={[styles.footerText, { color: t.textMuted }]}>Made by Parth Bhende</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: { marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: '700' },
    content: { padding: 16 },

    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
    },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    profileInfo: { flex: 1, marginLeft: 16 },
    profileName: { fontSize: 18, fontWeight: '700' },
    profileSub: { fontSize: 14, marginTop: 2 },

    sectionLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4, marginTop: 8 },
    section: {
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 24,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    separator: { height: 1, marginLeft: 56 },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    itemContent: { flex: 1 },
    itemLabel: { fontSize: 16, fontWeight: '500' },
    itemSubLabel: { fontSize: 13, marginTop: 2 },

    footerActions: { gap: 12, marginTop: 8 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', backgroundColor: '#c0392b', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#9e2f23' },
    logoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

    footer: { alignItems: 'center', marginTop: 32, opacity: 0.5, marginBottom: 20 },
    footerBrand: { fontSize: 14, fontWeight: '700' },
    footerText: { fontSize: 12, marginTop: 4 },
});
