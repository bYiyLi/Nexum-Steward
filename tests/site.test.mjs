import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { bindInstallPrompt } from "../site/src/lib/copy-prompt.ts";
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
    assert.ok(page.includes("/tree/main/templates"));
  }
  assert.ok(html("index.html").includes('href="/install/"'));
  assert.ok(html("en/index.html").includes('href="/en/install/"'));
  const root = resolve(site, "../..");
  assert.equal(html("INSTALL.md"), readFileSync(resolve(root, "INSTALL.md"), "utf8"));
  for (const locale of ["zh", "en"]) {
    const page = html(locale === "zh" ? "install/index.html" : "en/install/index.html");
    const prompt = readFileSync(resolve(root, "site/src/content/install-prompt." + locale + ".txt"), "utf8").trim();
    const displayed = promptParagraphs(page).map(p => p.textContent).join("\n");
    assert.equal(displayed, prompt, locale + " visible prompt differs from source");
    assert.ok(prompt.length < (locale === "zh" ? 200 : 450));
    assert.doesNotMatch(prompt, /\[.*?\]/);
    assert.doesNotMatch(page, /<(?:form|input|textarea|select)\b/i);
    assert.equal((page.match(/class="guide-number"/g) ?? []).length, 3);
    assert.ok(page.indexOf('id="guide-prompt-content"') < page.indexOf('class="guide-flow"'));
  }
});


test("中英首页与安装页保留四技能、部署边界和待验收状态", () => {
  for (const name of ["index.html", "en/index.html", "install/index.html", "en/install/index.html"]) {
    const page = html(name);
    for (const skill of ["steward-spec", "steward-setup", "steward-doctor", "steward-deploy"])
      assert.ok(page.includes(skill), `${name}: ${skill}`);
    assert.match(page, /待验收|remain unverified/);
    assert.match(page, /不构建源码|does not build source/);
    assert.doesNotMatch(page, /尚无业务部署 Skill|业务部署技能尚未交付|deployment Skills are not delivered/);
  }
  assert.match(html("index.html"), /data \+ bind mount/);
  assert.match(html("en/index.html"), /bind mounts/);
});

function promptParagraphs(page) {
  const block = page.match(/<div id="guide-prompt-content"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  assert.ok(block, "visible prompt container missing");
  return Array.from(block.matchAll(/<p>([\s\S]*?)<\/p>/g), ([, text]) => ({
    textContent: text.replace(/<[^>]*>/g, "").replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'")
  }));
}

function promptDOM(page) {
  const events = {};
  const copy = { dataset: { success: "copied", error: "failed" }, addEventListener: (_, cb) => { events.copy = cb; } };
  const select = { dataset: { selected: "selected" }, addEventListener: (_, cb) => { events.select = cb; } };
  const status = { textContent: "" };
  const selection = { removeAllRanges() {}, addRange() { this.selected = true; } };
  const content = { children: promptParagraphs(page), focus() { this.focused = true; } };
  const root = {
    getElementById: () => content,
    querySelector: key => ({ "[data-copy-install]": copy, "[data-select-install]": select, "[data-copy-status]": status })[key],
    createRange: () => ({ selectNodeContents: node => assert.equal(node, content) }),
    getSelection: () => selection
  };
  return { root, events, status, content, selection };
}

test("复制读取全部可见段落，成功、拒绝和无 Clipboard 均有可用反馈", async () => {
  for (const locale of ["zh", "en"]) {
    const page = html(locale === "zh" ? "install/index.html" : "en/install/index.html");
    const expected = readFileSync(resolve(site, `../src/content/install-prompt.${locale}.txt`), "utf8").trim();
    const success = promptDOM(page);
    let clipboard;
    bindInstallPrompt(success.root, { writeText: async text => { clipboard = text; } });
    await success.events.copy();
    assert.equal(clipboard, expected);
    assert.equal(success.status.textContent, "copied");
    for (const api of [undefined, { writeText: async () => { throw new Error("denied"); } }]) {
      const failure = promptDOM(page);
      bindInstallPrompt(failure.root, api);
      await failure.events.copy();
      assert.equal(failure.status.textContent, "failed");
      assert.equal(failure.content.focused, true);
      assert.equal(failure.selection.selected, true);
      failure.events.select();
      assert.equal(failure.status.textContent, "selected");
    }
  }
});

test("内部链接均指向存在的页面或锚点，场景始终标注非执行", () => {
  for (const name of ["index.html", "en/index.html", "install/index.html", "en/install/index.html"]) {
    const page = html(name);
    for (const [, href] of page.matchAll(/href="([^"#]*(?:#[^"]*)?)"/g)) {
      if (href.startsWith("#")) assert.ok(page.includes(`id="${href.slice(1)}"`), `${name}: ${href}`);
      else if (href.startsWith("/") && !href.startsWith("//")) {
        const path = href.split("#")[0];
        assert.ok(existsSync(resolve(site, path.slice(1) + (path.endsWith("/") ? "index.html" : ""))), `${name}: ${href}`);
      }
    }
  }
  assert.match(html("index.html"), /交互示意 · 非实际执行/);
  assert.match(html("en/index.html"), /Illustration · Not executed/);
});

test("创建器选择说明位于复制正文之外，不改变可复制短提示词", async () => {
  for (const locale of ["zh", "en"]) {
    const page = html(locale === "zh" ? "install/index.html" : "en/install/index.html");
    const instruction = page.match(/<div class="guide-creator-tip"[^>]*data-creator-instructions[^>]*>([\s\S]*?)<\/div>/)?.[1];
    assert.ok(instruction, `${locale}: creator instructions missing`);
    assert.match(instruction, /Plugin Creator/);
    assert.match(instruction, /@/);
    assert.ok(page.indexOf("data-creator-instructions") < page.indexOf('id="guide-prompt-content"'));
    const visiblePrompt = promptParagraphs(page).map(p => p.textContent).join("\n");
    assert.doesNotMatch(visiblePrompt, /Plugin Creator|@plugin-creator|@/);
    const dom = promptDOM(page);
    let copied;
    bindInstallPrompt(dom.root, { writeText: async value => { copied = value; } });
    await dom.events.copy();
    assert.equal(copied, visiblePrompt);
    assert.ok(!copied.includes(instruction));
  }
});
