import Fuse from "fuse.js";
import { BRAND } from "@/styles/tokens";
import {
  areas,
  bundles,
  categories,
  prefill,
  products,
  profile,
  rails,
  seedAddresses,
  seedLists,
  seedOrderDrafts,
} from "@/data/catalog";
import type {
  AccountView,
  Address,
  Bill,
  BillLine,
  BundleDetail,
  CartLine,
  CatalogQuery,
  CatalogView,
  CheckoutView,
  Command,
  HomeView,
  InvoiceView,
  Language,
  ListView,
  Order,
  OrderStatus,
  OrderView,
  PackOption,
  Product,
  ProductCard,
  ProductView,
  SearchView,
  SessionState,
} from "./types";

export interface TrackingReady {
  id: string;
  status: OrderStatus;
  etaMins: number;
  areaName: string;
  steps: { id: OrderStatus; label: string; state: "done" | "current" | "upcoming" }[];
  riderName: string;
  riderRating: string;
  riderBike: string;
  delivered: boolean;
  rating: number | null;
  ratingChips: string[];
}

const productList = products as Product[];
const byId = new Map(productList.map((product) => [product.id, product]));

const STATUS_ORDER: OrderStatus[] = ["placed", "packing", "out", "delivered"];

function text(language: Language, en: string, ar: string) {
  return language === "ar" ? ar : en;
}

function fils(aed: number) {
  return Math.round(aed * 100);
}

function aed(amount: number) {
  return Math.round(amount) / 100;
}

export function productImages(id: string) {
  return [
    `/images/products/${id}.webp`,
    `/images/products/${id}-b.webp`,
    `/images/products/${id}-c.webp`,
  ];
}

function areaById(id: string) {
  return areas.find((area) => area.id === id) ?? areas[0];
}

function categoryById(id: string) {
  return categories.find((category) => category.id === id);
}

function packOf(product: Product, packId: string): PackOption {
  if (product.packs.length === 0) {
    return {
      id: "default",
      label: product.packSize,
      labelAr: product.packSizeAr,
      price: product.price,
      mrp: product.mrp,
    };
  }
  return product.packs.find((pack) => pack.id === packId) ?? product.packs[0];
}

function defaultPackId(product: Product) {
  const listed = product.packs.find((pack) => pack.price === product.price);
  return listed?.id ?? product.packs[0]?.id ?? "default";
}

function tierFor(product: Product, qty: number) {
  const sorted = [...product.bulkTiers].sort((a, b) => a.minQty - b.minQty);
  let chosen = sorted[0];
  for (const tier of sorted) {
    if (qty >= tier.minQty) chosen = tier;
  }
  return chosen ?? { minQty: 1, discountPct: 0 };
}

function lineMoney(product: Product, pack: PackOption, qty: number) {
  const tier = tierFor(product, qty);
  const list = fils(pack.price) * qty;
  const discount = Math.round((list * tier.discountPct) / 100);
  const mrp = fils(pack.mrp) * qty;
  return { list, discount, net: list - discount, mrpSavings: Math.max(0, mrp - list), tier };
}

function capQty(product: Product, qty: number) {
  if (product.stock === "out") return 0;
  const next = Math.max(0, Math.floor(qty));
  if (product.stock === "low" && product.lowCount) return Math.min(next, product.lowCount);
  return next;
}

function upsert(lines: CartLine[], line: CartLine): CartLine[] {
  const index = lines.findIndex(
    (item) => item.productId === line.productId && item.packId === line.packId,
  );
  if (line.qty <= 0) {
    return lines.filter(
      (item) => !(item.productId === line.productId && item.packId === line.packId),
    );
  }
  if (index === -1) return [...lines, line];
  const copy = lines.slice();
  copy[index] = line;
  return copy;
}

