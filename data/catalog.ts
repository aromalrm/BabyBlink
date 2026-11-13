import type { Address, Bundle, Category, Mode, Product } from "@/lib/commerce/types";
import {
  areas as rawAreas,
  bundles as rawBundles,
  categories as rawCategories,
  prefill as rawPrefill,
  products as rawProducts,
  profile as rawProfile,
  rails as rawRails,
  seedAddresses as rawAddresses,
  seedLists as rawLists,
  seedOrderDrafts as rawOrders,
} from "./catalog.mjs";

export const areas = rawAreas as { id: string; name: string; nameAr: string; etaMins: number }[];
export const categories = rawCategories as unknown as Category[];
export const products = rawProducts as unknown as Product[];
export const bundles = rawBundles as unknown as Bundle[];
export const seedLists = rawLists as {
  id: string;
  name: string;
  nameAr: string;
  lines: { productId: string; packId: string; qty: number }[];
}[];
export const profile = rawProfile as {
  name: string;
  role: string;
  roleAr: string;
  organisation: string;
  organisationAr: string;
};
export const seedAddresses = rawAddresses as unknown as Address[];
export const rails = rawRails as unknown as {
  id: string;
  mode: Mode;
  title: string;
  titleAr: string;
  productIds: string[];
}[];
export const prefill = rawPrefill as unknown as Record<Mode, { productId: string; packId: string; qty: number }[]>;
export const seedOrderDrafts = rawOrders as unknown as {
  id: string;
  createdAt: string;
  status: string;
  mode: Mode;
  addressId: string;
  paymentMethod: string;
  approvalRequested: boolean;
  instruction: string;
  slotLabel: string;
  rating: number | null;
  ratingChips: string[];
  lines: { productId: string; packId: string; qty: number }[];
}[];
