"use client";

import { useAuth } from "@/src/contexts/AuthContext";
import { Breadcrumb } from "./Breadcrumb";
import { CurrencySettingsTable } from "./CurrencySettingsTable";
import { useAccUserRedirect } from "@/src/hooks/useAccUser";

export const CurrencySettingsComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <CurrencySettingsTable />
    </main>
  );
};