function addLine(lines: CartLine[], productId: string, packId: string | undefined, qty: number) {
  const product = byId.get(productId);
  if (!product) return lines;
  const pack = packOf(product, packId ?? defaultPackId(product));
  const existing = lines.find((line) => line.productId === product.id && line.packId === pack.id);
  const next = capQty(product, (existing?.qty ?? 0) + qty);
  return upsert(lines, { productId: product.id, packId: pack.id, qty: next });
}

export function billOf(state: SessionState): Bill {
  const lines: BillLine[] = [];
  let items = 0;
  let discount = 0;
  let mrpSavings = 0;
  let count = 0;
  for (const line of state.lines) {
    const product = byId.get(line.productId);
    if (!product || line.qty <= 0) continue;
    const pack = packOf(product, line.packId);
    const money = lineMoney(product, pack, line.qty);
    items += money.list;
    discount += money.discount;
    mrpSavings += money.mrpSavings;
    count += line.qty;
    lines.push({
      productId: product.id,
      packId: pack.id,
      name: text(state.language, product.name, product.nameAr),
      pack: text(state.language, pack.label, pack.labelAr),
      image: productImages(product.id)[0],
      qty: line.qty,
      unitPrice: aed(Math.round(money.net / line.qty)),
      mrp: pack.mrp,
      lineTotal: aed(money.net),
      stock: product.stock,
    });
  }
  const merchandise = items - discount;
  const delivery =
    count === 0 ? 0 : merchandise >= fils(BRAND.freeDeliveryAt) ? 0 : merchandise >= fils(BRAND.midDeliveryAt) ? fils(BRAND.deliveryFeeMid) : fils(BRAND.deliveryFeeLow);
  const handling = count === 0 ? 0 : fils(BRAND.handlingFee);
  const vat = Math.round(((merchandise + delivery + handling) * 5) / 100);
  const gap = Math.max(0, fils(BRAND.freeDeliveryAt) - merchandise);
  return {
    lines,
    count,
    itemsTotal: aed(items),
    bulkDiscount: aed(discount),
    mrpSavings: aed(mrpSavings),
    deliveryFee: aed(delivery),
    handlingFee: aed(handling),
    vat: aed(vat),
    grand: aed(merchandise + delivery + handling + vat),
    merchandise: aed(merchandise),
    freeDeliveryGap: aed(gap),
    freeDeliveryProgress: Math.max(0, Math.min(1, merchandise / fils(BRAND.freeDeliveryAt))),
    etaMins: areaById(state.areaId).etaMins,
  };
}

function qtyOf(state: SessionState, productId: string, packId: string) {
  return state.lines.find((line) => line.productId === productId && line.packId === packId)?.qty ?? 0;
}

function cardOf(state: SessionState, product: Product): ProductCard {
  const pack = packOf(product, defaultPackId(product));
  const discountPct = pack.mrp > pack.price ? Math.round(((pack.mrp - pack.price) / pack.mrp) * 100) : 0;
  const badges: ProductCard["badges"] = [];
  if (discountPct >= 15) {
    badges.push({
      kind: "discount",
      label: text(state.language, `${discountPct}% OFF`, `خصم ${discountPct}٪`),
    });
  }
  if (product.tags.includes("bulk")) {
    badges.push({
      kind: "bulk",
      label: text(state.language, "Bulk deal", "سعر الجملة"),
    });
  }
  if (product.stock === "low" && product.lowCount) {
    badges.push({
      kind: "low",
      label: text(state.language, `Only ${product.lowCount} left`, `تبقّى ${product.lowCount}`),
    });
  }
  return {
    id: product.id,
    name: text(state.language, product.name, product.nameAr),
    brand: text(state.language, product.brand, product.brandAr),
    pack: text(state.language, pack.label, pack.labelAr),
    price: pack.price,
    mrp: pack.mrp,
    image: productImages(product.id)[0],
    etaMins: areaById(state.areaId).etaMins,
    discountPct,
    badges,
    stock: product.stock,
    qty: qtyOf(state, product.id, pack.id),
    packId: pack.id,
  };
}

