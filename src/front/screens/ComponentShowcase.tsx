import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Badge, Driver, CategoryCard, CategoryGrid, CategoryItem, ProductCard, HomeHeader, SectionTitle, BottomMenuItem, BottomMenu, BottomMenuItemData, Input, ImageSlider, SliderItem, Separator } from '../../../components/ui';
import { 
  ShowcaseSection, 
  PropsTable, 
  CodeExample, 
  VariantGroup, 
  ExampleItem 
} from '../../../components/docs';
import { colors, spacing, typography, fontWeights, borderRadius } from '../../lib/styles';
import { Home, ShoppingBag, User, Heart, Bell } from 'lucide-react-native';

type RootStackParamList = {
  Home: undefined;
  ComponentShowcase: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ComponentShowcase() {
  const navigation = useNavigation<NavigationProp>();

  const buttonProps = [
    {
      name: 'title',
      type: 'string',
      required: true,
      description: 'Texto exibido no botão',
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'outline'",
      default: "'primary'",
      description: 'Estilo visual do botão',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md'",
      description: 'Tamanho do botão',
    },
    {
      name: 'style',
      type: 'ViewStyle',
      description: 'Estilos adicionais do React Native',
    },
    {
      name: '...props',
      type: 'TouchableOpacityProps',
      description: 'Todas as props do TouchableOpacity do React Native',
    },
  ];

  const buttonExampleCode = `<Button
  title="Clique aqui"
  variant="primary"
  size="md"
  onPress={() => console.log("pressed")}
/>`;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Component Library
          </Text>
          <Text style={styles.headerDescription}>
            Hub de componentes e suas variações
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <ShowcaseSection
            title="Button"
            description="Componente de botão com suporte a múltiplas variantes e tamanhos. Ideal para ações principais e secundárias."
          >
            <PropsTable props={buttonProps} />

            <VariantGroup title="Variantes">
              <ExampleItem label="Primary">
                <Button title="Botão Primary" variant="primary" />
              </ExampleItem>
              <ExampleItem label="Secondary">
                <Button title="Botão Secondary" variant="secondary" />
              </ExampleItem>
              <ExampleItem label="Outline">
                <Button title="Botão Outline" variant="outline" />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Tamanhos">
              <ExampleItem label="Small (sm)">
                <Button title="Botão Small" variant="primary" size="sm" />
              </ExampleItem>
              <ExampleItem label="Medium (md)">
                <Button title="Botão Medium" variant="primary" size="md" />
              </ExampleItem>
              <ExampleItem label="Large (lg)">
                <Button title="Botão Large" variant="primary" size="lg" />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={buttonExampleCode} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="Badge"
            description="Componente de badge/etiqueta com diferentes tipos de cores. Ideal para indicar status, categorias ou informações rápidas."
          >
            <PropsTable props={[
              {
                name: 'label',
                type: 'string',
                default: "'Label'",
                description: 'Texto exibido no badge',
              },
              {
                name: 'type',
                type: "'Default' | 'Success' | 'Primary' | 'Info' | 'Warning'",
                default: "'Default'",
                description: 'Tipo/variação do badge que define a cor da borda',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="Tipos">
              <ExampleItem label="Default">
                <Badge label="Label" type="Default" />
              </ExampleItem>
              <ExampleItem label="Success">
                <Badge label="Label" type="Success" />
              </ExampleItem>
              <ExampleItem label="Primary">
                <Badge label="Label" type="Primary" />
              </ExampleItem>
              <ExampleItem label="Info">
                <Badge label="Label" type="Info" />
              </ExampleItem>
              <ExampleItem label="Warning">
                <Badge label="Label" type="Warning" />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`<Badge label="Novo" type="Success" />
<Badge label="Em Andamento" type="Primary" />
<Badge label="Atenção" type="Warning" />
<Badge label="Informação" type="Info" />`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="Driver"
            description="Componente de badge/etiqueta com fundo colorido. Ideal para categorizar e destacar informações com diferentes cores de fundo."
          >
            <PropsTable props={[
              {
                name: 'label',
                type: 'string',
                default: "'Label'",
                description: 'Texto exibido no driver',
              },
              {
                name: 'type',
                type: "'Default' | 'Primary' | 'Secondary' | 'Green' | 'Info' | 'Black'",
                default: "'Default'",
                description: 'Tipo/variação do driver que define a cor de fundo e do texto',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="Tipos">
              <ExampleItem label="Default">
                <Driver label="Label" type="Default" />
              </ExampleItem>
              <ExampleItem label="Primary">
                <Driver label="Label" type="Primary" />
              </ExampleItem>
              <ExampleItem label="Secondary">
                <Driver label="Label" type="Secondary" />
              </ExampleItem>
              <ExampleItem label="Green">
                <Driver label="Label" type="Green" />
              </ExampleItem>
              <ExampleItem label="Info">
                <Driver label="Label" type="Info" />
              </ExampleItem>
              <ExampleItem label="Black">
                <Driver label="Label" type="Black" />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`<Driver label="Premium" type="Primary" />
<Driver label="Novo" type="Green" />
<Driver label="VIP" type="Black" />
<Driver label="Info" type="Info" />
<Driver label="Destaque" type="Secondary" />`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="CategoryCard"
            description="Card de categoria com ícone e opção de badge de desconto. Ideal para exibir categorias de produtos ou serviços com destaque para ofertas."
          >
            <PropsTable props={[
              {
                name: 'label',
                type: 'string',
                default: "'Label'",
                description: 'Texto exibido abaixo do ícone',
              },
              {
                name: 'discountValue',
                type: 'string',
                default: "'12'",
                description: 'Valor do desconto exibido no badge (apenas quando type="Discount")',
              },
              {
                name: 'type',
                type: "'Default' | 'Discount'",
                default: "'Default'",
                description: 'Tipo do card: Default (sem desconto) ou Discount (com badge de desconto)',
              },
              {
                name: 'iconSource',
                type: 'ImageSourcePropType',
                description: 'Fonte da imagem do ícone da categoria',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="Variantes">
              <ExampleItem label="Default">
                <CategoryCard label="Categoria" type="Default" />
              </ExampleItem>
              <ExampleItem label="Discount">
                <CategoryCard 
                  label="Categoria" 
                  type="Discount" 
                  discountValue="25" 
                />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`<CategoryCard 
  label="Pizza" 
  type="Default" 
  iconSource={require('./assets/pizza.png')} 
/>

<CategoryCard 
  label="Hambúrguer" 
  type="Discount" 
  discountValue="30"
  iconSource={require('./assets/burger.png')} 
/>`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="CategoryGrid"
            description="Grid de categorias que renderiza múltiplos CategoryCards em um layout responsivo. Ideal para exibir listas de categorias de produtos ou serviços."
          >
            <PropsTable props={[
              {
                name: 'categories',
                type: 'CategoryItem[]',
                required: true,
                description: 'Array de categorias a serem exibidas no grid',
              },
              {
                name: 'columns',
                type: 'number',
                default: '4',
                description: 'Número de colunas no grid',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="CategoryItem Interface">
              <CodeExample code={`interface CategoryItem {
  label: string;
  discountValue?: string;
  type?: 'Default' | 'Discount';
  iconSource?: ImageSourcePropType;
}`} />
            </VariantGroup>

            <VariantGroup title="Exemplo">
              <ExampleItem label="Grid de 4 colunas">
                <CategoryGrid 
                  categories={[
                    { label: 'Pizza', type: 'Default' },
                    { label: 'Hambúrguer', type: 'Discount', discountValue: '25' },
                    { label: 'Sushi', type: 'Default' },
                    { label: 'Sobremesa', type: 'Default' },
                    { label: 'Bebidas', type: 'Discount', discountValue: '15' },
                    { label: 'Saladas', type: 'Default' },
                    { label: 'Massas', type: 'Default' },
                    { label: 'Carnes', type: 'Default' },
                  ]}
                  columns={4}
                />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`const categories: CategoryItem[] = [
  { label: 'Pizza', type: 'Default' },
  { label: 'Hambúrguer', type: 'Discount', discountValue: '25' },
  { label: 'Sushi', type: 'Default' },
  { label: 'Sobremesa', type: 'Default' },
];

<CategoryGrid 
  categories={categories}
  columns={4}
/>`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="ProductCard"
            description="Card de produto com imagem, informações e preços. Suporta variante de oferta com desconto e preço original riscado."
          >
            <PropsTable props={[
              {
                name: 'title',
                type: 'string',
                default: "'Nome do produto com suas linhas no máximo'",
                description: 'Título do produto',
              },
              {
                name: 'description',
                type: 'string',
                default: "'Nome do produto com suas linhas no máximo'",
                description: 'Descrição secundária do produto',
              },
              {
                name: 'showDriver',
                type: 'boolean',
                default: 'true',
                description: 'Exibe o badge Driver no topo da imagem e ao lado do preço (apenas na variante Offer)',
              },
              {
                name: 'driverLabel',
                type: 'string',
                default: "'Label'",
                description: 'Texto do badge Driver no topo da imagem',
              },
              {
                name: 'basePrice',
                type: 'string',
                default: "'R$9,98'",
                description: 'Preço original (exibido riscado na variante Offer)',
              },
              {
                name: 'finalPrice',
                type: 'string',
                default: "'R$9,98'",
                description: 'Preço final do produto',
              },
              {
                name: 'discountValue',
                type: 'string',
                default: "'R$12'",
                description: 'Valor do desconto exibido no badge verde (apenas na variante Offer)',
              },
              {
                name: 'type',
                type: "'Offer' | 'Default'",
                default: "'Offer'",
                description: 'Tipo do card: Offer (com desconto) ou Default (sem desconto)',
              },
              {
                name: 'imageSource',
                type: 'ImageSourcePropType',
                description: 'Fonte da imagem do produto',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="Variantes">
              <ExampleItem label="Offer">
                <ProductCard 
                  title="Nome do produto"
                  description="Descrição do produto"
                  type="Offer"
                  showDriver={true}
                  driverLabel="Novo"
                  basePrice="R$21,98"
                  finalPrice="R$9,98"
                  discountValue="R$12"
                />
              </ExampleItem>
              <ExampleItem label="Default">
                <ProductCard 
                  title="Nome do produto"
                  description="Descrição do produto"
                  type="Default"
                  showDriver={true}
                  driverLabel="Label"
                  finalPrice="R$9,98"
                />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`<ProductCard 
  title="Pizza Margherita"
  description="Pizza tradicional italiana"
  type="Offer"
  showDriver={true}
  driverLabel="Novo"
  basePrice="R$45,90"
  finalPrice="R$35,90"
  discountValue="R$10"
  imageSource={require('./assets/pizza.png')}
/>

<ProductCard 
  title="Hambúrguer Artesanal"
  description="Hambúrguer com carne artesanal"
  type="Default"
  showDriver={false}
  finalPrice="R$29,90"
  imageSource={require('./assets/burger.png')}
/>`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="HomeHeader"
            description="Cabeçalho da home com informações do usuário, endereço e ações rápidas. Ideal para a tela inicial do aplicativo."
          >
            <PropsTable props={[
              {
                name: 'firstName',
                type: 'string',
                default: "'Wallace'",
                description: 'Primeiro nome do usuário',
              },
              {
                name: 'address',
                type: 'string',
                default: "'Av. Rua do Amor, 256'",
                description: 'Endereço do usuário',
              },
              {
                name: 'cartCount',
                type: 'number',
                default: '9',
                description: 'Número de notificações não lidas (0 para ocultar o badge)',
              },
              {
                name: 'profileImageSource',
                type: 'ImageSourcePropType',
                description: 'Fonte da imagem de perfil do usuário',
              },
              {
                name: 'onAddressPress',
                type: '() => void',
                description: 'Callback quando o ícone de endereço é pressionado',
              },
              {
                name: 'onNotificationPress',
                type: '() => void',
                description: 'Callback quando o ícone de notificação é pressionado',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="Exemplo">
              <ExampleItem label="Header completo">
                <HomeHeader 
                  firstName="Wallace"
                  address="Av. Rua do Amor, 256"
                  cartCount={9}
                />
              </ExampleItem>
              <ExampleItem label="Sem notificações">
                <HomeHeader 
                  firstName="Maria"
                  address="Rua das Flores, 123"
                  cartCount={0}
                />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`<HomeHeader 
  firstName="Wallace"
  address="Av. Rua do Amor, 256"
  cartCount={9}
  profileImageSource={require('./assets/profile.png')}
  onAddressPress={() => console.log('Mudar endereço')}
  onNotificationPress={() => console.log('Ver notificações')}
/>`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="SectionTitle"
            description="Título de seção com ícone, descrição opcional, link 'Ver tudo' e timer. Ideal para organizar seções de conteúdo com ações rápidas."
          >
            <PropsTable props={[
              {
                name: 'title',
                type: 'string',
                default: "'Title'",
                description: 'Título da seção',
              },
              {
                name: 'description',
                type: 'string',
                default: "'Description'",
                description: 'Descrição da seção (exibida quando showDescription=true)',
              },
              {
                name: 'showIcon',
                type: 'boolean',
                default: 'true',
                description: 'Exibe o ícone à esquerda',
              },
              {
                name: 'iconName',
                type: "'star' | 'clock' | 'bell' | 'tag'",
                default: "'star'",
                description: 'Tipo de ícone a ser exibido',
              },
              {
                name: 'showTimer',
                type: 'boolean',
                default: 'true',
                description: 'Exibe o timer amarelo à direita',
              },
              {
                name: 'endDate',
                type: 'Date',
                description: 'Data/hora final para o timer contar regressivamente (formato HH:MM:SS). Se fornecido, o timer será atualizado automaticamente.',
              },
              {
                name: 'timerText',
                type: 'string',
                default: "'03:12:34'",
                description: 'Texto estático do timer (usado apenas se endDate não for fornecido)',
              },
              {
                name: 'showLink',
                type: 'boolean',
                default: 'true',
                description: 'Exibe o link "Ver tudo" à direita',
              },
              {
                name: 'linkText',
                type: 'string',
                default: "'Ver tudo'",
                description: 'Texto do link',
              },
              {
                name: 'showDescription',
                type: 'boolean',
                default: 'true',
                description: 'Exibe a descrição abaixo do título',
              },
              {
                name: 'onLinkPress',
                type: '() => void',
                description: 'Callback quando o link é pressionado',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="Variantes">
              <ExampleItem label="Completo com timer funcional">
                <SectionTitle 
                  title="Ofertas Especiais"
                  description="Promoções imperdíveis"
                  showIcon={true}
                  showTimer={true}
                  endDate={new Date(Date.now() + 3 * 60 * 60 * 1000 + 12 * 60 * 1000 + 34 * 1000)}
                  showLink={true}
                  showDescription={true}
                />
              </ExampleItem>
              <ExampleItem label="Completo">
                <SectionTitle 
                  title="Ofertas Especiais"
                  description="Promoções imperdíveis"
                  showIcon={true}
                  showTimer={true}
                  showLink={true}
                  showDescription={true}
                />
              </ExampleItem>
              <ExampleItem label="Sem ícone">
                <SectionTitle 
                  title="Categorias"
                  description="Explore nossas categorias"
                  showIcon={false}
                  showTimer={true}
                  showLink={true}
                  showDescription={true}
                />
              </ExampleItem>
              <ExampleItem label="Sem timer">
                <SectionTitle 
                  title="Produtos Populares"
                  description="Mais vendidos"
                  showIcon={true}
                  showTimer={false}
                  showLink={true}
                  showDescription={true}
                />
              </ExampleItem>
              <ExampleItem label="Sem link">
                <SectionTitle 
                  title="Destaques"
                  description="Seleção especial"
                  showIcon={true}
                  showTimer={true}
                  showLink={false}
                  showDescription={true}
                />
              </ExampleItem>
              <ExampleItem label="Mínimo">
                <SectionTitle 
                  title="Título Simples"
                  showIcon={false}
                  showTimer={false}
                  showLink={false}
                  showDescription={false}
                />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`// Timer funcional (recomendado)
const endDate = new Date(Date.now() + 2 * 60 * 60 * 1000 + 30 * 60 * 1000 + 15 * 1000); // 2h 30min 15s

<SectionTitle 
  title="Ofertas Especiais"
  description="Promoções imperdíveis"
  showIcon={true}
  iconName="star"
  showTimer={true}
  endDate={endDate}
  showLink={true}
  linkText="Ver tudo"
  onLinkPress={() => navigation.navigate('Offers')}
/>

// Timer estático (fallback)
<SectionTitle 
  title="Ofertas Especiais"
  showIcon={true}
  showTimer={true}
  timerText="02:30:15"
  showLink={true}
/>

// Sem timer
<SectionTitle 
  title="Categorias"
  showIcon={true}
  showTimer={false}
  showLink={true}
  showDescription={false}
/>`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="BottomMenuItem"
            description="Item de menu inferior com ícone e label. Usado em barras de navegação inferiores. Suporta estado ativo/inativo com mudanças visuais."
          >
            <PropsTable props={[
              {
                name: 'label',
                type: 'string',
                default: "'Label'",
                description: 'Texto exibido abaixo do ícone',
              },
              {
                name: 'active',
                type: 'boolean',
                default: 'false',
                description: 'Define se o item está ativo (muda cor do texto e ícone)',
              },
              {
                name: 'icon',
                type: 'LucideIcon',
                default: 'Home',
                description: 'Componente de ícone do lucide-react-native',
              },
              {
                name: 'onPress',
                type: '() => void',
                description: 'Callback quando o item é pressionado',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="Variantes">
              <ExampleItem label="Inativo">
                <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                  <BottomMenuItem 
                    label="Home"
                    active={false}
                    icon={Home}
                  />
                  <BottomMenuItem 
                    label="Loja"
                    active={false}
                    icon={ShoppingBag}
                  />
                  <BottomMenuItem 
                    label="Perfil"
                    active={false}
                    icon={User}
                  />
                </View>
              </ExampleItem>
              <ExampleItem label="Ativo">
                <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                  <BottomMenuItem 
                    label="Home"
                    active={true}
                    icon={Home}
                  />
                  <BottomMenuItem 
                    label="Loja"
                    active={false}
                    icon={ShoppingBag}
                  />
                  <BottomMenuItem 
                    label="Perfil"
                    active={false}
                    icon={User}
                  />
                </View>
              </ExampleItem>
              <ExampleItem label="Com interação">
                <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
                  <BottomMenuItem 
                    label="Home"
                    active={true}
                    icon={Home}
                    onPress={() => console.log('Home pressionado')}
                  />
                  <BottomMenuItem 
                    label="Favoritos"
                    active={false}
                    icon={Heart}
                    onPress={() => console.log('Favoritos pressionado')}
                  />
                  <BottomMenuItem 
                    label="Notificações"
                    active={false}
                    icon={Bell}
                    onPress={() => console.log('Notificações pressionado')}
                  />
                </View>
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`import { BottomMenuItem } from '@/components/ui';
import { Home, ShoppingBag, User } from 'lucide-react-native';

// Item simples
<BottomMenuItem 
  label="Home"
  active={true}
  icon={Home}
/>

// Com interação
<BottomMenuItem 
  label="Loja"
  active={false}
  icon={ShoppingBag}
  onPress={() => navigation.navigate('Store')}
/>

// Barra de navegação completa
<View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
  <BottomMenuItem 
    label="Home"
    active={currentRoute === 'Home'}
    icon={Home}
    onPress={() => navigation.navigate('Home')}
  />
  <BottomMenuItem 
    label="Loja"
    active={currentRoute === 'Store'}
    icon={ShoppingBag}
    onPress={() => navigation.navigate('Store')}
  />
  <BottomMenuItem 
    label="Perfil"
    active={currentRoute === 'Profile'}
    icon={User}
    onPress={() => navigation.navigate('Profile')}
  />
</View>`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="Input"
            description="Campo de entrada de texto com suporte a label, validação, estados de erro/sucesso e ícone de busca. Ideal para formulários e buscas."
          >
            <PropsTable props={[
              {
                name: 'placeholder',
                type: 'string',
                default: "'Buscar itens'",
                description: 'Texto placeholder exibido quando o campo está vazio',
              },
              {
                name: 'label',
                type: 'string',
                description: 'Label opcional exibido acima do input',
              },
              {
                name: 'required',
                type: 'boolean',
                default: 'false',
                description: 'Exibe asterisco (*) ao lado do label indicando campo obrigatório',
              },
              {
                name: 'status',
                type: "'default' | 'error' | 'success'",
                default: "'default'",
                description: 'Status de validação do input (muda cor da borda e exibe ícone)',
              },
              {
                name: 'errorMessage',
                type: 'string',
                description: 'Mensagem de erro exibida abaixo do input quando status="error"',
              },
              {
                name: 'successMessage',
                type: 'string',
                description: 'Mensagem de sucesso exibida abaixo do input quando status="success"',
              },
              {
                name: 'state',
                type: "'Default' | 'Focus' | 'Disabled'",
                default: "'Default'",
                description: 'Estado visual do input',
              },
              {
                name: 'showSearchIcon',
                type: 'boolean',
                default: 'true',
                description: 'Exibe o ícone de busca à esquerda',
              },
              {
                name: 'containerStyle',
                type: 'ViewStyle',
                description: 'Estilos adicionais do container',
              },
              {
                name: 'inputStyle',
                type: 'ViewStyle',
                description: 'Estilos adicionais do TextInput',
              },
              {
                name: 'editable',
                type: 'boolean',
                description: 'Define se o input é editável (padrão: true, exceto quando state="Disabled")',
              },
              {
                name: '...props',
                type: 'TextInputProps',
                description: 'Todas as props do TextInput do React Native (value, onChangeText, onFocus, onBlur, etc.)',
              },
            ]} />

            <VariantGroup title="Variantes">
              <ExampleItem label="Default">
                <Input 
                  placeholder="Buscar itens"
                  state="Default"
                />
              </ExampleItem>
              <ExampleItem label="Focus">
                <Input 
                  placeholder="Buscar itens"
                  state="Focus"
                />
              </ExampleItem>
              <ExampleItem label="Disabled">
                <Input 
                  placeholder="Buscar itens"
                  state="Disabled"
                />
              </ExampleItem>
              <ExampleItem label="Com label">
                <Input 
                  label="Nome completo"
                  placeholder="Digite seu nome"
                  state="Default"
                  showSearchIcon={false}
                />
              </ExampleItem>
              <ExampleItem label="Com label obrigatório">
                <Input 
                  label="Email"
                  required={true}
                  placeholder="seu@email.com"
                  state="Default"
                  showSearchIcon={false}
                />
              </ExampleItem>
              <ExampleItem label="Status de erro">
                <Input 
                  label="Email"
                  required={true}
                  placeholder="seu@email.com"
                  status="error"
                  errorMessage="Email inválido"
                  state="Default"
                  showSearchIcon={false}
                />
              </ExampleItem>
              <ExampleItem label="Status de sucesso">
                <Input 
                  label="Email"
                  placeholder="seu@email.com"
                  status="success"
                  successMessage="Email válido"
                  state="Default"
                  showSearchIcon={false}
                  value="usuario@email.com"
                />
              </ExampleItem>
              <ExampleItem label="Com valor">
                <Input 
                  placeholder="Buscar itens"
                  state="Default"
                  value="Produto exemplo"
                />
              </ExampleItem>
              <ExampleItem label="Sem ícone">
                <Input 
                  placeholder="Digite aqui..."
                  state="Default"
                  showSearchIcon={false}
                />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`import { Input } from '@/components/ui';
import { useState } from 'react';

// Input básico
<Input 
  placeholder="Buscar produtos"
  state="Default"
/>

// Input com label
<Input 
  label="Nome completo"
  placeholder="Digite seu nome"
  showSearchIcon={false}
/>

// Input obrigatório
<Input 
  label="Email"
  required={true}
  placeholder="seu@email.com"
  showSearchIcon={false}
/>

// Input com validação de erro
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState('');

const validateEmail = (text: string) => {
  setEmail(text);
  if (text && !text.includes('@')) {
    setEmailError('Email inválido');
  } else {
    setEmailError('');
  }
};

<Input 
  label="Email"
  required={true}
  placeholder="seu@email.com"
  value={email}
  onChangeText={validateEmail}
  status={emailError ? 'error' : 'default'}
  errorMessage={emailError}
  showSearchIcon={false}
/>

// Input com sucesso
<Input 
  label="Email"
  placeholder="seu@email.com"
  value="usuario@email.com"
  status="success"
  successMessage="Email válido"
  showSearchIcon={false}
/>

// Input controlado
const [searchText, setSearchText] = useState('');

<Input 
  placeholder="Buscar produtos"
  value={searchText}
  onChangeText={setSearchText}
  state="Default"
/>`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="ImageSlider"
            description="Carousel de imagens, GIFs e arquivos Lottie com indicadores de slide e texto sobreposto. Ideal para banners promocionais e galerias."
          >
            <PropsTable props={[
              {
                name: 'items',
                type: 'SliderItem[]',
                required: true,
                description: 'Array de itens do slider. Cada item pode ser imagem, GIF ou Lottie.',
              },
              {
                name: 'height',
                type: 'number',
                default: '220',
                description: 'Altura do slider em pixels',
              },
              {
                name: 'showDots',
                type: 'boolean',
                default: 'true',
                description: 'Exibe os indicadores de slide no topo',
              },
              {
                name: 'showText',
                type: 'boolean',
                default: 'true',
                description: 'Exibe o texto sobreposto na parte inferior',
              },
              {
                name: 'showDescription',
                type: 'boolean',
                default: 'true',
                description: 'Exibe a descrição abaixo do título (quando showText=true)',
              },
              {
                name: 'autoPlay',
                type: 'boolean',
                default: 'false',
                description: 'Reproduz automaticamente os slides',
              },
              {
                name: 'autoPlayInterval',
                type: 'number',
                default: '3000',
                description: 'Intervalo em milissegundos entre slides (quando autoPlay=true)',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="Variantes">
              <ExampleItem label="Com imagem e texto">
                <ImageSlider 
                  items={[
                    {
                      id: '1',
                      type: 'image',
                      source: { uri: 'https://via.placeholder.com/400x220' },
                      title: 'Título do slider',
                      description: 'Exemplo de descrição grande como exemplo de como é o banner aqui',
                    },
                  ]}
                />
              </ExampleItem>
              <ExampleItem label="Múltiplas imagens">
                <ImageSlider 
                  items={[
                    {
                      id: '1',
                      type: 'image',
                      source: { uri: 'https://via.placeholder.com/400x220/FF6B6B/FFFFFF?text=Slide+1' },
                      title: 'Primeiro slide',
                      description: 'Descrição do primeiro slide',
                    },
                    {
                      id: '2',
                      type: 'image',
                      source: { uri: 'https://via.placeholder.com/400x220/4ECDC4/FFFFFF?text=Slide+2' },
                      title: 'Segundo slide',
                      description: 'Descrição do segundo slide',
                    },
                    {
                      id: '3',
                      type: 'image',
                      source: { uri: 'https://via.placeholder.com/400x220/45B7D1/FFFFFF?text=Slide+3' },
                      title: 'Terceiro slide',
                      description: 'Descrição do terceiro slide',
                    },
                  ]}
                />
              </ExampleItem>
              <ExampleItem label="Sem texto">
                <ImageSlider 
                  showText={false}
                  items={[
                    {
                      id: '1',
                      type: 'image',
                      source: { uri: 'https://via.placeholder.com/400x220' },
                    },
                    {
                      id: '2',
                      type: 'image',
                      source: { uri: 'https://via.placeholder.com/400x220/FF6B6B/FFFFFF' },
                    },
                  ]}
                />
              </ExampleItem>
              <ExampleItem label="Sem indicadores">
                <ImageSlider 
                  showDots={false}
                  items={[
                    {
                      id: '1',
                      type: 'image',
                      source: { uri: 'https://via.placeholder.com/400x220' },
                      title: 'Slide sem dots',
                      description: 'Sem indicadores de slide',
                    },
                  ]}
                />
              </ExampleItem>
              <ExampleItem label="Altura customizada">
                <ImageSlider 
                  height={150}
                  items={[
                    {
                      id: '1',
                      type: 'image',
                      source: { uri: 'https://via.placeholder.com/400x150' },
                      title: 'Slider menor',
                      description: 'Altura de 150px',
                    },
                  ]}
                />
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`import { ImageSlider, SliderItem } from '@/components/ui';

// Slider básico com imagem
const items: SliderItem[] = [
  {
    id: '1',
    type: 'image',
    source: { uri: 'https://example.com/image.jpg' },
    title: 'Título do slide',
    description: 'Descrição do slide',
  },
];

<ImageSlider items={items} />

// Slider com múltiplas imagens
const multipleItems: SliderItem[] = [
  {
    id: '1',
    type: 'image',
    source: require('./assets/banner1.jpg'),
    title: 'Primeiro banner',
    description: 'Promoção especial',
  },
  {
    id: '2',
    type: 'image',
    source: require('./assets/banner2.jpg'),
    title: 'Segundo banner',
    description: 'Ofertas imperdíveis',
  },
  {
    id: '3',
    type: 'gif',
    source: { uri: 'https://example.com/animation.gif' },
    title: 'Banner animado',
  },
];

<ImageSlider 
  items={multipleItems}
  height={220}
  showDots={true}
  showText={true}
/>

// Slider com Lottie
const lottieItems: SliderItem[] = [
  {
    id: '1',
    type: 'lottie',
    source: require('./assets/animation.json'),
    title: 'Animação Lottie',
    description: 'Arquivo Lottie animado',
  },
];

<ImageSlider 
  items={lottieItems}
  autoPlay={true}
  autoPlayInterval={5000}
/>

// Slider sem texto
<ImageSlider 
  items={items}
  showText={false}
  showDots={true}
/>`} />
            </VariantGroup>
          </ShowcaseSection>

          <ShowcaseSection
            title="BottomMenu"
            description="Barra de navegação inferior que agrupa múltiplos BottomMenuItem. Ideal para navegação principal do app com distribuição igual de espaço entre os itens."
          >
            <PropsTable props={[
              {
                name: 'items',
                type: 'BottomMenuItemData[]',
                required: true,
                description: 'Array de itens do menu. Cada item contém label, icon, active e onPress.',
              },
              {
                name: 'style',
                type: 'ViewStyle',
                description: 'Estilos adicionais do React Native',
              },
            ]} />

            <VariantGroup title="Variantes">
              <ExampleItem label="Menu básico">
                <View style={{ marginBottom: spacing.lg }}>
                  <BottomMenu 
                    items={[
                      { label: 'Home', icon: Home, active: true },
                      { label: 'Loja', icon: ShoppingBag, active: false },
                      { label: 'Favoritos', icon: Heart, active: false },
                      { label: 'Perfil', icon: User, active: false },
                    ]}
                  />
                </View>
              </ExampleItem>
              <ExampleItem label="Com interações">
                <View style={{ marginBottom: spacing.lg }}>
                  <BottomMenu 
                    items={[
                      { 
                        label: 'Home', 
                        icon: Home, 
                        active: true,
                        onPress: () => console.log('Home pressionado')
                      },
                      { 
                        label: 'Loja', 
                        icon: ShoppingBag, 
                        active: false,
                        onPress: () => console.log('Loja pressionado')
                      },
                      { 
                        label: 'Notificações', 
                        icon: Bell, 
                        active: false,
                        onPress: () => console.log('Notificações pressionado')
                      },
                      { 
                        label: 'Perfil', 
                        icon: User, 
                        active: false,
                        onPress: () => console.log('Perfil pressionado')
                      },
                    ]}
                  />
                </View>
              </ExampleItem>
              <ExampleItem label="Todos inativos">
                <View style={{ marginBottom: spacing.lg }}>
                  <BottomMenu 
                    items={[
                      { label: 'Home', icon: Home, active: false },
                      { label: 'Loja', icon: ShoppingBag, active: false },
                      { label: 'Favoritos', icon: Heart, active: false },
                      { label: 'Perfil', icon: User, active: false },
                    ]}
                  />
                </View>
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`import { BottomMenu, BottomMenuItemData } from '@/components/ui';
import { Home, ShoppingBag, Heart, User } from 'lucide-react-native';

// Menu básico
const menuItems: BottomMenuItemData[] = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Loja', icon: ShoppingBag, active: false },
  { label: 'Favoritos', icon: Heart, active: false },
  { label: 'Perfil', icon: User, active: false },
];

<BottomMenu items={menuItems} />

// Com navegação
const [activeRoute, setActiveRoute] = useState('Home');

const menuItemsWithNavigation: BottomMenuItemData[] = [
  { 
    label: 'Home', 
    icon: Home, 
    active: activeRoute === 'Home',
    onPress: () => {
      setActiveRoute('Home');
      navigation.navigate('Home');
    }
  },
  { 
    label: 'Loja', 
    icon: ShoppingBag, 
    active: activeRoute === 'Store',
    onPress: () => {
      setActiveRoute('Store');
      navigation.navigate('Store');
    }
  },
  { 
    label: 'Favoritos', 
    icon: Heart, 
    active: activeRoute === 'Favorites',
    onPress: () => {
      setActiveRoute('Favorites');
      navigation.navigate('Favorites');
    }
  },
  { 
    label: 'Perfil', 
    icon: User, 
    active: activeRoute === 'Profile',
    onPress: () => {
      setActiveRoute('Profile');
      navigation.navigate('Profile');
    }
  },
];

<BottomMenu items={menuItemsWithNavigation} />`} />
            </VariantGroup>
          </ShowcaseSection>

          {/* Separator Component */}
          <ShowcaseSection title="Separator" description="Componente de separador visual para dividir seções de conteúdo">
            <PropsTable
              props={[
                {
                  name: 'orientation',
                  type: "'horizontal' | 'vertical'",
                  default: "'horizontal'",
                  description: 'Orientação do separador',
                },
                {
                  name: 'width',
                  type: 'number | string',
                  description: 'Largura do separador (número em pixels ou string como "100%")',
                },
                {
                  name: 'height',
                  type: 'number',
                  description: 'Altura do separador (apenas para vertical)',
                },
                {
                  name: 'color',
                  type: 'string',
                  description: 'Cor do separador (padrão: gray[200])',
                },
                {
                  name: 'style',
                  type: 'ViewStyle',
                  description: 'Estilos adicionais do React Native',
                },
              ]}
            />

            <VariantGroup title="Variantes">
              <ExampleItem label="Horizontal (padrão)">
                <View style={{ width: '100%', paddingVertical: spacing.md }}>
                  <Separator />
                </View>
              </ExampleItem>
              <ExampleItem label="Vertical">
                <View style={{ flexDirection: 'row', height: 100, alignItems: 'center' }}>
                  <View style={{ flex: 1, padding: spacing.md }}>
                    <Text style={{ ...typography.sm, color: colors.gray[600] }}>Conteúdo à esquerda</Text>
                  </View>
                  <Separator orientation="vertical" height={60} />
                  <View style={{ flex: 1, padding: spacing.md }}>
                    <Text style={{ ...typography.sm, color: colors.gray[600] }}>Conteúdo à direita</Text>
                  </View>
                </View>
              </ExampleItem>
              <ExampleItem label="Largura customizada">
                <View style={{ width: '100%', paddingVertical: spacing.md, alignItems: 'center' }}>
                  <Separator width={230} />
                </View>
              </ExampleItem>
              <ExampleItem label="Cor customizada">
                <View style={{ width: '100%', paddingVertical: spacing.md }}>
                  <Separator color={colors.primary} />
                </View>
              </ExampleItem>
              <ExampleItem label="Com margens">
                <View style={{ width: '100%', paddingVertical: spacing.md }}>
                  <Text style={{ ...typography.sm, color: colors.gray[600], marginBottom: spacing.sm }}>
                    Texto acima
                  </Text>
                  <Separator style={{ marginVertical: spacing.lg }} />
                  <Text style={{ ...typography.sm, color: colors.gray[600], marginTop: spacing.sm }}>
                    Texto abaixo
                  </Text>
                </View>
              </ExampleItem>
            </VariantGroup>

            <VariantGroup title="Exemplos de Uso">
              <CodeExample code={`import { Separator } from '@/components/ui';

// Separador horizontal padrão
<Separator />

// Separador vertical
<View style={{ flexDirection: 'row', height: 100 }}>
  <View style={{ flex: 1 }}>Conteúdo 1</View>
  <Separator orientation="vertical" height={60} />
  <View style={{ flex: 1 }}>Conteúdo 2</View>
</View>

// Separador com largura customizada
<Separator width={230} />

// Separador com cor customizada
<Separator color="#E61C61" />

// Separador com estilo customizado
<Separator 
  style={{ 
    marginVertical: 24,
    backgroundColor: '#4C5564'
  }} 
/>`} />
            </VariantGroup>
          </ShowcaseSection>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl * 2, // Espaço extra para o BottomMenu
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.primary,
    ...typography.base,
  },
  headerTitle: {
    ...typography['3xl'],
    fontWeight: fontWeights.bold,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  headerDescription: {
    ...typography.base,
    color: colors.gray[600],
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
});
