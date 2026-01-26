import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SocialLinks } from "@/components/SocialLinks";
import { Toast } from "@/components/Toast";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getMessageTemplate,
  saveMessageTemplate,
  DEFAULT_MESSAGE_TEMPLATE,
} from "@/lib/storage";

const AVAILABLE_KEYWORDS = [
  { key: "{title}", description: "Product title" },
  { key: "{price}", description: "Current price" },
  { key: "{originalPrice}", description: "Original price" },
  { key: "{discount}", description: "Discount percentage" },
  { key: "{storeName}", description: "Store name" },
  { key: "{offers}", description: "All affiliate links" },
];

export default function MessageDesignScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [template, setTemplate] = useState(DEFAULT_MESSAGE_TEMPLATE);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as const,
  });

  useEffect(() => {
    loadTemplate();
  }, []);

  const loadTemplate = async () => {
    const savedTemplate = await getMessageTemplate();
    setTemplate(savedTemplate);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const handleSave = async () => {
    try {
      await saveMessageTemplate(template);
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showToast("Template saved successfully!", "success");
    } catch (error) {
      showToast("Failed to save template", "error");
    }
  };

  const handleReset = () => {
    setTemplate(DEFAULT_MESSAGE_TEMPLATE);
    showToast("Template reset to default", "info");
  };

  const insertKeyword = (keyword: string) => {
    setTemplate((prev) => prev + keyword);
  };

  const getPreview = () => {
    return template
      .replace("{title}", "Sample Product Title - High Quality Item")
      .replace("{price}", "$19.99 USD")
      .replace("{originalPrice}", "$39.99 USD")
      .replace("{discount}", "50%")
      .replace("{storeName}", "Best Store Official")
      .replace(
        "{offers}",
        "Coin Page Offer:\nhttps://example.com/offer1\n\nDirect Link:\nhttps://example.com/offer2"
      );
  };

  return (
    <ThemedView style={styles.container}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="edit-3" size={18} color={AppColors.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              Template Editor
            </ThemedText>
          </View>
          <ThemedText
            type="small"
            style={[styles.sectionDescription, { color: theme.textSecondary }]}
          >
            Customize how your product messages are formatted when copied or shared
          </ThemedText>

          <View
            style={[
              styles.editorContainer,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.editor, { color: theme.text }]}
              value={template}
              onChangeText={setTemplate}
              multiline
              numberOfLines={12}
              textAlignVertical="top"
              placeholder="Enter your message template..."
              placeholderTextColor={theme.textSecondary}
              testID="input-template"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="hash" size={18} color={AppColors.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              Available Keywords
            </ThemedText>
          </View>
          <ThemedText
            type="small"
            style={[styles.sectionDescription, { color: theme.textSecondary }]}
          >
            Tap a keyword to add it to your template
          </ThemedText>

          <View style={styles.keywordsContainer}>
            {AVAILABLE_KEYWORDS.map((item) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.keywordChip,
                  { backgroundColor: theme.backgroundSecondary },
                  pressed && styles.pressed,
                ]}
                onPress={() => insertKeyword(item.key)}
              >
                <ThemedText type="small" style={{ color: AppColors.primary }}>
                  {item.key}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View
            style={[
              styles.keywordsList,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            {AVAILABLE_KEYWORDS.map((item) => (
              <View key={item.key} style={styles.keywordRow}>
                <ThemedText type="small" style={{ color: AppColors.primary }}>
                  {item.key}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {item.description}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="eye" size={18} color={AppColors.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              Preview
            </ThemedText>
          </View>

          <View
            style={[
              styles.previewContainer,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <ThemedText type="small" style={styles.previewText}>
              {getPreview()}
            </ThemedText>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.resetButton,
              { borderColor: theme.border },
              pressed && styles.pressed,
            ]}
            onPress={handleReset}
            testID="button-reset-template"
          >
            <Feather name="refresh-cw" size={18} color={theme.text} />
            <ThemedText type="body">Reset</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.pressed,
            ]}
            onPress={handleSave}
            testID="button-save-template"
          >
            <Feather name="save" size={18} color="#FFFFFF" />
            <ThemedText type="body" style={styles.saveButtonText}>
              Save Template
            </ThemedText>
          </Pressable>
        </View>

        <SocialLinks />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
  },
  sectionDescription: {
    marginBottom: Spacing.md,
  },
  editorContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 200,
  },
  editor: {
    fontSize: 14,
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
    lineHeight: 20,
    minHeight: 180,
  },
  keywordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  keywordChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  keywordsList: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  keywordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  previewContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  previewText: {
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  resetButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
