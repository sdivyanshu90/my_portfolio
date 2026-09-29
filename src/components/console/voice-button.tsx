"use client";

import { useEffect, useRef, useState } from "react";
import { beacon } from "@/lib/beacon";

/**
 * Ask by voice (Web Speech API) — a small nod to the Hindi ASR work. Renders
 * only where the browser supports recognition; the transcript fills the
 * prompt live and runs when speech ends.
 */

interface Recognition {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => Recognition;

export function VoiceButton({ onText, onFinal }: { onText: (t: string) => void; onFinal: (t: string) => void }) {
  const [Ctor, setCtor] = useState<RecognitionCtor | null>(null);
  const [listening, setListening] = useState(false);
  const rec = useRef<Recognition | null>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    setCtor(() => w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null);
  }, []);

  if (!Ctor) return null;

  const toggle = () => {
    if (listening) {
      rec.current?.stop();
      return;
    }
    const r = new Ctor();
    r.lang = navigator.language || "en-US";
    r.interimResults = true;
    let text = "";
    r.onresult = (e) => {
      text = Array.from(e.results)
        .map((res) => res[0].transcript)
        .join("");
      onText(text);
    };
    r.onend = () => {
      setListening(false);
      if (text.trim()) {
        beacon("voice");
        onFinal(text.trim());
      }
    };
    r.onerror = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Ask by voice"}
      title="Ask by voice"
      className={`shrink-0 font-mono text-[10px] tracking-wider uppercase transition-colors hover:text-accent ${
        listening ? "animate-pulse text-accent motion-reduce:animate-none" : "text-ink-faint"
      }`}
    >
      {listening ? "● rec" : "mic"}
    </button>
  );
}
