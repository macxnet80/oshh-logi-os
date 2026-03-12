"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="font-body text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3
            bg-white border border-gray-200
            rounded-lg
            font-body text-base text-orendt-black
            placeholder:text-gray-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-orendt-accent focus:border-transparent
            ${error ? "border-status-occupied" : ""}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="font-body text-xs text-status-occupied">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
