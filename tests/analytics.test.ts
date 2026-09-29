import { describe, expect, it } from "vitest";
import { POST as pv } from "@/app/api/pv/route";
import { browserFamily, deviceFromWidth, isBot } from "@/lib/ua";

describe("visitor classification", () => {
  it("filters bots and headless browsers", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe(true);
    expect(isBot("Mozilla/5.0 HeadlessChrome/151.0")).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(isBot("Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/150.0 Safari/537.36")).toBe(false);
  });
  it("keeps only a browser family and a device class", () => {
    expect(browserFamily("Mozilla/5.0 AppleWebKit Chrome/150 Safari/537 Edg/150")).toBe("Edge");
    expect(browserFamily("Mozilla/5.0 (iPhone) AppleWebKit Version/19 Mobile Safari/604")).toBe("Safari");
    expect(browserFamily("Mozilla/5.0 Firefox/140")).toBe("Firefox");
    expect(deviceFromWidth(390)).toBe("mobile");
    expect(deviceFromWidth(800)).toBe("tablet");
    expect(deviceFromWidth(1440)).toBe("desktop");
    expect(deviceFromWidth("x")).toBe("unknown");
  });
});

describe("/api/pv", () => {
  const send = (body: unknown, ua = "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/150.0 Safari/537.36") =>
    pv(new Request("http://l/api/pv", { method: "POST", headers: { "user-agent": ua, "x-forwarded-for": "10.9.1.1" }, body: JSON.stringify(body) }));
  it("always answers 204 (beacons never wait) — valid, invalid, or bot", async () => {
    expect((await send({ kind: "view", id: "abcdef12-3456", path: "/", w: 1440 })).status).toBe(204);
    expect((await send({ kind: "view", id: "bad id!", path: "/" })).status).toBe(204);
    expect((await send({ kind: "view", id: "abcdef12-3456", path: "/" }, "Googlebot/2.1")).status).toBe(204);
    expect((await send("not json")).status).toBe(204);
  });
});
