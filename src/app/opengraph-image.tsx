import { ImageResponse } from "next/og";
import { personal, site } from "@/data/portfolio";

export const alt = `${personal.name} — DIV-1, an AI-native queryable portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Newsreader TTF fetched at build time (no UA header → Google serves truetype). */
async function loadSerif(): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch("https://fonts.googleapis.com/css2?family=Newsreader:wght@500")
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await (await fetch(url)).arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OgImage() {
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
          padding: "64px 72px",
          fontFamily: serif ? "Newsreader" : "serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 0,
            bottom: 0,
            width: 4,
            background: "#a82f1b",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "2px solid #1c1a17",
            paddingBottom: 20,
            fontSize: 24,
            letterSpacing: 4,
          }}
        >
          <span>AI-NATIVE PORTFOLIO</span>
          <span style={{ color: "#a82f1b" }}>{`DIV-1 · rev ${site.revision}`}</span>
        </div>
        <div style={{ fontSize: 92, marginTop: 84, letterSpacing: -2 }}>
          {personal.name}
        </div>
        <div style={{ fontSize: 34, marginTop: 24, color: "#57534a" }}>
          {personal.roles.join(" · ")}
        </div>
        <div style={{ fontSize: 28, marginTop: 14, color: "#a82f1b" }}>
          {`${personal.currentRole} — don't read the portfolio, query it`}
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            borderTop: "1px solid #ddd5c6",
            paddingTop: 20,
            fontSize: 22,
            color: "#6e685d",
          }}
        >
          <span>div90.vercel.app</span>
          <span>github.com/sdivyanshu90</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: serif
        ? [{ name: "Newsreader", data: serif, weight: 500 as const, style: "normal" as const }]
        : undefined,
    },
  );
}
