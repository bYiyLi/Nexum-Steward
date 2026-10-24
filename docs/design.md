# Nexum Steward — 产品与网站设计

## 1. 正确的产品边界

```text
用户 → ChatGPT (Nexum Steward 插件)
              │
              │ 现有 Nexum MCP / OAuth
              ▼
        Nexum Cloud ── Grant（稳定 Agent ID 集合）
              │
              ▼
        Nexum Agent（部署在 Linux 服务器）
              │
              └── 已有 Project / Files / Process
                        └── Docker Compose（Linux 宿主机）
```

Nexum Steward 是 ChatGPT 上的插件产品，而不是 Codex 本地插件、服务器控制面板或 Docker 专用 MCP 服务。用户可使用 Agent 名称与 ChatGPT 沟通，但最终权限由 Nexum Cloud 的 owner/Grant/稳定 Agent ID 逐次执行。Nexum `process.exec` 不提供命令沙箱，允许根目录不等于 OS Shell 的能力边界；部署涉及 Docker socket 的高权限风险必须独立处理。

当前另行增加 `steward-spec` 共用规范与 `steward-setup` 服务器环境初始化 Skill；尚未交付业务部署与日常运维 Skill，也未完成真实服务器初始化验收。

## 2. ChatGPT 插件模板与安装入口

