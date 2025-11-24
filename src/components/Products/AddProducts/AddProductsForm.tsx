"use client";

import { useAuth } from "@/src/contexts/AuthContext";
import Image from "next/image";
import success from "../../../../public/images/success.webp";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useId, useState } from "react";
import Select, { StylesConfig } from "react-select";
import { FaXmark } from "react-icons/fa6";
import { Modal } from "antd";

const UNITS = [
  "Pieces",
  "Kilograms",
  "Grams",
  "Liters",
  "Meters",
  "Box",
  "Set",
  "Pack",
  "Pair",
  "Dozen",
  "Bottle",
  "Can",
  "Carton",
  "Bag",
  "Roll",
  "Sheet",
];

interface FormValues {
  name: string;
  description: string;
  price: string;
  unit: string;
  stock: string;
  category: string;
  size: string;
  color: string;
  material: string;
  weight: string;
}

export const AddProductsForm = () => {
  const instanceId = useId();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [product_id, setProductId] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    description: "",
    price: "",
    unit: "",
    stock: "",
    category: "",
    size: "",
    color: "",
    material: "",
    weight: "",
  });

  const [generalOptions, setGeneralOptions] = useState<{
    category: string[];
    size: string[];
    color: string[];
    material: string[];
    weight: string[];
  }>({ category: [], size: [], color: [], material: [], weight: [] });

  const fetchGenerals = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/generals?user_id=${user.id}`);
      const json = await response.json();

      if (response.ok && json.success) {
        const optionsData = json.data[0] || {};

        setGeneralOptions({
          category: Array.isArray(optionsData.category) ? optionsData.category : [],
          size: Array.isArray(optionsData.size) ? optionsData.size : [],
          color: Array.isArray(optionsData.color) ? optionsData.color : [],
          material: Array.isArray(optionsData.material) ? optionsData.material : [],
          weight: Array.isArray(optionsData.weight) ? optionsData.weight : [],
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchGenerals();
  }, [fetchGenerals]);

  useEffect(() => {
    const generateProductId = () => {
      const compPrefix = user?.company
        ? user.company.slice(0, 1).toUpperCase()
        : "C";
      const random = Math.floor(100000 + Math.random() * 900000);
      return `P${compPrefix}${random}`;
    };

    setProductId(generateProductId());
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchCurrencies = async () => {
      try {
        const currencyRes = await fetch(`/api/currencies?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const currencyJson = await currencyRes.json();

        if (currencyRes.status == 404 || !currencyJson.success) {
          setCurrencyCode("USD");
        } else if (currencyJson.data && currencyJson.data.length > 0) {
          setCurrencyCode(currencyJson.data[0].currency || "USD");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setCurrencyCode("USD");
      }
    };

    fetchCurrencies();
  }, [user?.id]);

  const toSelectOptions = (arr: string[]) =>
    Array.isArray(arr) ? arr.map((item) => ({ label: item, value: item })) : [];

  const handleSelectChange = (field: keyof FormValues) => (selected: any) => {
    const value = selected?.value || "";
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormValues({
      ...formValues,
      [id]:
        id == "price" || id == "stock"
          ? value == ""
            ? ""
            : Number(value)
          : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { size, color, material, weight, stock, ...restFormValues } =
      formValues;

    const stockQty = Number(stock) || 1;
    const attribute = [
      { name: "size", value: size },
      { name: "color", value: color },
      { name: "material", value: material },
      { name: "weight", value: weight },
    ].filter((attr) => attr.value);

    const payloads = Array.from({ length: stockQty }, () => ({
      ...restFormValues,
      stock: 1,
      user_id: user?.id,
      product_id,
      attribute,
    }));

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ products: payloads }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to add product(s)");
      }

      setShowSuccessModal(true);
    } catch (error: any) {
      setUserMessage(error.message || "An unexpected error occurred");
    } finally {
      setTimeout(() => setUserMessage(null), 5000);
      setLoading(false);
    }
  };

  const generalSelectStyles: StylesConfig<any, false> = {
    control: (provided) => ({
      ...provided,
      borderColor: "#E3E5E9",
      borderRadius: "0.375rem",
      padding: "5px 0",
      marginTop: "5px",
      fontSize: "14px",
      outline: "none",
      color: "#131226",
      width: "100%",
      backgroundColor: "#F2F4F7",
      transition: "border-color 0.3s",
      "&:hover": {
        borderColor: "#B9C1CC",
      },
      "&:focus": {
        borderColor: "#B9C1CC",
        outline: "none",
      },
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: "0.375rem",
      backgroundColor: "#F2F4F7",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
      border: "none",
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? "#E3E5E9"
        : "#F2F4F7",
      color: "#131226",
      padding: "5px 10px",
      fontSize: "14px",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#E3E5E9",
        color: "#131226",
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#E3E5E9",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "#131226",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#6B7280",
      "&:hover": {
        backgroundColor: "#D1D5DB",
        color: "#1F2937",
      },
    }),
    input: (provided) => ({
      ...provided,
      color: "black",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6B7280",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black",
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: "#E3E5E9",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#6B7280",
      "&:hover": {
        color: "#111827",
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "#6B7280",
      "&:hover": {
        color: "#111827",
      },
    }),
  };

  const handleOkay = () => {
    setShowSuccessModal(false);
    router.push("/products/products-list");
  };

  const handleCloseMessage = () => {
    setUserMessage(null);
  };

  return (
    <main className="bg-white p-5 mt-6 rounded-lg border shadow-md">
      {userMessage && (
        <div className="left-1/2 top-10 transform -translate-x-1/2 fixed z-50">
          <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-800 text-green-600 border-2 border-green-600 mx-auto">
            <div className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {userMessage}
            </div>
            <button
              onClick={handleCloseMessage}
              className="ml-3 focus:outline-none hover:text-green-600"
            >
              <FaXmark className="text-[14px]" />
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center pb-5">
        <div className="h-2 w-2 bg-[#307EF3] rounded-full mr-2"></div>
        <h2 className="text-[13px] font-[500] text-black">
          Add Product Form
        </h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-2 grid-cols-1 sm:gap-4 gap-0">
          <div className="mb-4">
            <label
              className="text-[14px] text-black"
              htmlFor="product_id"
            >
              Product ID
            </label>
            <input
              placeholder="Enter product id"
              className="border text-[14px] py-3 px-[10px] w-full bg-gray-300 text-gray-500 dhover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="text"
              id="product_id"
              value={product_id}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label
              className="text-[14px] text-black"
              htmlFor="name"
            >
              Product Name
            </label>
              <input
                placeholder="Enter product name"
                className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
                type="text"
                id="name"
                value={formValues.name}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
          </div>
        </div>

        <div className="mb-4">
          <label
            className="text-[14px] text-black"
            htmlFor="description"
          >
            Description (Optional)
          </label>
          <textarea
            placeholder="Enter product description"
            className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
            id="description"
            maxLength={250}
            value={formValues.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 sm:gap-4">
          <div className="mb-4">
            <label
              className="text-[14px] text-black"
              htmlFor="price"
            >
              Price ({currencyCode})
            </label>
            <input
              placeholder="Enter price"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              id="price"
              min="0"
              step="0.01"
              value={formValues.price}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (
                  !/[0-9.]/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete" &&
                  e.key !== "Tab" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight"
                ) {
                  e.preventDefault();
                }
                if (e.key == "." && formValues.price.toString().includes(".")) {
                  e.preventDefault();
                }
              }}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="text-[14px] text-black"
              htmlFor="unit"
            >
              Unit
            </label>
            <Select
              instanceId={`${instanceId}-unit`}
              inputId="unit"
              className="mt-2"
              options={toSelectOptions(UNITS)}
              value={toSelectOptions(UNITS).find(
                (opt) => opt.value == formValues.unit
              )}
              onChange={handleSelectChange("unit")}
              placeholder="Select Unit"
              styles={generalSelectStyles}
              isClearable
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="text-[14px] text-black"
              htmlFor="category"
            >
              Category
            </label>
            <Select
              instanceId={`${instanceId}-category`}
              inputId="category"
              className="mt-2"
              options={generalOptions.category.map((option) => ({
                label: option,
                value: option,
              }))}
              value={
                generalOptions.category.find(
                  (opt) => opt == formValues.category
                )
                  ? {
                      label: formValues.category,
                      value: formValues.category,
                    }
                  : null
              }
              onChange={handleSelectChange("category")}
              placeholder="Category"
              styles={generalSelectStyles}
              isClearable
            />
          </div>
          <div className="mb-4">
            <label
              className="text-[14px] text-black"
              htmlFor="stock"
            >
              Stock Quantity
            </label>
            <input
              placeholder="Enter Stock Quantity"
              className="border text-[14px] py-3 px-[10px] w-full bg-[#F2F4F7] hover:border-[#B9C1CC] focus:outline-none focus:border-[#B9C1CC] rounded-md transition-all duration-300 mt-2"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              id="stock"
              min="0"
              value={formValues.stock}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (
                  !/[0-9.]/.test(e.key) &&
                  e.key !== "Backspace" &&
                  e.key !== "Delete" &&
                  e.key !== "Tab" &&
                  e.key !== "ArrowLeft" &&
                  e.key !== "ArrowRight"
                ) {
                  e.preventDefault();
                }
                if (e.key == "." && formValues.stock.toString().includes(".")) {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 sm:gap-4">
          <div className="mb-4 col-span-4">
            <div className="flex justify-between items-center">
              <label
                className="text-[14px] text-black"
                htmlFor="category"
              >
                Attributes
              </label>
            </div>
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 sm:gap-4">
              <Select
                instanceId={`${instanceId}-size`}
                inputId="size"
                className="mt-2"
                options={generalOptions.size.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={
                  generalOptions.size.find((opt) => opt == formValues.size)
                    ? {
                        label: formValues.size,
                        value: formValues.size,
                      }
                    : null
                }
                onChange={handleSelectChange("size")}
                placeholder="Size"
                styles={generalSelectStyles}
                isClearable
              />
              <Select
                instanceId={`${instanceId}-color`}
                inputId="color"
                className="mt-2"
                options={generalOptions.color.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={
                  generalOptions.color.find((opt) => opt == formValues.color)
                    ? {
                        label: formValues.color,
                        value: formValues.color,
                      }
                    : null
                }
                onChange={handleSelectChange("color")}
                placeholder="Color"
                styles={generalSelectStyles}
                isClearable
              />
              <Select
                instanceId={`${instanceId}-material`}
                inputId="material"
                className="mt-2"
                options={generalOptions.material.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={
                  generalOptions.material.find(
                    (opt) => opt == formValues.material
                  )
                    ? {
                        label: formValues.material,
                        value: formValues.material,
                      }
                    : null
                }
                onChange={handleSelectChange("material")}
                placeholder="Material"
                styles={generalSelectStyles}
                isClearable
              />
              <Select
                instanceId={`${instanceId}-weight`}
                inputId="weight"
                className="mt-2"
                options={generalOptions.weight.map((option) => ({
                  label: option,
                  value: option,
                }))}
                value={
                  generalOptions.weight.find((opt) => opt == formValues.weight)
                    ? {
                        label: formValues.weight,
                        value: formValues.weight,
                      }
                    : null
                }
                onChange={handleSelectChange("weight")}
                placeholder="Weight"
                styles={generalSelectStyles}
                isClearable
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="text-[14px] font-[500] py-2 w-40 rounded cursor-pointer transition-all duration-300 mt-4 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3] disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      </form>
      <Modal
        open={showSuccessModal}
        onCancel={handleOkay}
        footer={[
          <button
            key="okay"
            onClick={handleOkay}
            className="text-[14px] font-[500] py-2 w-20 rounded cursor-pointer transition-all duration-300 mt-2 text-white bg-[#307EF3] hover:bg-[#478cf3] focus:bg-[#307EF3]"
          >
            Okay
          </button>,
        ]}
        centered
        width={400}
      >
        <div className="flex flex-col items-center pt-5">
          <Image src={success} alt="Success" width={80} height={80} />
          <h3 className="text-xl font-semibold mt-2">Success!</h3>
          <p className="text-gray-600 text-center">
            Product has been added successfully.
          </p>
        </div>
      </Modal>
    </main>
  );
};
