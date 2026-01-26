import React from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Linking,
  Share,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";

interface OfferButtonProps {
  name: string;
  link: string;
  success: boolean;
  onCopied?: () => void;
}

export function OfferButton({
  name,
  link,
  success,
  onCopied,
}: OfferButtonProps) {
  const { theme } = useTheme();

  const openOffer = async () => {
    if (!success) return;
    try {
      await Linking.openURL(link);
    } catch (error) {
      console.error("Failed to open link:", error);
    }
  };

  const copyLink = async () => {
    if (!success) return;
    try {
      await Clipboard.setStringAsync(link);
      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onCopied?.();
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const shareOffer = async () => {
    if (!success) return;
    try {
      await Share.share({
        message: `${name}\n${link}`,
      });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: success ? theme.border : AppColors.error,
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.mainButton,
          pressed && styles.pressed,
          !success && styles.disabled,
        ]}
        onPress={openOffer}
        disabled={!success}
        testID={`offer-button-${name}`}
      >
        <View style={styles.offerIcon}>
          <Feather
            name={success ? "tag" : "x-circle"}
            size={18}
            color={success ? AppColors.primary : AppColors.error}
          />
        </View>
        <ThemedText
          type="small"
          style={[styles.offerName, !success && styles.disabledText]}
          numberOfLines={2}
        >
          {name}
        </ThemedText>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
            !success && styles.disabled,
          ]}
          onPress={copyLink}
          disabled={!success}
          testID={`copy-offer-${name}`}
        >
          <Feather
            name="copy"
            size={18}
            color={success ? theme.textSecondary : theme.border}
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.pressed,
            !success && styles.disabled,
          ]}
          onPress={shareOffer}
          disabled={!success}
          testID={`share-offer-${name}`}
        >
          <Feather
            name="share-2"
            size={18}
            color={success ? theme.textSecondary : theme.border}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  mainButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  offerIcon: {
    marginRight: Spacing.sm,
  },
  offerName: {
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    textDecorationLine: "line-through",
  },
});