function inCategory(product: Product, categoryId: string) {
  return (
    product.categoryId === categoryId ||
    product.alsoIn.some((place) => place.categoryId === categoryId)
  );
}

function subFor(product: Product, categoryId: string) {
  if (product.categoryId === categoryId) return product.subCategoryId;
  return product.alsoIn.find((place) => place.categoryId === categoryId)?.subCategoryId ?? product.subCategoryId;
}

function matchesBand(price: number, band: CatalogQuery["priceBand"]) {
  if (!band) return true;
  if (band === "under-20") return price < 20;
  if (band === "20-50") return price >= 20 && price <= 50;
  return price > 50;
}

export function catalogOf(state: SessionState, query: CatalogQuery = {}): CatalogView {
  const category =
    categories.find((item) => item.slug === query.categorySlug) ??
    categories.find((item) => item.mode === state.mode);
  const chosen = category ?? categories[0];
  const brands = new Set<string>();
  const packs = new Set<string>();
  let pool = productList.filter(
    (product) => product.modes.includes(state.mode) && inCategory(product, chosen.id),
  );
  for (const product of pool) {
    brands.add(text(state.language, product.brand, product.brandAr));
    packs.add(text(state.language, product.packSize, product.packSizeAr));
  }
  pool = pool.filter((product) => {
    const pack = packOf(product, defaultPackId(product));
    const brand = text(state.language, product.brand, product.brandAr);
    const packLabel = text(state.language, product.packSize, product.packSizeAr);
    if (query.brands && query.brands.length > 0 && !query.brands.includes(brand)) return false;
    if (query.pack && query.pack !== packLabel) return false;
    return matchesBand(pack.price, query.priceBand);
  });
  const sort = query.sort ?? "relevance";
  if (sort === "price-asc" || sort === "price-desc") {
    pool = pool.slice().sort((a, b) => {
      const delta = packOf(a, defaultPackId(a)).price - packOf(b, defaultPackId(b)).price;
      return sort === "price-asc" ? delta : -delta;
    });
  }
  const groups = chosen.subcategories
    .map((sub) => ({
      id: sub.id,
      name: text(state.language, sub.name, sub.nameAr),
      icon: sub.icon,
      products: pool
        .filter((product) => subFor(product, chosen.id) === sub.id)
        .map((product) => cardOf(state, product)),
    }))
    .filter((group) => group.products.length > 0);
  return {
    title: text(state.language, chosen.name, chosen.nameAr),
    slug: chosen.slug,
    groups,
    brands: [...brands],
    packs: [...packs],
    count: groups.reduce((sum, group) => sum + group.products.length, 0),
  };
}

export function homeOf(state: SessionState): HomeView {
  const area = areaById(state.areaId);
  const modeCategories = categories.filter((category) => category.mode === state.mode);
  const modeRails = rails.filter((rail) => rail.mode === state.mode);
  const reorderSource = [...(seedSafeOrders(state))].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
  return {
    etaMins: area.etaMins,
    areaName: text(state.language, area.name, area.nameAr),
    categories: modeCategories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: text(state.language, category.name, category.nameAr),
      icon: category.icon,
      tint: category.tint,
    })),
    rails: modeRails.map((rail) => ({
      id: rail.id,
      title: text(state.language, rail.title, rail.titleAr),
      products: rail.productIds
        .map((id) => byId.get(id))
        .filter((product): product is Product => Boolean(product))
        .map((product) => cardOf(state, product)),
    })),
    bundles: bundleCards(state),
    reorder: reorderSource
      ? {
          orderId: reorderSource.id,
          images: reorderSource.lines.slice(0, 4).map((line) => productImages(line.productId)[0]),
          count: reorderSource.lines.reduce((sum, line) => sum + line.qty, 0),
          total: reorderSource.total,
        }
      : null,
  };
}

function seedSafeOrders(state: SessionState) {
  return state.orders;
}

