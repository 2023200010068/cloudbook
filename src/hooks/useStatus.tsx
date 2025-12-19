"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Modal } from "antd";
import Image from "next/image";
import warning from "../../public/images/warning.webp";
import { signOut } from "next-auth/react";
import { FaRightFromBracket } from "react-icons/fa6";
import { useAuth } from "@/src/contexts/AuthContext";

export default function UseStatus({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [modalsShown, setModalsShown] = useState({
    inactiveModal: false,
  });

  useEffect(() => {
    const excludedPaths = [
      "/",
      "/auth/login",
    ];

    if (excludedPaths.includes(pathname)) {
      return;
    }

    if (
      !modalsShown.inactiveModal &&
      user &&
      user?.role?.toLowerCase() !== "admin" &&
      user?.status?.toLowerCase() == "inactive"
    ) {
      setShowInactiveModal(true);
      setModalsShown((prev) => ({ ...prev, inactiveModal: true }));
      return;
    }
  }, [user, pathname, modalsShown]);

  return (
    <>
      {children}
      <Modal open={showInactiveModal} footer={null} closable={false}>
        <div className="py-4 px-2">
          <div className="flex justify-center">
            <Image
              height={150}
              width={150}
              src={warning}
              alt={"Warning"}
            ></Image>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">
            Account Inactive!
          </h2>
          <p className="text-center">
            Your account is currently inactive. Please contact your admin.
          </p>
          <div className="mt-4 flex justify-end">
            <button
              onClick={async () => {
                setShowInactiveModal(false);
                localStorage.removeItem("cb_auth");
                localStorage.removeItem("userEmail");
                await signOut({
                  redirect: false,
                  callbackUrl: "/auth/login",
                });
                router.push("/auth/login");
              }}
              className="flex items-center bg-red-500 text-white hover:bg-red-600 cursor-pointer transition-all duration-300  py-2 px-5 rounded-md ml-3 font-[500]"
            >
              <FaRightFromBracket className="mr-2" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
