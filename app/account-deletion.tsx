import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';

export default function AccountDeletionScreen() {
    const handleEmailPress = () => {
        Linking.openURL('mailto:support@clgmart.com?subject=Account Deletion Request');
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Account Deletion', headerShown: false }} />

            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Delete Account</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.intro}>
                        We value your privacy. If you wish to delete your ClgMart account and all associated data, please follow the instructions below.
                    </Text>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Option 1: Delete via App (Instant)</Text>
                        <Text style={styles.text}>
                            The fastest way to delete your account is directly through the ClgMart mobile application:
                        </Text>
                        <View style={styles.steps}>
                            <Text style={styles.step}>1. Open the <Text style={styles.bold}>ClgMart</Text> app.</Text>
                            <Text style={styles.step}>2. Go to the <Text style={styles.bold}>Profile</Text> tab.</Text>
                            <Text style={styles.step}>3. Tap the <Text style={styles.bold}>Settings</Text> (gear icon) in the top right.</Text>
                            <Text style={styles.step}>4. Select <Text style={styles.bold}>Account Settings</Text>.</Text>
                            <Text style={styles.step}>5. Scroll to the bottom and tap <Text style={[styles.bold, styles.danger]}>Delete account permanently</Text>.</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Option 2: Request Deletion via Email</Text>
                        <Text style={styles.text}>
                            If you are unable to access the app, you may request account deletion by contacting our support team. We will process your request within 30 days.
                        </Text>

                        <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress}>
                            <Ionicons name="mail-outline" size={20} color="#4da3ff" />
                            <Text style={styles.emailText}>support@clgmart.com</Text>
                        </TouchableOpacity>

                        <Text style={styles.subtext}>
                            Please include your registered phone number or email address in the subject or body of the email so we can verify your identity.
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.section}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Option 3: Delete Specific Data</Text>
                            <Text style={styles.text}>
                                You can also delete specific data without deleting your entire account:
                            </Text>

                            <Text style={[styles.stepsTitle, { marginTop: 8 }]}>To delete a post/listing:</Text>
                            <View style={styles.steps}>
                                <Text style={styles.step}>1. Go to the <Text style={styles.bold}>Profile</Text> tab.</Text>
                                <Text style={styles.step}>2. Scroll down to your listings.</Text>
                                <Text style={styles.step}>3. Tap on the item you want to delete.</Text>
                                <Text style={styles.step}>4. Tap the <Text style={styles.bold}>Trash Icon</Text> (delete button).</Text>
                                <Text style={styles.step}>5. Confirm the action to permanently remove the item.</Text>
                            </View>

                            <Text style={[styles.stepsTitle, { marginTop: 16 }]}>To remove your profile picture:</Text>
                            <View style={styles.steps}>
                                <Text style={styles.step}>1. Go to <Text style={styles.bold}>Settings &gt; Account Settings</Text>.</Text>
                                <Text style={styles.step}>2. Tap <Text style={[styles.bold, styles.danger]}>Remove</Text> under your profile photo.</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>Data Retention Policy</Text>
                        <Text style={styles.text}>
                            When your account is deleted, the following data is permanently removed from our systems:
                        </Text>
                        <View style={styles.bullets}>
                            <Text style={styles.bullet}>• Your user profile (Name, Email, Phone, Avatar)</Text>
                            <Text style={styles.bullet}>• All your active and inactive listings</Text>
                            <Text style={styles.bullet}>• All uploaded images associated with your listings</Text>
                            <Text style={styles.bullet}>• Your chat history and messages</Text>
                        </View>
                        <Text style={[styles.text, { marginTop: 10 }]}>
                            This action is irreversible. Once deleted, your data cannot be recovered.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#0a0a0a',
        borderBottomWidth: 1,
        borderBottomColor: '#222',
        alignItems: 'center',
    },
    headerContent: {
        width: '100%',
        maxWidth: 800,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: '#111',
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: '#222',
    },
    intro: {
        fontSize: 16,
        color: '#ccc',
        lineHeight: 24,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
    },
    text: {
        fontSize: 15,
        color: '#ccc',
        lineHeight: 22,
        marginBottom: 12,
    },
    stepsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 6,
    },
    steps: {
        marginLeft: 8,
        gap: 8,
    },
    step: {
        fontSize: 15,
        color: '#ccc',
        lineHeight: 22,
    },
    bold: {
        fontWeight: '700',
        color: '#fff',
    },
    danger: {
        color: '#e57373',
    },
    divider: {
        height: 1,
        backgroundColor: '#222',
        marginVertical: 24,
    },
    emailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1a2633',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#4da3ff',
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    emailText: {
        color: '#4da3ff',
        fontSize: 16,
        fontWeight: '600',
    },
    subtext: {
        fontSize: 13,
        color: '#888',
        lineHeight: 20,
        fontStyle: 'italic',
    },
    bullets: {
        marginLeft: 8,
        gap: 6,
    },
    bullet: {
        fontSize: 15,
        color: '#ccc',
        lineHeight: 22,
    },
});
