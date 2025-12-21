import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { Image } from 'expo-image';
import { useStore } from "@/store";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { hapticManager } from "@/lib/sound";
import * as Haptics from 'expo-haptics';
import { colors } from "@/lib/colors";

const CONDITIONS = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor'
] as const;
type Condition = typeof CONDITIONS[number];

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Books',
  'Clothing',
  'Other'
];

export default function PostScreen() {
  const { createPost, theme } = useStore();
  const t = colors[theme];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<Condition>(CONDITIONS[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageUri, setImageUri] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const extractGpsFromExif = (exif: any): { lat?: number; lon?: number } => {
    if (!exif) return {};
    // Common cases across platforms
    const gpsObj = exif["{GPS}"];
    const lat1 = typeof exif.GPSLatitude === "number" ? exif.GPSLatitude : gpsObj?.Latitude;
    const lon1 = typeof exif.GPSLongitude === "number" ? exif.GPSLongitude : gpsObj?.Longitude;
    if (typeof lat1 === "number" && typeof lon1 === "number") {
      return { lat: lat1, lon: lon1 };
    }
    return {};
  };

  const pickImage = async () => {
    hapticManager.trigger(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need photo library permission to pick an image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      // Resize the image to a reasonable size
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setImageUri(manipResult.uri);
    }
  };

  const onSubmit = async () => {
    if (!title || !price || !imageUri) {
      Alert.alert("Incomplete", "Please fill in all required fields and add a photo.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await createPost({
        title,
        description: description || undefined,
        price: parseFloat(price),
        condition,
        category,
        imageUri,
      });

      if (res.ok) {
        hapticManager.trigger('success');
        setTitle("");
        setDescription("");
        setPrice("");
        setCondition(CONDITIONS[0]);
        setCategory(CATEGORIES[0]);
        setImageUri("");
        router.push(`/post/${res.id}` as any);
      } else {
        Alert.alert("Error", res.reason || "Failed to create listing. Please try again.");
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={[styles.container, { backgroundColor: t.background }]} contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: t.text }]}>Sell an Item</Text>

        {/* Image Upload */}
        <View style={styles.imageUploadContainer}>
          {imageUri ? (
            <TouchableOpacity onPress={pickImage} style={[styles.imagePreview, { backgroundColor: t.card }]}>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                contentFit="cover"
              />
              <View style={styles.changePhotoButton}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.addPhotoButton, { backgroundColor: t.card, borderColor: t.borderSubtle }]} onPress={pickImage}>
              <Ionicons name="camera" size={32} color={t.textMuted} />
              <Text style={[styles.addPhotoText, { color: t.textMuted }]}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: t.text }]}>Item Name*</Text>
          <TextInput
            placeholder="What are you selling?"
            placeholderTextColor={t.textMuted}
            style={[styles.input, { backgroundColor: t.inputBg, color: t.text, borderColor: t.borderSubtle }]}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: t.text }]}>Price*</Text>
          <View style={[styles.priceInputContainer, { backgroundColor: t.inputBg, borderColor: t.borderSubtle }]}>
            <View style={[styles.currencyWrap, { backgroundColor: t.card, borderRightColor: t.borderSubtle }]}><Text style={[styles.currencySymbol, { color: t.textMuted }]}>₹</Text></View>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={t.textMuted}
              style={[styles.input, styles.priceInput, { color: t.text }]}
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: t.text }]}>Condition*</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {CONDITIONS.map((cond) => {
              const selected = condition === cond;
              return (
                <TouchableOpacity
                  key={cond}
                  onPress={() => {
                    hapticManager.trigger('selection');
                    setCondition(cond);
                  }}
                  style={[
                    styles.chip,
                    { borderColor: selected ? t.text : t.borderSubtle },
                    selected ? { backgroundColor: t.text } : { backgroundColor: t.card }
                  ]}
                >
                  <Text style={[
                    { fontWeight: '700' },
                    selected ? { color: t.background } : { color: t.textMuted }
                  ]}>{cond}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: t.text }]}>Category*</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            {CATEGORIES.map((cat) => {
              const selected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    hapticManager.trigger('selection');
                    setCategory(cat);
                  }}
                  style={[
                    styles.chip,
                    { borderColor: selected ? t.text : t.borderSubtle },
                    selected ? { backgroundColor: t.text } : { backgroundColor: t.card }
                  ]}
                >
                  <Text style={[
                    { fontWeight: '700' },
                    selected ? { color: t.background } : { color: t.textMuted }
                  ]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: t.text }]}>Description (optional)</Text>
          <TextInput
            placeholder="Include details like size, brand, color, etc."
            placeholderTextColor={t.textMuted}
            style={[styles.input, styles.textArea, { backgroundColor: t.inputBg, color: t.text, borderColor: t.borderSubtle }]}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: t.text, borderColor: t.borderSubtle },
            isLoading && { opacity: 0.5 }
          ]}
          onPress={() => {
            hapticManager.trigger(Haptics.ImpactFeedbackStyle.Medium);
            onSubmit();
          }}
          disabled={isLoading}
        >
          <Text style={[styles.submitButtonText, { color: t.background }]}>{isLoading ? 'Selling…' : 'Sell Item'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  imageUploadContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  addPhotoButton: {
    width: '100%',
    height: 180,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 16,
  },
  imagePreview: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    height: 48,
  },
  currencyWrap: { paddingHorizontal: 14, height: '100%', alignItems: 'center', justifyContent: 'center', borderRightWidth: 1 },
  currencySymbol: { fontSize: 16 },
  priceInput: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    marginBottom: 0,
    paddingLeft: 12,
  },
  chipsRow: { gap: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, borderWidth: 1 },
  submitButtonText: { fontSize: 16, fontWeight: '800' },
  row: {
    flexDirection: 'row'
  },
  half: {
    flex: 1
  },
});

