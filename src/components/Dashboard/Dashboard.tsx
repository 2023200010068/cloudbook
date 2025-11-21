"use client";

import { Company } from "./Company";
import { MetricsCards } from "./MetricsCards";
import { QuickActions } from "./QuickActions";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAccUserRedirect } from "@/src/hooks/useAccUser";
import { Overviews } from "./Overviews";

export const DashboardComponent = () => {
  const { user } = useAuth();

  useAccUserRedirect();
  if (!user) return null;

  return (
    <main className="bg-[#F2F4F7] min-h-screen p-6">
      <Company />
      <MetricsCards />
      {user.role?.toLocaleLowerCase() == "admin" && <QuickActions />}
      <Overviews />
    </main>
  );
};
