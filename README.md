# Nexum Steward

**将服务器运维交给 ChatGPT，把执行权限留在 Nexum。**

Nexum Steward 是面向 **ChatGPT** 的 Linux 服务器运维与 Docker Compose 服务部署插件。Docker 管理范围仅限目标 Nexum Agent 所在服务器的本机 Engine，不支持远程 Daemon。用户先安装 Nexum，在目标 Linux 服务器安装 Nexum Agent，并在 Nexum OAuth Grant 中明确选择可管理的 Agent；插件通过既有 Nexum MCP 调用 Project / Files / Process 工具，无须另建 PaaS、Docker 专用 MCP Server 或 Web 运维后台。

> **当前状态：私人插件模板、`steward-spec`、`steward-setup`、`steward-doctor` 与 `steward-deploy` 已写入源码，尚未完成 ChatGPT 安装/发现、独立模型行为及真实 Linux 初始化/诊断/部署验收。** doctor 只诊断并交付报告，不自动修复；deploy 先规划确认再变更，首版只使用现成镜像或已有 Compose，不构建源码。模板不预置 MCP 连接；用户需在自己的账户创建、安装并验证插件，连接与授权由现有 Nexum 应用处理。

## 产品网站

**https://nexum-steward.sites.y2l.top** · [GitHub](https://github.com/bYiyLi/Nexum-Steward)

**[私人 ChatGPT Plugin 安装引导](https://nexum-steward.sites.y2l.top/install/)** · [AI Agent 安装指南](INSTALL.md)

官网位于 [site/](site/)，采用居中首屏、统一内容宽度与单一蓝色强调，中英与深浅主题均可用。安装页直接提供短提示词；ChatGPT 按单一指南识别现状，选择首次、更新或无需变更。安装能力取决于账户与工作区，安装流程不执行服务器运维。

## 插件结构

| 文件 | 作用 |
| --- | --- |
| [templates/plugin.json](templates/plugin.json) | 最简 ChatGPT 插件清单，不预设 MCP 连接 |
| [templates/skills/steward-spec/SKILL.md](templates/skills/steward-spec/SKILL.md) | Steward 共用规范：Agent 命名、Services Root 与个人 AGENTS.md |
| [templates/skills/steward-setup/SKILL.md](templates/skills/steward-setup/SKILL.md) | 服务器环境初始化 Skill：软件准备、服务根目录、Git、日志和个人 AGENTS.md |
| [templates/skills/steward-setup/assets/](templates/skills/steward-setup/assets/) | dev、qa、pro、prod 四份环境运维规范模板 |
| [templates/skills/steward-doctor/SKILL.md](templates/skills/steward-doctor/SKILL.md) | 环境体检、指定对象或症状诊断；只读取证并报告，不自动修复 |
| [templates/skills/steward-deploy/SKILL.md](templates/skills/steward-deploy/SKILL.md) | 服务首次部署、升级、配置调整与安全续作；计划确认、过程控制及分层验收 |
| [INSTALL.md](INSTALL.md) | AI Agent 使用的私人插件安装指南 |
| [site/](site/) | 产品官网（GitHub Pages 静态站） |
| [docs/requirements.md](docs/requirements.md) | 需求与验收边界 |
| [docs/design.md](docs/design.md) | 插件和网站技术设计 |
| [docs/development/05-website-and-installation.md](docs/development/05-website-and-installation.md) | 当前官网与安装入口计划、视觉和交付证据 |
| [docs/development/04-steward-deploy.md](docs/development/04-steward-deploy.md) | 当前 deploy 单一计划、检查证据与待验收项 |
| [docs/development/03-steward-doctor.md](docs/development/03-steward-doctor.md) | doctor 历史实施、证据与待验收项 |
| [docs/development/02-chatgpt-plugin-and-website.md](docs/development/02-chatgpt-plugin-and-website.md) | 插件与网站历史交付 |
| [docs/chatgpt-project.md](docs/chatgpt-project.md) | 维护者的 ChatGPT 开发 Project Instructions 模板 |

插件包位于 `templates/`，安装指南在仓库根目录维护；版本通过 Git Tag 区分，官网使用 `site/src/content/` 下的提示词。项目**不包含** `.codex-plugin/`、独立运维后端或 Docker 操作脚本。

## 预期工作流程

1. 用户安装 Nexum、登录并绑定目标服务器的 Nexum Agent。
2. 用户在 Nexum 的 OAuth 授权中选择插件允许管理的 Agent。
3. ChatGPT 根据实时 `project.list` 返回的名称唯一定位 Agent，操作权限由服务端 Grant + 稳定 Agent ID 校验。
4. ChatGPT 复用现有 `project.open`、`files.*`、`process.*` 工具检查环境并操作 Docker Compose。
5. deploy 先只读规划，明确目标、有效 Compose 输入、数据不可逆点、过程控制和验收项；用户确认具体修订后复核执行，最后按同项报告。
6. 持久数据优先服务目录下 `data` + bind mount，既有卷或应用要求说明例外、不擅迁移。配置解析、容器运行、应用健康、用户入口和数据恢复分别核验，不能互相替代。

服务器配置 Git 的共同规则见 [steward-spec](templates/skills/steward-spec/SKILL.md)：用于追溯和重建材料同步，非敏感 `.env` 可提交，敏感配置优先加密。推荐独立私有仓库；明确远程、分支及管理范围后，及时定向提交并在已确认授权内推送，分别报告配置、提交、同步和业务验收。

Nexum `process.exec` 不是命令沙箱，Docker socket 权限可能很高。Skill 或提示词不能代替实际的权限隔离、数据备份和风险审批。

## 本地开发

使用 macOS 上的 Node.js 24、pnpm 10.34.5：

```bash
node --test tests/plugin.test.mjs
cd site
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm dev
```

在仓库根目录运行 `node --test tests/site.test.mjs` 可对已生成的 `site/dist` 进行静态产物检查。部署工作流位于 `.github/workflows/pages.yml`，只上传 `site/dist`，不会操作用户的 Nexum Agent 或服务器。

本仓库目前未确定开源许可证，不以公开可见等同于已获得某种开源使用授权。
