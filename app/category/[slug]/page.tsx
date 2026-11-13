"use client";

import { useParams } from "next/navigation";
import { CategoryScreen } from "@/components/category/CategoryScreen";

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  return <CategoryScreen slug={params.slug} />;
}
