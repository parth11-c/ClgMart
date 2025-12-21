import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Platform, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock Notification Component for demo
const NotificationToast = ({ visible, title, message, onClose }: { visible: boolean, title: string, message: string, onClose: () => void }) => {
    const translateY = new Animated.Value(-100);

    useEffect(() => {
        if (visible) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                friction: 6
            }).start();

            const timer = setTimeout(() => {
                close();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    const close = () => {
        Animated.timing(translateY, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true
        }).start(() => onClose());
    };

    if (!visible) return null;

    return (
        <Animated.View style={[styles.toast, { transform: [{ translateY }] }]}>
            <View style={styles.toastIcon}>
                <Ionicons name="notifications" size={20} color="#fff" />
            </View>
            <View style={styles.toastContent}>
                <Text style={styles.toastTitle}>{title}</Text>
                <Text style={styles.toastMessage}>{message}</Text>
            </View>
            <TouchableOpacity onPress={close}>
                <Ionicons name="close" size={18} color="#aaa" />
            </TouchableOpacity>
        </Animated.View>
    );
};

export default function NotificationSettingsScreen() {
    const insets = useSafeAreaInsets();

    const [pauseAll, setPauseAll] = useState(false);
    const [msgNotif, setMsgNotif] = useState(true);
    const [postNotif, setPostNotif] = useState(true);
    const [marketingNotif, setMarketingNotif] = useState(false);

    // Demo state
    const [demoVisible, setDemoVisible] = useState(false);

    const triggerDemo = () => {
        setDemoVisible(false); // reset
        setTimeout(() => setDemoVisible(true), 100);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>

                {/* Master Switch */}
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Pause all</Text>
                            <Text style={styles.subLabel}>Temporarily disable all notifications</Text>
                        </View>
                        <Switch
                            value={pauseAll}
                            onValueChange={setPauseAll}
                            trackColor={{ false: "#333", true: "#4da3ff" }}
                            thumbColor={Platform.OS === 'ios' ? '#fff' : '#fff'}
                        />
                    </View>
                </View>

                {/* Section: Messages */}
                <View style={styles.sectionTitle}>
                    <Text style={styles.sectionTitleText}>Messages</Text>
                </View>
                <View style={styles.card}>
                    <View style={[styles.row, { opacity: pauseAll ? 0.5 : 1 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Message notifications</Text>
                            <Text style={styles.subLabel}>Get alerts when someone messages you</Text>
                        </View>
                        <Switch
                            value={msgNotif}
                            onValueChange={setMsgNotif}
                            disabled={pauseAll}
                            trackColor={{ false: "#333", true: "#4da3ff" }}
                        />
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity style={[styles.row, { opacity: pauseAll ? 0.5 : 1 }]} disabled={pauseAll}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Sound</Text>
                            <Text style={styles.subLabel}>Note (Default)</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Section: Marketplace */}
                <View style={styles.sectionTitle}>
                    <Text style={styles.sectionTitleText}>Marketplace</Text>
                </View>
                <View style={styles.card}>
                    <View style={[styles.row, { opacity: pauseAll ? 0.5 : 1 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>New post recommendations</Text>
                            <Text style={styles.subLabel}>Notify me about new items in my college</Text>
                        </View>
                        <Switch
                            value={postNotif}
                            onValueChange={setPostNotif}
                            disabled={pauseAll}
                            trackColor={{ false: "#333", true: "#4da3ff" }}
                        />
                    </View>
                </View>

                <View style={styles.sectionTitle}>
                    <Text style={styles.sectionTitleText}>Other</Text>
                </View>
                <View style={styles.card}>
                    <View style={[styles.row, { opacity: pauseAll ? 0.5 : 1 }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.label}>Tips & Offers</Text>
                        </View>
                        <Switch
                            value={marketingNotif}
                            onValueChange={setMarketingNotif}
                            disabled={pauseAll}
                            trackColor={{ false: "#333", true: "#4da3ff" }}
                        />
                    </View>
                </View>

                {/* Demo Button to show 'Elegant' notification */}
                <TouchableOpacity style={styles.demoBtn} onPress={triggerDemo}>
                    <Text style={styles.demoBtnText}>Send Test Notification</Text>
                </TouchableOpacity>
                <Text style={styles.demoHint}>Press to see the in-app notification style</Text>

            </ScrollView>

            <View style={{ position: 'absolute', top: insets.top + 50, left: 16, right: 16 }}>
                <NotificationToast
                    visible={demoVisible}
                    title="New Message"
                    message="Alex sent you a message about 'Engineering Graphics Kit'"
                    onClose={() => setDemoVisible(false)}
                />
            </View>
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
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#222',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        minHeight: 50,
    },
    divider: { height: 1, backgroundColor: '#222', width: '100%' },

    label: { color: '#fff', fontSize: 16, fontWeight: '500' },
    subLabel: { color: '#888', fontSize: 13, marginTop: 2 },

    sectionTitle: { marginTop: 16, marginBottom: 8, marginLeft: 4 },
    sectionTitleText: { color: '#888', fontSize: 13, fontWeight: '600', textTransform: 'uppercase' },

    demoBtn: { marginTop: 32, backgroundColor: '#1f1f22', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    demoBtnText: { color: '#4da3ff', fontWeight: '700' },
    demoHint: { color: '#555', textAlign: 'center', marginTop: 8, fontSize: 12 },

    // Toast Styles
    toast: {
        backgroundColor: '#1a1a1a',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#333'
    },
    toastIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#4da3ff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    toastContent: { flex: 1 },
    toastTitle: { color: '#fff', fontWeight: '700', fontSize: 15 },
    toastMessage: { color: '#ccc', fontSize: 13, marginTop: 2 },
});
