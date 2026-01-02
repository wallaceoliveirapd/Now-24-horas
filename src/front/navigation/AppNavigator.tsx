import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home } from '../screens/Home';
import { ComponentShowcase } from '../screens/ComponentShowcase';
import { Cart } from '../screens/Cart';
import { Cupons } from '../screens/Cupons';
import { Search } from '../screens/Search';
import { Checkout } from '../screens/Checkout';
import { OrderConfirmation } from '../screens/OrderConfirmation';
import { OrderDetails } from '../screens/OrderDetails';
import { MyOrders } from '../screens/MyOrders';

export type RootStackParamList = {
  Home: undefined;
  ComponentShowcase: undefined;
  Cart: undefined;
  Cupons: undefined;
  Search: undefined;
  Checkout: undefined;
  OrderConfirmation: {
    orderNumber: string;
    deliveryTime: string;
    totalPaid: number;
  };
  OrderDetails: {
    orderNumber: string;
    orderDate?: string;
    orderId?: string;
  };
  MyOrders: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ComponentShowcase" component={ComponentShowcase} />
        <Stack.Screen name="Cart" component={Cart} />
        <Stack.Screen name="Cupons" component={Cupons} />
        <Stack.Screen name="Search" component={Search} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} />
        <Stack.Screen name="MyOrders" component={MyOrders} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

