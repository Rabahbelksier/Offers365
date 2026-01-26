import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SocialLinks } from "@/components/SocialLinks";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";

interface GuideCardProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

function GuideCard({ icon, title, description }: GuideCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.guideCard,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <View style={styles.guideIconContainer}>
        <Feather name={icon} size={24} color={AppColors.primary} />
      </View>
      <View style={styles.guideContent}>
        <ThemedText type="h4" style={styles.guideTitle}>
          {title}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

export default function AppGuideScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const guideItems: GuideCardProps[] = [
    {
      icon: "link",
      title: "Link Input",
      description:
        "Paste any AliExpress product link in the input field on the home screen. The app supports all link formats including shortened URLs and links from the AliExpress app.",
    },
    {
      icon: "search",
      title: "Get Offers",
      description:
        "Press the 'Get Offers' button to fetch product details and generate multiple affiliate offer links. The app will display all available promotional offers for the product.",
    },
    {
      icon: "tag",
      title: "Understanding Offers",
      description:
        "Each offer button represents a different promotional link type: Coin Page, Direct Link, Super Deals, Big Save, Limited Discount, Bundle Deals, and more. Tap to open the offer in AliExpress.",
    },
    {
      icon: "copy",
      title: "Copy & Share",
      description:
        "Use the copy buttons to copy individual links, product details, or the complete formatted message. Share buttons open your device's share sheet for easy sharing to social media.",
    },
    {
      icon: "settings",
      title: "API Configuration",
      description:
        "Go to Settings to enter your AliExpress Affiliate API credentials (APP KEY, APP SECRET, and TRACKING ID). These are required to generate affiliate links.",
    },
    {
      icon: "edit-3",
      title: "Message Customization",
      description:
        "Visit Message Design to customize how product information is formatted when copied or shared. Use keywords like {title}, {price}, {discount} to create your template.",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image
            source={require("../../assets/images/guide-hero.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />
          <ThemedText type="h2" style={styles.heroTitle}>
            Welcome to Offers 365
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.heroSubtitle, { color: theme.textSecondary }]}
          >
            Your ultimate tool for finding the best AliExpress deals
          </ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="book-open" size={18} color={AppColors.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>
              How to Use
            </ThemedText>
          </View>

          {guideItems.map((item, index) => (
            <GuideCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </View>

        <View
          style={[
            styles.tipCard,
            { backgroundColor: `${AppColors.accent}20`, borderColor: AppColors.accent },
          ]}
        >
          <View style={styles.tipHeader}>
            <Feather name="zap" size={20} color={AppColors.accent} />
            <ThemedText type="h4" style={[styles.tipTitle, { color: "#B8860B" }]}>
              Pro Tips
            </ThemedText>
          </View>
          <ThemedText type="small" style={styles.tipText}>
            {"\u2022"} Recent products are saved for quick access - tap them to view offers
            without fetching again{"\n"}
            {"\u2022"} The app detects AliExpress links within any text, so you can paste
            entire messages{"\n"}
            {"\u2022"} Try different offer types - some may have better discounts than others{"\n"}
            {"\u2022"} Customize your message template for consistent sharing across platforms
          </ThemedText>
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
  heroContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  heroImage: {
    width: 200,
    height: 150,
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    textAlign: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
  },
  guideCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  guideIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${AppColors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  guideContent: {
    flex: 1,
  },
  guideTitle: {
    marginBottom: Spacing.xs,
  },
  tipCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  tipTitle: {
    marginLeft: Spacing.sm,
  },
  tipText: {
    lineHeight: 22,
  },
});
