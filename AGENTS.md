# Nexum Steward — 工程约定

## 真源

- 产品与验收：`docs/requirements.md`
- 架构及网站设计：`docs/design.md`
- 当前开发交付与状态：`docs/development/02-chatgpt-plugin-and-website.md`
- 初始化历史记录：`docs/development/01-initialization.md`
- ChatGPT 开发 Project Instructions 源：`docs/chatgpt-project.md`

需求定义用户承诺，设计定义边界，代码与真实运行结果证明实现，开发记录负责阶段结果。不要把规划中的功能当成已交付。

## 边界

- 工作语言：简体中文；协议、工具名、API 标识保持原文。
- **ChatGPT 插件，不是 Codex 专用插件**：插件包根目录为 `templates/`，包含最简 `plugin.json`、共用规范 `skills/steward-spec/SKILL.md` 和服务器初始化 `skills/steward-setup/SKILL.md`（四份环境 AGENTS 模板在其 `assets/` 下）。不预置 MCP 或其他业务部署 Skill；版本由 Git Tag 区分。AI 安装指南在根目录 `INSTALL.md`，安装提示词在 `site/src/content/`。不创建 `install/` 或版本目录，也不自建额外 MCP Server。
- Nexum Cloud、OAuth Grant、Nexum Agent 和 Project / Files / Process 是外部既有能力，本仓库不开发独立 PaaS、Docker 专用 MCP Server、运维 Web 控制台。
- Agent 名称用于识别，真正授权由 Nexum OAuth Grant + 稳定 Agent ID 执行；`process.exec` 以目标 OS 用户权限执行，没有命令沙箱。不能用插件文字替代后端授权、Docker 权限与持久化数据保护。
- `site/` 是**纯静态产品介绍站**，不是 Nexum Cloud 或远程执行服务。文案必须区分已验证能力与产品方向，不能对尚未发布的运维插件使用“立即安装”“正在自动运行”等误导措辞。
- 参考 KG OS 仓库的设计/Pages 架构时只读，不跨仓库复制受授权限制的代码或修改其他项目。
- 对外发布前检查个人目录、账户内部链接、认证信息及生成产物；保留未授权的用户文件改动。

## 工作流和验证

- 只读讨论/评审不改文件；明确实施请求按「检查 → 修改 → 验证 → Review → 交付」执行。不得从 Git 历史或聊天推断当前工作树。
- 项目根目录：`node --test tests/plugin.test.mjs`。
- 网站目录：`cd site && pnpm install --frozen-lockfile && pnpm check && pnpm build`，再在仓库根目录运行 `node --test tests/site.test.mjs`。
- 页面检查覆盖中英文、移动端、键盘焦点、可读性、导航和“未发布”状态。网站发布后分别核实 Actions、Pages、DNS、HTTPS，不能只因 workflow 文件存在就宣称域名已生效。
- 提交前检查 `git diff --check`、提交范围、测试、公开内容；区分修改、提交、推送、CI、Pages、域名与插件真实安装。
