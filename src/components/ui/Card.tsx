import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export default function Card({
  hoverable = false,
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white border border-gray-200 rounded-xl
        p-5 shadow-subtle
        ${hoverable ? "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
