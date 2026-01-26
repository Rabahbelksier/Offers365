import React from "react";
import { View, StyleSheet, Pressable, Share, Linking } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "@/screens/HomeScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import MessageDesignScreen from "@/screens/MessageDesignScreen";
import AppGuideScreen from "@/screens/AppGuideScreen";
import { ThemedText } from "@/components/ThemedText";
import { SocialLinks } from "@/components/SocialLinks";
import { useTheme } from "@/hooks/useTheme";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";

export type DrawerParamList = {
  Home: undefined;
  Settings: undefined;
  MessageDesign: undefined;
  AppGuide: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

interface DrawerItemProps {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isActive: boolean;
  onPress: () => void;
}

function DrawerItem({ label, icon, isActive, onPress }: DrawerItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.drawerItem,
        isActive && {
          backgroundColor: `${AppColors.primary}15`,
        },
        pressed && styles.drawerItemPressed,
      ]}
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={22}
        color={isActive ? AppColors.primary : theme.textSecondary}
      />
      <ThemedText
        type="body"
        style={[
          styles.drawerLabel,
          isActive && { color: AppColors.primary, fontWeight: "600" },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, navigation } = props;

  const menuItems: { name: keyof DrawerParamList; label: string; icon: keyof typeof Feather.glyphMap }[] = [
    { name: "Home", label: "Home", icon: "home" },
    { name: "Settings", label: "Settings", icon: "settings" },
    { name: "MessageDesign", label: "Message Design", icon: "edit-3" },
    { name: "AppGuide", label: "App Guide", icon: "book-open" },
  ];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[
        styles.drawerContent,
        { backgroundColor: theme.backgroundRoot },
      ]}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.logoContainer}>
          <Feather name="tag" size={32} color={AppColors.primary} />
        </View>
        <ThemedText type="h2" style={styles.appName}>
          Offers 365
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }}>
          AliExpress Deals Finder
        </ThemedText>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <DrawerItem
            key={item.name}
            label={item.label}
            icon={item.icon}
            isActive={state.index === index}
            onPress={() => navigation.navigate(item.name)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <SocialLinks />
        <ThemedText
          type="caption"
          style={[styles.version, { color: theme.textSecondary }]}
        >
          Version 1.0.0
        </ThemedText>
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { theme, isDark } = useTheme();

  const shareApp = async () => {
    try {
      await Share.share({
        message:
          "Check out Offers 365 - Find the best AliExpress deals! Download now: https://offers365.app",
      });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.backgroundRoot,
        },
        headerTintColor: theme.text,
        headerTitleAlign: "center",
        drawerStyle: {
          backgroundColor: theme.backgroundRoot,
          width: 280,
        },
        headerRight: () => (
          <Pressable
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.headerButtonPressed,
            ]}
            onPress={shareApp}
          >
            <Feather name="share-2" size={22} color={AppColors.primary} />
          </Pressable>
        ),
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => (
            <View style={styles.headerTitleContainer}>
              <Feather name="tag" size={24} color={AppColors.primary} />
              <ThemedText type="h3" style={styles.headerTitle}>
                Offers 365
              </ThemedText>
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
      <Drawer.Screen
        name="MessageDesign"
        component={MessageDesignScreen}
        options={{
          headerTitle: "Message Design",
        }}
      />
      <Drawer.Screen
        name="AppGuide"
        component={AppGuideScreen}
        options={{
          headerTitle: "App Guide",
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    alignItems: "center",
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${AppColors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    color: AppColors.primary,
    marginBottom: Spacing.xs,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  drawerItemPressed: {
    opacity: 0.7,
  },
  drawerLabel: {
    marginLeft: Spacing.md,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    marginTop: Spacing.lg,
  },
  version: {
    textAlign: "center",
  },
  headerButton: {
    marginRight: Spacing.lg,
    padding: Spacing.sm,
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    marginLeft: Spacing.sm,
    color: AppColors.primary,
  },
});
