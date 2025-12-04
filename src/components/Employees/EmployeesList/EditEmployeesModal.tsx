"use client";

import { Modal, message } from "antd";
import { EditEmployeeModalProps } from "@/src/types/employees";
import { useCallback, useEffect, useId, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import { StylesConfig } from "react-select";
import dynamic from "next/dynamic";
import { FaXmark } from "react-icons/fa6";

const Select = dynamic(() => import("react-select"), {
  ssr: false,
  loading: () => <div className="h-[38px] w-full rounded border" />,
});

interface SelectOption {
  label: string;
  value: string;
}

interface GeneralOptions {
  department: string[];
  role: string[];
}

export const EditEmployeesModal: React.FC<EditEmployeeModalProps> = ({
  isOpen,
  onClose,
  currentEmployee,
  onSave,
}) => {
  const instanceId = useId();
  const { user } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [generalOptions, setGeneralOptions] = useState<GeneralOptions>({
    department: [],
    role: [],
  });
  const statusOptions = [
    { label: "Active", value: "Active" },
    { label: "Inactive", value: "Inactive" },
  ];

  const fetchGenerals = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/generals?user_id=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json: any = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Failed to fetch customers");
      }

      const optionsData = json.data[0] || {};
      const newGeneralOptions = {
        department: Array.isArray(optionsData.department) ? optionsData.department : [],
        role: Array.isArray(optionsData.role) ? optionsData.role : [],
      };
      setGeneralOptions(newGeneralOptions);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGenerals();
  }, [fetchGenerals]);

  const toSelectOptions = (arr: string[] | undefined): SelectOption[] => {
    return (arr || []).map((item) => ({ label: item, value: item }));
  };

  useEffect(() => {
    if (currentEmployee) {
      setEmployeeId(currentEmployee.employee_id);
      setEmployeeName(currentEmployee.name);
      setEmail(currentEmployee.email);
      setContact(currentEmployee.contact);
      setDepartment(currentEmployee.department);
      setRole(currentEmployee.role);
      setStatus(currentEmployee.status);
    }
  }, [currentEmployee]);

  const handleSubmit = async () => {
    if (!currentEmployee) return;

    if (
      !employeeName.trim() ||
      !email.trim() ||
      !contact.trim() ||
      !department.trim() ||
      !role.trim() ||
      !status.trim()
    ) {
      setUserMessage("Fill in all fields");
      setTimeout(() => setUserMessage(null), 5000);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setUserMessage("Invalid email address");
      setTimeout(() => setUserMessage(null), 5000);
      return;
    }

    try {
      setLoading(true);
      const updatedEmployee = {
        id: currentEmployee.id,
        employee_id: employeeId,
        name: employeeName,
        email,
        contact,
        department,
        role,
        status,
      };

      await onSave(updatedEmployee);
      message.success("Employee updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  const generalSelectStyles: StylesConfig<any, boolean> = {
    control: (base) => ({
      ...base,
      borderColor: "#E5E7EB",
      "&:hover": {
        borderColor: "#E5E7EB",
      },
      minHeight: "48px",
      fontSize: "14px",
      boxShadow: "none",
      backgroundColor: "#F2F4F7",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "14px",
      backgroundColor: state.isSelected ? "#F2F4F7" : "white",
      color: "black",
      "&:hover": {
        backgroundColor: "#F2F4F7",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  return (
    <Modal
      open={isOpen}
      onOk={handleSubmit}
      onCancel={onClose}
      okText="Save"
      okButtonProps={{ loading }}
      cancelButtonProps={{ disabled: loading }}
    >
      {userMessage && (
        <div className="left-1/2 top-10 transform -translate-x-1/2 fixed z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-red-400 border-2 border-red-400 mx-auto">
            <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {userMessage}
            </div>
            <button
              onClick={handleCloseMessage}
              className="ml-3 focus:outline-none hover:text-red-300"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center pb-3">
        <div className="h-2 w-2 bg-[#307EF3] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500]">Edit Employee</h2>
      </div>

      <div className="mb-4">
        <label className="text-[14px]" htmlFor="employeeId">
          Employee ID
        </label>
        <input
          id="employeeId"
          placeholder="Enter employee name"
          className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          value={employeeId}
          readOnly
        />
      </div>
      <div className="mb-4">
        <label className="text-[14px]" htmlFor="employeeName">
          Name
        </label>
        <input
          id="employeeName"
          placeholder="Enter employee name"
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-[14px]" htmlFor="email">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter employee email"
          className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="contact">
            Contact Number
          </label>
          <input
            id="contact"
            placeholder="Enter contact number"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            onKeyDown={(e) => {
              if (
                !/[0-9]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Delete" &&
                e.key !== "Tab" &&
                e.key !== "ArrowLeft" &&
                e.key !== "ArrowRight"
              ) {
                e.preventDefault();
              }
            }}
            minLength={11}
            maxLength={11}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="text-[14px]" htmlFor="department">
            Department
          </label>
          <Select
            instanceId={`${instanceId}-department`}
            inputId="department"
            className="mt-2"
            options={toSelectOptions(generalOptions.department)}
            value={toSelectOptions(generalOptions.department).find(
              (opt) => opt.value == department
            )}
            onChange={(selected) =>
              setDepartment((selected as SelectOption)?.value || "")
            }
            placeholder="Select Department"
            styles={generalSelectStyles}
            isClearable
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4">
        <div className="mb-4">
          <label className="text-[14px]" htmlFor="role">
            Role
          </label>
          <Select
            instanceId={`${instanceId}-role`}
            inputId="role"
            className="mt-2"
            options={toSelectOptions(generalOptions.role)}
            value={toSelectOptions(generalOptions.role).find(
              (opt) => opt.value == role
            )}
            onChange={(selected) =>
              setRole((selected as SelectOption)?.value || "")
            }
            placeholder="Select Role"
            styles={generalSelectStyles}
            isClearable
          />
        </div>

        <div className="mb-4">
          <label className="text-[14px]" htmlFor="status">
            Status
          </label>
          <Select
            instanceId={`${instanceId}-status`}
            inputId="status"
            className="mt-2"
            options={statusOptions}
            value={statusOptions.find((opt) => opt.value == status)}
            onChange={(selected) =>
              setStatus((selected as SelectOption)?.value || "")
            }
            placeholder="Select Status"
            styles={generalSelectStyles}
            isClearable
          />
        </div>
      </div>
    </Modal>
  );
};
