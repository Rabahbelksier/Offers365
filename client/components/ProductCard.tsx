import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import type { ProductItem } from "@/lib/storage";

interface ProductCardProps {
  product: ProductItem;
  onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const { theme } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
        },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      testID={`product-card-${product.productId}`}
    >
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View
            style={[styles.imagePlaceholder, { backgroundColor: theme.border }]}
          >
            <Feather name="image" size={24} color={theme.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <ThemedText type="small" numberOfLines={2} style={styles.title}>
          {product.title}
        </ThemedText>
        <View style={styles.priceRow}>
          <ThemedText
            type="h4"
            style={{ color: AppColors.primary }}
          >
            {product.price}
          </ThemedText>
          {product.discount && product.discount !== "0%" && (
            <View style={styles.discountBadge}>
              <ThemedText type="caption" style={styles.discountText}>
                {product.discount}
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText
          type="caption"
          style={{ color: theme.textSecondary }}
        >
          {formatDate(product.searchedAt)}
        </ThemedText>
      </View>

      <View style={styles.arrow}>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  discountBadge: {
    backgroundColor: AppColors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  discountText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  arrow: {
    marginLeft: Spacing.sm,
  },
});
