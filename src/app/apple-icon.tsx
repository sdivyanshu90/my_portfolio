import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon: the notebook-page mark, scaled up. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#faf7f0",
          border: "10px solid #1c1a17",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          paddingLeft: 62,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 40,
            top: 0,
            bottom: 0,
            width: 10,
            background: "#a82f1b",
          }}
        />
        <div style={{ width: 76, height: 13, background: "#1c1a17" }} />
        <div style={{ width: 54, height: 13, background: "#1c1a17" }} />
        <div style={{ width: 66, height: 13, background: "#1c1a17" }} />
      </div>
    ),
    size,
  );
}
