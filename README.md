# Nexum Steward

**基于 Nexum 的 AI 原生 Linux 服务器运维与 Docker Compose 部署插件。**

Nexum Steward 不开发新的 PaaS、运维 Web 控制台或 MCP Server，而是通过 ChatGPT 插件 Skill，复用现有 Nexum MCP 的 Agent 授权、Files 与 Process 工具，让 AI 执行用户已授权的服务器操作。

## 架构

```text
用户安装 Nexum，在目标服务器安装 Nexum Agent
  → 用户 OAuth 登录并在 Nexum 中选择授权的 Agent
  → ChatGPT（Nexum Steward 插件 / Skill）
  → Nexum Cloud（账号、Grant、稳定 Agent ID 授权）
  → 目标 Nexum Agent（现有 Project / Files / Process）
  → Docker Compose（部署、维护、日志）
```

Agent 名称是用户可读的识别约定（如 `prod-app-01`），**不构成权限凭证**。真实权限由当前 OAuth Grant、Agent ID 和目标机器的 OS 权限决定。

## 当前状态

**仅完成工程初始化时，本项目尚不具备已验证的生产服务器部署能力。**

| 已建立 | 尚需实证或实施的功能 |
| --- | --- |
| 项目规范、需求、技术设计与开发记录 | 真实 Nexum MCP 插件绑定与安装 |
| Skill 插件骨架与本地结构检查 | 目标服务器 Docker Compose 端到端部署 |
| ChatGPT Project Instructions 模板；维护者已在个人账户配置项目 | 各用户自己的 Project 设置、插件安装与 Nexum MCP 绑定验收 |

不预装工具、不修改现有 Nexum 主仓库、不在服务器执行部署。

## 本地检查

在本地仓库根目录运行：

```sh
node --test tests/plugin.test.mjs
git status --short --branch
```

使用当前已核实的 Node.js 24，无第三方包依赖。此检查只覆盖初始化结构，不代表 Skill 的模型行为或服务器运维已经验证。

## 代码与文档

- `docs/requirements.md`：目标、验收、非目标
- `docs/design.md`：Nexum / ChatGPT / Docker Compose 职责边界
- `docs/development/01-initialization.md`：当前交付状态
- `docs/chatgpt-project.md`：同名 ChatGPT 开发 Project 的指令维护源
- `skills/nexum-steward/SKILL.md`：实际 Agent 面向运维能力的 Skill
- `.codex-plugin/plugin.json`：当前可打包的最小插件声明
- `AGENTS.md`：仓库工程规则

Nexum 源仓库与本项目独立维护；本仓库不假设其本地绝对路径，也不将其作为插件的运行时依赖。
