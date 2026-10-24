import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(resolve(root, path), "utf8");

test("ChatGPT 插件以 templates 为包根目录，不包含 Codex 兼容包", () => {
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

test("共用规范与初始化 Skill 均位于 ChatGPT 插件包的 skills/ 下", () => {
  assert.deepEqual(readdirSync(resolve(root, "templates/skills")).sort(), ["steward-setup", "steward-spec"]);
  assert.deepEqual(readdirSync(resolve(root, "templates/skills/steward-spec")), ["SKILL.md"]);
  const skill = read("templates/skills/steward-spec/SKILL.md");
  assert.match(skill, /^---\nname: steward-spec\ndescription: .+\n---\n/);
  assert.match(skill, /steward-<节点名称>-<env>-ops/);
  for (const env of ["dev", "qa", "pro", "prod"]) {
    assert.ok(skill.includes(`\`${env}\``), `missing environment: ${env}`);
  }
  assert.match(skill, /一个 Steward Agent 只对应一个环境/);
  assert.doesNotMatch(skill, /steward-<节点名称>-ops/);
  assert.match(skill, /project\.list/);
  assert.match(skill, /OAuth Grant/);
  assert.match(skill, /Services Root/);
  assert.match(skill, /个人 AGENTS\.md/);
  assert.match(skill, /ISO 8601/);
  assert.match(skill, /已有文件中的其他用户指令和结构不得/);
});

test("steward-setup 覆盖环境初始化且不承担业务服务部署", () => {
  assert.deepEqual(readdirSync(resolve(root, "templates/skills/steward-setup")).sort(), ["SKILL.md", "assets"]);
  const setup = read("templates/skills/steward-setup/SKILL.md");
  assert.match(setup, /^---\nname: steward-setup\ndescription: .+\n---\n/);
  for (const expected of [
    "steward-spec", "project.list", "project.open", "docker compose",
    "python3.12", "Services Root", "df", "lsblk", "findmnt",
    ".gitignore", "logs/YYYY-MM-DD.md", "~/.agents/AGENTS.md",
    "## 服务器信息", "## 管理运维规范"
  ]) assert.ok(setup.includes(expected), `missing setup contract: ${expected}`);
  assert.match(setup, /不预建.*业务服务目录/);
  assert.match(setup, /\*\*\/\.env/);
  assert.match(setup, /\*\*\/\.env\.\*/);
  assert.match(setup, /\*\*\/data\//);
  assert.match(setup, /不得用.*process\.exec.*绕过.*授权拒绝/);
  assert.match(setup, /重新.*project\.open.*刷新 Context/);
  assert.match(setup, /authorization_required/);
  assert.match(setup, /原有指令/);
  assert.match(setup, /无法读取.*暂停/);
  assert.match(setup, /运行所需的 Nexum Project \/ Files \/ Process Tools 或连接不可用时/);
  assert.match(setup, /上层已经是其他 Git 工作区/);
  assert.match(setup, /不把命令输出或带有指令内容的文本原样拼入规范/);
});

test("可移植 Skill 的标识和引用资源均可定位", () => {
  const manifest = JSON.parse(read("templates/plugin.json"));
  const skillsRoot = "templates/skills";
  for (const name of readdirSync(resolve(root, skillsRoot))) {
    const body = read(`${skillsRoot}/${name}/SKILL.md`);
    assert.match(body, new RegExp(`^---\\nname: ${name}\\n`));
    assert.ok(`${manifest.name}:${name}`.length <= 64, `skill identity too long: ${name}`);
  }
  const setup = read(`${skillsRoot}/steward-setup/SKILL.md`);
  const setupRoot = resolve(root, skillsRoot, "steward-setup");
  for (const [, link] of setup.matchAll(/\]\(([^)]+\.md)\)/g)) {
    assert.ok(existsSync(resolve(setupRoot, link)), `missing linked resource: ${link}`);
  }
});

test("四份环境 AGENTS 模板只包含相应的运维规范片段", () => {
  const assets = "templates/skills/steward-setup/assets";
  const environments = ["dev", "qa", "pro", "prod"];
  assert.deepEqual(
    readdirSync(resolve(root, assets)).sort(),
    environments.map(env => `AGENTS.${env}.md`).sort()
  );
  const texts = environments.map(env => read(`${assets}/AGENTS.${env}.md`));
  for (const [index, body] of texts.entries()) {
    assert.ok(body.startsWith("## 管理运维规范\n"), environments[index]);
    assert.deepEqual(body.match(/^## .+$/gm), ["## 管理运维规范"], environments[index]);
    assert.ok(!body.includes("## 服务器信息"), environments[index]);
    assert.match(body, /Services Root/);
    assert.match(body, /logs\/YYYY-MM-DD\.md/);
    assert.ok(body.includes("### <ISO 8601 时间> · <目标>"), `missing log format: ${environments[index]}`);
    assert.match(body, /未提交/);
    assert.match(body, /Git/);
    const example = `# Nexum Steward\n\n## 服务器信息\n\n- Services Root: /srv/demo\n\n${body}`;
    assert.deepEqual(example.match(/^## .+$/gm), ["## 服务器信息", "## 管理运维规范"]);
    assert.ok(Buffer.byteLength(example, "utf8") < 32 * 1024, environments[index]);
  }
  assert.match(texts[0], /快速迭代/);
  assert.match(texts[1], /测试基线/);
  assert.match(texts[2], /发布演练/);
  assert.match(texts[2], /不猜测生产配置或访问未授权的生产 Agent/);
  assert.match(texts[3], /生产变更/);
  assert.equal(new Set(texts).size, 4);
});

test("产品文档区分规范 Skill 与尚未交付的运维 Skill", () => {
  for (const path of [
    "README.md", "AGENTS.md", "docs/requirements.md",
    "docs/design.md", "docs/development/02-chatgpt-plugin-and-website.md"
  ]) assert.ok(read(path).length > 200, path);
  assert.match(read("docs/requirements.md"), /steward-spec/);
  assert.match(read("docs/design.md"), /steward-spec/);
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
  assert.deepEqual(readdirSync(resolve(root, "templates")).sort(), ["plugin.json", "skills"]);
  for (const locale of ["zh", "en"]) {
    const prompt = read("site/src/content/install-prompt." + locale + ".txt");
    assert.ok(prompt.includes("https://nexum-steward.sites.y2l.top/INSTALL.md"));
    assert.ok(prompt.includes("Nexum Steward"));
  }
  assert.match(manual, /templates\//);
  assert.match(manual, /skills\/steward-spec\/SKILL\.md/);
  assert.match(manual, /skills\/steward-setup\/SKILL\.md/);
  assert.match(manual, /Git Tag/);
  assert.match(manual, /\.app\.json/);
  assert.match(manual, /project\.list/);
  assert.match(manual, /不在聊天中索取/);
});

test("本机 Docker 边界随独立生成的个人规范分发", () => {
  const spec = read("templates/skills/steward-spec/SKILL.md");
  const setup = read("templates/skills/steward-setup/SKILL.md");
  assert.match(spec, /本机 Docker/);
  assert.match(setup, /endpoint/);
  for (const env of ["dev", "qa", "pro", "prod"]) {
    const generated = "# Nexum Steward\n\n## 服务器信息\n\nServices Root: /srv/example\n\n"
      + read(`templates/skills/steward-setup/assets/AGENTS.${env}.md`);
    assert.deepEqual(generated.match(/^## .+$/gm), ["## 服务器信息", "## 管理运维规范"]);
    assert.match(generated, /本机 Docker Engine/);
    assert.match(generated, /endpoint/);
    assert.match(generated, /远程或无法确认/);
  }
  assert.ok(existsSync(resolve(root, "tests/steward-setup-scenarios.md")));
  // 这是边界文本与产物存在检查，不是 Docker 目标识别的行为测试。
});
