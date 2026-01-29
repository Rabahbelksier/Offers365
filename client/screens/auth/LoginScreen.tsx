import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Login">;

export default function LoginScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email.trim()) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!password.trim()) {
      setError("يرجى إدخال كلمة المرور");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        emailOrUsername: email.trim(),
        password: password,
      });

      const data = await response.json();
      await login(data.user);
    } catch (err: any) {
      const errorMessage = err.message || "حدث خطأ أثناء تسجيل الدخول";
      if (errorMessage.includes("404") || errorMessage.includes("not found")) {
        setError("لم يتم العثور على حساب بهذا البريد الإلكتروني");
      } else if (errorMessage.includes("401") || errorMessage.includes("Invalid")) {
        setError("كلمة المرور غير صحيحة");
      } else {
        setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة لاحقاً");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + Spacing["3xl"], paddingBottom: insets.bottom + Spacing["2xl"] },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            testID="button-back"
          >
            <Feather name="arrow-left" size={24} color={theme.text} />
          </Pressable>

          <View style={styles.headerSection}>
            <ThemedText type="h1" style={styles.title}>
              مرحباً بك
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              قم بتسجيل الدخول للمتابعة
            </ThemedText>
          </View>

          <View style={styles.formSection}>
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={18} color={AppColors.error} />
                <ThemedText type="small" style={styles.errorText}>
                  {error}
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                البريد الإلكتروني
              </ThemedText>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="example@email.com"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="input-email"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                كلمة المرور
              </ThemedText>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  testID="input-password"
                />
                <Pressable style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              testID="button-submit-login"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="body" style={styles.loginButtonText}>
                  تسجيل الدخول
                </ThemedText>
              )}
            </Pressable>

            <View style={styles.registerSection}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                ليس لديك حساب؟{" "}
              </ThemedText>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <ThemedText type="small" style={styles.registerLink}>
                  إنشاء حساب
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  backButton: {
    marginBottom: Spacing["2xl"],
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  headerSection: {
    marginBottom: Spacing["3xl"],
    alignItems: "flex-end",
  },
  title: {
    marginBottom: Spacing.sm,
  },
  formSection: {
    gap: Spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${AppColors.error}15`,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  errorText: {
    color: AppColors.error,
    flex: 1,
    textAlign: "right",
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontWeight: "500",
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    textAlign: "right",
  },
  eyeButton: {
    padding: Spacing.sm,
  },
  loginButton: {
    height: 56,
    backgroundColor: AppColors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
  },
  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  registerLink: {
    color: AppColors.primary,
    fontWeight: "600",
  },
});
