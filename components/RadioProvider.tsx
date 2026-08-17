"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type RadioAccent = "UK" | "US";

type RadioContextValue = {
  playing: boolean;
  failed: boolean;
  toggle: () => void;
  accent: RadioAccent;
  setAccent: (accent: RadioAccent) => void;
  station: string;
};

const RadioContext = createContext<RadioContextValue | null>(null);

export const RADIO_STREAMS: Record<
  RadioAccent,
  { label: string; url: string }
> = {
  UK: { label: "LBC UK", url: "https://media-ice.musicradio.com/LBCUKMP3" },
  US: { label: "WNYC 93.9 FM (NY)", url: "https://fm939.wnyc.org/wnycfm" },
};

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [accent, setAccent] = useState<RadioAccent>(() => {
    if (typeof window === "undefined") return "UK";
    return localStorage.getItem("radio-accent") === "US" ? "US" : "UK";
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("radio-accent", accent);
  }, [accent]);

  useEffect(() => {
    if (!playing) return;
    const audio = audioRef.current;
    if (!audio) return;
    setFailed(false);
    audio.play().catch(() => setFailed(true));
  }, [accent, playing]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || failed) return;
    if (playing) audio.pause();
    else audio.play();
  }, [playing, failed]);

  const station = RADIO_STREAMS[accent].label;

  return (
    <RadioContext.Provider
      value={{ playing, failed, toggle, accent, setAccent, station }}>
      {children}
      {mounted && (
        <audio
          key={accent}
          ref={audioRef}
          src={RADIO_STREAMS[accent].url}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      )}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const ctx = useContext(RadioContext);
  if (!ctx) throw new Error("useRadio must be used within RadioProvider");
  return ctx;
}
