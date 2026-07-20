"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EventsDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/enthusiasts/dashboard");
  }, [router]);

  return null;
}
