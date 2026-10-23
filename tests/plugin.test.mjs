import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(resolve(root, path), "utf8");

test("ChatGPT 插件使用可移植清单，不包含 Codex 兼容包或产品 Skill", () => {
  const manifest = JSON.parse(read("templates/plugin.json"));
  assert.equal(manifest.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
  assert.equal(manifest.name, "nexum-steward");
  assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
  assert.ok(manifest.description?.includes("ChatGPT"));
  assert.equal(manifest.skills, undefined);
  assert.equal(manifest.hooks, undefined);
  assert.ok(!existsSync(resolve(root, "plugin.json")));
  assert.ok(!existsSync(resolve(root, "mcp.json")));
  assert.ok(!existsSync(resolve(root, ".codex-plugin/plugin.json")));
  assert.ok(!existsSync(resolve(root, "skills/nexum-steward/SKILL.md")));
});

test("空模板不预设 MCP 连接", () => {
  assert.ok(!existsSync(resolve(root, "templates/mcp.json")));
});

test("产品文档反映本阶段不开发 Skill", () => {
  for (const path of [
    "README.md", "AGENTS.md", "docs/requirements.md",
    "docs/design.md", "docs/development/02-chatgpt-plugin-and-website.md"
  ]) assert.ok(read(path).length > 200, path);
  assert.match(read("docs/requirements.md"), /暂不交付产品 Skill/);
  assert.match(read("docs/design.md"), /不定义产品 Skill/);
});

test("网站源与自定义域名配置一致", () => {
  for (const path of [
    "site/package.json", "site/astro.config.mjs",
    "site/src/components/Home.astro", "site/src/styles/site.css",
    "site/src/pages/index.astro", "site/src/pages/en/index.astro",
    "site/src/lib/content.ts", ".github/workflows/pages.yml"
  ]) assert.ok(existsSync(resolve(root, path)), path);
  assert.match(read("site/astro.config.mjs"), /https:\/\/nexum-steward\.sites\.y2l\.top/);
});

test("根目录安装指南与网站提示词独立维护，不使用版本目录", () => {
  const manual = read("INSTALL.md");
  assert.ok(!existsSync(resolve(root, "install")));
  assert.ok(!existsSync(resolve(root, "templates/v0.1.0")));
  assert.ok(!existsSync(resolve(root, "templates/README.md")));
  assert.deepEqual(readdirSync(resolve(root, "templates")), ["plugin.json"]);
  for (const locale of ["zh", "en"]) {
    const prompt = read("site/src/content/install-prompt." + locale + ".txt");
    assert.ok(prompt.includes("https://nexum-steward.sites.y2l.top/INSTALL.md"));
    assert.ok(prompt.includes("Nexum Steward"));
  }
  assert.match(manual, /templates\/plugin\.json/);
  assert.match(manual, /Git Tag/);
  assert.match(manual, /\.app\.json/);
  assert.match(manual, /project\.list/);
  assert.match(manual, /不在聊天中索取/);
});
