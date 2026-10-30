export function AuthorAvatar({
  seed,
  name,
  size,
  className = "",
  rounded = "rounded-full",
}: {
  seed?: string | null;
  name: string;
  size: number;
  className?: string;
  rounded?: string;
}) {
  if (seed) {
    return (
      <img
        src={`https://api.dicebear.com/10.x/notionists/svg?seed=${encodeURIComponent(seed)}`}
        alt={name}
        width={size}
        height={size}
        className={`${rounded} object-cover shrink-0 bg-[#333] ${className}`}
      />
    );
  }

  return (
    <span
      className={`${rounded} bg-[#333] flex items-center justify-center shrink-0 font-bold text-[#bbb] ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}>
      {name.trim().charAt(0)}
    </span>
  );
}
