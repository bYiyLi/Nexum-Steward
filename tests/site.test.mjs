import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "../site/dist");
const html = (name) => readFileSync(resolve(site, name), "utf8");

test("构建产物包含中英文页面、导航和 SEO", () => {
  const zh = html("index.html");
  const en = html("en/index.html");
  assert.match(zh, /<html lang="zh-CN"/);
  assert.match(en, /<html lang="en"/);
  assert.match(zh, /https:\/\/nexum-steward\.sites\.y2l\.top\//);
  assert.match(en, /https:\/\/nexum-steward\.sites\.y2l\.top\/en\//);
  for (const page of [zh, en]) {
    for (const id of ["overview", "capabilities", "workflow", "safety"]) {
      assert.ok(page.includes('id="' + id + '"'), "missing section " + id);
    }
    assert.match(page, /github\.com\/bYiyLi\/Nexum-Steward/);
    assert.match(page, /name="description"/);
    assert.match(page, /rel="canonical"/);
    assert.match(page, /rel="alternate"/);
    assert.match(page, /data-theme-switch/);
    assert.doesNotMatch(page, /\/Users\/|g-p-[a-z0-9]{20}|gho_[a-z0-9]/i);
  }
  assert.match(zh, /产品设计预览/);
  assert.match(en, /Product preview/);
});

test("静态资源存在，文案不误导安装状态", () => {
  assert.ok(existsSync(resolve(site, "favicon.svg")));
  assert.ok(existsSync(resolve(site, "robots.txt")));
  assert.ok(readdirSync(resolve(site, "_astro")).some(name => name.endsWith(".css")));
  for (const name of ["index.html", "en/index.html"]) {
    assert.doesNotMatch(html(name), /立即安装|Install now|已正式发布|Now available/i);
  }
});

test("官网安装页展示提示词，唯一的安装指南来自仓库根目录", () => {
  const zh = html("install/index.html");
  const en = html("en/install/index.html");
  assert.match(zh, /<html lang="zh-CN"/);
  assert.match(en, /<html lang="en"/);
  for (const page of [zh, en]) {
    assert.ok(page.includes('href="/INSTALL.md"'));
    assert.ok(page.includes("data-copy-install"));
    assert.ok(page.includes("templates/plugin.json"));
  }
  assert.ok(html("index.html").includes('href="/install/"'));
  assert.ok(html("en/index.html").includes('href="/en/install/"'));
  const root = resolve(site, "../..");
  assert.equal(html("INSTALL.md"), readFileSync(resolve(root, "INSTALL.md"), "utf8"));
  for (const locale of ["zh", "en"]) {
    const page = html(locale === "zh" ? "install/index.html" : "en/install/index.html");
    const prompt = readFileSync(resolve(root, "site/src/content/install-prompt." + locale + ".txt"), "utf8").trim();
    assert.ok(page.replaceAll("&quot;", '"').includes(prompt), locale + " prompt missing or changed");
  }
});
