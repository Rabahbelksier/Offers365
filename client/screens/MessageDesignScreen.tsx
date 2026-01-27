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
  getShareTemplate,
  saveShareTemplate,
  getDetailsTemplate,
  saveDetailsTemplate,
  getCopyAllTemplate,
  saveCopyAllTemplate,
  DEFAULT_SHARE_TEMPLATE,
  DEFAULT_DETAILS_TEMPLATE,
  DEFAULT_COPY_ALL_TEMPLATE,
} from "@/lib/storage";

const AVAILABLE_KEYWORDS = [
  { key: "{title}", description: "Product title" },
  { key: "{price}", description: "Current price" },
  { key: "{originalPrice}", description: "Original price" },
  { key: "{discount}", description: "Discount percentage" },
  { key: "{storeName}", description: "Store name" },
  { key: "{offers}", description: "All affiliate links" },
];

type TemplateType = "share" | "details" | "copyAll";

const TEMPLATE_TABS: { key: TemplateType; label: string; icon: string }[] = [
  { key: "share", label: "Share", icon: "share-2" },
  { key: "details", label: "Details", icon: "file-text" },
  { key: "copyAll", label: "Copy All", icon: "copy" },
];

export default function MessageDesignScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<TemplateType>("share");
  const [shareTemplate, setShareTemplate] = useState(DEFAULT_SHARE_TEMPLATE);
  const [detailsTemplate, setDetailsTemplate] = useState(DEFAULT_DETAILS_TEMPLATE);
  const [copyAllTemplate, setCopyAllTemplate] = useState(DEFAULT_COPY_ALL_TEMPLATE);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as const,
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const [share, details, copyAll] = await Promise.all([
      getShareTemplate(),
      getDetailsTemplate(),
      getCopyAllTemplate(),
    ]);
    setShareTemplate(share);
    setDetailsTemplate(details);
    setCopyAllTemplate(copyAll);
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

  const getCurrentTemplate = () => {
    switch (activeTab) {
      case "share":
        return shareTemplate;
      case "details":
        return detailsTemplate;
      case "copyAll":
        return copyAllTemplate;
    }
  };

  const setCurrentTemplate = (value: string) => {
    switch (activeTab) {
      case "share":
        setShareTemplate(value);
        break;
      case "details":
        setDetailsTemplate(value);
        break;
      case "copyAll":
        setCopyAllTemplate(value);
        break;
    }
  };

  const getDefaultTemplate = () => {
    switch (activeTab) {
      case "share":
        return DEFAULT_SHARE_TEMPLATE;
      case "details":
        return DEFAULT_DETAILS_TEMPLATE;
      case "copyAll":
        return DEFAULT_COPY_ALL_TEMPLATE;
    }
  };

  const handleSave = async () => {
    try {
      switch (activeTab) {
        case "share":
          await saveShareTemplate(shareTemplate);
          break;
        case "details":
          await saveDetailsTemplate(detailsTemplate);
          break;
        case "copyAll":
          await saveCopyAllTemplate(copyAllTemplate);
          break;
      }
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showToast("Template saved successfully!", "success");
    } catch (error) {
      showToast("Failed to save template", "error");
    }
  };

  const handleReset = () => {
    setCurrentTemplate(getDefaultTemplate());
    showToast("Template reset to default", "info");
  };

  const insertKeyword = (keyword: string) => {
    setCurrentTemplate(getCurrentTemplate() + keyword);
  };

  const getPreview = () => {
    return getCurrentTemplate()
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
            <Feather name="layers" size={18} color={AppColors.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              Select Template
            </ThemedText>
          </View>
          <ThemedText
            type="small"
            style={[styles.sectionDescription, { color: theme.textSecondary }]}
          >
            Choose which button message to customize
          </ThemedText>

          <View style={styles.tabsContainer}>
            {TEMPLATE_TABS.map((tab) => (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  {
                    backgroundColor:
                      activeTab === tab.key
                        ? AppColors.primary
                        : theme.backgroundSecondary,
                  },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Feather
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.key ? "#FFFFFF" : theme.text}
                />
                <ThemedText
                  type="small"
                  style={{
                    color: activeTab === tab.key ? "#FFFFFF" : theme.text,
                    fontWeight: activeTab === tab.key ? "600" : "400",
                  }}
                >
                  {tab.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

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
            Customize how your product messages are formatted
          </ThemedText>

          <View
            style={[
              styles.editorContainer,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <TextInput
              style={[styles.editor, { color: theme.text }]}
              value={getCurrentTemplate()}
              onChangeText={setCurrentTemplate}
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
  tabsContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
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
