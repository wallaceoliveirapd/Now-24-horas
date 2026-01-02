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
import { Profile } from '../screens/Profile';
import { Addresses } from '../screens/Addresses';
import { PaymentMethods } from '../screens/PaymentMethods';
import { Favorites } from '../screens/Favorites';
import { Settings } from '../screens/Settings';
import { Languages } from '../screens/Languages';
import { TermsOfUse } from '../screens/TermsOfUse';
import { PrivacyPolicy } from '../screens/PrivacyPolicy';
import { ChangePassword } from '../screens/ChangePassword';
import { Help } from '../screens/Help';
import { EditProfile } from '../screens/EditProfile';

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
  Profile: undefined;
  Addresses: undefined;
  PaymentMethods: undefined;
  Favorites: undefined;
  Settings: undefined;
  Languages: undefined;
  TermsOfUse: undefined;
  PrivacyPolicy: undefined;
  ChangePassword: undefined;
  Help: undefined;
  EditProfile: undefined;
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
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Addresses" component={Addresses} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethods} />
        <Stack.Screen name="Favorites" component={Favorites} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Languages" component={Languages} />
        <Stack.Screen name="TermsOfUse" component={TermsOfUse} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="Help" component={Help} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