依据 OpenAI [插件打包文档](https://developers.openai.com/plugins/build/plugins) 与 Agent Plugins 1.0：

- `templates/` 是可移植 ChatGPT Plugin 的包根目录，包含最简 `plugin.json`、`skills/steward-spec/SKILL.md` 和 `skills/steward-setup/SKILL.md`；初始化 Skill 的四份环境模板位于其 `assets/`。符合插件根目录 `skills/<skill-name>/SKILL.md` 的发现约定。不预置 MCP、Hooks 或业务部署 Skill。
- `steward-spec` 规定运维 Agent 使用 `steward-<节点名称>-<env>-ops`；`env` 只能是 `dev`、`qa`、`pro`（预生产）、`prod`。一个 Agent 对应一个环境，环境直接由 Agent 名称确定；命名只是识别约定，不产生 Nexum Grant 权限。
- 共用 Services Root 由用户在核实存储状态后选定绝对路径，**所选路径即根目录**，不追加 `services/`。根目录内用本地 Git 管理非敏感服务配置、用 `logs/YYYY-MM-DD.md` 记录重要运维操作；不向配置 Git 提交明文秘密、运行数据或备份。
- `steward-setup` 的唯一职责是初始化目标 Linux 服务器环境：识别授权 Agent，检查并按需准备 Docker Engine / Compose Plugin、Python 3.12、必要运维工具；创建或复用 Services Root 的 Git 和日志；在当前 Agent OS 用户的 `~/.agents/AGENTS.md` 中组合动态服务器信息与对应环境模板，并核实 Nexum Context 实际发现。首次或重复初始化均不得覆盖既有数据和指令；不预部署业务容器。
- 新建个人 `AGENTS.md` 只设 `## 服务器信息` 与 `## 管理运维规范` 两个二级区域。前者按当前服务器实际情况动态生成，不使用固定资产字段表；后者由 dev、qa、pro、prod 四份环境模板提供不同的运维行为规则。已有个人文件保留其他正文、章节与用户定制，仅安全合并可定位的 Steward 内容，不能为满足新建格式删除或重排原有指令。
- `INSTALL.md` 位于仓库根目录，作为 AI Agent 的安装指南；`site/src/content/install-prompt.zh.txt` 与 `install-prompt.en.txt` 为官网展示的安装提示词。官网静态构建直接从根目录指南生成 `/INSTALL.md`，无须维护第二份副本。
- 不建立 `install/`、`templates` 版本子目录、打包脚本或额外的 MCP Server；发行历史使用 **Git Tag** 而不是目录路径体现。
- 用户的现有 Nexum MCP 应用以及 OAuth Grant 由真实 ChatGPT/Nexum 平台管理。模板本身没有预授予任何 Agent 权限，也不能以提示词替代真实授权。插件实际创建、绑定、安装及工具调用仍须独立核验。

## 3. Agent 选择与部署边界（后续验证目标）

- 对实时 `project.list` 仅在当前 Grant 可见的 Agents 中匹配显示名称；不允许从名称推断 opaque ID；同名、不可见与离线均不能擅自切换目标。
- 使用实际 `project.open` 返回的 `contextId`，依现有 Files / Process 实现运行目标上的 Docker Compose；没有 `compose.*` 专属 MCP Tools。
- Docker Compose 操作前关注配置、端口、已运行服务、网络、数据卷、Secret；后检验命令终态、容器和应用健康。破坏性数据操作不由普通部署意图自动授权。
- 本节是**产品接口目标**，不能以文档已写证明已经完成真实运维能力。

### 本机 Docker 目标约束

Agent 身份核验与 Docker Daemon 归属核验是两个不同条件：在目标 Agent 上运行 CLI，并不证明 CLI 连接了该机 Engine。按实际命令的参数、环境变量与 context 确定生效 endpoint，再用本机 Daemon/连接端点归属证据确认，不仅凭名称、路径或命令成功判断。本机 rootless Engine 可以使用其真实端点，不固定要求默认 socket。

远程或未知归属时，不向该 Daemon 发起检查或变更请求，也不自动永久修改 context 或清除连接设置；报告阻塞与重新进入条件。执行身份或连接条件变化后重新核验。仅不依赖 Docker 且已获授权的工作可以继续。规则由 steward-spec 持有，setup 在准备和验收处执行；四份环境模板保留简短边界，因为生成的个人 AGENTS.md 会独立使用。

## 4. 产品官网

- 网站责任：介绍产品愿景、用户授权流程、安全边界、开发状态、公开源码；**不运行控制面服务，不接受凭证**。
- 参考 KG OS 源仓库的 `distribution/site/`：其 Astro 静态构建、响应式布局、双语、深浅主题与 GitHub Pages Actions 发布方式。仅借鉴工程模式与结构，不直接复制其带许可的源文件。
- 本项目网站位于 `site/`，Astro 静态输出 `site/dist/`；简体中文默认 `/`，英文 `/en/`。
- 安装引导页面为 `/install/` 和 `/en/install/`，只展示与复制站点源文件中的安装提示词；AI 指南统一从仓库根目录 `INSTALL.md` 生成网页可访问的 `/INSTALL.md`。
- GitHub Actions 工作流从 `main` 构建，`actions/upload-pages-artifact` 仅发布 `site/dist`，`actions/deploy-pages` 部署。静态站不加载服务器机密与私有 Nexum 源码。
- 自定义域名：`nexum-steward.sites.y2l.top`；沿用已有 DNSPod `*.sites.y2l.top` → `byiyli.github.io` 泛解析。**仍需为本 GitHub Pages 仓库单独绑定精确域名**（Pages `cname`）并验证 HTTPS。通配符 DNS 不会自动把不同项目路由到不同仓库，也不能代替 GitHub Pages 站点绑定；GitHub 官方不建议直接使用通配符指向 Pages，需关注域名接管风险，后续可改为自动化管理精确 DNS 记录。
- 只对真实已交付的事实说“已完成”；规划中的部署、自动诊断和 Skill 必须以“设计方向 / 开发中”展示。

## 5. 不属于网站的系统

官网与 ChatGPT 产品插件相互独立：Pages 不接收 OAuth 回调，不调用用户 MCP，不收集服务器登录信息，不能作为运营后台。真实插件分发、身份映射、多账户 OAuth 与运维闭环将在后续阶段由 ChatGPT/Nexum 实测后确认。

本项目当前未选定开源许可证，不能从公开仓库可见性推出可再分发许可。
