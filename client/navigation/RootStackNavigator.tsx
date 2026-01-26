import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigator from "@/navigation/DrawerNavigator";
import ProductDetailsScreen from "@/screens/ProductDetailsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import type { ProductItem } from "@/lib/storage";

export type RootStackParamList = {
  Main: undefined;
  ProductDetails: { product: ProductItem };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions({ transparent: false });

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{
          headerTitle: "Product Details",
          presentation: "card",
        }}
      />
    </Stack.Navigator>
  );
}