function bundleSeparate(bundleId: string) {
  const bundle = bundles.find((item) => item.id === bundleId);
  if (!bundle) return 0;
  return bundle.items.reduce((sum, item) => {
    const product = byId.get(item.productId);
    if (!product) return sum;
    return sum + packOf(product, defaultPackId(product)).price * item.qty;
  }, 0);
}

function bundleCards(state: SessionState) {
  return bundles
    .filter((bundle) => bundle.mode === state.mode)
    .map((bundle) => ({
      id: bundle.id,
      name: text(state.language, bundle.name, bundle.nameAr),
      blurb: text(state.language, bundle.blurb, bundle.blurbAr),
      image: productImages(bundle.items[0]?.productId ?? "a4-80-500")[0],
      count: bundle.items.reduce((sum, item) => sum + item.qty, 0),
      bundlePrice: bundle.bundlePrice,
      separatePrice: bundleSeparate(bundle.id),
      mode: bundle.mode,
    }));
}

export function bundlesOf(state: SessionState) {
  return bundles.map((bundle) => ({
    id: bundle.id,
    name: text(state.language, bundle.name, bundle.nameAr),
    blurb: text(state.language, bundle.blurb, bundle.blurbAr),
    image: productImages(bundle.items[0]?.productId ?? "a4-80-500")[0],
    count: bundle.items.reduce((sum, item) => sum + item.qty, 0),
    bundlePrice: bundle.bundlePrice,
    separatePrice: bundleSeparate(bundle.id),
    mode: bundle.mode,
  }));
}

export function bundleOf(state: SessionState, id: string): BundleDetail | null {
  const bundle = bundles.find((item) => item.id === id);
  if (!bundle) return null;
  const card = bundlesOf(state).find((item) => item.id === id);
  if (!card) return null;
  return {
    ...card,
    items: bundle.items.flatMap((item) => {
      const product = byId.get(item.productId);
      if (!product) return [];
      const pack = packOf(product, defaultPackId(product));
      return [
        {
          productId: product.id,
          name: text(state.language, product.name, product.nameAr),
          pack: text(state.language, pack.label, pack.labelAr),
          image: productImages(product.id)[0],
          qty: item.qty,
          unitPrice: pack.price,
        },
      ];
    }),
  };
}

export function productViewOf(state: SessionState, id: string, packId?: string): ProductView | null {
  const product = byId.get(id);
  if (!product) return null;
  const selected = packOf(product, packId ?? defaultPackId(product));
  const tiers = [...product.bulkTiers].sort((a, b) => a.minQty - b.minQty);
  const category = categoryById(product.categoryId);
  const also = productList
    .filter(
      (item) =>
        item.id !== product.id &&
        item.categoryId === product.categoryId &&
        item.modes.includes(state.mode),
    )
    .slice(0, 8)
    .map((item) => cardOf(state, item));
  return {
    id: product.id,
    name: text(state.language, product.name, product.nameAr),
    brand: text(state.language, product.brand, product.brandAr),
    description: text(state.language, product.description, product.descriptionAr),
    highlights: state.language === "ar" ? product.highlightsAr : product.highlights,
    details: [
      { label: text(state.language, "Brand", "العلامة"), value: text(state.language, product.brand, product.brandAr) },
      { label: text(state.language, "Pack", "العبوة"), value: text(state.language, selected.label, selected.labelAr) },
      { label: text(state.language, "SKU", "رمز الصنف"), value: product.id },
    ],
    images: productImages(product.id),
    packs: (product.packs.length > 0 ? product.packs : [selected]).map((pack) => ({
      id: pack.id,
      label: text(state.language, pack.label, pack.labelAr),
      price: pack.price,
      mrp: pack.mrp,
    })),
    selectedPackId: selected.id,
    price: selected.price,
    mrp: selected.mrp,
    bulkRows: tiers.map((tier, index) => {
      const next = tiers[index + 1];
      const range = next ? `${tier.minQty}–${next.minQty - 1}` : `${tier.minQty}+`;
      const unit = aed(Math.round((fils(selected.price) * (100 - tier.discountPct)) / 100));
      return {
        range,
        unitPrice: unit,
        saveLabel:
          tier.discountPct === 0
            ? text(state.language, "Standard", "السعر")
            : text(state.language, `Save ${tier.discountPct}%`, `وفّر ${tier.discountPct}٪`),
      };
    }),
    etaMins: areaById(state.areaId).etaMins,
    stock: product.stock,
    lowCount: product.lowCount,
    qty: qtyOf(state, product.id, selected.id),
    also,
    categorySlug: category?.slug ?? "",
    categoryName: category ? text(state.language, category.name, category.nameAr) : "",
  };
}

