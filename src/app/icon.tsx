import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: a tiny notebook page — rubrication margin rule + ink lines. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#faf7f0",
          border: "2px solid #1c1a17",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 4,
          paddingLeft: 11,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 7,
            top: 0,
            bottom: 0,
            width: 2,
            background: "#a82f1b",
          }}
        />
        <div style={{ width: 14, height: 2.5, background: "#1c1a17" }} />
        <div style={{ width: 10, height: 2.5, background: "#1c1a17" }} />
        <div style={{ width: 12, height: 2.5, background: "#1c1a17" }} />
      </div>
    ),
    size,
  );
}
