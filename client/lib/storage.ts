import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  RECENT_PRODUCTS: "offers365_recent_products",
  SETTINGS: "offers365_settings",
  MESSAGE_TEMPLATE: "offers365_message_template",
};

export interface ProductItem {
  id: string;
  productId: string;
  title: string;
  imageUrl: string | null;
  price: string;
  originalPrice: string;
  discount: string;
  storeName: string;
  evaluateRate?: string;
  shopUrl?: string;
  categoryName?: string;
  commissionRate?: string;
  orders?: string;
  searchedAt: string;
  offers: OfferItem[];
}

export interface OfferItem {
  name: string;
  link: string;
  success: boolean;
}

export interface AppSettings {
  language: "en" | "ar";
  theme: "light" | "dark" | "system";
  appKey: string;
  appSecret: string;
  trackingId: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  language: "en",
  theme: "system",
  appKey: "",
  appSecret: "",
  trackingId: "",
};

export const DEFAULT_MESSAGE_TEMPLATE = `{title}

Current Price: {price}
Original Price: {originalPrice}
Discount: {discount}

Store: {storeName}

Offers:
{offers}`;

export async function getRecentProducts(): Promise<ProductItem[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENT_PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveProduct(product: ProductItem): Promise<void> {
  try {
    const products = await getRecentProducts();
    const existingIndex = products.findIndex(
      (p) => p.productId === product.productId
    );

    if (existingIndex >= 0) {
      products.splice(existingIndex, 1);
    }

    products.unshift(product);

    if (products.length > 20) {
      products.pop();
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.RECENT_PRODUCTS,
      JSON.stringify(products)
    );
  } catch (error) {
    console.error("Failed to save product:", error);
  }
}

export async function clearRecentProducts(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.RECENT_PRODUCTS);
  } catch (error) {
    console.error("Failed to clear products:", error);
  }
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export async function getMessageTemplate(): Promise<string> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGE_TEMPLATE);
    return data || DEFAULT_MESSAGE_TEMPLATE;
  } catch {
    return DEFAULT_MESSAGE_TEMPLATE;
  }
}

export async function saveMessageTemplate(template: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGE_TEMPLATE, template);
  } catch (error) {
    console.error("Failed to save template:", error);
  }
}

export function formatProductMessage(
  product: ProductItem,
  template: string
): string {
  const offersText = product.offers
    .filter((o) => o.success)
    .map((o) => `${o.name}:\n${o.link}`)
    .join("\n\n");

  return template
    .replace("{title}", product.title)
    .replace("{price}", product.price)
    .replace("{originalPrice}", product.originalPrice)
    .replace("{discount}", product.discount)
    .replace("{storeName}", product.storeName)
    .replace("{offers}", offersText);
}
