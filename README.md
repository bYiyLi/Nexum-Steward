# Nexum Steward

**将服务器运维交给 ChatGPT，把执行权限留在 Nexum。**

Nexum Steward 是面向 **ChatGPT** 的 Linux 服务器运维与 Docker Compose 服务部署插件。Docker 管理范围仅限目标 Nexum Agent 所在服务器的本机 Engine，不支持远程 Daemon。用户先安装 Nexum，在目标 Linux 服务器安装 Nexum Agent，并在 Nexum OAuth Grant 中明确选择可管理的 Agent；插件通过既有 Nexum MCP 调用 Project / Files / Process 工具，无须另建 PaaS、Docker 专用 MCP Server 或 Web 运维后台。

> **当前状态：私人插件模板、`steward-spec`、`steward-setup` 与 `steward-doctor` 已写入源码，尚未完成 ChatGPT 安装/发现、独立模型行为及真实 Linux 初始化/诊断验收。** doctor 只诊断并交付报告，不自动修复。模板不预置 MCP 连接；用户需在自己的账户创建、安装并验证插件，连接与授权由现有 Nexum 应用处理。

## 产品网站

**https://nexum-steward.sites.y2l.top** · [GitHub](https://github.com/bYiyLi/Nexum-Steward)

**[私人 ChatGPT Plugin 安装引导](https://nexum-steward.sites.y2l.top/install/)** · [AI Agent 安装指南](INSTALL.md)

官网位于 [site/](site/)，参考 KG OS 产品网站的静态 Astro + GitHub Actions Pages 发布方式，但拥有独立的设计与内容。

## 插件结构

| 文件 | 作用 |
| --- | --- |
| [templates/plugin.json](templates/plugin.json) | 最简 ChatGPT 插件清单，不预设 MCP 连接 |
| [templates/skills/steward-spec/SKILL.md](templates/skills/steward-spec/SKILL.md) | Steward 共用规范：Agent 命名、Services Root 与个人 AGENTS.md |
| [templates/skills/steward-setup/SKILL.md](templates/skills/steward-setup/SKILL.md) | 服务器环境初始化 Skill：软件准备、服务根目录、Git、日志和个人 AGENTS.md |
| [templates/skills/steward-setup/assets/](templates/skills/steward-setup/assets/) | dev、qa、pro、prod 四份环境运维规范模板 |
| [templates/skills/steward-doctor/SKILL.md](templates/skills/steward-doctor/SKILL.md) | 环境体检、指定对象或症状诊断；只读取证并报告，不自动修复 |
| [INSTALL.md](INSTALL.md) | AI Agent 使用的私人插件安装指南 |
| [site/](site/) | 产品官网（GitHub Pages 静态站） |
| [docs/requirements.md](docs/requirements.md) | 需求与验收边界 |
| [docs/design.md](docs/design.md) | 插件和网站技术设计 |
| [docs/development/03-steward-doctor.md](docs/development/03-steward-doctor.md) | 当前 doctor 实施、证据与待验收项 |
| [docs/development/02-chatgpt-plugin-and-website.md](docs/development/02-chatgpt-plugin-and-website.md) | 插件与网站历史交付 |
| [docs/chatgpt-project.md](docs/chatgpt-project.md) | 维护者的 ChatGPT 开发 Project Instructions 模板 |

插件包位于 `templates/`，安装指南在仓库根目录维护；版本通过 Git Tag 区分，官网使用 `site/src/content/` 下的提示词。项目**不包含** `.codex-plugin/`、独立运维后端或 Docker 操作脚本。

## 预期工作流程

1. 用户安装 Nexum、登录并绑定目标服务器的 Nexum Agent。
2. 用户在 Nexum 的 OAuth 授权中选择插件允许管理的 Agent。
3. ChatGPT 根据实时 `project.list` 返回的名称唯一定位 Agent，操作权限由服务端 Grant + 稳定 Agent ID 校验。
4. ChatGPT 复用现有 `project.open`、`files.*`、`process.*` 工具检查环境并操作 Docker Compose。
5. 操作前检查端口、持久化卷及风险；操作后核实容器与应用健康，不能把命令成功当成业务可用。

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
