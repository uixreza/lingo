"use client";

type Props = {
  seed: string;
  size?: number;
  className?: string;
};

export default function Avatar({ seed, size = 48, className = "" }: Props) {
  return (
    <img
      key={seed}
      src={`https://api.dicebear.com/10.x/notionists/svg?seed=${encodeURIComponent(seed)}`}
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
