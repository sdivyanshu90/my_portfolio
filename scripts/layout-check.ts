/**
 * Can a visitor actually read the answer? Asks real questions at ten screen
 * sizes in both themes and fails if the narration is squeezed, covered, or
 * the card's footer can't be scrolled into view.
 *   BASE=http://localhost:3100 CHROME_PATH=/path/to/chrome npm run layout
 * Run it against a server started without OPENROUTER_API_KEY: answers are
 * then deterministic (or cached) and cost nothing. Traffic is tagged
 * smoke-test (ADMIN_TOKEN from .env.local) so analytics can tell it apart;
 * nothing is ever deleted.
 */
import nextEnv from "@next/env";
import { chromium } from "playwright-core";

nextEnv.loadEnvConfig(process.cwd());
const BASE = process.env.BASE ?? "http://localhost:3100";
const TOKEN = process.env.ADMIN_TOKEN;
if (!TOKEN) {
  console.error(
    "ADMIN_TOKEN is required (it tags the test traffic as smoke-test).",
  );
  process.exit(1);
}
const QUESTIONS = [
  "What's his role description at Uniiq.ai?", // two intents, long trace
  "Give me the 30-second pitch", // preset
  "Does he know Kubernetes?", // honest absence + handoff box
  "Show the experience timeline",
  // A long question must wrap in the card header, never be cut off.
  "Can you walk me through how he evaluated the Admissions Decision Twin and what changed in critical constraint violations before and after?",
];
const SIZES: [number, number][] = [
  [1162, 560],
  [1162, 640],
  [1280, 720],
  [1366, 768],
  [1440, 900],
  [1920, 1080],
  [1024, 768],
  [768, 1024],
  [390, 844],
  [360, 640],
];
/** The first lines of an answer must be on screen without scrolling. */
const MIN_VISIBLE_PX = 120;

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH,
});
let failed = 0;
let total = 0;
for (const q of QUESTIONS) {
  for (const scheme of ["dark", "light"] as const) {
    for (const [width, height] of SIZES) {
      const mobile = width < 640;
      const ctx = await browser.newContext({
        viewport: { width, height },
        colorScheme: scheme,
        isMobile: mobile,
        hasTouch: mobile,
        extraHTTPHeaders: { "x-div1-smoke": TOKEN },
      });
      const page = await ctx.newPage();
      await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
      // The input's hint must fit: a clipped hint is an unreadable prompt.
      const hint = await page.evaluate(() => {
        const input =
          document.querySelector<HTMLInputElement>("#console-input")!;
        const cs = getComputedStyle(input);
        const ctx2d = document.createElement("canvas").getContext("2d")!;
        ctx2d.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const room =
          input.clientWidth -
          parseFloat(cs.paddingLeft) -
          parseFloat(cs.paddingRight);
        return {
          fits: ctx2d.measureText(input.placeholder).width <= room + 1,
          text: input.placeholder,
        };
      });
      await page.fill("#console-input", q);
      await page.keyboard.press("Enter");
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll("article")].some(
            (a) =>
              /run 01/i.test(a.textContent ?? "") && a.querySelector("footer"),
          ),
        null,
        { timeout: 20_000 },
      );
      await page.waitForTimeout(1_200);
      const m = await page.evaluate(async (asked) => {
        const card = [...document.querySelectorAll("article")].find((a) =>
          /run 01/i.test(a.textContent ?? ""),
        )!;
        const answer = card.querySelector("[aria-live=polite]")!;
        // Visible height after clipping by every scrolling ancestor and the viewport.
        const r = answer.getBoundingClientRect();
        let top = Math.max(r.top, 0);
        let bottom = Math.min(r.bottom, innerHeight);
        for (let a = answer.parentElement; a; a = a.parentElement) {
          if (/(auto|scroll|hidden)/.test(getComputedStyle(a).overflowY)) {
            const ar = a.getBoundingClientRect();
            top = Math.max(top, ar.top);
            bottom = Math.min(bottom, ar.bottom);
          }
        }
        const hit = document.elementFromPoint(r.left + 20, top + 8);
        // The question, as asked, is shown in full (wrapped, not ellipsized).
        const h2 = card.querySelector("h2")!;
        // Long questions are clamped with an expander: it must reveal it all.
        const expander = card.querySelector<HTMLButtonElement>(
          "header button[aria-expanded]",
        );
        const clampedBefore = h2.scrollHeight > h2.clientHeight + 1;
        const expandable = !clampedBefore || !!expander;
        if (expander) {
          expander.click();
          await new Promise((res) => setTimeout(res, 150));
        }
        const hr = h2.getBoundingClientRect();
        const questionShown =
          expandable &&
          (h2.textContent ?? "").includes(asked) &&
          h2.scrollWidth <= h2.clientWidth + 1 &&
          h2.scrollHeight <= h2.clientHeight + 1 &&
          hr.top >= 0 &&
          hr.bottom <= innerHeight;
        const fontPx = parseFloat(getComputedStyle(answer).fontSize);
        // The whole answer can be brought on screen, down to its last line.
        answer.scrollIntoView({ block: "end" });
        await new Promise((res) => setTimeout(res, 250));
        const end = answer.getBoundingClientRect();
        let clipBottom = innerHeight;
        for (let a = answer.parentElement; a; a = a.parentElement) {
          if (/(auto|scroll|hidden)/.test(getComputedStyle(a).overflowY)) {
            clipBottom = Math.min(clipBottom, a.getBoundingClientRect().bottom);
          }
        }
        const endReachable = end.bottom <= clipBottom + 1;
        const cardBottom = card.getBoundingClientRect().bottom;
        // Scroll whatever scrolls to the end: the footer must come into view.
        for (const el of [
          card,
          ...card.querySelectorAll<HTMLElement>(".card-scroll"),
        ])
          el.scrollTop = el.scrollHeight;
        await new Promise((res) => setTimeout(res, 300));
        const f = card.querySelector("footer")!.getBoundingClientRect();
        const c = card.getBoundingClientRect();
        return {
          visible: Math.round(Math.max(0, bottom - top)),
          full: Math.round(r.height),
          covered: !(hit && answer.contains(hit)),
          overflowsScreen: cardBottom > innerHeight + 1,
          questionShown,
          endReachable,
          fontPx,
          words: (answer.textContent ?? "").trim().split(/\s+/).length,
          footerReachable:
            f.bottom <= Math.min(c.bottom, innerHeight) + 1 &&
            f.top >= c.top - 1,
        };
      }, q);
      const ok =
        m.visible >= Math.min(m.full, MIN_VISIBLE_PX) &&
        !m.covered &&
        !m.overflowsScreen &&
        m.footerReachable &&
        m.questionShown &&
        m.endReachable &&
        m.fontPx >= 14 &&
        m.words >= 5 &&
        hint.fits;
      total++;
      if (!ok) {
        failed++;
        console.log(
          `✗ ${scheme} ${width}x${height} "${q.slice(0, 40)}" — answer ${m.visible}/${m.full}px visible, covered=${m.covered}, off-screen=${m.overflowsScreen}, footer=${m.footerReachable}, question shown=${m.questionShown}, end reachable=${m.endReachable}, ${m.fontPx}px, ${m.words} words, hint fits=${hint.fits} ("${hint.text}")`,
        );
      }
      await ctx.close();
    }
  }
}
await browser.close();

console.log(`\n${total - failed}/${total} layouts readable`);
process.exit(failed ? 1 : 0);
