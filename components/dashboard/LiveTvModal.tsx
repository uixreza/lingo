"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

const STREAM_URL =
  "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8";

export default function LiveTvModal({ onClose }: { onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failed, setFailed] = useState(false);
  const { t } = useLang();

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: { destroy: () => void } | null = null;
    let cancelled = false;

    const play = () => {
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = STREAM_URL;
      play();
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          setFailed(true);
          return;
        }
        const instance = new Hls();
        instance.loadSource(STREAM_URL);
        instance.attachMedia(video);
        instance.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) setFailed(true);
        });
        hls = instance;
        play();
      });
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, []);

  // Only ever rendered after a user click (client-side), never during SSR.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onCloseRef.current()}
      />
      <div className="relative w-full max-w-3xl rounded-2xl overflow-hidden bg-[#0b1410] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-[#101a14]">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {t("dashboard.liveTvBadge")}
          </span>
          <span className="text-sm font-bold text-white">NASA TV</span>
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            aria-label={t("dashboard.liveTvClose")}
            title={t("dashboard.liveTvClose")}
            className="ms-auto p-1.5 rounded-full bg-white/5 text-[#bacbb9] hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Player */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            controls
            playsInline
            className="absolute inset-0 w-full h-full"
          />
          {failed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-6 text-center">
              <p className="text-sm text-[#bacbb9]">
                {t("dashboard.radioUnavailable")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