let fuse: Fuse<Product> | null = null;
function searchIndex() {
  if (!fuse) {
    fuse = new Fuse(productList, {
      keys: ["name", "nameAr", "brand", "brandAr", "tags", "packSize", "description"],
      threshold: 0.38,
      ignoreLocation: true,
      distance: 80,
    });
  }
  return fuse;
}

export function searchCatalog(state: SessionState, query: string): SearchView {
  const needle = query.trim();
  if (!needle) return { products: [], categories: [] };
  const hits = searchIndex()
    .search(needle)
    .map((result) => result.item)
    .filter((product) => product.modes.includes(state.mode))
    .slice(0, 24)
    .map((product) => cardOf(state, product));
  const lowered = needle.toLowerCase();
  const matchedCategories = categories
    .filter((category) => category.mode === state.mode)
    .filter((category) => {
      const name = `${category.name} ${category.nameAr}`.toLowerCase();
      return name.includes(lowered) || category.subcategories.some((sub) => `${sub.name} ${sub.nameAr}`.toLowerCase().includes(lowered));
    })
    .slice(0, 6)
    .map((category) => ({
      slug: category.slug,
      name: text(state.language, category.name, category.nameAr),
      icon: category.icon,
      tint: category.tint,
    }));
  return { products: hits, categories: matchedCategories };
}

function addressLines(state: SessionState, addressId: string) {
  const address = state.addresses.find((item) => item.id === addressId);
  if (!address) return [];
  const area = areaById(address.areaId);
  return [
    text(state.language, address.label, address.labelAr),
    text(state.language, address.building, address.buildingAr),
    text(state.language, address.floor, address.floorAr),
    `${text(state.language, area.name, area.nameAr)}, ${text(state.language, "Ajman", "عجمان")}`,
    `${address.contactName} · ${address.phone}`,
  ];
}

function paymentLabel(language: Language, method: Order["paymentMethod"]) {
  const labels = {
    card: ["Card", "بطاقة"],
    apple: ["Apple Pay", "Apple Pay"],
    cod: ["Cash on delivery", "الدفع عند الاستلام"],
    credit: ["Company credit (net-30)", "حساب الشركة (30 يوماً)"],
  } as const;
  const pair = labels[method];
  return text(language, pair[0], pair[1]);
}

function statusLabel(language: Language, status: OrderStatus) {
  const labels = {
    placed: ["Order confirmed", "تم تأكيد الطلب"],
    packing: ["Packing", "يجري التجهيز"],
    out: ["Out for delivery", "خرج للتوصيل"],
    delivered: ["Delivered", "تم التوصيل"],
  } as const;
  const pair = labels[status];
  return text(language, pair[0], pair[1]);
}

function orderBill(state: SessionState, order: Order): Bill {
  return billOf({ ...state, lines: order.lines, areaId: state.addresses.find((item) => item.id === order.addressId)?.areaId ?? state.areaId });
}

