export type Mode = "office" | "school";
export type Language = "en" | "ar";
export type Stock = "in" | "low" | "out";
export type OrderStatus = "placed" | "packing" | "out" | "delivered";
export type PaymentMethod = "card" | "apple" | "cod" | "credit";
export type SortKey = "relevance" | "price-asc" | "price-desc";
export type PriceBand = "under-20" | "20-50" | "over-50";

export interface BulkTier {
  minQty: number;
  discountPct: number;
}

export interface PackOption {
  id: string;
  label: string;
  labelAr: string;
  price: number;
  mrp: number;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  brand: string;
  brandAr: string;
  packSize: string;
  packSizeAr: string;
  categoryId: string;
  subCategoryId: string;
  alsoIn: { categoryId: string; subCategoryId: string }[];
  modes: Mode[];
  price: number;
  mrp: number;
  art: string;
  bulkTiers: BulkTier[];
  stock: Stock;
  lowCount?: number;
  tags: string[];
  description: string;
  descriptionAr: string;
  highlights: string[];
  highlightsAr: string[];
  packs: PackOption[];
}

export interface SubCategory {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  mode: Mode | "both";
  icon: string;
  tint: string;
  subcategories: SubCategory[];
}

export interface Bundle {
  id: string;
  name: string;
  nameAr: string;
  mode: Mode;
  blurb: string;
  blurbAr: string;
  items: { productId: string; qty: number }[];
  bundlePrice: number;
}

export interface Area {
  id: string;
  name: string;
  nameAr: string;
  etaMins: number;
}

export interface Address {
  id: string;
  label: string;
  labelAr: string;
  kind: Mode;
  areaId: string;
  building: string;
  buildingAr: string;
  floor: string;
  floorAr: string;
  contactName: string;
  phone: string;
}

export interface CartLine {
  productId: string;
  packId: string;
  qty: number;
}

export interface SavedList {
  id: string;
  name: string;
  nameAr: string;
  lines: CartLine[];
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  lines: CartLine[];
  addressId: string;
  paymentMethod: PaymentMethod;
  total: number;
  mode: Mode;
  approvalRequested: boolean;
  instruction: string;
  slotLabel: string;
  rating: number | null;
  ratingChips: string[];
}

export interface CompanyDetails {
  trn: string;
  billingEmail: string;
}

export interface Profile {
  name: string;
  role: string;
  roleAr: string;
  organisation: string;
  organisationAr: string;
}

export interface SessionState {
  mode: Mode;
  defaultMode: Mode;
  language: Language;
  areaId: string;
  lines: CartLine[];
  orders: Order[];
  lists: SavedList[];
  addresses: Address[];
  company: CompanyDetails;
  profile: Profile;
  approvalNeeded: boolean;
  trackingSpeed: 1 | 2;
  recentSearches: string[];
  nextOrderNumber: number;
}

export type Command =
  | { type: "setMode"; mode: Mode }
  | { type: "setDefaultMode"; mode: Mode }
  | { type: "setLanguage"; language: Language }
  | { type: "setArea"; areaId: string }
  | { type: "addProduct"; productId: string; qty?: number; packId?: string }
  | { type: "setLineQty"; productId: string; packId: string; qty: number }
  | { type: "addBundle"; bundleId: string; quantities?: Record<string, number> }
  | { type: "addList"; listId: string }
  | { type: "reorder"; orderId: string }
  | { type: "createList"; name: string; lines?: CartLine[] }
  | { type: "setListQty"; listId: string; productId: string; packId: string; qty: number }
  | { type: "setApproval"; needed: boolean }
  | { type: "setCompany"; trn: string; billingEmail: string }
  | { type: "saveAddress"; address: Address }
  | { type: "noteSearch"; query: string }
  | { type: "clearRecentSearches" }
  | {
      type: "placeOrder";
      addressId: string;
      paymentMethod: PaymentMethod;
      instruction: string;
      slotLabel: string;
    }
  | { type: "advanceOrder"; orderId: string }
  | { type: "rateOrder"; orderId: string; stars: number; chips: string[] }
  | { type: "prefillCart"; kind: Mode }
  | { type: "setTrackingSpeed"; speed: 1 | 2 }
  | { type: "clearCart" }
  | { type: "reset" };

