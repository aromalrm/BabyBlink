"use client";

import { useParams } from "next/navigation";
import { OrderDetail } from "@/components/orders/OrdersScreen";

export default function OrderPage() {
  const params = useParams<{ id: string }>();
  return <OrderDetail id={params.id} />;
}