function orderView(state: SessionState, order: Order): OrderView {
  return {
    id: order.id,
    createdAt: order.createdAt,
    status: order.status,
    statusLabel: statusLabel(state.language, order.status),
    mode: order.mode,
    total: order.total,
    count: order.lines.reduce((sum, line) => sum + line.qty, 0),
    images: order.lines.slice(0, 4).map((line) => productImages(line.productId)[0]),
    lines: orderBill(state, order).lines,
    bill: orderBill(state, order),
    addressLines: addressLines(state, order.addressId),
    paymentLabel: paymentLabel(state.language, order.paymentMethod),
    slotLabel: order.slotLabel,
    instruction: order.instruction,
    approvalRequested: order.approvalRequested,
  };
}

export function ordersOf(state: SessionState): OrderView[] {
  return [...state.orders]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((order) => orderView(state, order));
}

export function orderOf(state: SessionState, id: string) {
  const order = state.orders.find((item) => item.id === id);
  return order ? orderView(state, order) : null;
}

export function invoiceOf(state: SessionState, id: string): InvoiceView | null {
  const order = state.orders.find((item) => item.id === id);
  if (!order) return null;
  const bill = orderBill(state, order);
  const issued = new Intl.DateTimeFormat(state.language === "ar" ? "ar-AE" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(order.createdAt));
  return {
    id: order.id,
    invoiceNumber: order.id.replace("DD-", "INV-2026-"),
    issued,
    seller: text(state.language, BRAND.legalName, BRAND.legalNameAr),
    sellerTrn: BRAND.trn,
    buyer: text(state.language, state.profile.organisation, state.profile.organisationAr),
    buyerTrn: state.company.trn || "—",
    lines: bill.lines.map((line) => ({
      name: line.name,
      qty: line.qty,
      unit: line.unitPrice,
      total: line.lineTotal,
    })),
    itemsTotal: bill.itemsTotal,
    bulkDiscount: bill.bulkDiscount,
    deliveryFee: bill.deliveryFee,
    handlingFee: bill.handlingFee,
    vat: bill.vat,
    grand: bill.grand,
  };
}

export function listsOf(state: SessionState): ListView[] {
  return state.lists.map((list) => ({
    id: list.id,
    name: text(state.language, list.name, list.nameAr),
    count: list.lines.reduce((sum, line) => sum + line.qty, 0),
    lines: list.lines.flatMap((line) => {
      const product = byId.get(line.productId);
      if (!product) return [];
      const pack = packOf(product, line.packId);
      return [
        {
          productId: product.id,
          packId: pack.id,
          name: text(state.language, product.name, product.nameAr),
          pack: text(state.language, pack.label, pack.labelAr),
          image: productImages(product.id)[0],
          qty: line.qty,
          unitPrice: pack.price,
        },
      ];
    }),
  }));
}

export function accountOf(state: SessionState): AccountView {
  return {
    profile: state.profile,
    mode: state.mode,
    defaultMode: state.defaultMode,
    language: state.language,
    areaName: text(state.language, areaById(state.areaId).name, areaById(state.areaId).nameAr),
    addresses: state.addresses.map((address) => ({
      ...address,
      areaName: text(state.language, areaById(address.areaId).name, areaById(address.areaId).nameAr),
    })),
    company: state.company,
    payments: [
      { id: "card", label: text(state.language, "Card", "بطاقة"), detail: "•••• 4242" },
      { id: "apple", label: "Apple Pay", detail: text(state.language, "Fatima's iPhone", "آيفون فاطمة") },
      { id: "cod", label: text(state.language, "Cash on delivery", "الدفع عند الاستلام"), detail: text(state.language, "Pay the rider", "يُدفع للمندوب") },
      { id: "credit", label: text(state.language, "Company credit", "حساب الشركة"), detail: text(state.language, "Net 30", "30 يوماً") },
    ],
  };
}

export function checkoutOf(state: SessionState): CheckoutView {
  return {
    addresses: state.addresses.map((address) => ({
      ...address,
      areaName: text(state.language, areaById(address.areaId).name, areaById(address.areaId).nameAr),
      selectedAreaEta: areaById(address.areaId).etaMins,
    })),
    etaMins: areaById(state.areaId).etaMins,
    bill: billOf(state),
    mode: state.mode,
    approvalNeeded: state.approvalNeeded,
  };
}

