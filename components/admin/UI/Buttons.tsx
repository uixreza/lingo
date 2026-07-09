// components/Buttons.tsx
import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  target?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
}

// Base button styles
const baseButtonClasses =
  "px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border flex items-center gap-2 justify-center";

// Purple Button Component
export function PurpleButton({
  children,
  onClick,
  href,
  disabled,
  target,
  className = "",
  type = "button",
}: ButtonProps) {
  const buttonClasses = `${baseButtonClasses} bg-gradient-to-l from-[#412b6b] to-[#5c3e94] text-white hover:from-[#5c3e94] hover:to-[#412b6b] border-[#412b6b]/30 ${
    disabled
      ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-lg"
      : ""
  } ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} target={target} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}>
      {children}
    </button>
  );
}

// Orange Button Component
export function OrangeButton({
  children,
  onClick,
  href,
  disabled,
  target,
  className = "",
  type = "button",
}: ButtonProps) {
  const buttonClasses = `${baseButtonClasses} bg-gradient-to-l from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-500 border-orange-500/30 ${
    disabled
      ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-lg"
      : ""
  } ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} target={target} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}>
      {children}
    </button>
  );
}

// Green Button Component (for success actions)
export function GreenButton({
  children,
  onClick,
  href,
  disabled,
  target,
  className = "",
  type = "button",
}: ButtonProps) {
  const buttonClasses = `${baseButtonClasses} bg-gradient-to-l from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-600 border-green-500/30 ${
    disabled
      ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-lg"
      : ""
  } ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} target={target} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}>
      {children}
    </button>
  );
}

// Secondary Button Component
export function SecondaryButton({
  children,
  onClick,
  href,
  disabled,
  target,
  className = "",
  type = "button",
}: ButtonProps) {
  const buttonClasses = `${baseButtonClasses} bg-dash-muted/20 text-dash-muted border-dash-muted/30 hover:bg-dash-muted/30 ${
    disabled ? "cursor-not-allowed" : ""
  } ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} target={target} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}>
      {children}
    </button>
  );
}

// Small Button Variants
export function SmallPurpleButton({
  children,
  onClick,
  href,
  disabled,
  target,
  className = "",
}: ButtonProps) {
  return (
    <PurpleButton
      onClick={onClick}
      href={href}
      disabled={disabled}
      target={target}
      className={`px-4 py-2 text-xs ${className}`}>
      {children}
    </PurpleButton>
  );
}

export function SmallOrangeButton({
  children,
  onClick,
  href,
  disabled,
  target,
  className = "",
}: ButtonProps) {
  return (
    <OrangeButton
      onClick={onClick}
      href={href}
      disabled={disabled}
      target={target}
      className={`px-4 py-2 text-xs ${className}`}>
      {children}
    </OrangeButton>
  );
}
