export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-green-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-green-500/50 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
        <span className="text-xs font-bold tracking-[0.25em] text-green-500/60 uppercase">
          LINGOFAM
        </span>
      </div>
    </div>
  );
}