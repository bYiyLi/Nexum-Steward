# Nexum Steward

**将服务器运维交给 ChatGPT，把执行权限留在 Nexum。**

Nexum Steward 是面向 **ChatGPT** 的 Linux 服务器运维与 Docker Compose 服务部署插件。用户先安装 Nexum，在目标 Linux 服务器安装 Nexum Agent，并在 Nexum OAuth Grant 中明确选择可管理的 Agent；插件通过既有 Nexum MCP 调用 Project / Files / Process 工具，无须另建 PaaS、Docker 专用 MCP Server 或 Web 运维后台。

> **当前状态：产品设计与预览阶段。** 插件包已转为 OpenAI 推荐的可移植格式；真实 ChatGPT 安装、OAuth 授权和 Docker Compose 生产操作尚未完成端到端验收。产品 Skill 暂不包含在仓库中，留待后续单独设计。

## 产品网站

**https://nexum-steward.sites.y2l.top** · [GitHub](https://github.com/bYiyLi/Nexum-Steward)

官网位于 [site/](site/)，参考 KG OS 产品网站的静态 Astro + GitHub Actions Pages 发布方式，但拥有独立的设计与内容。

## 插件结构

| 文件 | 作用 |
| --- | --- |
| [plugin.json](plugin.json) | ChatGPT 可使用的 Agent Plugins 1.0 可移植清单 |
| [mcp.json](mcp.json) | 现有 Nexum MCP 远程连接入口，不添加新运维 Tools |
| [site/](site/) | 产品官网（GitHub Pages 静态站） |
| [docs/requirements.md](docs/requirements.md) | 需求与验收边界 |
| [docs/design.md](docs/design.md) | 插件和网站技术设计 |
| [docs/development/02-chatgpt-plugin-and-website.md](docs/development/02-chatgpt-plugin-and-website.md) | 本阶段实施和验收 |
| [docs/chatgpt-project.md](docs/chatgpt-project.md) | 维护者的 ChatGPT 开发 Project Instructions 模板 |

此项目**不包含**原来的 `.codex-plugin/` 兼容包、`skills/`、任何正在运行的运维后端或 Docker 操作脚本。ChatGPT 与 Codex 的插件目录基础协议具有重叠，但本项目的目标用户和验收环境是 **ChatGPT**。

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
