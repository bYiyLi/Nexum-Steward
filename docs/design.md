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

现阶段只定义连接与产品边界，**不定义产品 Skill 及其自动化工作流**。

## 2. ChatGPT 插件包

依据 OpenAI 当前 [插件打包文档](https://developers.openai.com/plugins/build/plugins) 与 Agent Plugins 1.0：

- `plugin.json` 放在项目根目录，使用 `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`。
- `mcp.json` 放在根目录，使用 `https://agent-plugins.org/schemas/1.0.0/mcp.schema.json`，声明 `streamable-http` 连接 `https://nexum.y2l.top/mcp`。现行公开 MCP JSON Schema 不接受服务器条目上的 `extensions` 字段，因此此基础包保持最小可校验格式；OAuth 能否在 ChatGPT 安装时正确发现和完成授权仍须平台实测。
- **没有** `.codex-plugin/plugin.json`、`skills/`、`SKILL.md`、Hooks 或本地可执行文件。
- 公共包不包含用户 Token；OAuth 在 ChatGPT 与 Nexum 之间完成。Nexum `/mcp` 未认证访问返回 `401` 和 OAuth 发现入口已从实际公开端点核实（2026-10-23）。
- `mcp.json` 是用户可分发的可移植声明，**不代表已完成 ChatGPT 实际安装、Grant 选择或连接验收**；ChatGPT 注册的具体插件 identity/技术 ID 必须由真实平台操作获取，不能在代码中虚构。

## 3. Agent 选择与部署边界（后续验证目标）

- 对实时 `project.list` 仅在当前 Grant 可见的 Agents 中匹配显示名称；不允许从名称推断 opaque ID；同名、不可见与离线均不能擅自切换目标。
- 使用实际 `project.open` 返回的 `contextId`，依现有 Files / Process 实现运行目标上的 Docker Compose；没有 `compose.*` 专属 MCP Tools。
- Docker Compose 操作前关注配置、端口、已运行服务、网络、数据卷、Secret；后检验命令终态、容器和应用健康。破坏性数据操作不由普通部署意图自动授权。
- 本节是**产品接口目标**，不能以文档已写证明已经完成真实运维能力。

## 4. 产品官网

- 网站责任：介绍产品愿景、用户授权流程、安全边界、开发状态、公开源码；**不运行控制面服务，不接受凭证**。
- 参考 KG OS 源仓库的 `distribution/site/`：其 Astro 静态构建、响应式布局、双语、深浅主题与 GitHub Pages Actions 发布方式。仅借鉴工程模式与结构，不直接复制其带许可的源文件。
- 本项目网站位于 `site/`，Astro 静态输出 `site/dist/`；简体中文默认 `/`，英文 `/en/`。
- GitHub Actions 工作流从 `main` 构建，`actions/upload-pages-artifact` 仅发布 `site/dist`，`actions/deploy-pages` 部署。静态站不加载服务器机密与私有 Nexum 源码。
- 自定义域名：`nexum-steward.sites.y2l.top`；沿用已有 DNSPod `*.sites.y2l.top` → `byiyli.github.io` 泛解析。**仍需为本 GitHub Pages 仓库单独绑定精确域名**（Pages `cname`）并验证 HTTPS。通配符 DNS 不会自动把不同项目路由到不同仓库，也不能代替 GitHub Pages 站点绑定；GitHub 官方不建议直接使用通配符指向 Pages，需关注域名接管风险，后续可改为自动化管理精确 DNS 记录。
- 只对真实已交付的事实说“已完成”；规划中的部署、自动诊断和 Skill 必须以“设计方向 / 开发中”展示。

## 5. 不属于网站的系统

官网与 ChatGPT 产品插件相互独立：Pages 不接收 OAuth 回调，不调用用户 MCP，不收集服务器登录信息，不能作为运营后台。真实插件分发、身份映射、多账户 OAuth 与运维闭环将在后续阶段由 ChatGPT/Nexum 实测后确认。

本项目当前未选定开源许可证，不能从公开仓库可见性推出可再分发许可。
