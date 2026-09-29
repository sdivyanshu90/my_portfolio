import { ImageResponse } from "next/og";
import { personal } from "@/data/portfolio";

/** Shared Open Graph plumbing: the paper-and-ink card every share renders as. */

export const OG_SIZE = { width: 1200, height: 630 };

/** Newsreader TTF fetched at build time (no UA header → Google serves truetype). */
export async function loadSerif(): Promise<ArrayBuffer | null> {
  try {
    const css = await (await fetch("https://fonts.googleapis.com/css2?family=Newsreader:wght@500")).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * A poster: small running head, one huge figure, a title, a footer. Used
 * for case studies (the headline metric *is* the image) and shared runs.
 */
export async function posterImage({
  head,
  figure,
  title,
  sub,
}: {
  head: string;
  figure: string;
  title: string;
  sub: string;
}) {
  const serif = await loadSerif();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#faf7f0",
          color: "#1c1a17",
          display: "flex",
          flexDirection: "column",
          padding: "56px 72px",
          fontFamily: serif ? "Newsreader" : "serif",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: 44, top: 0, bottom: 0, width: 4, background: "#a82f1b" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "2px solid #1c1a17",
            paddingBottom: 16,
            fontSize: 22,
            letterSpacing: 4,
          }}
        >
          <span>{head.toUpperCase()}</span>
          <span style={{ color: "#a82f1b" }}>DIV-1</span>
        </div>
        <div style={{ fontSize: 150, marginTop: 40, letterSpacing: -4, color: "#a82f1b", lineHeight: 1 }}>{figure}</div>
        <div style={{ fontSize: 50, marginTop: 28, letterSpacing: -1, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 26, marginTop: 14, color: "#57534a" }}>{sub}</div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #ddd5c6",
            paddingTop: 16,
            fontSize: 22,
            color: "#6e685d",
          }}
        >
          <span>{personal.name}</span>
          <span>div90.vercel.app</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: serif ? [{ name: "Newsreader", data: serif, weight: 500 as const, style: "normal" as const }] : undefined,
    },
  );
}
