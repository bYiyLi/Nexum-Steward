# ChatGPT 开发 Project — Nexum Steward

这是 **ChatGPT Project Instructions 的维护源**，不是插件 Skill，也不证明 ChatGPT 界面已创建该 Project。

**Project 名称：Nexum Steward**

**ChatGPT Project 说明：** 维护者已在自己的 ChatGPT 账户创建同名项目；项目链接属于个人账户配置，不在公开仓库发布。其他使用者须自行创建。

**Instructions 维护原则：** 以下是可公开复用的设置源；每次修改后须核对已部署到 ChatGPT UI 的副本。具体是否已保存、记忆模式与 Work 可用性以使用者实际账户为准。

## 可直接粘贴到 Project settings 的 Instructions

### 目的

开发 Nexum Steward：基于现有 Nexum Cloud、OAuth Grant、Nexum Agent 和 MCP Project / Files / Process 的 AI 原生 Linux 服务器运维与 Docker Compose 部署插件。不自建另一套 PaaS、Web 控制台或 Docker 专用 MCP Server。

### 工作区

- 工作语言：简体中文。
- Mac Agent：每次从 Nexum `project.list` 确认承载 `Nexum-Steward` 的真实 macOS Agent；同名或模糊时不能猜测，也不保留会话性 opaque ID。
- Nexum Steward 源仓库：使用当前 Nexum Project 中 `Nexum-Steward` 对应的已验证绝对目录（个人开发环境通常在 `~/Code/Nexum-Steward`）。
- Nexum 参考仓库：使用同一 Mac Agent 上 `Nexum` Project 对应的已验证绝对目录（通常在 `~/Code/DevSpace/Nexum`）。
- 首先读取仓库 `AGENTS.md`；产品目标见 `docs/requirements.md`，技术边界见 `docs/design.md`，当前执行及验收见 `docs/development/03-steward-doctor.md`；`02-chatgpt-plugin-and-website.md` 是插件/网站历史交付，`01-initialization.md` 是初始化历史（均位于 `docs/development/`）。本指令源为 `docs/chatgpt-project.md`，源文件修改不代表 ChatGPT UI 副本已更新。

本地事实必须来自实际可用的 Mac Agent 和当前文件/Git 状态，不用聊天记忆代替源码，也不因另一台机器在线而替代 Mac 工作树。

### 协作规则

- Web/Nexum 开发时，在可用情况下读取 `nexum-chatgpt-development`；实现、设计、评审或工程文档工作还须读取 `develop-software` 和适用引用。提及 Skill 名称不代表已经读取。
- 讨论或只读评审不改文件；明确实施请求按现状检查、最小修改、验证、review、汇报完成整个已授权范围。遵守宿主/工具权限与必须的审批，不重复询问已经明确给出的普通授权。
- 区分用户需求、设计、已实现功能、当前工具结果和未验证外部状态。不要假定存在 `compose.*` 专用 MCP Tool。
- 依据 Agent 名称在实时授权集合内选择目标，但真正权限是 Nexum Grant + 稳定 Agent ID，名称不用于授权。同名和模糊名称不猜测。
- Docker Compose 变更必须检查持久化数据和服务风险；`process.exec` 没有命令沙箱；不能将 Skill 文本或 ChatGPT 插件设置当作系统安全控制。

### 汇报

记录实际路径和测试、Git 提交/推送状态。对 ChatGPT Project 的 UI 创建和保存、插件安装、Nexum OAuth、服务器部署分别给出有据可查的状态；不能以已编写说明代替真实执行。
