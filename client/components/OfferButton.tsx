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
          { backgroundColor: success ? `${AppColors.primary}10` : 'transparent' },
          pressed && styles.pressed,
          !success && styles.disabled,
        ]}
        onPress={openOffer}
        disabled={!success}
        testID={`offer-button-${name}`}
      >
        <View style={styles.offerIcon}>
          <View style={[styles.iconBadge, { backgroundColor: success ? AppColors.primary : AppColors.error }]}>
            <Feather
              name={success ? "tag" : "x-circle"}
              size={14}
              color="#FFFFFF"
            />
          </View>
        </View>
        <View style={styles.offerTextContainer}>
          <ThemedText
            type="body"
            style={[styles.offerName, !success && styles.disabledText, { fontWeight: '600' }]}
            numberOfLines={1}
          >
            {name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
            {success ? "Click to view offer" : "Offer unavailable"}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} style={styles.chevron} />
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
            color={success ? AppColors.primary : theme.border}
          />
        </Pressable>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
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
            color={success ? AppColors.primary : theme.border}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }
    }),
  },
  mainButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  offerIcon: {
    marginRight: Spacing.md,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  offerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  offerName: {
    fontSize: 16,
    marginBottom: 2,
  },
  chevron: {
    marginLeft: Spacing.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    height: 48,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  divider: {
    width: 1,
    height: "60%",
    opacity: 0.3,
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
