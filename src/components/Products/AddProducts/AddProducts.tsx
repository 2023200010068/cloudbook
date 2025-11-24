"use client";

import { useAuth } from "@/src/contexts/AuthContext";
import { AddProductsForm } from "./AddProductsForm";
import { Breadcrumb } from "./Breadcrumb";
import { useAccUserRedirect } from "@/src/hooks/useAccUser";

export const AddProductsComponent = () => {
  const { user } = useAuth();
  useAccUserRedirect();
  if (!user) return null;
  return (
    <main className="bg-[#F2F4F7] min-h-screen p-5">
      <Breadcrumb />
      <AddProductsForm />
    </main>
  );
};
