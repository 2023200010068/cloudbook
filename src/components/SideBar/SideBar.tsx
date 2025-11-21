"use client";

import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/logo.webp";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AiFillDashboard, AiFillProduct } from "react-icons/ai";
import { useAuth } from "@/src/contexts/AuthContext";
import { useAccUserRedirect } from "@/src/hooks/useAccUser";
import { ModulePermission, PermissionResponse } from "@/src/types/permission";
import { FaChevronDown, FaUsers, FaUserTie } from "react-icons/fa";
import { FaGear, FaMoneyBillTrendUp } from "react-icons/fa6";

const SIDEBAR_MODULES = [
  "products",
  "customers",
  "invoices",
  "employees",
  "settings",
];

interface SideBarProps {
  closeSidebar?: () => void;
}

export const SideBar = ({ closeSidebar }: SideBarProps) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [roleModules, setRoleModules] = useState<
    Record<string, ModulePermission[]>
  >({});
  useAccUserRedirect();

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user?.id || !user?.role) return;

      try {
        const permissionsRes = await fetch(
          `/api/permissions?user_id=${user.id}`
        );
        const permissionsData = await permissionsRes.json();
        const permissionsList: PermissionResponse[] = Array.isArray(
          permissionsData.data
        )
          ? permissionsData.data
          : [];

        let allowedModules: string[] = [];

        if (user.role.toLowerCase() == "admin") {
          allowedModules = SIDEBAR_MODULES;
        } else {
          const matchedRole = permissionsList.find((p) => p.role == user.role);
          allowedModules = matchedRole?.allowedModules || [];
        }

        const modules = SIDEBAR_MODULES.map((module, idx) => ({
          id: idx.toString(),
          name: module,
          canView: allowedModules.includes(module),
        }));

        setRoleModules({
          [user.role]: modules,
        });
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchPermissions();
  }, [user?.id, user?.role]);
  if (!user) return null;
  const canAccessModule = (module: string) => {
    const userRole = user?.role;
    const modules = roleModules[userRole] || [];
    return modules.find((m) => m.name == module && m.canView);
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection == section ? null : section);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768 && closeSidebar) {
      closeSidebar();
    }
  };

  const linkClass = (route: string) =>
    `text-[13px] text-white font-[500] flex items-center transition duration-300 group h-11 border-t border-[#252D37] ${
      pathname == route ? "text-white bg-[#1E2639]" : ""
    }`;

  const subLinkClass = (route: string) =>
    `text-[13px] text-gray-400 hover:text-white font-[500] flex items-center transition duration-300 group h-11 ${
      pathname == route ? "text-white" : ""
    }`;

  const linkBar = (route: string) =>
    `bg-[#307DF1] h-[23px] w-[3px] group-hover:opacity-100 opacity-0 transition duration-300 ${
      pathname == route ? "opacity-100" : ""
    }`;

  return (
    <main className="bg-[#151822] h-screen overflow-y-auto overflow-x-hidden scrollbar-hide">
      <div className="shrink-0 sticky top-0 z-10 bg-[#151822] border-b border-[#252D37]">
        <Link
          className="text-white font-bold flex items-center text-[30px] px-8 py-[19.5px]"
          href={"/"}
          onClick={handleLinkClick}
        >
          <Image height={30} src={logo} alt={"Logo"} priority />
          <span className="text-white text-[18px] font-bold ml-2">
            CloudBook
          </span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <Link
          href={"/dashboard"}
          className={linkClass("/dashboard")}
          onClick={handleLinkClick}
        >
          <div className={linkBar("/dashboard")}></div>
          <AiFillDashboard className="ml-[21px] text-[16px] mr-3 w-5" />
          Dashboard
        </Link>

      {canAccessModule("products") && (
        <>
          <button
            onClick={() => toggleSection("products")}
            className={`text-[13px] text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
              pathname.includes("/products") ? "text-white bg-[#1E2639]" : ""
            }`}
          >
            <div className="flex items-center">
              <div
                className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
                  pathname.includes("/products")
                    ? "bg-[#307DF1]"
                    : "bg-transparent"
                }`}
              ></div>
              <AiFillProduct className="ml-[21px] text-[16px] mr-3 w-5" />
              Products
            </div>
            <FaChevronDown />
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 transform ${
              openSection == "products"
                ? "max-h-[135px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="pl-[56px] bg-[#202431] text-[13px]">
              <Link
                className={subLinkClass("/products/add-products")}
                href="/products/add-products"
                onClick={handleLinkClick}
              >
                Add Products
              </Link>

              <Link
                className={subLinkClass("/products/products-list")}
                href="/products/products-list"
                onClick={handleLinkClick}
              >
                Products List
              </Link>

              <Link
                className={subLinkClass("/products/product-settings")}
                href="/products/product-settings"
                onClick={handleLinkClick}
              >
                Product Settings
              </Link>
            </div>
          </div>
        </>
      )}

      {canAccessModule("customers") && (
        <>
          <button
            onClick={() => toggleSection("customers")}
            className={`text-[13px] text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
              pathname.includes("/customers") ? "text-white bg-[#1E2639]" : ""
            }`}
          >
            <div className="flex items-center">
              <div
                className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
                  pathname.includes("/customers")
                    ? "bg-[#307DF1]"
                    : "bg-transparent"
                }`}
              ></div>
              <FaUsers className="ml-[21px] text-[16px] mr-3 w-5" />
              Customers
            </div>
            <FaChevronDown />
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 transform ${
              openSection == "customers"
                ? "max-h-[90px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="pl-[56px] bg-[#202431] text-[13px]">
              <Link
                className={subLinkClass("/customers/add-customers")}
                href="/customers/add-customers"
                onClick={handleLinkClick}
              >
                Add Customers
              </Link>

              <Link
                className={subLinkClass("/customers/customers-list")}
                href="/customers/customers-list"
                onClick={handleLinkClick}
              >
                Customers List
              </Link>
            </div>
          </div>
        </>
      )}

      {canAccessModule("invoices") && (
        <>
          <button
            onClick={() => toggleSection("invoices")}
            className={`text-[13px] text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
              pathname.includes("/invoices") ? "text-white bg-[#1E2639]" : ""
            }`}
          >
            <div className="flex items-center">
              <div
                className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
                  pathname.includes("/invoices")
                    ? "bg-[#307DF1]"
                    : "bg-transparent"
                }`}
              ></div>
              <FaMoneyBillTrendUp className="ml-[21px] text-[16px] mr-3 w-5" />
              Invoices
            </div>
            <FaChevronDown />
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 transform ${
              openSection == "invoices"
                ? "max-h-[180px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="pl-[56px] bg-[#202431] text-[13px]">
              <Link
                className={subLinkClass("/invoices/create-invoices")}
                href="/invoices/create-invoices"
                onClick={handleLinkClick}
              >
                Create Invoices
              </Link>

              <Link
                className={subLinkClass("/invoices/invoices-list")}
                href="/invoices/invoices-list"
                onClick={handleLinkClick}
              >
                Invoices List
              </Link>

              <Link
                className={subLinkClass("/invoices/open-invoices-list")}
                href="/invoices/open-invoices-list"
                onClick={handleLinkClick}
              >
                Open Invoices
              </Link>

              <Link
                className={subLinkClass("/invoices/closed-invoices-list")}
                href="/invoices/closed-invoices-list"
                onClick={handleLinkClick}
              >
                Closed Invoices
              </Link>
            </div>
          </div>
        </>
      )}

      {canAccessModule("employees") && (
        <>
          <button
            onClick={() => toggleSection("employees")}
            className={`text-[13px] text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
              pathname.includes("/employees") ? "text-white bg-[#1E2639]" : ""
            }`}
          >
            <div className="flex items-center">
              <div
                className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
                  pathname.includes("/employees")
                    ? "bg-[#307DF1]"
                    : "bg-transparent"
                }`}
              ></div>
              <FaUserTie className="ml-[21px] text-[16px] mr-3 w-5" />
              Employees
            </div>
            <FaChevronDown />
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 transform ${
              openSection == "employees"
                ? "max-h-[135px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="pl-[56px] bg-[#202431] text-[13px]">
              <Link
                className={subLinkClass("/employees/add-employees")}
                href="/employees/add-employees"
                onClick={handleLinkClick}
              >
                Add Employees
              </Link>

              <Link
                className={subLinkClass("/employees/employees-list")}
                href="/employees/employees-list"
                onClick={handleLinkClick}
              >
                Employees List
              </Link>

              <Link
                className={subLinkClass("/employees/employee-settings")}
                href="/employees/employee-settings"
                onClick={handleLinkClick}
              >
                Employee Settings
              </Link>
            </div>
          </div>
        </>
      )}

      {canAccessModule("settings") && (
        <>
          <button
            onClick={() => toggleSection("settings")}
            className={`text-[13px] text-white font-[500] flex items-center justify-between pr-5 transition duration-300 group h-11 w-full border-t border-[#252D37] ${
              pathname.includes("/settings") ? "text-white bg-[#1E2639]" : ""
            }`}
          >
            <div className="flex items-center">
              <div
                className={`h-[23px] w-[3px] group-hover:bg-[#307DF1] transition duration-300 ${
                  pathname.includes("/settings")
                    ? "bg-[#307DF1]"
                    : "bg-transparent"
                }`}
              ></div>
              <FaGear className="ml-[21px] text-[16px] mr-3 w-5" />
              Settings
            </div>
            <FaChevronDown />
          </button>
          <div
            className={`overflow-hidden transition-all duration-500 transform ${
              openSection == "settings"
                ? "max-h-[135px] opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <div className="pl-[56px] bg-[#202431] text-[13px]">
              <Link
                className={subLinkClass("/settings/currency-settings")}
                href="/settings/currency-settings"
                onClick={handleLinkClick}
              >
                Currency Settings
              </Link>

              <Link
                className={subLinkClass("/settings/terms-and-conditions")}
                href="/settings/terms-and-conditions"
                onClick={handleLinkClick}
              >
                Terms & Conditions
              </Link>

              <Link
                className={subLinkClass("/settings/roles-and-permissions")}
                href="/settings/roles-and-permissions"
                onClick={handleLinkClick}
              >
                Roles & Permissions
              </Link>
            </div>
          </div>
        </>
      )}

        <div className="text-white font-bold flex items-center text-[30px] px-6 py-[19.5px]">
          <span className="text-white text-[14px] font-bold text-center px-5 py-3 border border-[#307DF1] rounded-lg">
            Business is in your hand...
          </span>
        </div>
      </div>
    </main>
  );
};
