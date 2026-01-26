import React, { useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: "success" | "error" | "info";
  onHide: () => void;
  duration?: number;
}

export function Toast({
  visible,
  message,
  type = "success",
  onHide,
  duration = 2000,
}: ToastProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15 });
      const timeout = setTimeout(() => {
        translateY.value = withDelay(
          0,
          withSpring(-100, { damping: 15 }, () => {
            runOnJS(onHide)();
          })
        );
      }, duration);
      return () => clearTimeout(timeout);
    }
  }, [visible, duration, onHide, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const getIcon = () => {
    switch (type) {
      case "success":
        return "check-circle";
      case "error":
        return "x-circle";
      case "info":
        return "info";
      default:
        return "check-circle";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return AppColors.success;
      case "error":
        return AppColors.error;
      case "info":
        return AppColors.primary;
      default:
        return AppColors.success;
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + Spacing.lg,
          backgroundColor: theme.backgroundDefault,
          borderColor: getColor(),
        },
        animatedStyle,
      ]}
    >
      <Feather name={getIcon()} size={20} color={getColor()} />
      <ThemedText type="small" style={styles.message}>
        {message}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    zIndex: 1000,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  message: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
});
