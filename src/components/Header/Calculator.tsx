"use client";

import { Modal } from "antd";
import { useState, useEffect, useRef } from "react";

interface CalculatorModalProps {
  visible: boolean;
  onCancel: () => void;
}

export const CalculatorModal = ({
  visible,
  onCancel,
}: CalculatorModalProps) => {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;

    if (/[0-9+\-*/.()=]|Backspace|Enter|Delete|Escape/.test(key)) {
      e.preventDefault();

      if (key === "Enter" || key === "=") {
        calculateResult();
      } else if (key === "Backspace") {
        setInput(input.slice(0, -1));
      } else if (key === "Delete" || key === "Escape") {
        setInput("");
        setResult("");
      } else {
        setInput((prev) => prev + key);
      }
    }
  };

  const calculateResult = () => {
    try {
      setResult(eval(input).toString());
    } catch {
      setResult("Error");
    }
  };

  const handleClick = (value: string) => {
    if (value === "=") {
      calculateResult();
    } else if (value === "C") {
      setInput("");
      setResult("");
    } else if (value === "⌫") {
      setInput(input.slice(0, -1));
    } else {
      setInput((prev) => prev + value);
    }
  };

  const buttons = [
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "*",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+",
    "C",
    "⌫",
    "(",
    ")",
  ];

  return (
    <Modal
      title={<span className="text-black">Calculator</span>}
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      width={300}
      className="bg-white text-black rounded"
      styles={{
        body: {
          backgroundColor: "transparent",
        },
        header: {
          backgroundColor: "transparent",
          color: "inherit",
        },
        content: {
          backgroundColor: "var(--modal-bg)",
        },
      }}
    >
      <div className="bg-gray-200 p-2 rounded mb-4 space-y-2 overflow-hidden">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            const value = e.target.value;
            const sanitized = value.replace(/[^0-9+\-*/().]/g, "");
            setInput(sanitized);
          }}
          onKeyDown={handleKeyDown}
          className="w-full text-right text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none"
          placeholder="Enter expression"
        />
        <input
          type="text"
          value={result || "0"}
          readOnly
          onClick={() => {
            if (result) {
              navigator.clipboard.writeText(result);
              console.log("Copied to clipboard:", result);
            }
          }}
          title="Click to copy result"
          className="w-full text-right text-2xl font-semibold bg-transparent cursor-pointer select-all focus:outline-none text-black"
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`p-2 rounded text-lg font-medium transition-colors ${
              btn === "="
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : btn === "C" || btn === "⌫"
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </Modal>
  );
};
