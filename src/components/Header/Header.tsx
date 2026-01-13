"use client";

import { Popover } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dummy from "../../../public/images/dummy.webp";
import { CalculatorModal } from "./Calculator";
import { useAuth } from "@/src/contexts/AuthContext";
import { FaCalculator, FaUser } from "react-icons/fa";
import { FaKey } from "react-icons/fa6";
import { FaRightFromBracket } from "react-icons/fa6";
import { VscThreeBars } from "react-icons/vsc";
import { useState } from "react";
import { MdFullscreen, MdOutlineFullscreenExit } from "react-icons/md";
import { useAccUserRedirect } from "@/src/hooks/useAccUser";

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header = ({ toggleSidebar }: HeaderProps) => {
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  useAccUserRedirect();
  if (!user?.id) return;

  const showCalculator = () => {
    setIsCalculatorVisible(true);
  };

  const handleCalculatorCancel = () => {
    setIsCalculatorVisible(false);
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem("cb_auth");
    localStorage.removeItem("userEmail");
    router.push("/auth/login");
  };

  const popoverContent = (
    <div className="w-52">
      <div className="flex border-b mt-1 pl-3">
        <div className="mb-4">
          <p className="font-[500] text-black text-[14px]">
            {user?.name} {user?.last_name}
          </p>
          <p className="text-[13px] text-[#797c8b] capitalize">
            {user?.role}
          </p>
        </div>
      </div>

      {user?.role.toLowerCase() == "admin" && (
        <div className="flex flex-col gap-1 my-3 border-b">
          <Link
            className="flex items-center bg-white text-black hover:bg-[#EDF2F6] hover:text-[#00A3FF] transition-all duration-300 px-3 py-2 rounded text-[14px]"
            href="/my-profile"
          >
            <FaUser className="text-[12px] mr-3" />
            <span>My Profile</span>
          </Link>

          <Link
            className="flex items-center bg-white text-black hover:bg-[#EDF2F6] hover:text-[#00A3FF] transition-all duration-300 px-3 py-2 rounded text-[14px] mb-3"
            href="/auth/change-password"
          >
            <FaKey className="text-[12px] mr-3" />
            <span>Change Password</span>
          </Link>
        </div>
      )}

      <button
        className="flex items-center bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-all duration-300 py-2 px-5 rounded-md ml-3 font-[500] my-2"
        onClick={handleSignOut}
      >
        <FaRightFromBracket className="mr-2" />
        <span>Log out</span>
      </button>
    </div>
  );

  return (
    <>
      <main className="flex justify-between items-center h-[70px] p-5 shadow-md w-full bg-[#151822]">
        <div className="flex items-center">
          <button
            className="text-[#6E6F78] px-3 py-1 border rounded-md"
            onClick={toggleSidebar}
          >
            <VscThreeBars className="fill-white" />
          </button>
          <div className="ml-4 sm:block hidden">
            {user.logo ? (
              <Image
                className="h-10 w-auto"
                priority
                src={user.logo}
                height={500}
                width={500}
                alt="Payment Gateway Logo"
              />
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="flex items-center md:gap-5 gap-3">
          <button
            className="bg-gray-100 dark:bg-gray-800 h-10 w-10 rounded-full flex justify-center items-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={showCalculator}
          >
            <FaCalculator className="h-4 w-4" />
          </button>

          <button
            className="bg-gray-100 dark:bg-gray-800 h-10 w-10 rounded-full flex justify-center items-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={toggleFullScreen}
          >
            {isFullScreen ? (
              <MdOutlineFullscreenExit className="h-6 w-6" />
            ) : (
              <MdFullscreen className="h-6 w-6" />
            )}
          </button>
          <Popover
            content={popoverContent}
            trigger="click"
            placement="bottomRight"
          >
            <button className="flex items-center border-2 border-white rounded-full overflow-hidden">
              <Image
                className="h-10 w-10"
                src={user?.image?.trim() || dummy}
                height={225}
                width={225}
                alt={"User"}
              />
            </button>
          </Popover>
        </div>
      </main>
      <CalculatorModal
        visible={isCalculatorVisible}
        onCancel={handleCalculatorCancel}
      />
    </>
  );
};