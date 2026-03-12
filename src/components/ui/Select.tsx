"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
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
        <select
          ref={ref}
          id={id}
          className={`
            w-full px-4 py-3
            bg-white border border-gray-200
            rounded-lg
            font-body text-base text-orendt-black
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-orendt-accent focus:border-transparent
            cursor-pointer
            ${error ? "border-status-occupied" : ""}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="font-body text-xs text-status-occupied">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
