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
import { getSettings, saveSettings, AppSettings, DEFAULT_SETTINGS } from "@/lib/storage";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showSecrets, setShowSecrets] = useState({
    appKey: false,
    appSecret: false,
  });
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as const,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await getSettings();
    setSettings(savedSettings);
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
      await saveSettings(settings);
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showToast("Settings saved successfully!", "success");
    } catch (error) {
      showToast("Failed to save settings", "error");
    }
  };

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      // Save immediately for theme and language to reflect changes
      if (key === "theme" || key === "language") {
        saveSettings(newSettings).catch(console.error);
      }
      return newSettings;
    });
  };

  const ThemeOption = ({
    value,
    label,
    icon,
  }: {
    value: AppSettings["theme"];
    label: string;
    icon: keyof typeof Feather.glyphMap;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.themeOption,
        {
          backgroundColor:
            settings.theme === value
              ? `${AppColors.primary}15`
              : theme.backgroundDefault,
          borderColor:
            settings.theme === value ? AppColors.primary : theme.border,
        },
        pressed && styles.pressed,
      ]}
      onPress={() => updateSetting("theme", value)}
    >
      <Feather
        name={icon}
        size={20}
        color={settings.theme === value ? AppColors.primary : theme.textSecondary}
      />
      <ThemedText
        type="small"
        style={[
          styles.themeLabel,
          settings.theme === value && { color: AppColors.primary },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  const LanguageOption = ({
    value,
    label,
  }: {
    value: AppSettings["language"];
    label: string;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.languageOption,
        {
          backgroundColor:
            settings.language === value
              ? `${AppColors.primary}15`
              : theme.backgroundDefault,
          borderColor:
            settings.language === value ? AppColors.primary : theme.border,
        },
        pressed && styles.pressed,
      ]}
      onPress={() => updateSetting("language", value)}
    >
      <ThemedText
        type="body"
        style={settings.language === value && { color: AppColors.primary }}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

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
            <Feather name="sun" size={18} color={AppColors.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              Appearance
            </ThemedText>
          </View>

          <View style={styles.themeContainer}>
            <ThemeOption value="light" label="Light" icon="sun" />
            <ThemeOption value="dark" label="Dark" icon="moon" />
            <ThemeOption value="system" label="System" icon="smartphone" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="globe" size={18} color={AppColors.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              Language
            </ThemedText>
          </View>

          <View style={styles.languageContainer}>
            <LanguageOption value="en" label="English" />
            <LanguageOption value="ar" label="العربية" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="key" size={18} color={AppColors.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              API Configuration
            </ThemedText>
          </View>
          <ThemedText
            type="small"
            style={[styles.sectionDescription, { color: theme.textSecondary }]}
          >
            Enter your AliExpress Affiliate API credentials
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.inputLabel}>
              APP KEY
            </ThemedText>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your APP KEY"
                placeholderTextColor={theme.textSecondary}
                value={settings.appKey}
                onChangeText={(value) => updateSetting("appKey", value)}
                secureTextEntry={!showSecrets.appKey}
                autoCapitalize="none"
                testID="input-app-key"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() =>
                  setShowSecrets((prev) => ({
                    ...prev,
                    appKey: !prev.appKey,
                  }))
                }
              >
                <Feather
                  name={showSecrets.appKey ? "eye-off" : "eye"}
                  size={18}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.inputLabel}>
              APP SECRET
            </ThemedText>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your APP SECRET"
                placeholderTextColor={theme.textSecondary}
                value={settings.appSecret}
                onChangeText={(value) => updateSetting("appSecret", value)}
                secureTextEntry={!showSecrets.appSecret}
                autoCapitalize="none"
                testID="input-app-secret"
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() =>
                  setShowSecrets((prev) => ({
                    ...prev,
                    appSecret: !prev.appSecret,
                  }))
                }
              >
                <Feather
                  name={showSecrets.appSecret ? "eye-off" : "eye"}
                  size={18}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.inputLabel}>
              TRACKING ID
            </ThemedText>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter your Tracking ID"
                placeholderTextColor={theme.textSecondary}
                value={settings.trackingId}
                onChangeText={(value) => updateSetting("trackingId", value)}
                autoCapitalize="none"
                testID="input-tracking-id"
              />
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
          ]}
          onPress={handleSave}
          testID="button-save-settings"
        >
          <Feather name="save" size={20} color="#FFFFFF" />
          <ThemedText type="body" style={styles.saveButtonText}>
            Save Settings
          </ThemedText>
        </Pressable>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="info" size={18} color={AppColors.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              About
            </ThemedText>
          </View>

          <View
            style={[
              styles.aboutCard,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <View style={styles.aboutRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Version
              </ThemedText>
              <ThemedText type="body">1.0.0</ThemedText>
            </View>
            <View style={styles.aboutRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Developer
              </ThemedText>
              <ThemedText type="body">Rabah Coupons</ThemedText>
            </View>
          </View>
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
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
  },
  sectionDescription: {
    marginBottom: Spacing.md,
  },
  themeContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  themeLabel: {
    fontWeight: "500",
  },
  languageContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  languageOption: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
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
  aboutCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
});
