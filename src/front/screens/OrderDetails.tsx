import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState, useEffect, useRef, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Separator, OrderStepsIcon, Skeleton, ErrorState, Button } from '../../../components/ui';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { MapPin, Info, Wallet, CreditCard, ChevronDown, ChevronUp, MessageSquareMore, ChevronLeft } from 'lucide-react-native';
import { orderService, type Order, formatOrderDate, formatCurrency } from '../../services/order.service';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type RootStackParamList = {
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OrderDetailsRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;

interface OrderStatus {
  step: 'Confirmação' | 'Preparação' | 'Entrega' | 'Entregue';
  state: 'Default' | 'Current' | 'Complete' | 'Error';
  label: string;
  date?: string;
}

// Map Track Component
function MapTrack({ order, onBackPress }: { order: Order | null; onBackPress: () => void }) {
  const [embedMapUrl, setEmbedMapUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get restaurant coordinates from environment variables
  const storeCoordinates = { 
    latitude: parseFloat(process.env.EXPO_PUBLIC_RESTAURANT_LATITUDE || process.env.RESTAURANT_LATITUDE || '-7.0813493'),
    longitude: parseFloat(process.env.EXPO_PUBLIC_RESTAURANT_LONGITUDE || process.env.RESTAURANT_LONGITUDE || '-34.8391646')
  };
  
  // State for user coordinates (will be geocoded from address)
  const [userCoordinates, setUserCoordinates] = useState<{ latitude: number; longitude: number }>({
    latitude: -7.1195, // Default to João Pessoa, PB (will be updated by geocoding)
    longitude: -34.8450
  });
  
  // Calculate center point between store and user (recalculated when coordinates change)
  const centerCoordinates = useMemo(() => ({
    latitude: (storeCoordinates.latitude + userCoordinates.latitude) / 2,
    longitude: (storeCoordinates.longitude + userCoordinates.longitude) / 2,
  }), [storeCoordinates.latitude, storeCoordinates.longitude, userCoordinates.latitude, userCoordinates.longitude]);

  // Calculate zoom based on distance between points
  const zoom = useMemo(() => {
    const latDiff = Math.abs(storeCoordinates.latitude - userCoordinates.latitude);
    const lngDiff = Math.abs(storeCoordinates.longitude - userCoordinates.longitude);
    const maxDiff = Math.max(latDiff, lngDiff);
    
    if (maxDiff < 0.01) return 15;
    else if (maxDiff < 0.02) return 14;
    else if (maxDiff > 0.1) return 11;
    return 13;
  }, [storeCoordinates.latitude, storeCoordinates.longitude, userCoordinates.latitude, userCoordinates.longitude]);

  // Geocode user address to get coordinates
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!order?.endereco) return;
      
      const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 
                     (global as any).__EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      
      if (!apiKey) return;

      try {
        // Build address string
        const addressParts = [
          order.endereco.rua,
          order.endereco.numero,
          order.endereco.bairro,
          order.endereco.cidade,
          order.endereco.estado,
          'Brasil'
        ].filter(Boolean);
        const addressString = addressParts.join(', ');
        
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${apiKey}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results[0]) {
          const location = data.results[0].geometry.location;
          setUserCoordinates({
            latitude: location.lat,
            longitude: location.lng
          });
          console.log('✅ User address geocoded successfully:', location);
        } else {
          console.warn('⚠️ Geocoding failed. Status:', data.status);
        }
      } catch (error) {
        console.warn('⚠️ Geocoding error:', error);
      }
    };

    geocodeAddress();
  }, [order?.endereco]);

  // Generate Google Maps JavaScript API HTML
  useEffect(() => {
    const generateMapHTML = async () => {
      setIsLoading(true);
      
      // Wait a bit for geocoding to complete if address is being geocoded
      if (order?.endereco) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      try {
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 
                       (global as any).__EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        
        if (!apiKey) {
          console.warn('⚠️ Google Maps API key not found');
          console.warn('💡 Set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file');
          setEmbedMapUrl(null);
          setIsLoading(false);
          return;
        }

        // Get route from Directions API
        let routePolyline = '';
        const origin = `${storeCoordinates.latitude},${storeCoordinates.longitude}`;
        const destination = `${userCoordinates.latitude},${userCoordinates.longitude}`;
        
        try {
          const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;
          const response = await fetch(directionsUrl);
          const data = await response.json();
          
          if (data.status === 'OK' && data.routes && data.routes[0] && data.routes[0].overview_polyline) {
            routePolyline = data.routes[0].overview_polyline.points;
            console.log('✅ Using real route from Directions API');
          }
        } catch (error) {
          console.warn('⚠️ Directions API failed:', error);
        }

        // Account for help banner at bottom (approximately 20% of screen height)
        // Adjust center to show more of the map above the help banner
        const latDiff = Math.abs(storeCoordinates.latitude - userCoordinates.latitude);
        const adjustedCenterLat = centerCoordinates.latitude + (latDiff * 0.15);
        
        // Build HTML with Google Maps JavaScript API
        const primaryColor = colors.primary.replace('#', '');
        const secondaryColor = colors.secondary.replace('#', '');
        
        const mapHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body, html {
                  width: 100%;
                  height: 100%;
                  overflow: hidden;
                  touch-action: none;
                  background-color: #f0f0f0;
                }
                #map {
                  width: 100%;
                  height: 100%;
                  background-color: #e0e0e0;
                }
                .error {
                  padding: 20px;
                  color: red;
                  font-family: Arial, sans-serif;
                }
              </style>
            </head>
            <body>
              <div id="map"></div>
              <div id="error" class="error" style="display: none;"></div>
              <script>
                window.onerror = function(msg, url, line) {
                  console.error('JavaScript error:', msg, 'at', url, ':', line);
                  document.getElementById('error').style.display = 'block';
                  document.getElementById('error').textContent = 'Error: ' + msg;
                  return false;
                };

                function initMap() {
                  try {
                    console.log('Initializing map...');
                    const center = { lat: ${adjustedCenterLat}, lng: ${centerCoordinates.longitude} };
                    const map = new google.maps.Map(document.getElementById('map'), {
                      center: center,
                      zoom: ${zoom},
                      mapTypeId: 'roadmap',
                      disableDefaultUI: true,
                      zoomControl: false,
                      gestureHandling: 'none',
                      draggable: false,
                      scrollwheel: false,
                      disableDoubleClickZoom: true,
                      keyboardShortcuts: false
                    });

                    console.log('Map created successfully');

                    // Add store marker with default icon (visible)
                    const storeMarker = new google.maps.Marker({
                      position: { lat: ${storeCoordinates.latitude}, lng: ${storeCoordinates.longitude} },
                      map: map,
                      title: 'A Loja'
                    });

                    // Add user marker with default icon (visible)
                    const userMarker = new google.maps.Marker({
                      position: { lat: ${userCoordinates.latitude}, lng: ${userCoordinates.longitude} },
                      map: map,
                      title: 'Você'
                    });

                    ${routePolyline ? `
                    // Add route polyline
                    try {
                      const routePath = google.maps.geometry.encoding.decodePath('${routePolyline}');
                      const routePolyline = new google.maps.Polyline({
                        path: routePath,
                        geodesic: true,
                        strokeColor: '#${primaryColor}',
                        strokeOpacity: 1.0,
                        strokeWeight: 5,
                        map: map
                      });
                      console.log('Route polyline added');
                    } catch (e) {
                      console.error('Error adding route:', e);
                    }
                    ` : ''}

                    console.log('Map initialization complete');
                  } catch (error) {
                    console.error('Error in initMap:', error);
                    document.getElementById('error').style.display = 'block';
                    document.getElementById('error').textContent = 'Map error: ' + error.message;
                  }
                }

                function gm_authFailure() {
                  console.error('Google Maps authentication failed');
                  document.getElementById('error').style.display = 'block';
                  document.getElementById('error').textContent = 'Google Maps API authentication failed. Please check your API key.';
                }
              </script>
              <script async defer
                src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=geometry&v=3.56"
                onerror="gm_authFailure()">
              </script>
            </body>
          </html>
        `;
        
        setEmbedMapUrl(mapHTML);
        console.log('✅ Google Maps JavaScript API HTML generated successfully');
        console.log('🔑 API Key present:', !!apiKey);
        console.log('📍 Store coordinates:', storeCoordinates);
        console.log('📍 User coordinates:', userCoordinates);
      } catch (error) {
        console.error('❌ Error generating map HTML:', error);
        setEmbedMapUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    generateMapHTML();
  }, [order, userCoordinates.latitude, userCoordinates.longitude, centerCoordinates.latitude, centerCoordinates.longitude, zoom, storeCoordinates.latitude, storeCoordinates.longitude]);

  return (
    <View style={styles.mapContainer}>
      {/* Google Maps JavaScript API */}
      {embedMapUrl ? (
        <WebView
          source={{ 
            html: embedMapUrl
          }}
          style={StyleSheet.absoluteFillObject}
          scrollEnabled={false}
          zoomEnabled={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => {
            setIsLoading(false);
            console.log('✅ WebView loaded');
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ WebView error:', nativeEvent);
            console.error('❌ Error code:', nativeEvent.code);
            console.error('❌ Error description:', nativeEvent.description);
            setIsLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('❌ WebView HTTP error:', nativeEvent);
            console.error('❌ Status code:', nativeEvent.statusCode);
          }}
          onMessage={(event) => {
            const data = event.nativeEvent.data;
            console.log('📨 WebView message:', data);
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      ) : (
        // Fallback: gray background when API key is not available
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.gray[100] }]} />
      )}
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={onBackPress}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color={colors.black} strokeWidth={2} />
      </TouchableOpacity>

      {/* Store label - Positioned at store coordinates */}
      {(() => {
        // Calculate map bounds based on zoom level and center
        // For zoom 13, approximate degrees per pixel
        const latDiff = Math.abs(storeCoordinates.latitude - userCoordinates.latitude) * 1.5 || 0.05;
        const lngDiff = Math.abs(storeCoordinates.longitude - userCoordinates.longitude) * 1.5 || 0.05;
        
        // Calculate visible map bounds (approximate)
        const mapLatMin = centerCoordinates.latitude - latDiff;
        const mapLatMax = centerCoordinates.latitude + latDiff;
        const mapLngMin = centerCoordinates.longitude - lngDiff;
        const mapLngMax = centerCoordinates.longitude + lngDiff;
        
        // Account for safe area and help banner (approximately 20% from bottom)
        const mapVisibleHeight = SCREEN_HEIGHT * 0.8; // 80% visible (20% for help banner)
        const mapVisibleTop = 0; // Start from top
        
        // Convert geographic coordinates to screen pixels
        const storeX = ((storeCoordinates.longitude - mapLngMin) / (mapLngMax - mapLngMin)) * SCREEN_WIDTH;
        const storeY = mapVisibleTop + ((mapLatMax - storeCoordinates.latitude) / (mapLatMax - mapLatMin)) * mapVisibleHeight;
        
        const userX = ((userCoordinates.longitude - mapLngMin) / (mapLngMax - mapLngMin)) * SCREEN_WIDTH;
        const userY = mapVisibleTop + ((mapLatMax - userCoordinates.latitude) / (mapLatMax - mapLatMin)) * mapVisibleHeight;
        
        return (
          <>
            <View 
              style={[
                styles.storeLabelContainer,
                {
                  position: 'absolute',
                  top: storeY - 30, // Offset to center label above point
                  left: storeX - 40, // Offset to center label horizontally
                }
              ]}
            >
              <View style={[styles.labelContainer, { backgroundColor: colors.primary }]}>
                <Text style={styles.labelText}>A Loja</Text>
                <View style={styles.triangleContainer}>
                  <Svg width={12} height={6} viewBox="0 0 12 6">
                    <Path d="M6 6L12 0H0L6 6Z" fill={colors.primary} />
                  </Svg>
                </View>
              </View>
            </View>

            {/* User label - Positioned at user coordinates */}
            <View 
              style={[
                styles.userLabelContainer,
                {
                  position: 'absolute',
                  top: userY - 30, // Offset to center label above point
                  left: userX - 30, // Offset to center label horizontally
                }
              ]}
            >
              <View style={[styles.labelContainer, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.labelText, { color: colors.black }]}>Você</Text>
                <View style={styles.triangleContainer}>
                  <Svg width={12} height={6} viewBox="0 0 12 6">
                    <Path d="M6 6L12 0H0L6 6Z" fill={colors.secondary} />
                  </Svg>
                </View>
              </View>
            </View>
          </>
        );
      })()}
    </View>
  );
}

// Help Banner Component
function HelpBanner() {
  // TODO: Replace with actual avatar image from order/user
  const avatarImage = null; // Placeholder for avatar image
  
  return (
    <View style={styles.helpBanner}>
      <View style={styles.helpBannerAvatar}>
        {avatarImage ? (
          <Image source={avatarImage} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
      </View>
      <View style={styles.helpBannerContent}>
        <Text style={styles.helpBannerTitle}>Precisa de ajuda?</Text>
        <Text style={styles.helpBannerSubtitle}>Fale conosco no chat</Text>
      </View>
      <TouchableOpacity style={styles.helpBannerButton} activeOpacity={0.7}>
        <MessageSquareMore size={24} color={colors.mutedForeground} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}

interface OrderDetailsProps {
  detailsActive?: "False" | "True" | "--";
  error?: boolean;
}

export function OrderDetails({ detailsActive, error }: OrderDetailsProps = {}) {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<OrderDetailsRouteProp>();
  
  const { orderNumber, orderDate, orderId } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  
  // Determine if details should be shown based on props or state
  const isDetailsActive = detailsActive === "True";
  const hasPaymentError = Boolean(error) && detailsActive === "--";
  
  const [showDetails, setShowDetails] = useState(isDetailsActive);
  
  // Animation values
  const animatedHeight = useRef(new Animated.Value(isDetailsActive ? 1 : 0)).current;
  const animatedOpacity = useRef(new Animated.Value(isDetailsActive ? 1 : 0)).current;
  const MAX_DETAILS_HEIGHT = SCREEN_HEIGHT * 0.4; // Maximum 40% of screen height
  const contentHeight = useRef(MAX_DETAILS_HEIGHT);
  const contentMeasured = useRef(false);
  const animationStarted = useRef(isDetailsActive);

  // Animate details section when showDetails changes
  useEffect(() => {
    const shouldShow = showDetails || isDetailsActive;
    animationStarted.current = shouldShow;
    
    // Only animate if content has been measured, or use default height
    if (shouldShow) {
      // Open animation - both must use useNativeDriver: false because maxHeight doesn't support native driver
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 1,
          duration: 500, // Increased from 300ms to 500ms for smoother animation
          useNativeDriver: false, // height animation requires layout
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 400, // Increased from 250ms to 400ms for smoother animation
          useNativeDriver: false, // Changed to false to avoid conflicts
        }),
      ]).start();
    } else {
      // Close animation
      Animated.parallel([
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 400, // Increased from 300ms to 400ms
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 300, // Increased from 200ms to 300ms
          useNativeDriver: false, // Changed to false to avoid conflicts
        }),
      ]).start();
    }
  }, [showDetails, isDetailsActive, animatedHeight, animatedOpacity]);

  // Buscar pedido
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setErrorState('ID do pedido não fornecido');
        setLoading(false);
        return;
      }

      try {
        setErrorState(null);
        const orderData = await orderService.getOrderById(orderId);
        setOrder(orderData);
      } catch (err: any) {
        console.error('Erro ao buscar pedido:', err);
        setErrorState(err.message || 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Mapear histórico de status para timeline com labels dinâmicos
  const getOrderStatus = (): OrderStatus[] => {
    if (!order) return [];

    const status = order.status;
    const historico = order.historicoStatus || [];
    
    // Encontrar datas de cada transição
    const confirmadoDate = historico.find(h => h.statusNovo === 'confirmado')?.criadoEm;
    const preparandoDate = historico.find(h => h.statusNovo === 'preparando')?.criadoEm;
    const saiuParaEntregaDate = historico.find(h => h.statusNovo === 'saiu_para_entrega')?.criadoEm;
    const entregueDate = historico.find(h => h.statusNovo === 'entregue')?.criadoEm;

    // Status auxiliares
    const isPendente = status === 'pendente';
    const isAguardandoPagamento = status === 'aguardando_pagamento';
    const isCancelado = status === 'cancelado';
    const isConfirmado = ['confirmado', 'preparando', 'saiu_para_entrega', 'entregue'].includes(status);
    const isPreparando = status === 'preparando';
    const isPreparado = ['saiu_para_entrega', 'entregue'].includes(status);
    const isSaiuParaEntrega = status === 'saiu_para_entrega';
    const isEntregue = status === 'entregue';

    // Step 1: Confirmação
    let confirmacaoLabel: string;
    let confirmacaoState: 'Default' | 'Current' | 'Complete' | 'Error';
    
    // Se houver erro de pagamento, mostrar estado de erro
    if (hasPaymentError) {
      confirmacaoLabel = 'Erro no pagamento';
      confirmacaoState = 'Error';
    } else if (isCancelado) {
      confirmacaoLabel = 'Pedido cancelado';
      confirmacaoState = 'Error';
    } else if (isConfirmado) {
      confirmacaoLabel = 'Confirmado';
      confirmacaoState = 'Complete';
    } else if (isAguardandoPagamento) {
      confirmacaoLabel = 'Aguardando pagamento';
      confirmacaoState = 'Current';
    } else {
      confirmacaoLabel = 'Aguardando confirmação';
      confirmacaoState = 'Current';
    }

    // Step 2: Preparação
    let preparacaoLabel: string;
    let preparacaoState: 'Default' | 'Current' | 'Complete';
    
    if (isPreparado) {
      preparacaoLabel = 'Preparado';
      preparacaoState = 'Complete';
    } else if (isPreparando) {
      preparacaoLabel = 'Preparando';
      preparacaoState = 'Current';
    } else {
      preparacaoLabel = 'Preparando';
      preparacaoState = 'Default';
    }

    // Step 3: Entrega
    let entregaLabel: string;
    let entregaState: 'Default' | 'Current' | 'Complete';
    
    if (isEntregue) {
      entregaLabel = 'Saiu para entrega';
      entregaState = 'Complete';
    } else if (isSaiuParaEntrega) {
      entregaLabel = 'Saiu para entrega';
      entregaState = 'Current';
    } else if (isPreparando) {
      entregaLabel = 'Aguardando motorista';
      entregaState = 'Default';
    } else {
      entregaLabel = 'Aguardando motorista';
      entregaState = 'Default';
    }

    // Step 4: Entregue
    let entregueState: 'Default' | 'Current' | 'Complete';
    if (isEntregue) {
      entregueState = 'Complete';
    } else {
      entregueState = 'Default';
    }

    return [
      {
        step: 'Confirmação',
        state: confirmacaoState,
        label: confirmacaoLabel,
        date: confirmadoDate ? formatOrderDate(confirmadoDate) : undefined,
      },
      {
        step: 'Preparação',
        state: preparacaoState,
        label: preparacaoLabel,
        date: preparandoDate ? formatOrderDate(preparandoDate) : undefined,
      },
      {
        step: 'Entrega',
        state: entregaState,
        label: entregaLabel,
        date: saiuParaEntregaDate ? formatOrderDate(saiuParaEntregaDate) : undefined,
      },
      {
        step: 'Entregue',
        state: entregueState,
        label: 'Entregue',
        date: entregueDate ? formatOrderDate(entregueDate) : undefined,
      },
    ];
  };

  // Get status message based on order status
  const getStatusMessage = (): string => {
    if (!order) return '';

    // Se houver erro de pagamento, mostrar mensagem de erro
    if (hasPaymentError) {
      return 'Erro no pagamento do pedido';
    }

    const status = order.status;
    
    if (status === 'preparando') {
      return 'Pedido em separação, ele sairá para entrega em breve';
    } else if (status === 'saiu_para_entrega') {
      return 'Seu pedido saiu para entrega';
    } else if (status === 'entregue') {
      return 'Pedido entregue';
    } else if (status === 'confirmado') {
      return 'Pedido confirmado, será preparado em breve';
    } else if (status === 'aguardando_pagamento') {
      return 'Aguardando confirmação do pagamento';
    } else if (status === 'pendente') {
      return 'Aguardando confirmação do pedido';
    } else if (status === 'cancelado') {
      return 'Pedido cancelado';
    }
    
    return 'Pedido em separação, ele sairá para entrega em breve';
  };

  // Get delivery estimate
  const getDeliveryEstimate = (): string => {
    if (!order || !order.tempoEntrega) {
      return '10:00 - 10:40';
    }
    return order.tempoEntrega;
  };

  // Formatar método de pagamento
  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case 'cartao_credito':
        return 'Cartão de crédito';
      case 'cartao_debito':
        return 'Cartão de débito';
      case 'pix':
        return 'PIX';
      case 'boleto':
        return 'Boleto';
      default:
        return method;
    }
  };

  // Get payment card mask
  const getPaymentCardMask = (): string => {
    if (!order || !order.cartaoId) {
      return '****5678';
    }
    // TODO: Get card details from payment card context
    return '****5678';
  };

  const orderStatus = getOrderStatus();

  return (
    <>
      <StatusBar 
        style="dark"
        backgroundColor={colors.white}
        translucent={false}
      />
      <View style={styles.container}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Skeleton width={150} height={18} borderRadius={4} />
          </View>
        ) : errorState ? (
          <ErrorState
            type="orders"
            title="Erro ao carregar pedido"
            description={errorState}
            retryLabel="Tentar novamente"
            onRetry={() => {
              setLoading(true);
              if (orderId) {
                orderService.getOrderById(orderId)
                  .then(setOrder)
                  .catch((err: any) => setErrorState(err.message || 'Erro ao carregar pedido'))
                  .finally(() => setLoading(false));
              }
            }}
            actionLabel="Voltar"
            onAction={() => navigation.goBack()}
          />
        ) : (
          <>
            {/* Map Track Section - Full Screen Background */}
            <View style={styles.mapSection}>
              <MapTrack order={order} onBackPress={() => navigation.goBack()} />
            </View>

            {/* Bottom Overlay Section - Overlaps Map */}
            <View style={styles.bottomOverlay}>
              {/* Help Banner */}
              <HelpBanner />

              {/* Order Status Card */}
              <View style={[styles.statusCard, isDetailsActive && styles.statusCardExpanded]}>
                {/* Status Message */}
                <Text style={styles.statusMessage}>
                  {getStatusMessage()}
                </Text>

                {/* Order Steps */}
                <View style={styles.stepsContainer}>
                  {orderStatus.map((status, index) => {
                    const isLast = index === orderStatus.length - 1;
                    const currentState = status.state;
                    const nextState = !isLast ? orderStatus[index + 1].state : null;
                    
                    // Determine connector color
                    let connectorColor = colors.gray[200];
                    if (currentState === 'Complete') {
                      connectorColor = nextState === 'Current' ? colors.primary : colors.green[700];
                    } else if (currentState === 'Current') {
                      connectorColor = colors.primary;
                    } else if (currentState === 'Error') {
                      connectorColor = colors.red[600] || '#DC6E00';
                    }
                    
                    return (
                      <View key={index} style={styles.stepItem}>
                        <OrderStepsIcon
                          step={status.step}
                          state={currentState}
                          showConnector={false}
                        />
                        {!isLast && (
                          <View style={[styles.horizontalConnector, { backgroundColor: connectorColor }]} />
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Delivery Estimate - Only show if not error */}
                {!hasPaymentError && (
                  <Text style={styles.deliveryEstimate}>
                    <Text style={styles.deliveryEstimateLabel}>Previsão de entrega:</Text>
                    {` ${getDeliveryEstimate()}`}
                  </Text>
                )}

                <Separator style={styles.separator} />

                {/* Details Section - Animated */}
                <Animated.View
                  style={[
                    styles.detailsAnimatedContainer,
                    {
                      height: animatedHeight.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, contentHeight.current],
                      }),
                      opacity: animatedOpacity,
                    },
                  ]}
                >
                  <ScrollView 
                    style={styles.detailsScrollView}
                    contentContainerStyle={styles.detailsContent}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={showDetails || isDetailsActive}
                    onContentSizeChange={(contentWidth, contentHeightValue) => {
                      if (contentHeightValue > 0) {
                        // Limit content height to maximum percentage of screen
                        const actualContentHeight = Math.min(contentHeightValue, MAX_DETAILS_HEIGHT);
                        const wasDefault = contentHeight.current === MAX_DETAILS_HEIGHT;
                        contentHeight.current = actualContentHeight;
                        contentMeasured.current = true;
                        
                        // If content was just measured for the first time and should be shown, animate
                        if (wasDefault && (showDetails || isDetailsActive)) {
                          // Trigger animation after a small delay to ensure layout is complete
                          setTimeout(() => {
                            if (showDetails || isDetailsActive) {
                              animatedHeight.setValue(1);
                              animatedOpacity.setValue(1);
                            }
                          }, 50);
                        }
                      }
                    }}
                  >
                    {/* Order Information */}
                    <View style={styles.detailCard}>
                      <View style={styles.detailCardHeader}>
                        <Info size={16.67} color={colors.primary} strokeWidth={2} />
                        <Text style={styles.detailCardTitle}>Informações do pedido</Text>
                      </View>
                      <View style={styles.detailCardContent}>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Data do pedido</Text>
                          <Text style={styles.detailValue}>
                            {orderDate || (order ? formatOrderDate(order.criadoEm) : '')}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Número do pedido</Text>
                          <Text style={styles.detailValue}>
                            {orderNumber || (order ? order.numeroPedido : '')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Delivery Address */}
                    {order && (
                      <View style={styles.detailCard}>
                        <View style={styles.detailCardHeader}>
                          <MapPin size={16.67} color={colors.primary} strokeWidth={2} />
                          <Text style={styles.detailCardTitle}>Endereço de entrega</Text>
                        </View>
                        <View style={styles.addressContent}>
                          <Text style={styles.addressStreet}>
                            {order.endereco.rua}, {order.endereco.numero}
                          </Text>
                          {order.endereco.complemento && (
                            <Text style={styles.addressLine}>{order.endereco.complemento}</Text>
                          )}
                          <Text style={styles.addressLine}>
                            {order.endereco.bairro}, {order.endereco.cidade} - {order.endereco.estado}
                          </Text>
                          <Text style={styles.addressLine}>CEP: {order.endereco.cep}</Text>
                        </View>
                      </View>
                    )}

                    {/* Payment Method */}
                    {order && (
                      <View style={styles.detailCard}>
                        <View style={styles.detailCardHeader}>
                          <Wallet size={16.67} color={colors.primary} strokeWidth={2} />
                          <Text style={styles.detailCardTitle}>Forma de pagamento</Text>
                        </View>
                        <View style={styles.paymentCard}>
                          <CreditCard size={24} color={colors.black} strokeWidth={2} />
                          <View style={styles.paymentCardContent}>
                            <Text style={styles.paymentMethodName}>
                              {getPaymentMethodLabel(order.metodoPagamento)}
                            </Text>
                            <Text style={styles.paymentMethodDetails}>
                              {getPaymentCardMask()}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Order Summary */}
                    {order && (
                      <View style={styles.detailCard}>
                        <Text style={styles.summaryTitle}>Resumo do pedido</Text>
                        
                        {/* Order Items */}
                        <View style={styles.itemsList}>
                          {order.itens.map((item) => (
                            <View key={item.id} style={styles.itemRow}>
                              <Text style={styles.itemText}>
                                {item.quantidade}x {item.nomeProduto}
                              </Text>
                              <Text style={styles.itemPrice}>
                                {formatCurrency(item.precoTotal)}
                              </Text>
                            </View>
                          ))}
                        </View>

                        <Separator style={styles.separator} />

                        {/* Totals */}
                        <View style={styles.totalsList}>
                          <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>{formatCurrency(order.subtotal)}</Text>
                          </View>
                          <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Taxa de entrega</Text>
                            <Text style={styles.totalValue}>{formatCurrency(order.taxaEntrega)}</Text>
                          </View>
                          {order.desconto > 0 && (
                            <View style={styles.totalRow}>
                              <Text style={[styles.totalLabel, styles.discountLabel]}>Desconto</Text>
                              <Text style={[styles.totalValue, styles.discountValue]}>
                                - {formatCurrency(order.desconto)}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Final Total */}
                        <View style={styles.finalTotalRow}>
                          <Text style={styles.finalTotalLabel}>Total</Text>
                          <Text style={styles.finalTotalValue}>
                            {formatCurrency(order.total)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </ScrollView>
                </Animated.View>

                {/* Payment Error Button */}
                {hasPaymentError && (
                  <Button
                    title="Realizar pagamento"
                    variant="primary"
                    size="md"
                    onPress={() => {
                      // TODO: Navigate to payment screen
                      console.log('Navigate to payment');
                    }}
                    style={styles.paymentErrorButton}
                  />
                )}

                {/* Toggle Details Button */}
                <TouchableOpacity
                  style={styles.toggleDetailsButton}
                  onPress={() => setShowDetails(!showDetails)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toggleDetailsText}>
                    {showDetails ? 'Ocultar detalhes' : 'Ver mais detalhes'}
                  </Text>
                  {showDetails ? (
                    <ChevronUp size={24} color={colors.mutedForeground} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={24} color={colors.mutedForeground} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  mapSection: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.gray[50],
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarker: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderWidth: 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarkerInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeLabelContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.25,
    right: SCREEN_WIDTH * 0.15,
    zIndex: 2, // Below track component
  },
  userLabelContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.32,
    left: SCREEN_WIDTH * 0.15,
    zIndex: 2, // Below track component
  },
  markerLabel: {
    position: 'absolute',
    zIndex: 10,
  },
  labelContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'flex-start', // Allow container to size to content
  },
  labelText: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  triangleContainer: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    width: 12,
    height: 6,
    marginLeft: -6, // Center the 12px wide triangle (half of 12px)
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  helpBanner: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.md + 24, // Extra padding bottom to show more
    paddingHorizontal: spacing.xl,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    gap: spacing.sm,
    marginBottom: -24, // Less overlap to show more of the banner
    zIndex: 6,
  },
  helpBannerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: colors.gray[200],
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  helpBannerContent: {
    flex: 1,
    gap: 2,
  },
  helpBannerTitle: {
    ...typography.base,
    fontWeight: fontWeights.semibold,
    color: colors.white,
  },
  helpBannerSubtitle: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.white,
  },
  helpBannerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    zIndex: 7,
    overflow: 'visible',
  },
  statusCardExpanded: {
    paddingBottom: spacing.xl,
  },
  statusMessage: {
    ...typography.lg,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 22,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.xs,
    overflow: 'visible',
    minHeight: 36,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    overflow: 'visible',
    justifyContent: 'center',
  },
  horizontalConnector: {
    height: 2,
    flex: 1,
    minWidth: 30,
    maxWidth: 100,
    marginHorizontal: spacing.xs,
    zIndex: 0,
  },
  deliveryEstimate: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.black,
    textAlign: 'left',
  },
  deliveryEstimateLabel: {
    color: colors.mutedForeground,
  },
  separator: {
    marginVertical: 0,
  },
  detailsAnimatedContainer: {
    overflow: 'hidden',
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.4, // Maximum 40% of screen height
  },
  detailsScrollView: {
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  detailsContent: {
    gap: spacing.md,
  },
  detailCard: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailCardTitle: {
    ...typography.lg,
    fontWeight: fontWeights.medium,
    color: colors.black,
  },
  detailCardContent: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  detailValue: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  addressContent: {
    gap: spacing.xs,
  },
  addressStreet: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    lineHeight: 20.8,
  },
  addressLine: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2,
  },
  paymentCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md - 4,
    height: 70,
  },
  paymentCardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  paymentMethodName: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.black,
    lineHeight: 16,
  },
  paymentMethodDetails: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 18.2,
  },
  summaryTitle: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.black,
  },
  itemsList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  itemPrice: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  totalsList: {
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.sm,
    fontWeight: fontWeights.normal,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  totalValue: {
    ...typography.sm,
    fontWeight: fontWeights.semibold,
    color: colors.mutedForeground,
    lineHeight: 16,
  },
  discountLabel: {
    color: colors.green[700],
  },
  discountValue: {
    color: colors.green[700],
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  finalTotalLabel: {
    ...typography.base,
    fontWeight: fontWeights.medium,
    color: colors.black,
    lineHeight: 19.2,
  },
  finalTotalValue: {
    ...typography.lg,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
    lineHeight: 21.6,
  },
  toggleDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  toggleDetailsText: {
    ...typography.sm,
    fontWeight: fontWeights.medium,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  paymentErrorButton: {
    width: '100%',
    borderRadius: 99,
    marginBottom: spacing.sm,
  },
});
