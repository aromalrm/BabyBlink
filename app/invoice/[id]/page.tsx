"use client";

import { useParams } from "next/navigation";
import { InvoiceScreen } from "@/components/orders/InvoiceScreen";

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  return <InvoiceScreen id={params.id} />;
}
