"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, Maximize2, Minimize2, RotateCcw, X } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

// Public, CORS-enabled HLS feeds. Keep at least one fallback so a single
// provider outage doesn't leave the player with a dead stream.
const CHANNELS = [
  {
    name: "DW English",
    url: "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
  },
  {
    name: "Bloomberg TV",
    url: "https://bloomberg.com/media-manifest/streams/us.m3u8",
  },
] as const;

export default function LiveTvPlayer({ onClose }: { onClose: () => void }) {
  const playerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [channelIndex, setChannelIndex] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { t } = useLang();

  const channel = CHANNELS[channelIndex];

  // Keep the fullscreen icon in sync with the browser state (Esc included).
  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Player: attach the current channel, fall back on fatal errors.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: { destroy: () => void } | null = null;
    let cancelled = false;
    let recovered = false;
    let detachNative: (() => void) | null = null;

    setLoading(true);
    setFailed(false);

    const play = () => {
      video.muted = false;
      video.play().catch(() => {
        // Browsers block unmuted autoplay until the user has interacted
        // with the page — start muted so the feed still plays.
        video.muted = true;
        video.play().catch(() => {});
      });
    };

    const tryNextChannel = () => {
      if (cancelled) return;
      if (channelIndex < CHANNELS.length - 1) {
        setChannelIndex((index) => index + 1);
      } else {
        setLoading(false);
        setFailed(true);
      }
    };

    const startNative = () => {
      const onReady = () => setLoading(false);
      const onError = () => tryNextChannel();
      video.addEventListener("loadedmetadata", onReady);
      video.addEventListener("error", onError);
      detachNative = () => {
        video.removeEventListener("loadedmetadata", onReady);
        video.removeEventListener("error", onError);
      };
      video.src = channel.url;
      play();
    };

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      startNative();
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          startNative();
          return;
        }
        const instance = new Hls({ enableWorker: true });
        instance.loadSource(channel.url);
        instance.attachMedia(video);
        instance.on(Hls.Events.MANIFEST_PARSED, () => {
          if (!cancelled) setLoading(false);
        });
        instance.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal || cancelled) return;
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !recovered) {
            recovered = true;
            instance.recoverMediaError();
            return;
          }
          tryNextChannel();
        });
        hls = instance;
        play();
      });
    }

    return () => {
      cancelled = true;
      detachNative?.();
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [channelIndex, channel.url, attempt]);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    setChannelIndex(0);
    setAttempt((value) => value + 1);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    const player = playerRef.current;
    if (!player) return;
    if (player.requestFullscreen) {
      player.requestFullscreen().catch(() => {});
    } else {
      // iOS Safari only exposes fullscreen on the video element.
      const video = videoRef.current as
        | (HTMLVideoElement & { webkitEnterFullscreen?: () => void })
        | null;
      video?.webkitEnterFullscreen?.();
    }
  };

  // Only ever rendered after a user click (client-side), never during SSR.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={playerRef}
      role="region"
      aria-label={t("dashboard.liveTv")}
      className={`fixed z-[90] flex flex-col overflow-hidden bg-[#0b1410] shadow-[0_24px_80px_rgba(0,0,0,0.6)] ${
        isFullscreen
          ? "inset-0 h-screen w-screen rounded-none"
          : "w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-white/10 max-lg:left-1/2 max-lg:top-[6.5rem] max-lg:-translate-x-1/2 lg:start-4 lg:bottom-4"
      }`}>
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#101a14] px-2.5 py-2">
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-red-500/40 bg-red-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400">
          <span className="h-1 w-1 animate-pulse rounded-full bg-red-500" />
          {t("dashboard.liveTvBadge")}
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-white">
          {channel.name}
        </span>
        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label={
            isFullscreen
              ? t("dashboard.liveTvExitFullscreen")
              : t("dashboard.liveTvFullscreen")
          }
          title={
            isFullscreen
              ? t("dashboard.liveTvExitFullscreen")
              : t("dashboard.liveTvFullscreen")
          }
          className="shrink-0 rounded-full bg-white/5 p-1.5 text-[#bacbb9] transition-colors hover:bg-white/10 hover:text-white">
          {isFullscreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("dashboard.liveTvClose")}
          title={t("dashboard.liveTvClose")}
          className="shrink-0 rounded-full bg-white/5 p-1.5 text-[#bacbb9] transition-colors hover:bg-white/10 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Player */}
      <div
        className={`relative bg-black ${
          isFullscreen ? "min-h-0 flex-1" : "aspect-video"
        }`}
        onDoubleClick={toggleFullscreen}>
        <video
          ref={videoRef}
          controls
          playsInline
          className="absolute inset-0 h-full w-full"
        />
        {loading && !failed && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40">
            <Loader2 className="h-6 w-6 animate-spin text-white/80" />
            <p className="text-[11px] font-medium text-white/70">
              {t("dashboard.loading")}
            </p>
          </div>
        )}
        {failed && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/70 px-4 text-center">
            <p className="text-xs text-[#bacbb9]">
              {t("dashboard.radioUnavailable")}
            </p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-white/10">
              <RotateCcw className="h-3 w-3" />
              {t("dashboard.liveTvRetry")}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
