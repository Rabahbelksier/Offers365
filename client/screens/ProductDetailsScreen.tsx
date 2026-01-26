import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { OfferButton } from "@/components/OfferButton";
import { SocialLinks } from "@/components/SocialLinks";
import { Toast } from "@/components/Toast";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import { formatProductMessage, getMessageTemplate, ProductItem } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type ProductDetailsRouteProp = RouteProp<RootStackParamList, "ProductDetails">;

export default function ProductDetailsScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<ProductDetailsRouteProp>();
  const { theme } = useTheme();
  const { product } = route.params;

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as const,
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success"
  ) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const triggerHaptic = async () => {
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const copyAll = async () => {
    try {
      const template = await getMessageTemplate();
      const text = formatProductMessage(product, template);
      await Clipboard.setStringAsync(text);
      await triggerHaptic();
      showToast("All details copied!", "success");
    } catch (error) {
      showToast("Failed to copy", "error");
    }
  };

  const copyDetails = async () => {
    try {
      const text = `${product.title}

Price: ${product.price}
Original: ${product.originalPrice}
Discount: ${product.discount}
Store: ${product.storeName}`;
      await Clipboard.setStringAsync(text);
      await triggerHaptic();
      showToast("Details copied!", "success");
    } catch (error) {
      showToast("Failed to copy", "error");
    }
  };

  const copyTitle = async () => {
    try {
      await Clipboard.setStringAsync(product.title);
      await triggerHaptic();
      showToast("Title copied!", "success");
    } catch (error) {
      showToast("Failed to copy", "error");
    }
  };

  const shareProduct = async () => {
    try {
      const template = await getMessageTemplate();
      const text = formatProductMessage(product, template);
      await Share.share({ message: text });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const downloadImage = async () => {
    if (!product.imageUrl) {
      showToast("No image available", "error");
      return;
    }

    try {
      if (Platform.OS === "web") {
        await Linking.openURL(product.imageUrl);
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        showToast("Permission required to save images", "error");
        return;
      }

      const fileUri = FileSystem.documentDirectory + `product_${product.productId}.jpg`;
      const download = await FileSystem.downloadAsync(product.imageUrl, fileUri);
      await MediaLibrary.saveToLibraryAsync(download.uri);
      await triggerHaptic();
      showToast("Image saved to gallery!", "success");
    } catch (error) {
      console.error("Failed to download image:", error);
      showToast("Failed to download image", "error");
    }
  };

  const otherOffersUrl = `https://www.aliexpress.com/item/${product.productId}.html`;
  const openOtherOffers = async () => {
    try {
      await Linking.openURL(otherOffersUrl);
    } catch (error) {
      console.error("Failed to open link:", error);
    }
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
        <View style={styles.imageContainer}>
          {product.imageUrl ? (
            <Image
              source={{ uri: product.imageUrl.replace(/\d+x\d+/, "1536x1536") }}
              style={styles.productImage}
              contentFit="cover"
              transition={300}
            />
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="image" size={48} color={theme.textSecondary} />
            </View>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.downloadButton,
              { backgroundColor: theme.backgroundRoot },
              pressed && styles.pressed,
            ]}
            onPress={downloadImage}
            testID="button-download-image"
          >
            <Feather name="download" size={20} color={AppColors.primary} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <ThemedText type="h3" style={styles.title}>
            {product.title}
          </ThemedText>

          <View
            style={[
              styles.detailsCard,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.priceRow}>
              <View>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Current Price
                </ThemedText>
                <ThemedText type="h2" style={{ color: AppColors.primary }}>
                  {product.price}
                </ThemedText>
              </View>
              <View style={styles.priceRight}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Original
                </ThemedText>
                <ThemedText
                  type="body"
                  style={[styles.originalPrice, { color: theme.textSecondary }]}
                >
                  {product.originalPrice}
                </ThemedText>
              </View>
              {product.discount && product.discount !== "0%" && (
                <View style={styles.discountBadge}>
                  <ThemedText type="small" style={styles.discountText}>
                    -{product.discount}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Feather name="shopping-bag" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={styles.infoText}>
                  {product.storeName}
                </ThemedText>
              </View>
              {product.evaluateRate && (
                <View style={styles.infoItem}>
                  <Feather name="star" size={16} color="#FFD700" />
                  <ThemedText type="small" style={styles.infoText}>
                    {product.evaluateRate}
                  </ThemedText>
                </View>
              )}
              {product.orders && (
                <View style={styles.infoItem}>
                  <Feather name="trending-up" size={16} color={AppColors.primary} />
                  <ThemedText type="small" style={styles.infoText}>
                    {product.orders} orders
                  </ThemedText>
                </View>
              )}
              {product.shippingFee && (
                <View style={styles.infoItem}>
                  <Feather name="truck" size={16} color={AppColors.accent} />
                  <ThemedText type="small" style={styles.infoText}>
                    {product.shippingFee}
                  </ThemedText>
                </View>
              )}
              {product.categoryName && (
                <View style={styles.infoItem}>
                  <Feather name="list" size={16} color={theme.textSecondary} />
                  <ThemedText type="small" style={styles.infoText}>
                    {product.categoryName}
                  </ThemedText>
                </View>
              )}
              {product.commissionRate && (
                <View style={styles.infoItem}>
                  <Feather name="percent" size={16} color={AppColors.success || "#4CAF50"} />
                  <ThemedText type="small" style={styles.infoText}>
                    Comm: {product.commissionRate}
                  </ThemedText>
                </View>
              )}
            </View>
            
            {product.shopUrl && product.shopUrl !== "N/A" && (
              <Pressable 
                onPress={() => Linking.openURL(product.shopUrl!)}
                style={styles.shopButton}
              >
                <ThemedText type="small" style={{ color: AppColors.primary, fontWeight: '600' }}>
                  Visit Store
                </ThemedText>
                <Feather name="external-link" size={14} color={AppColors.primary} />
              </Pressable>
            )}
          </View>

          <View style={styles.copyActions}>
            <Pressable
              style={({ pressed }) => [
                styles.copyButton,
                { backgroundColor: AppColors.primary },
                pressed && styles.pressed,
              ]}
              onPress={copyAll}
              testID="button-copy-all"
            >
              <Feather name="copy" size={16} color="#FFFFFF" />
              <ThemedText type="small" style={styles.copyButtonText}>
                Copy All
              </ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.copyButton,
                { borderColor: theme.border, borderWidth: 1 },
                pressed && styles.pressed,
              ]}
              onPress={copyDetails}
              testID="button-copy-details"
            >
              <Feather name="file-text" size={16} color={theme.text} />
              <ThemedText type="small">Details</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.copyButton,
                { borderColor: theme.border, borderWidth: 1 },
                pressed && styles.pressed,
              ]}
              onPress={copyTitle}
              testID="button-copy-title"
            >
              <Feather name="type" size={16} color={theme.text} />
              <ThemedText type="small">Title</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.copyButton,
                { backgroundColor: AppColors.secondary },
                pressed && styles.pressed,
              ]}
              onPress={shareProduct}
              testID="button-share-product"
            >
              <Feather name="share-2" size={16} color="#FFFFFF" />
              <ThemedText type="small" style={styles.copyButtonText}>
                Share
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.offersSection}>
            <View style={styles.sectionHeader}>
              <Feather name="tag" size={18} color={AppColors.primary} />
              <ThemedText type="h4" style={styles.sectionTitle}>
                Available Offers
              </ThemedText>
            </View>

            {product.offers.map((offer, index) => (
              <OfferButton
                key={index}
                name={offer.name}
                link={offer.link}
                success={offer.success}
                onCopied={() => showToast("Link copied!", "success")}
              />
            ))}

            <Pressable
              style={({ pressed }) => [
                styles.otherOffersButton,
                pressed && styles.pressed,
              ]}
              onPress={openOtherOffers}
              testID="button-other-offers"
            >
              <Feather name="external-link" size={18} color="#FFFFFF" />
              <ThemedText type="body" style={styles.otherOffersText}>
                Other Offers
              </ThemedText>
            </Pressable>
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
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  downloadButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  detailsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  priceRight: {
    marginLeft: Spacing.xl,
  },
  originalPrice: {
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: AppColors.secondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginLeft: "auto",
  },
  discountText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: "45%",
  },
  infoText: {
    marginLeft: Spacing.xs,
  },
  shopButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  copyActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  copyButtonText: {
    color: "#FFFFFF",
  },
  offersSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
  },
  otherOffersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.accent,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  otherOffersText: {
    color: "#1A1A1A",
    fontWeight: "600",
  },
});
