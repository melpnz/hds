import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(fs.readFileSync(path.join(root, "machine", "catalog.json"), "utf8"));
const candidates = [
  process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
  process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Microsoft", "Edge", "Application", "msedge.exe"),
  process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe")
].filter(Boolean);
const executablePath = candidates.find((candidate) => fs.existsSync(candidate));
const browser = await chromium.launch(executablePath ? { executablePath } : {});

async function newTestPage(options) {
  const page = await browser.newPage(options);
  await page.route(/^https:\/\/fonts\.googleapis\.com\//, (route) => route.fulfill({ status: 200, contentType: "text/css", body: "" }));
  return page;
}

try {
  const page = await newTestPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto(pathToFileURL(path.join(root, "viewer", "index.html")).href);
  await page.waitForSelector(".catalog-item");
  if (await page.locator(".catalog-item").count() !== catalog.items.length) throw new Error(`В каталоге должно быть ${catalog.items.length} сущностей`);
  const widthLabels = await page.locator("[data-width]").allTextContents();
  if (widthLabels.join("|") !== "320|480|768|992|1280|1440|Auto") throw new Error(`Неверный набор ширин витрины: ${widthLabels.join(", ")}`);
  if (await page.locator(".catalog-group").count() !== 5) throw new Error("В каталоге должно быть 5 групп");
  await page.getByRole("button", { name: /Кнопки/ }).click();
  await page.waitForFunction(() => document.querySelector("#preview").src.includes("collections/buttons/index.html"));
  await page.locator("#search").fill("ввода");
  if (await page.locator(".catalog-item").count() < 1) throw new Error("Фильтр витрины по полям не сработал");
  await page.locator("#search").fill("");
  await page.getByRole("button", { name: "320", exact: true }).click();
  if (await page.locator("#preview").evaluate((node) => node.style.width) !== "320px") throw new Error("Переключатель ширины не сработал");
  await page.getByRole("button", { name: "Auto", exact: true }).click();
  if (await page.locator("#preview").evaluate((node) => node.style.width) !== "100%") throw new Error("Автоматическая ширина не сработала");
  const frame = page.frames().find((candidate) => candidate.url().includes("collections/buttons/index.html"));
  if (!frame || !(await frame.locator("button").count())) throw new Error("file:// iframe не загрузил пример");
  if (consoleErrors.length) throw new Error(`Ошибки console: ${consoleErrors.join(" | ")}`);

  for (const example of [...new Set(catalog.items.map((item) => item.example.split("#")[0]))]) {
    for (const width of [390, 1440]) {
      const examplePage = await newTestPage({ viewport: { width, height: 900 } });
      const failures = [];
      examplePage.on("requestfailed", (request) => {
        if (!/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//.test(request.url())) failures.push(request.url());
      });
      await examplePage.goto(pathToFileURL(path.resolve(root, "machine", example)).href);
      if (example.includes("../examples/pages/")) {
        const pageBackground = await examplePage.evaluate(() => getComputedStyle(document.body).backgroundColor);
        if (pageBackground !== "rgb(23, 28, 27)") throw new Error(`${example}: фон темы company не применился (${pageBackground})`);
      }
      const overflow = await examplePage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      if (overflow) throw new Error(`${example}: горизонтальный overflow при ${width}px`);
      if (failures.length) throw new Error(`${example}: не загрузились ресурсы ${failures.join(", ")}`);
      await examplePage.close();
    }
  }

  const geometryPage = await newTestPage({ viewport: { width: 900, height: 500 } });
  await geometryPage.goto(pathToFileURL(path.join(root, "examples", "button", "variants.html")).href);
  const buttonOffsets = await geometryPage.locator("button,[role=button]").evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect();
    const text = document.createRange();
    text.selectNodeContents(node);
    const textBox = text.getBoundingClientRect();
    return Math.abs((box.top + box.height / 2) - (textBox.top + textBox.height / 2));
  }));
  if (buttonOffsets.some((offset) => offset > 1.5)) throw new Error(`Текст кнопки не центрирован: ${buttonOffsets.join(", ")}`);

  await geometryPage.goto(pathToFileURL(path.join(root, "examples", "checkbox", "states.html")).href);
  const checkOffsets = await geometryPage.locator(".hds-check").evaluateAll((nodes) => nodes.map((node) => {
    const control = node.querySelector("input").getBoundingClientRect();
    const label = node.querySelector("span");
    const firstGlyph = document.createRange();
    firstGlyph.setStart(label.firstChild, 0);
    firstGlyph.setEnd(label.firstChild, 1);
    const line = firstGlyph.getBoundingClientRect();
    return Math.abs((control.top + control.height / 2) - (line.top + line.height / 2));
  }));
  if (checkOffsets.some((offset) => offset > 1.5)) throw new Error(`Первая строка чекбокса не центрирована: ${checkOffsets.join(", ")}`);

  await geometryPage.goto(pathToFileURL(path.join(root, "examples", "form-field", "states.html")).href);
  const errorGap = await geometryPage.locator(".hds-field__error").evaluate((node) => node.getBoundingClientRect().top - node.previousElementSibling.getBoundingClientRect().bottom);
  if (errorGap < 8) throw new Error(`Ошибка слишком близко к полю: ${errorGap}px`);
  const fieldPaddings = await geometryPage.locator(".hds-field > input, .hds-field > textarea, .hds-field > select").evaluateAll((nodes) => nodes.map((node) => parseFloat(getComputedStyle(node).paddingLeft)));
  if (fieldPaddings.some((padding) => Math.abs(padding - 16) > .1)) throw new Error(`Левые отступы полей расходятся: ${fieldPaddings.join(", ")}`);
  const firstField = geometryPage.locator(".hds-field > input").first();
  await firstField.click();
  const pointerFocus = await firstField.evaluate((node) => ({ outline: getComputedStyle(node).outlineWidth, border: getComputedStyle(node).borderWidth, keyboard: document.documentElement.classList.contains("hds-keyboard") }));
  if (pointerFocus.outline !== "0px" || pointerFocus.border !== "1px" || pointerFocus.keyboard) throw new Error(`Pointer focus должен иметь только тонкую границу: ${JSON.stringify(pointerFocus)}`);
  await geometryPage.goto(pathToFileURL(path.join(root, "examples", "form-field", "states.html")).href);
  await geometryPage.keyboard.press("Tab");
  const keyboardFocus = await geometryPage.locator(".hds-field > input").first().evaluate((node) => ({ outline: getComputedStyle(node).outlineWidth, keyboard: document.documentElement.classList.contains("hds-keyboard"), focused: document.activeElement === node }));
  if (keyboardFocus.outline !== "2px" || !keyboardFocus.keyboard || !keyboardFocus.focused) throw new Error(`Keyboard focus должен иметь внешний focus-ring: ${JSON.stringify(keyboardFocus)}`);

  await geometryPage.setViewportSize({ width: 1200, height: 500 });
  await geometryPage.goto(pathToFileURL(path.join(root, "examples", "site-header", "default.html")).href);
  const logo = await geometryPage.locator(".hds-logo").evaluate((node) => ({ background: getComputedStyle(node).backgroundColor, source: node.querySelector("img").getAttribute("src"), filter: getComputedStyle(node.querySelector("img")).filter, height: node.querySelector("img").getBoundingClientRect().height }));
  if (logo.background !== "rgba(0, 0, 0, 0)" || !logo.source.includes("wordmark-ru") || logo.filter === "none") throw new Error("Логотип должен быть белым текстовым знаком без подложки");
  if (Math.abs(logo.height - 30) > .5) throw new Error(`Logo height must be 30 px: ${logo.height}`);
  const headerFontSize = await geometryPage.locator(".hds-header__nav a").first().evaluate((node) => parseFloat(getComputedStyle(node).fontSize));
  if (Math.abs(headerFontSize - 18) > .5) throw new Error(`Header navigation must use the body text size: ${headerFontSize}`);
  await geometryPage.close();

  const collectionPage = await newTestPage({ viewport: { width: 1280, height: 900 } });
  await collectionPage.goto(pathToFileURL(path.join(root, "examples", "collections", "buttons", "index.html")).href);
  const sectionTops = await collectionPage.locator(".demo-section").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
  if (sectionTops.some((top, index) => index && top <= sectionTops[index - 1])) throw new Error(`Коллекция кнопок должна идти вертикальными секциями: ${sectionTops.join(", ")}`);
  if (await collectionPage.locator(".demo-state").count() !== 32) throw new Error("В коллекции кнопок должна быть полная матрица состояний");
  const linkDecorations = await collectionPage.locator(".hds-link").evaluateAll((nodes) => [getComputedStyle(nodes[0]).textDecorationLine, getComputedStyle(nodes.find((node) => node.closest('[data-demo-state="hover"]'))).textDecorationLine]);
  if (linkDecorations[0] !== "none" || linkDecorations[1] !== "underline") throw new Error(`Подчеркивание текстовой ссылки должно появляться только при hover: ${linkDecorations.join(", ")}`);
  await collectionPage.goto(pathToFileURL(path.join(root, "examples", "collections", "choice-controls", "index.html")).href);
  if (await collectionPage.locator(".demo-state").count() !== 12) throw new Error("В коллекции выбора должна быть полная матрица состояний");
  await collectionPage.goto(pathToFileURL(path.join(root, "examples", "collections", "input-fields", "index.html")).href);
  if (await collectionPage.locator(".demo-state").count() !== 11) throw new Error("В коллекции полей должна быть полная матрица состояний");
  await collectionPage.goto(pathToFileURL(path.join(root, "examples", "collections", "cards", "index.html")).href);
  if (await collectionPage.locator(".demo-section").count() !== 19) throw new Error("Каждый тип карточки должен быть отдельной секцией коллекции");
  if (await collectionPage.locator(".hds-service-card, .hds-benefit-card, .hds-offer--media, .hds-icon-card, .hds-process-card, .hds-stat, .hds-case, .hds-showcase-card, .hds-project-card, .hds-team-link, .hds-image-note-card, .hds-price-card, .hds-format-card, .hds-course-card, .hds-action-card, .hds-visual-benefit-card, .hds-partner-card, .hds-tier-card").count() !== 18) throw new Error("В витрине должны быть все выделенные Webflow-варианты карточек");
  if (await collectionPage.locator(".hds-case img, .hds-showcase-card img, .hds-project-card img").count() !== 3) throw new Error("Карточки кейса и проектов должны показывать свои обложки");
  await collectionPage.close();

  for (const [width, columns] of [[768, 2], [480, 1]]) {
    const footerPage = await newTestPage({ viewport: { width, height: 900 } });
    await footerPage.goto(pathToFileURL(path.join(root, "examples", "pages", "company", "index.html")).href);
    const templateColumns = await footerPage.locator(".hds-footer--source .hds-footer__grid").evaluate((node) => getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length);
    if (templateColumns !== columns) throw new Error(`Source footer at ${width}px must have ${columns} column(s), got ${templateColumns}`);
    await footerPage.close();
  }

  const largePage = await newTestPage({ viewport: { width: 1920, height: 900 } });
  await largePage.goto(pathToFileURL(path.join(root, "examples", "breakpoints", "index.html")).href);
  const largeStatus = await largePage.locator(".bp-large .status").evaluate((node) => getComputedStyle(node, "::after").content);
  if (!largeStatus.includes("Текущий") || await largePage.locator(".bp-ultra").count()) throw new Error("При 1920 px должен оставаться диапазон Large");
  const containerWidth = await largePage.locator(".hds-container").first().evaluate((node) => node.getBoundingClientRect().width);
  if (Math.abs(containerWidth - 1440) > .1) throw new Error(`Контейнер на Large должен быть 1440 px, получено ${containerWidth}`);
  await largePage.close();

  const testimonialPage = await newTestPage({ viewport: { width: 900, height: 700 } });
  await testimonialPage.goto(pathToFileURL(path.join(root, "examples", "blocks", "testimonials", "index.html")).href);
  const visibleSlides = testimonialPage.locator("[data-hds-slide]:not([hidden])");
  if (await visibleSlides.count() !== 1) throw new Error("The testimonial carousel must show exactly one slide");
  await testimonialPage.locator("[data-hds-carousel-next]").click();
  if (await testimonialPage.locator("[data-hds-carousel-status]").textContent() !== "2 / 3") throw new Error("The testimonial next button did not change the slide");
  if (await visibleSlides.count() !== 1) throw new Error("The testimonial carousel must keep exactly one visible slide after navigation");
  await testimonialPage.close();

  const portfolioPage = await newTestPage({ viewport: { width: 1440, height: 900 } });
  await portfolioPage.goto(pathToFileURL(path.join(root, "examples", "pages", "portfolio", "index.html")).href);
  if (await portfolioPage.locator(".hds-project-card").count() !== 24) throw new Error("Портфолио должно показывать все 24 карточки Webflow-выборки");
  await portfolioPage.close();
  console.log("OK: витрина и примеры работают через file://; Large остаётся активным на 1920 px.");
} finally {
  await browser.close();
}
