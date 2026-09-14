import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(os.tmpdir(), "hds-landings-review");
fs.mkdirSync(output, { recursive: true });
const candidates = [
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
  process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe")
].filter(Boolean);
const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
const browser = await chromium.launch(executablePath ? { executablePath } : {});

const captures = [
  ["viewer", "viewer/index.html", 1440, 900],
  ["elements", "examples/button/variants.html", 1200, 900],
  ["organism-lead-form", "examples/organisms/lead-form/index.html", 1200, 900],
  ["block-pricing", "examples/blocks/pricing/index.html", 1200, 900],
  ["source-company", "../temp/from-webflow/index.html", 1440, 900],
  ["source-advertising", "../temp/from-webflow/ru/advertising.html", 1440, 900],
  ["source-agency", "../temp/from-webflow/ru/agency.html", 1440, 900],
  ["source-corporate-blogs", "../temp/from-webflow/ru/corporate-blogs.html", 1440, 900],
  ["source-career-special", "../temp/from-webflow/ru/career-special.html", 1440, 900],
  ["source-education", "../temp/from-webflow/ru/education-programs.html", 1440, 900],
  ["source-startup", "../temp/from-webflow/ru/hello-startup.html", 1440, 900],
  ["source-native", "../temp/from-webflow/ru/native-special.html", 1440, 900],
  ["source-newsletter", "../temp/from-webflow/ru/newsletter.html", 1440, 900],
  ["source-promo", "../temp/from-webflow/ru/promo.html", 1440, 900],
  ["source-portfolio", "../temp/from-webflow/ru/portfolio.html", 1440, 900],
  ["company", "examples/pages/company/index.html", 1440, 1000],
  ["advertising", "examples/pages/advertising/index.html", 1440, 1000],
  ["agency", "examples/pages/agency/index.html", 1440, 1000],
  ["corporate-blogs", "examples/pages/corporate-blogs/index.html", 1440, 1000],
  ["career-special", "examples/pages/career-special/index.html", 1440, 1000],
  ["education", "examples/pages/education-programs/index.html", 1440, 1000],
  ["startup", "examples/pages/hello-startup/index.html", 1440, 1000],
  ["native", "examples/pages/native-special/index.html", 1440, 1000],
  ["newsletter", "examples/pages/newsletter/index.html", 1440, 1000],
  ["promo", "examples/pages/promo/index.html", 1440, 1000],
  ["portfolio", "examples/pages/portfolio/index.html", 1440, 1000],
  ["portfolio-mobile", "examples/pages/portfolio/index.html", 390, 844]
];
const captureFilter = process.env.HDS_CAPTURE_FILTER;
for (const [name, relative, width, height] of captures.filter(([name]) => !captureFilter || name === captureFilter)) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.route(/^https:\/\/fonts\.googleapis\.com\//, (route) => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
  await page.goto(pathToFileURL(path.join(root, relative)).href);
  await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: name !== "viewer" });
  await page.close();
}
await browser.close();
console.log(output);
