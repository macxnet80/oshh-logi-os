import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: string;
  bgColor?: string;
}

export default function Badge({
  color,
  bgColor,
  className = "",
  children,
  style,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2.5 py-0.5
        rounded-full
        font-body text-xs font-medium
        ${className}
      `}
      style={{
        color: color,
        backgroundColor: bgColor,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