export function trackingOf(state: SessionState, id: string): TrackingReady | null {
  const order = state.orders.find((item) => item.id === id);
  if (!order) return null;
  const address = state.addresses.find((item) => item.id === order.addressId);
  const area = areaById(address?.areaId ?? state.areaId);
  const index = STATUS_ORDER.indexOf(order.status);
  return {
    id: order.id,
    status: order.status,
    etaMins: order.status === "delivered" ? 0 : area.etaMins,
    areaName: text(state.language, area.name, area.nameAr),
    steps: STATUS_ORDER.map((status, step) => ({
      id: status,
      label: statusLabel(state.language, status),
      state: step < index ? "done" : step === index ? "current" : "upcoming",
    })),
    riderName: "Hassan Al Mazrouei",
    riderRating: "4.9",
    riderBike: "DD-214",
    delivered: order.status === "delivered",
    rating: order.rating,
    ratingChips: order.ratingChips,
  };
}

export function areasOf(state: SessionState) {
  return areas.map((area) => ({
    id: area.id,
    name: text(state.language, area.name, area.nameAr),
    etaMins: area.etaMins,
    selected: area.id === state.areaId,
  }));
}

function withTotals(draft: (typeof seedOrderDrafts)[number], language: Language): Order {
  const scratch = blankState();
  scratch.language = language;
  scratch.lines = draft.lines;
  const bill = billOf(scratch);
  return {
    id: draft.id,
    createdAt: draft.createdAt,
    status: draft.status as OrderStatus,
    lines: draft.lines,
    addressId: draft.addressId,
    paymentMethod: draft.paymentMethod as Order["paymentMethod"],
    total: bill.grand,
    mode: draft.mode as Order["mode"],
    approvalRequested: draft.approvalRequested,
    instruction: draft.instruction,
    slotLabel: draft.slotLabel,
    rating: draft.rating,
    ratingChips: draft.ratingChips,
  };
}

function blankState(): SessionState {
  return {
    mode: "office",
    defaultMode: "office",
    language: "en",
    areaId: "al-nuaimiya",
    lines: [],
    orders: [],
    lists: seedLists.map((list) => ({ ...list, lines: list.lines.map((line) => ({ ...line })) })),
    addresses: seedAddresses.map((address) => ({ ...address })),
    company: { trn: "", billingEmail: "fatima@horizon-offices.ae" },
    profile: { ...profile },
    approvalNeeded: false,
    trackingSpeed: 1,
    recentSearches: [],
    nextOrderNumber: 1020,
  };
}

export function initialSession(): SessionState {
  const state = blankState();
  state.orders = seedOrderDrafts.map((draft) => withTotals(draft, "en"));
  return state;
}

