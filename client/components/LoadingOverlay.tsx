import React from "react";
import { View, StyleSheet, ActivityIndicator, Modal } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({
  visible,
  message = "Loading...",
}: LoadingOverlayProps) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        >
          <ActivityIndicator size="large" color={AppColors.primary} />
          <ThemedText type="body" style={styles.message}>
            {message}
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    minWidth: 150,
  },
  message: {
    marginTop: Spacing.lg,
  },
});
