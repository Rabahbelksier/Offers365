import React from "react";
import { View, StyleSheet, Pressable, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppColors, Spacing } from "@/constants/theme";

const SOCIAL_LINKS = {
  telegram: "https://t.me/rabahcopons",
  facebook: "https://www.facebook.com/share/14SzTie384J/",
  tiktok: "https://www.tiktok.com/@rabahbelksier",
};

export function SocialLinks() {
  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open link:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        onPress={() => openLink(SOCIAL_LINKS.telegram)}
        testID="social-telegram"
      >
        <Feather name="send" size={20} color={AppColors.primary} />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        onPress={() => openLink(SOCIAL_LINKS.facebook)}
        testID="social-facebook"
      >
        <Feather name="facebook" size={20} color={AppColors.primary} />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        onPress={() => openLink(SOCIAL_LINKS.tiktok)}
        testID="social-tiktok"
      >
        <Feather name="video" size={20} color={AppColors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 106, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
