import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store';
import { router } from 'expo-router';
import { hapticManager } from '@/lib/sound';
import * as Haptics from 'expo-haptics';

export default function AccountSettingsScreen() {
    const insets = useSafeAreaInsets();
    const { currentUser, updateProfile, deleteAccount } = useStore();

    const [name, setName] = useState<string>(currentUser.name || '');
    const [avatarUri, setAvatarUri] = useState<string | null | undefined>(currentUser.avatar);
    const [phone, setPhone] = useState<string>(currentUser.phone || '');
    const [email, setEmail] = useState<string>(currentUser.email || '');
    const [isSaving, setIsSaving] = useState(false);

    const pickImage = async () => {
        hapticManager.trigger(Haptics.ImpactFeedbackStyle.Light);
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'We need photo library permission to pick an image.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });
        if (!result.canceled && result.assets?.[0]?.uri) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const clearAvatar = () => setAvatarUri(null);

    const onSave = async () => {
        if (!name?.trim()) {
            Alert.alert('Name required', 'Please enter your name.');
            return;
        }
        // Normalize and validate phone: default to +91 if no country code provided
        const rawPhone = phone.trim();
        let normalizedPhone: string | undefined = undefined;
        if (rawPhone) {
            if (rawPhone.startsWith('+')) {
                const digits = rawPhone.slice(1).replace(/\D+/g, '');
                normalizedPhone = '+' + digits;
            } else {
                const digits = rawPhone.replace(/\D+/g, '');
                // Default to India country code
                normalizedPhone = '+91' + digits;
            }
            if (!/^\+\d{7,15}$/.test(normalizedPhone)) {
                Alert.alert('Invalid phone number', 'Enter a valid number. If you omit country code, we will default to +91.');
                return;
            }
        }
        setIsSaving(true);
        try {
            const res = await updateProfile({
                name: name.trim(),
                phone: normalizedPhone || undefined,
                email: email.trim() || undefined,
                avatarUri
            });
            if (!res.ok) {
                Alert.alert('Error', res.reason || 'Failed to update profile.');
            } else {
                hapticManager.trigger('success');
                router.back();
            }
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Unexpected error');
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDeleteAccount = () => {
        const doDelete = async () => {
            hapticManager.trigger(Haptics.ImpactFeedbackStyle.Heavy);
            const res = await deleteAccount();
            if (!res.ok) {
                Alert.alert('Error', res.reason || 'Failed to delete account.');
                return;
            }
            router.replace('/' as any);
        };

        if (Platform.OS === 'web') {
            const ok = typeof window !== 'undefined' ? window.confirm('This will permanently delete your profile, sells, and associated images. This action cannot be undone.') : false;
            if (ok) doDelete();
            return;
        }

        Alert.alert(
            'Delete account',
            'This will permanently delete your profile, sells, and associated images. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: doDelete },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => {
                        hapticManager.trigger('selection');
                        router.back();
                    }}
                    style={styles.backBtn}
                >
                    <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Settings</Text>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>

                {/* Avatar */}
                <View style={styles.card}>
                    <View style={styles.avatarRow}>
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={styles.avatar} contentFit="cover" />
                        ) : (
                            <View style={[styles.avatar, styles.avatarPlaceholder]}>
                                <Ionicons name="person" size={28} color="#888" />
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <View style={styles.avatarActionsRow}>
                                <TouchableOpacity
                                    style={styles.btn}
                                    onPress={pickImage}
                                >
                                    <Ionicons name="image-outline" size={16} color="#4da3ff" />
                                    <Text style={styles.btnText}>Change Photo</Text>
                                </TouchableOpacity>
                                {avatarUri && (
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnDanger]}
                                        onPress={() => {
                                            hapticManager.trigger(Haptics.ImpactFeedbackStyle.Light);
                                            clearAvatar();
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={16} color="#fff" />
                                        <Text style={styles.btnDangerText}>Remove</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <Text style={styles.hint}>Use a clear photo so buyers can recognize you.</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionTitle}>
                    <Text style={styles.sectionTitleText}>Profile Details</Text>
                </View>

                <View style={styles.card}>
                    {/* Name */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            placeholder="Your name"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Email */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Email (Visible on Profile)</Text>
                        <TextInput
                            placeholder="public@example.com"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Phone */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Phone number (WhatsApp)</Text>
                        <TextInput
                            placeholder="e.g. +91 98765 43210"
                            placeholderTextColor="#666"
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            autoComplete="tel"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                        onPress={() => {
                            hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
                            onSave();
                        }}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#0a0a0a" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionTitle}>
                    <Text style={styles.sectionTitleText}>Danger Zone</Text>
                </View>

                <View style={[styles.card, { borderColor: '#5e0000', backgroundColor: '#1a0505' }]}>
                    <Text style={styles.dangerText}>
                        Deleting your account will permanently remove your profile, sells, and images. This action cannot be undone.
                    </Text>
                    <TouchableOpacity
                        style={styles.deleteAccBtn}
                        onPress={() => {
                            hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
                            confirmDeleteAccount();
                        }}
                    >
                        <Ionicons name="trash-outline" size={16} color="#fff" />
                        <Text style={styles.deleteAccBtnText}>Delete account permanently</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
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

    card: {
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#222',
        marginBottom: 8,
    },

    sectionTitle: { marginTop: 16, marginBottom: 8, marginLeft: 4 },
    sectionTitleText: { color: '#888', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },

    avatarRow: { flexDirection: 'row', alignItems: 'center' },
    avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#111', marginRight: 16 },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#222' },
    avatarActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
    hint: { color: '#888', fontSize: 12 },

    formGroup: { marginBottom: 16 },
    label: { color: '#ddd', marginBottom: 8, fontWeight: '600', fontSize: 14 },
    input: { backgroundColor: '#0a0a0a', borderColor: '#333', borderWidth: 1, borderRadius: 10, padding: 12, color: '#fff', fontSize: 16 },

    btn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#4da3ff', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
    btnText: { color: '#4da3ff', fontWeight: '600' },
    btnDanger: { backgroundColor: '#cc3333', borderColor: '#cc3333' },
    btnDangerText: { color: '#fff', fontWeight: '600' },

    saveBtn: { backgroundColor: '#4da3ff', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    saveBtnDisabled: { backgroundColor: '#2b5e91' },
    saveBtnText: { color: '#0a0a0a', fontWeight: '800', fontSize: 16 },

    dangerText: { color: '#e57373', fontSize: 14, marginBottom: 16, lineHeight: 20 },
    deleteAccBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', backgroundColor: '#8b0000', paddingVertical: 14, borderRadius: 10, borderWidth: 1, borderColor: '#5e0000' },
    deleteAccBtnText: { color: '#fff', fontWeight: '800' },
});
