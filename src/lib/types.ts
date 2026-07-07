// ─────────────────────────────────────────────────────────────────────────────
// TEMEL TİPLER — Bayirlioglu E-Commerce
// ─────────────────────────────────────────────────────────────────────────────

/** Desteklenen iki marka */
export type BrandKey = 'alb-tarim' | 'alb-su-aritma';

// ─── MARKA ───────────────────────────────────────────────────────────────────

export interface BrandColors {
  primary: string;          // bg-green-600 | bg-blue-600
  primaryHover: string;     // hover:bg-green-500 | hover:bg-blue-500
  primaryText: string;      // text-green-600 | text-blue-600
  primaryLight: string;     // bg-green-50 | bg-blue-50
  primaryBorder: string;    // border-green-200 | border-blue-200
  gradientOverlay: string;  // Hero gradient sınıfı
  fallbackGradient: string; // Video yoksa arka plan
  logoBg: string;           // Logo arka planı
  accentPrimary: string;    // Birincil buton tam sınıfı
  accentSecondary: string;  // İkincil buton tam sınıfı
  badgeStyle: string;       // Hero badge sınıfı
  statDivider: string;      // İstatistik ayraç rengi
  navHover: string;         // Nav link hover sınıfı
  ring: string;             // Focus ring sınıfı
}

export interface BrandConfig {
  key: BrandKey;
  name: string;
  shortCode: string;
  tagline: string;
  subtitle: string;
  description: string;
  badge: string;
  cta: CtaConfig;
  ctaSecondary: CtaConfig;
  whatsapp: WhatsAppConfig;
  stats: StatItem[];
  nav: NavItem[];
  video: string;
  poster: string;
  colors: BrandColors;
}

// ─── NAVİGASYON ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  icon?: string;
}

export interface CtaConfig {
  label: string;
  href: string;
}

// ─── ÜRÜN ────────────────────────────────────────────────────────────────────

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductSpec {
  name: string;
  value: string;
  unit?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  salePrice?: number;
  images: ProductImage[];
  category: Category;
  brand: BrandKey;
  specs: ProductSpec[];
  stock: number;
  unit: string;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  sku: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── KATEGORİ ────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;        // emoji veya icon adı
  image?: string;       // görsel URL — sonradan eklenecek
  brand: BrandKey;
  parentId?: number;    // dolu ise alt kategoridır
  sortOrder: number;
  productCount?: number;
  children?: Category[]; // getCategoriesWithChildren tarafından doldurulur
}

// ─── YORUM ───────────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  isApproved: boolean;
  createdAt: string;
}

// ─── SEPET ───────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ─── SİPARİŞ ─────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cash_on_delivery';

export interface OrderItem {
  id: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  cargoCompany?: string;
  trackingNumber?: string;
  notes?: string;
  brand: BrandKey;
  createdAt: string;
  updatedAt: string;
}

// ─── KULLANICI ────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'admin' | 'dealer';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  brandPreference?: BrandKey | 'both';
  emailVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood?: string;
  addressLine: string;
  postalCode?: string;
  isDefault: boolean;
}

// ─── BLOG ────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;   // görsel URL — sonradan eklenecek
  author: string;
  publishedAt: string;
  brand: BrandKey;
  tags?: string[];
  readTime?: number;    // dakika
}

// ─── HİZMET ──────────────────────────────────────────────────────────────────

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
  features: string[];
  brand: BrandKey;
  price?: string;       // 'Ücretsiz' | 'Fiyat almak için arayın' vs.
}

// ─── BAYİ BAŞVURU ────────────────────────────────────────────────────────────

export interface DealerApplication {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  district?: string;
  message?: string;
  brandInterest: BrandKey | 'both';
}

// ─── KUPON ───────────────────────────────────────────────────────────────────

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  isActive: boolean;
  expiresAt?: string;
}

// ─── FORM TİPLERİ ────────────────────────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  brand?: BrandKey;
}

export interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
}

// ─── GENEL UI TİPLERİ ────────────────────────────────────────────────────────

export interface StatItem {
  value: string;
  label: string;
}

export interface WhatsAppConfig {
  phone: string;
  message: string;
  tooltip: string;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  role?: string;
  body: string;
  rating: number;
  image?: string;       // görsel URL — sonradan eklenecek
  brand: BrandKey;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  error?: string;
}
