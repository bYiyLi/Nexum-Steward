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