export function reduceSession(state: SessionState, command: Command): SessionState {
  switch (command.type) {
    case "setMode":
      return { ...state, mode: command.mode };
    case "setDefaultMode":
      return { ...state, defaultMode: command.mode, mode: command.mode };
    case "setLanguage":
      return { ...state, language: command.language };
    case "setArea":
      return areas.some((area) => area.id === command.areaId) ? { ...state, areaId: command.areaId } : state;
    case "addProduct":
      return { ...state, lines: addLine(state.lines, command.productId, command.packId, command.qty ?? 1) };
    case "setLineQty": {
      const product = byId.get(command.productId);
      if (!product) return state;
      return {
        ...state,
        lines: upsert(state.lines, {
          productId: command.productId,
          packId: command.packId,
          qty: capQty(product, command.qty),
        }),
      };
    }
    case "addBundle": {
      const bundle = bundles.find((item) => item.id === command.bundleId);
      if (!bundle) return state;
      let lines = state.lines;
      for (const item of bundle.items) {
        const qty = command.quantities?.[item.productId] ?? item.qty;
        lines = addLine(lines, item.productId, undefined, qty);
      }
      return { ...state, lines };
    }
    case "addList": {
      const list = state.lists.find((item) => item.id === command.listId);
      if (!list) return state;
      let lines = state.lines;
      for (const line of list.lines) lines = addLine(lines, line.productId, line.packId, line.qty);
      return { ...state, lines };
    }
    case "reorder": {
      const order = state.orders.find((item) => item.id === command.orderId);
      if (!order) return state;
      let lines = state.lines;
      for (const line of order.lines) lines = addLine(lines, line.productId, line.packId, line.qty);
      return { ...state, lines };
    }
    case "createList": {
      const name = command.name.trim();
      const lines = (command.lines ?? state.lines).filter((line) => line.qty > 0);
      if (!name || lines.length === 0) return state;
      return {
        ...state,
        lists: [
          ...state.lists,
          { id: `list-${state.lists.length + 1}`, name, nameAr: name, lines: lines.map((line) => ({ ...line })) },
        ],
      };
    }
    case "setListQty":
      return {
        ...state,
        lists: state.lists.map((list) => {
          if (list.id !== command.listId) return list;
          const product = byId.get(command.productId);
          const qty = product ? capQty(product, command.qty) : 0;
          return {
            ...list,
            lines: upsert(list.lines, { productId: command.productId, packId: command.packId, qty }),
          };
        }),
      };
    case "setApproval":
      return { ...state, approvalNeeded: command.needed };
    case "setCompany":
      return { ...state, company: { trn: command.trn.trim(), billingEmail: command.billingEmail.trim() } };
    case "saveAddress": {
      const exists = state.addresses.some((address) => address.id === command.address.id);
      return {
        ...state,
        addresses: exists
          ? state.addresses.map((address) => (address.id === command.address.id ? command.address : address))
          : [...state.addresses, command.address],
      };
    }
    case "noteSearch": {
      const query = command.query.trim();
      if (query.length < 2) return state;
      return {
        ...state,
        recentSearches: [query, ...state.recentSearches.filter((item) => item.toLowerCase() !== query.toLowerCase())].slice(0, 6),
      };
    }
    case "clearRecentSearches":
      return { ...state, recentSearches: [] };
    case "placeOrder": {
      if (state.lines.length === 0) return state;
      if (!state.addresses.some((address) => address.id === command.addressId)) return state;
      const bill = billOf(state);
      const order: Order = {
        id: `DD-${state.nextOrderNumber}`,
        createdAt: new Date().toISOString(),
        status: "placed",
        lines: state.lines.map((line) => ({ ...line })),
        addressId: command.addressId,
        paymentMethod: command.paymentMethod,
        total: bill.grand,
        mode: state.mode,
        approvalRequested: state.mode === "office" && state.approvalNeeded,
        instruction: command.instruction,
        slotLabel: command.slotLabel,
        rating: null,
        ratingChips: [],
      };
      return { ...state, lines: [], orders: [order, ...state.orders], nextOrderNumber: state.nextOrderNumber + 1 };
    }
    case "advanceOrder":
      return {
        ...state,
        orders: state.orders.map((order) => {
          if (order.id !== command.orderId) return order;
          const index = STATUS_ORDER.indexOf(order.status);
          const next = STATUS_ORDER[Math.min(STATUS_ORDER.length - 1, index + 1)];
          return { ...order, status: next };
        }),
      };
    case "rateOrder":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === command.orderId && order.status === "delivered"
            ? { ...order, rating: command.stars, ratingChips: command.chips }
            : order,
        ),
      };
    case "prefillCart":
      return { ...state, mode: command.kind, lines: prefill[command.kind].map((line) => ({ ...line })) };
    case "setTrackingSpeed":
      return { ...state, trackingSpeed: command.speed };
    case "clearCart":
      return { ...state, lines: [] };
    case "reset":
      return initialSession();
    default:
      return state;
  }
}

export function findAddress(state: SessionState, id: string): Address | undefined {
  return state.addresses.find((address) => address.id === id);
}
