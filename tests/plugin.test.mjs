import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { resolve, dirname, relative, sep } from "node:path";
import { tmpdir } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFileSync(resolve(root, path), "utf8");

// 检查本包 Markdown 链接构成的资源图；不证明模型实际加载或遵守资源。
function reachableResources(packageRoot, entry) {
  const visited = new Set();
  function visit(path) {
    const local = relative(packageRoot, path);
    assert.ok(local && local !== ".." && !local.startsWith(`..${sep}`) && !local.startsWith(sep),
      `resource outside package: ${path}`);
    let cursor = packageRoot;
    for (const part of local.split(sep)) {
      assert.ok(readdirSync(cursor).includes(part), `missing or case-mismatched resource: ${local}`);
      cursor = resolve(cursor, part);
    }
    assert.ok(statSync(path).isFile(), `resource is not a file: ${local}`);
    if (visited.has(path)) return;
    visited.add(path);
    assert.ok(readFileSync(path).length > 0, `empty resource: ${local}`);
    if (!/\.md(?:\.tmpl)?$/i.test(path)) return;
    const body = readFileSync(path, "utf8");
    for (const [, target] of body.matchAll(/\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(target)) continue;
      const resource = decodeURIComponent(target.split(/[?#]/, 1)[0]);
      if (resource) visit(resolve(dirname(path), resource));
    }
  }
  visit(resolve(packageRoot, entry));
  return visited;
}

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

test("插件模板不预设 MCP 连接", () => {
  assert.ok(!existsSync(resolve(root, "templates/mcp.json")));
});

test("共用规范、初始化、诊断与部署 Skill 均位于 ChatGPT 插件包的 skills/ 下", () => {
  assert.deepEqual(readdirSync(resolve(root, "templates/skills")).sort(), ["steward-deploy", "steward-doctor", "steward-setup", "steward-spec"]);
  assert.deepEqual(readdirSync(resolve(root, "templates/skills/steward-spec")), ["SKILL.md"]);
  assert.deepEqual(readdirSync(resolve(root, "templates/skills/steward-doctor")), ["SKILL.md"]);
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
  assert.match(setup, /非敏感 `.env` 可以提交/);
  assert.match(setup, /按内容分类/);
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
    assert.match(body, /^---\nname: [^\n]+\ndescription: [^\n]+\n---\n/);
    assert.ok(`${manifest.name}:${name}`.length <= 64, `skill identity too long: ${name}`);
    reachableResources(resolve(root, "templates"), `skills/${name}/SKILL.md`);
  }
  const doctorResources = reachableResources(resolve(root, "templates"), "skills/steward-doctor/SKILL.md");
  assert.ok(doctorResources.has(resolve(root, skillsRoot, "steward-spec/SKILL.md")));
});

test("资源图校验递归引用，并拒绝缺失、大小写不符及包外路径", () => {
  const fixture = mkdtempSync(resolve(tmpdir(), "steward-resources-"));
  try {
    mkdirSync(resolve(fixture, "references"));
    writeFileSync(resolve(fixture, "SKILL.md"), "[branch](references/branch.md#details)\n[external](https://example.invalid/a.md)\n[anchor](#local)");
    writeFileSync(resolve(fixture, "references/branch.md"), "[leaf](leaf.md)\n[cycle](../SKILL.md)");
    writeFileSync(resolve(fixture, "references/leaf.md"), "Leaf");
    assert.equal(reachableResources(fixture, "SKILL.md").size, 3);
    for (const target of ["missing.md", "Leaf.md", "../../outside.md"]) {
      writeFileSync(resolve(fixture, "references/branch.md"), `[broken](${target})`);
      assert.throws(() => reachableResources(fixture, "SKILL.md"),
        /missing or case-mismatched resource|resource outside package/);
    }
  } finally {
    rmSync(fixture, { recursive: true, force: true });
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

test("产品文档与诊断场景可定位", () => {
  for (const path of [
    "README.md", "AGENTS.md", "docs/requirements.md",
    "docs/design.md", "docs/development/02-chatgpt-plugin-and-website.md",
    "docs/development/03-steward-doctor.md", "tests/steward-doctor-scenarios.md",
    "docs/development/04-steward-deploy.md", "tests/steward-deploy-scenarios.md"
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
  assert.match(manual, /skills\/steward-doctor\/SKILL\.md/);
  assert.match(manual, /skills\/steward-deploy\/SKILL\.md/);
  assert.match(manual, /references\/upgrade\.md/);
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


function filesUnder(path) {
  return readdirSync(path).flatMap(name => {
    const child = resolve(path, name);
    return statSync(child).isDirectory() ? filesUnder(child) : [child];
  });
}

test("四技能的全部递归资源均有加载入口且包内无空资源", () => {
  const packageRoot = resolve(root, "templates");
  const names = readdirSync(resolve(packageRoot, "skills"));
  const reachable = new Set(names.flatMap(name => [...reachableResources(packageRoot, `skills/${name}/SKILL.md`)]));
  assert.deepEqual([...reachable].sort(), filesUnder(resolve(packageRoot, "skills")).sort());
  const deploy = reachableResources(packageRoot, "skills/steward-deploy/SKILL.md");
  assert.ok(deploy.has(resolve(packageRoot, "skills/steward-spec/SKILL.md")));
  assert.ok(deploy.has(resolve(packageRoot, "skills/steward-deploy/references/upgrade.md")));
});

test("资源图递归校验输出模板内的引用并拒绝空资源", () => {
  const fixture = mkdtempSync(resolve(tmpdir(), "steward-template-"));
  try {
    mkdirSync(resolve(fixture, "assets"));
    writeFileSync(resolve(fixture, "SKILL.md"), "[template](assets/report.md.tmpl)");
    writeFileSync(resolve(fixture, "assets/report.md.tmpl"), "[detail](../detail.md)");
    writeFileSync(resolve(fixture, "detail.md"), "Nonempty");
    assert.equal(reachableResources(fixture, "SKILL.md").size, 3);
    writeFileSync(resolve(fixture, "detail.md"), "");
    assert.throws(() => reachableResources(fixture, "SKILL.md"), /empty resource/);
    writeFileSync(resolve(fixture, "assets/report.md.tmpl"), "[detail](../Detail.md)");
    assert.throws(() => reachableResources(fixture, "SKILL.md"), /missing or case-mismatched/);
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

// 只校验可读文本合同，不是授权、Docker 或模型行为的执行器。
function validateDeployContract(body) {
  for (const letter of "ABCDEFGHIJ") {
    assert.match(body, new RegExp(`^\\| ${letter} [^|]+\\| .+ \\|$`, "m"), `missing plan item ${letter}`);
  }
  for (const rule of [
    /只请求计划则.*停止/, /同一组输入/, /修订.*确认/, /首次可能改变持久数据/,
    /所有 Docker Daemon 请求前/, /远程\/未知归属停止/,
    /不能安全中断且剩余授权不足则不启动/, /异步提交成功当操作完成/,
    /超时、断连或未知先查询/, /不默认 kill/, /不盲目重放初始化或迁移/,
    /不 dump env/, /创建凭据/, /共享资源/, /不自建锁服务/,
    /pass \/ fail \/ blocked \/ not run/, /complete \/ partial \/ failed \/ blocked/,
    /凭证交接未完或撤销失败不得隐去/
  ]) assert.match(body, rule);
}

test("deploy 计划与执行报告保留必需边界，删除关键字段会被拒绝", () => {
  const body = read("templates/skills/steward-deploy/SKILL.md");
  validateDeployContract(body);
  for (const letter of "ABCDEFGHIJ") {
    const mutated = body.replace(new RegExp(`^\\| ${letter} [^\\n]+\\n`, "m"), "");
    assert.throws(() => validateDeployContract(mutated), /missing plan item/);
  }
  assert.throws(() => validateDeployContract(body.replace("所有 Docker Daemon 请求前", "检查完成后")));
  assert.throws(() => validateDeployContract(body.replace("不能安全中断且剩余授权不足则不启动", "剩余时间不足仍执行")));
  const upgrade = read("templates/skills/steward-deploy/references/upgrade.md");
  assert.match(upgrade, /官方资料/);
  assert.match(upgrade, /中间版本/);
  assert.match(upgrade, /首次启动.*自动迁移/);
  assert.match(upgrade, /复制正在写入的数据库目录不能证明一致备份/);
  assert.match(upgrade, /容器镜像降级与数据恢复分开/);
});

test("data 偏好及例外在共用真源和独立环境输出中一致", () => {
  for (const path of ["templates/skills/steward-spec/SKILL.md", ...["dev", "qa", "pro", "prod"].map(env => `templates/skills/steward-setup/assets/AGENTS.${env}.md`)]) {
    const body = read(path);
    assert.ok(body.includes("Services Root/<单元名>/data"), path);
    assert.match(body, /bind mount/);
    assert.match(body, /默认优先/);
    assert.match(body, /例外/);
    assert.match(body, /不.*迁移/);
    assert.match(body, /data 不进入配置 Git/);
  }
  assert.match(read("templates/skills/steward-setup/assets/AGENTS.dev.md"), /构建镜像/);
  assert.match(read("templates/skills/steward-deploy/SKILL.md"), /首版不构建源码/);
});

test("独立请求与判定分离，场景 ID 唯一且正负边完整可定位", () => {
  const input = JSON.parse(read("tests/fixtures/steward-deploy/requests.json"));
  const oracle = read("tests/steward-deploy-scenarios.md");
  assert.equal(input.schemaVersion, 1);
  assert.equal(input.cases.length, 50);
  assert.equal(new Set(input.cases.map(c => c.id)).size, input.cases.length);
  assert.equal(input.cases.filter(c => c.id.startsWith("P")).length, 4);
  for (const entry of input.cases) {
    assert.ok(entry.request.length > 5, entry.id);
    assert.ok(Object.keys(entry.fixture).length > 0, entry.id);
    assert.ok(oracle.includes(`| ${entry.id} |`), entry.id);
    for (const forbidden of ["expected", "expectedStatus", "allowed", "forbidden", "answer", "continuation"])
      assert.equal(entry[forbidden] ?? entry.fixture[forbidden], undefined, `${entry.id}: oracle leaked`);
  }
  assert.match(oracle, /不提供给执行模型/);
  assert.match(oracle, /当前均 not run/);
});


test("配置 Git 明确目标、内容分类、同步授权与失败分层", () => {
  const spec = read("templates/skills/steward-spec/SKILL.md");
  for (const rule of [
    /不是业务数据备份/, /不强制一机一库/, /受管子路径/, /owner\/org/,
    /非敏感.*运维变更记录/, /不按 `.env` 文件名一刀切/, /解密密钥不与密文同库/,
    /逐次取得适用确认/, /不假装已加密/, /检查实际 staged diff/,
    /及时推送.*核对远端包含提交/, /推送失败保留本地提交/, /业务已验证与远程未同步分别表达/
  ]) assert.match(spec, rule);
  assert.doesNotMatch(spec, /不要自动配置远程仓库或推送/);
  const setup = read("templates/skills/steward-setup/SKILL.md");
  assert.match(setup, /尚未分类的文件先不暂存/);
  assert.match(setup, /新增忽略规则不证明历史已清理/);
  assert.doesNotMatch(setup, /不自动设置 Remote、提交或推送/);
  for (const env of ["dev", "qa", "pro", "prod"]) {
    const generated = read(`templates/skills/steward-setup/assets/AGENTS.${env}.md`);
    for (const rule of [/不是数据备份/, /owner\/org/, /按内容判断 `.env`/, /密钥不与密文同库/, /实际 staged diff/, /授权内及时推送/, /失败保留提交/, /分报修改\/提交\/同步与业务验证/]) assert.match(generated, rule);
    assert.doesNotMatch(generated, /不自动推送远程 Git/);
  }
  const deploy = read("templates/skills/steward-deploy/SKILL.md");
  assert.match(deploy, /执行 spec 的配置 Git/);
  assert.match(deploy, /远端留档是否为必需交付/);
  assert.match(read("templates/skills/steward-doctor/SKILL.md"), /不写服务器文件、运维日志或配置 Git 提交/);
});


test("个人规范显式加载契约覆盖复用、身份变化与缺失分支", () => {
  const spec = read("templates/skills/steward-spec/SKILL.md");
  for (const rule of [/实际 OS 执行用户/, /不依赖个人文件已经加载/, /本次上下文已含完整适用内容/, /实际可用工具显式读取/, /不只取 Services Root/, /目标\/用户变化/, /不将文件提升为系统指令或新授权/, /doctor 报告基线缺口/, /deploy 在关键变更前提无法确认时停止/]) assert.match(spec, rule);
  for (const name of ["setup", "doctor", "deploy"]) {
    const body = read(`templates/skills/steward-${name}/SKILL.md`);
    assert.match(body, /按 spec 的个人规范加载契约/);
    assert.match(body, /复用完整适用上下文或显式读取/);
  }
  assert.match(read("templates/skills/steward-setup/SKILL.md"), /保留既有定制/);
  assert.match(read("templates/skills/steward-doctor/SKILL.md"), /基线受阻分支，不修复/);
  assert.match(read("templates/skills/steward-deploy/SKILL.md"), /不以模板或记忆替代/);
});

// 仅验证可分发文本合同与场景材料，不执行或预测模型决策。
test("运维单元默认、例外与三个紧邻案例保留在共同真源", () => {
  const spec = read("templates/skills/steward-spec/SKILL.md");
  const rules = spec.split("### 运维单元、目录与 Compose 归属\n")[1]?.split("### 配置 Git：")[0];
  assert.ok(rules, "unit rules must be adjacent to Services Root and Git rules");
  for (const rule of [
    /按用途、生命周期及变更影响边界划分，不等于单容器/,
    /默认一个运维单元直接位于 `Services Root\/<单元名>\/`/,
    /默认每个独立单元使用独立且稳定的 Compose 项目身份/,
    /共享数据库应有独立归属/, /配置文件.*合并顺序.*相对路径基准/,
    /共享网络、入口和存储.*创建\/维护归属、消费者及变更影响/,
    /不强制一张全局网络/, /不强制预建.*空目录/,
    /已有外部路径、已有卷或软件要求.*例外/,
    /不得把新默认原则倒推为旧部署违规/, /不新增逐目录审批/,
    /以下名称和路径.*不是固定模板/
  ]) assert.match(rules, rule);
  assert.deepEqual([...rules.matchAll(/^\d\. \*\*(.+?)\*\*/gm)].map(m => m[1]),
    ["caddy / frpc / hello 独立运维", "myapp + 专用 postgres / redis", "已有 edge 集中栈"]);
  for (const name of ["caddy", "frpc", "hello", "myapp", "edge"])
    assert.ok(rules.includes(`Services Root/${name}/compose.yaml`), name);
  assert.match(spec, /按内容与用途分类，不仅凭目录名判定/);
  assert.match(spec, /证书及其私钥、秘密.*运行状态与业务数据/);
});

test("单元规则进入原计划字段与四份独立环境输出，不改变职责", () => {
  const deploy = read("templates/skills/steward-deploy/SKILL.md");
  validateDeployContract(deploy);
  const rows = [...deploy.matchAll(/^\| ([A-J]) ([^|]+)\| (.+) \|$/gm)];
  assert.equal(rows.length, 10, "retain exactly A-J, no per-directory plan gate");
  const row = letter => rows.find(m => m[1] === letter)[3];
  assert.match(row("A"), /运维单元分组理由.*专用组件与共享依赖/);
  assert.match(row("B"), /单元当前\/目标的目录.*Compose 项目名及生效来源.*既有例外.*相对路径基准/);
  assert.match(row("D"), /共享网络、入口、存储.*创建\/维护归属、消费者与变更影响/);
  const bodies = ["dev", "qa", "pro", "prod"].map(env =>
    read(`templates/skills/steward-setup/assets/AGENTS.${env}.md`));
  for (const body of bodies) {
    for (const rule of [/不等于单容器/, /默认直接使用 `Services Root\/<单元名>\/`/,
      /独立稳定的 Compose 项目身份/, /相对路径基准/, /共享数据库独立归属/,
      /创建\/维护归属、消费者和变更影响/, /不倒推旧部署违规/,
      /已有外部路径.*例外/, /按内容与用途分类/, /用户定制/]) assert.match(body, rule);
    assert.doesNotMatch(body, /每个服务使用独立目录|各服务使用独立的 Docker Compose 项目/);
  }
  assert.equal(new Set(bodies).size, 4, "preserve environment differences");
  assert.match(read("templates/skills/steward-doctor/SKILL.md"), /不自动拆分或迁移/);
  assert.match(read("templates/skills/steward-setup/SKILL.md"), /不预建.*Compose 栈.*空目录/);
});

test("单元场景独立冻结输入，判定逐一可定位且覆盖有区分度的事实", () => {
  const input = JSON.parse(read("tests/fixtures/steward-units/requests.json"));
  const oracle = read("tests/steward-unit-scenarios.md");
  const ids = input.cases.map(c => c.id);
  assert.equal(input.schemaVersion, 1);
  assert.deepEqual(ids, Array.from({ length: 9 }, (_, i) => `U0${i + 1}`));
  assert.deepEqual([...oracle.matchAll(/^\| (U\d+) \|/gm)].map(m => m[1]), ids);
  for (const entry of input.cases) {
    assert.ok(entry.request.length > 10 && Object.keys(entry.fixture).length > 0, entry.id);
    for (const forbidden of ["expected", "expectedStatus", "allowed", "forbidden", "answer", "continuation"])
      assert.equal(entry[forbidden] ?? entry.fixture[forbidden], undefined, `${entry.id}: oracle leaked`);
  }
  const fixture = id => input.cases.find(c => c.id === id).fixture;
  assert.equal(fixture("U01").lifecycle, "independent");
  assert.deepEqual(fixture("U02").postgresConsumers, ["myapp"]);
  assert.deepEqual(fixture("U03").databaseConsumers, ["myapp", "reports"]);
  assert.equal(fixture("U04").approvedMigration, false);
  assert.notEqual(fixture("U05").oldBase, fixture("U05").newBase);
  assert.ok(fixture("U05").bindSources.every(p => p.startsWith("./")));
  assert.equal(fixture("U06").networkOwner, null);
  assert.equal(fixture("U07").businessStackRequested, false);
  assert.ok(fixture("U08").files["config/private.key"]);
  assert.equal(fixture("U09").dataMoveRequested, false);
  assert.match(oracle, /不提供给执行模型/);
  assert.match(oracle, /当前均 not run/);
});