export interface ProductCard {
  id: string;
  name: string;
  brand: string;
  pack: string;
  price: number;
  mrp: number;
  image: string;
  etaMins: number;
  discountPct: number;
  badges: { kind: "discount" | "bulk" | "low"; label: string }[];
  stock: Stock;
  qty: number;
  packId: string;
}

export interface BillLine {
  productId: string;
  packId: string;
  name: string;
  pack: string;
  image: string;
  qty: number;
  unitPrice: number;
  mrp: number;
  lineTotal: number;
  stock: Stock;
}

export interface Bill {
  lines: BillLine[];
  count: number;
  itemsTotal: number;
  bulkDiscount: number;
  mrpSavings: number;
  deliveryFee: number;
  handlingFee: number;
  vat: number;
  grand: number;
  merchandise: number;
  freeDeliveryGap: number;
  freeDeliveryProgress: number;
  etaMins: number;
}

export interface CatalogQuery {
  categorySlug?: string;
  brands?: string[];
  priceBand?: PriceBand | null;
  pack?: string | null;
  sort?: SortKey;
}

export interface CatalogGroup {
  id: string;
  name: string;
  icon: string;
  products: ProductCard[];
}

export interface CatalogView {
  title: string;
  slug: string;
  groups: CatalogGroup[];
  brands: string[];
  packs: string[];
  count: number;
}

export interface HomeView {
  etaMins: number;
  areaName: string;
  categories: {
    id: string;
    slug: string;
    name: string;
    icon: string;
    tint: string;
  }[];
  rails: { id: string; title: string; products: ProductCard[] }[];
  bundles: BundleCard[];
  reorder: { orderId: string; images: string[]; count: number; total: number } | null;
}

export interface BundleCard {
  id: string;
  name: string;
  blurb: string;
  image: string;
  count: number;
  bundlePrice: number;
  separatePrice: number;
  mode: Mode;
}

export interface BundleDetail extends BundleCard {
  items: {
    productId: string;
    name: string;
    pack: string;
    image: string;
    qty: number;
    unitPrice: number;
  }[];
}

export interface ProductView {
  id: string;
  name: string;
  brand: string;
  description: string;
  highlights: string[];
  details: { label: string; value: string }[];
  images: string[];
  packs: { id: string; label: string; price: number; mrp: number }[];
  selectedPackId: string;
  price: number;
  mrp: number;
  bulkRows: { range: string; unitPrice: number; saveLabel: string }[];
  etaMins: number;
  stock: Stock;
  lowCount?: number;
  qty: number;
  also: ProductCard[];
  categorySlug: string;
  categoryName: string;
}

export interface SearchView {
  products: ProductCard[];
  categories: { slug: string; name: string; icon: string; tint: string }[];
}

export interface OrderView {
  id: string;
  createdAt: string;
  status: OrderStatus;
  statusLabel: string;
  mode: Mode;
  total: number;
  count: number;
  images: string[];
  lines: BillLine[];
  bill: Bill;
  addressLines: string[];
  paymentLabel: string;
  slotLabel: string;
  instruction: string;
  approvalRequested: boolean;
}

export interface InvoiceView {
  id: string;
  invoiceNumber: string;
  issued: string;
  seller: string;
  sellerTrn: string;
  buyer: string;
  buyerTrn: string;
  lines: { name: string; qty: number; unit: number; total: number }[];
  itemsTotal: number;
  bulkDiscount: number;
  deliveryFee: number;
  handlingFee: number;
  vat: number;
  grand: number;
}

export interface ListView {
  id: string;
  name: string;
  count: number;
  lines: {
    productId: string;
    packId: string;
    name: string;
    pack: string;
    image: string;
    qty: number;
    unitPrice: number;
  }[];
}

export interface AccountView {
  profile: Profile;
  mode: Mode;
  defaultMode: Mode;
  language: Language;
  areaName: string;
  addresses: (Address & { areaName: string })[];
  company: CompanyDetails;
  payments: { id: PaymentMethod; label: string; detail: string }[];
}

export interface CheckoutView {
  addresses: (Address & { areaName: string; selectedAreaEta: number })[];
  etaMins: number;
  bill: Bill;
  mode: Mode;
  approvalNeeded: boolean;
}
