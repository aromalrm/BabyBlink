"use client";

import { useParams } from "next/navigation";
import { ProductScreen } from "@/components/product/ProductScreen";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  return <ProductScreen id={params.id} />;
}
