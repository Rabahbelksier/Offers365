import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  RefreshControl,
  Pressable,
  Image,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ProductCard } from "@/components/ProductCard";
import { SocialLinks } from "@/components/SocialLinks";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { Toast } from "@/components/Toast";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import {
  getRecentProducts,
  saveProduct,
  clearRecentProducts,
  getSettings,
  ProductItem,
} from "@/lib/storage";
import { getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [linkInput, setLinkInput] = useState("");
  const [recentProducts, setRecentProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Searching for offers...");
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" as const });

  const loadRecentProducts = useCallback(async () => {
    const products = await getRecentProducts();
    setRecentProducts(products);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecentProducts();
    }, [loadRecentProducts])
  );

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  const getOffers = async () => {
    if (!linkInput.trim()) {
      showToast("Please enter an AliExpress product link", "error");
      return;
    }

    const settings = await getSettings();
    if (!settings.appKey || !settings.appSecret || !settings.trackingId) {
      showToast("Please configure API keys in Settings first", "error");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Extracting product information...");

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(new URL("/api/product", apiUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: linkInput.trim(),
          appKey: settings.appKey,
          appSecret: settings.appSecret,
          trackingId: settings.trackingId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch product");
      }

      setLoadingMessage("Generating affiliate links...");
      const product: ProductItem = await response.json();

      await saveProduct(product);
      await loadRecentProducts();

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setLinkInput("");
      navigation.navigate("ProductDetails", { product });
    } catch (error) {
      console.error("Failed to get offers:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to fetch product",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRecentProducts();
    setIsRefreshing(false);
  };

  const handleClearHistory = async () => {
    await clearRecentProducts();
    setRecentProducts([]);
    if (Platform.OS !== "web") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    showToast("History cleared", "success");
  };

  const handleProductPress = (product: ProductItem) => {
    navigation.navigate("ProductDetails", { product });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Image
        source={require("../../assets/images/empty-history.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText type="h4" style={styles.emptyTitle}>
        No Recent Products
      </ThemedText>
      <ThemedText
        type="small"
        style={[styles.emptyText, { color: theme.textSecondary }]}
      >
        Paste an AliExpress product link above to find the best offers
      </ThemedText>
    </View>
  );

  const renderFooter = () => {
    if (recentProducts.length === 0) return null;

    return (
      <View style={styles.listFooter}>
        <View style={styles.footerButtonsCenter}>
          <Pressable
            style={({ pressed }) => [
              styles.clearHistoryButton,
              { borderColor: theme.border },
              pressed && styles.buttonPressed,
            ]}
            onPress={handleClearHistory}
          >
            <Feather name="trash-2" size={18} color={AppColors.error} />
            <ThemedText type="small" style={{ color: AppColors.error }}>
              Clear History
            </ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  const handleSaveToList = async () => {
    if (!linkInput.trim()) {
      showToast("Please enter an AliExpress product link", "error");
      return;
    }

    const settings = await getSettings();
    if (!settings.appKey || !settings.appSecret || !settings.trackingId) {
      showToast("Please configure API keys in Settings first", "error");
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Saving to list...");

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(new URL("/api/product", apiUrl).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: linkInput.trim(),
          appKey: settings.appKey,
          appSecret: settings.appSecret,
          trackingId: settings.trackingId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch product");
      }

      const product: ProductItem = await response.json();
      await saveProduct(product);
      await loadRecentProducts();

      if (Platform.OS !== "web") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setLinkInput("");
      showToast("Product saved to list!", "success");
    } catch (error) {
      console.error("Failed to save product:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to save product",
        "error"
      );
    } finally {
      setIsLoading(false);
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
      <LoadingOverlay visible={isLoading} message={loadingMessage} />

      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        data={recentProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => handleProductPress(item)} />
        )}
        ListHeaderComponent={
          <View style={styles.header}>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <Feather name="link" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Paste AliExpress product link here..."
                placeholderTextColor={theme.textSecondary}
                value={linkInput}
                onChangeText={setLinkInput}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                testID="input-link"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.getOffersButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={getOffers}
              testID="button-get-offers"
            >
              <Feather name="search" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={styles.buttonText}>
                Get Offers
              </ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.saveToListButton,
                { borderColor: AppColors.primary },
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSaveToList}
              testID="button-save-to-list"
            >
              <Feather name="plus-circle" size={20} color={AppColors.primary} />
              <ThemedText type="body" style={styles.saveToListText}>
                Save to List
              </ThemedText>
            </Pressable>

            {recentProducts.length > 0 && (
              <View style={styles.sectionHeader}>
                <Feather name="clock" size={18} color={theme.textSecondary} />
                <ThemedText type="h4" style={styles.sectionTitle}>
                  Recent Products
                </ThemedText>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={AppColors.primary}
            colors={[AppColors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <SocialLinks />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 100,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 70,
  },
  getOffersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: AppColors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing["2xl"],
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
  listFooter: {
    marginTop: Spacing.lg,
  },
  footerButtonsCenter: {
    alignItems: "center",
  },
  clearHistoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  saveToListButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 2,
  },
  saveToListText: {
    color: AppColors.primary,
    fontWeight: "600",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});
