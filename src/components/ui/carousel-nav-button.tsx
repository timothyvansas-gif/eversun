"use client";

type Variant = "dark" | "light";

const VARIANTS: Record<Variant, { border: string; stroke: string }> = {
  dark: {
    border: "border-[#6B5C40]/30 hover:border-[#6B5C40]/50",
    stroke: "#1F1F1E",
  },
  light: {
    border: "border-white/12 hover:border-white/24",
    stroke: "#ffffff",
  },
};

interface Props {
  variant: Variant;
  isAtEnd: boolean;
  onClick: () => void;
  className?: string;
}

export function CarouselNavButton({ variant, isAtEnd, onClick, className = "" }: Props) {
  const { border, stroke } = VARIANTS[variant];

  return (
    <button
      onClick={onClick}
      aria-label={isAtEnd ? "Terug naar begin" : "Volgende"}
      className={`w-[60px] h-[60px] shrink-0 rounded-full border ${border} flex items-center justify-center transition-colors cursor-pointer group ${className}`}
    >
      <svg
        width="20"
        height="15"
        viewBox="0 0 16 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-transform duration-500 ${isAtEnd ? "rotate-180" : ""}`}
      >
        <path
          d="M9.73343 0.625L14.8921 5.85984C15.036 6.00628 15.036 6.24372 14.8921 6.39016L9.73343 11.625M14.7843 6.125H1"
          stroke={stroke}
          strokeWidth="1.25"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </button>
  );
}
