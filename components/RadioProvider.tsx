"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type RadioContextValue = {
  playing: boolean;
  failed: boolean;
  toggle: () => void;
};

const RadioContext = createContext<RadioContextValue | null>(null);

export const RADIO_STREAM_URL = "https://media-ice.musicradio.com/LBCUKMP3";

export function RadioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || failed) return;
    if (playing) audio.pause();
    else audio.play();
  }, [playing, failed]);

  return (
    <RadioContext.Provider value={{ playing, failed, toggle }}>
      {children}
      {mounted && (
        <audio
          ref={audioRef}
          src={RADIO_STREAM_URL}
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
