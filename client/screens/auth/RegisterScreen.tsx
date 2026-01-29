import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";
import { AppColors, Spacing, BorderRadius } from "@/constants/theme";
import type { AuthStackParamList } from "@/navigation/AuthNavigator";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, "Register">;

export default function RegisterScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleRegister = async () => {
    setError("");

    if (!firstName.trim()) {
      setError("يرجى إدخال الاسم");
      return;
    }

    if (!lastName.trim()) {
      setError("يرجى إدخال اللقب");
      return;
    }

    if (!email.trim()) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }

    if (!birthDate) {
      setError("يرجى تحديد تاريخ الميلاد");
      return;
    }

    if (!password) {
      setError("يرجى إدخال كلمة المرور");
      return;
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف أو أكثر");
      return;
    }

    const hasLetterAndNumber = /^(?=.*[a-zA-Z])(?=.*[0-9])/.test(password);
    if (!hasLetterAndNumber) {
      setError("كلمة المرور يجب أن تحتوي على أحرف وأرقام");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/register", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        birthDate: birthDate.toISOString().split("T")[0],
        password: password,
      });

      const data = await response.json();
      await login(data.user);
    } catch (err: any) {
      const errorMessage = err.message || "";
      if (errorMessage.includes("409") || errorMessage.includes("exists") || errorMessage.includes("duplicate")) {
        setError("البريد الإلكتروني مستخدم مسبقاً");
      } else {
        setError("حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة لاحقاً");
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
            { paddingTop: insets.top + Spacing["2xl"], paddingBottom: insets.bottom + Spacing["2xl"] },
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
              إنشاء حساب
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              أنشئ حسابك الجديد للبدء
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

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText type="small" style={styles.label}>
                  اللقب
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="اللقب"
                    placeholderTextColor={theme.textSecondary}
                    testID="input-last-name"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText type="small" style={styles.label}>
                  الاسم
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="الاسم"
                    placeholderTextColor={theme.textSecondary}
                    testID="input-first-name"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                البريد الإلكتروني
              </ThemedText>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Feather name="mail" size={20} color={theme.textSecondary} />
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
                تاريخ الميلاد
              </ThemedText>
              <Pressable
                style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                onPress={() => setShowDatePicker(true)}
                testID="input-birth-date"
              >
                <Feather name="calendar" size={20} color={theme.textSecondary} />
                <ThemedText
                  type="body"
                  style={[styles.dateText, { color: birthDate ? theme.text : theme.textSecondary }]}
                >
                  {birthDate ? formatDate(birthDate) : "اختر تاريخ الميلاد"}
                </ThemedText>
              </Pressable>
            </View>

            {showDatePicker ? (
              <DateTimePicker
                value={birthDate || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (date) {
                    setBirthDate(date);
                  }
                }}
                maximumDate={new Date()}
              />
            ) : null}

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                كلمة المرور
              </ThemedText>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Feather name="lock" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="8 أحرف وأرقام على الأقل"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                  testID="input-password"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                تأكيد كلمة المرور
              </ThemedText>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Feather name="lock" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="أعد كتابة كلمة المرور"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showConfirmPassword}
                  testID="input-confirm-password"
                />
                <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Feather
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.registerButton,
                pressed && styles.buttonPressed,
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
              testID="button-submit-register"
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText type="body" style={styles.registerButtonText}>
                  إنشاء حساب
                </ThemedText>
              )}
            </Pressable>

            <View style={styles.loginSection}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                لديك حساب بالفعل؟{" "}
              </ThemedText>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <ThemedText type="small" style={styles.loginLink}>
                  تسجيل الدخول
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
    marginBottom: Spacing.xl,
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  headerSection: {
    marginBottom: Spacing["2xl"],
    alignItems: "flex-end",
  },
  title: {
    marginBottom: Spacing.sm,
  },
  formSection: {
    gap: Spacing.md,
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
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontWeight: "500",
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlign: "right",
  },
  dateText: {
    flex: 1,
    textAlign: "right",
  },
  registerButton: {
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
  registerButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 18,
  },
  loginSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  loginLink: {
    color: AppColors.primary,
    fontWeight: "600",
  },
});
