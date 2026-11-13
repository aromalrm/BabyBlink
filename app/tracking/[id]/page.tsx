"use client";

import { useParams } from "next/navigation";
import { TrackingScreen } from "@/components/tracking/TrackingScreen";

export default function TrackingPage() {
  const params = useParams<{ id: string }>();
  return <TrackingScreen id={params.id} />;
}
