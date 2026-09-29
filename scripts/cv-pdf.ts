/**
 * Print /cv to public/Divanshu_Sharma_Resume.pdf — the résumé is generated
 * from the dossier, so it can't drift from the site.
 *   BASE=http://localhost:3000 CHROME_PATH=/path/to/chrome npm run cv:pdf
 */
import { writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH });
const page = await browser.newPage();
await page.goto(`${BASE}/cv`, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
const pdf = await page.pdf({ format: "A4", printBackground: true });
await browser.close();
const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
writeFileSync(new URL("../public/Divanshu_Sharma_Resume.pdf", import.meta.url), pdf);
console.log(`résumé: ${pages} page(s), ${Math.round(pdf.length / 1024)} KB → public/Divanshu_Sharma_Resume.pdf`);
if (pages > 2) console.warn("warning: longer than two pages — tighten the print styles in globals.css");
