# 02 — ChatGPT 插件基础与 GitHub Pages 官网

## 目标

在已初始化的 Nexum Steward 仓库中，纠正错误的 Codex 专属脚手架，并交付面向 ChatGPT 的 **MCP-only 可移植插件基础**及**公开静态产品官网**。产品 Skill 延后，不能用尚不存在的 Skill 填充本阶段验收。

依据：`docs/requirements.md`（R-08～R-12）、`docs/design.md`、[OpenAI 插件打包文档](https://developers.openai.com/plugins/build/plugins)、[GitHub Pages Actions 文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 范围和验收

| ID | 本阶段交付 | 可观察标准 | 状态 |
| --- | --- | --- | --- |
| P-01 | 根目录 `plugin.json` / `mcp.json` | OpenAI Portable Agent Plugins 1.0、唯一的 Nexum MCP 地址，不含凭证 | 通过：本地校验，未实装 ChatGPT |
| P-02 | 移除旧 Codex/Skill 文件 | 不再存在 `.codex-plugin/plugin.json`、`skills/nexum-steward/SKILL.md`、Skill 场景文件 | 通过：文件及空目录均已删除 |
| P-03 | 产品说明与设计同步 | README、需求、设计、AGENTS 能区分规划能力与已实现 | 通过：文档审查，历史初始化文档保留并标明已被替代 |
| P-04 | 中英静态产品站 | `site/` 可构建，`/` 与 `/en/`，导航/主题/移动端有效 | 通过：Astro check/build、Node 测试、Mac Chrome 页面实测 |
| P-05 | GitHub Pages 自动构建 | `main` 推送触发，构建产物和 Actions 成功 | 已创建 Pages 站点，待推送与 Actions 验收 |
| P-06 | 自定义域名与 HTTPS | Pages 绑定 `nexum-steward.y2l.top`，DNSPod CNAME 指向 `byiyli.github.io`，HTTPS 页面可访问 | Pages 自定义域名已绑定；DNSPod 登录阻塞，DNS 和 HTTPS 未通过 |
| P-07 | 交付核查 | Mac/远程 Git SHA 一致，公开内容无密钥或个人路径，实际链接打开验证 | 已完成公开内容初检；远程 SHA 及网站链接待推送后验证 |

## 技术依据

- 2026-10-23 检查 Mac 中 KG OS 源仓库 `distribution/site` 和 `distribution/.github/workflows/pages.yml`，确认它使用 Astro 7、双语网页、深浅色主题，以及 `upload-pages-artifact` / `deploy-pages` 静态部署。
- 已实际读取 Nexum Cloud 公共 `/mcp`，未认证请求返回 `401` 和 OAuth 资源发现 Header；这证明服务器端点存在，不证明插件已完成 OAuth。
- `y2l.top` 公开 DNS NS 为 DNSPod（`horse.dnspod.net`、`dean.dnspod.net`）；`kghub.y2l.top` 现有 CNAME 指向 `byiyli.github.io`。首次检查新子域还没有 CNAME，必须独立完成 DNS 配置。
- 2026-10-23 已通过具有仓库管理权限的 GitHub CLI 创建该仓库的 GitHub Pages 站点（`build_type=workflow`），并在 Pages 设置中绑定 `nexum-steward.y2l.top`。DNSPod 控制台访问跳转至腾讯云登录；未越过认证，也没有创建 DNS 记录。后续需在 DNSPod 添加主机记录 `nexum-steward`、类型 `CNAME`、目标 `byiyli.github.io`，等待证书签发后再次验证 HTTPS。
- Mac Chrome 已验证中文桌面页面、390px 手机布局（无横向溢出）、深浅色主题及移动导航，英文 `/en/` 页面亦已打开核实。已恢复浏览器默认视口并关闭测试标签。
- 网站不安装任何真实 Nexum Agent，也不触碰部署服务、Docker socket 或数据库。

## 发布与验收边界

本阶段获授权修改本仓库并实施指定域名的产品官网。GitHub Actions / Pages / DNS / TLS 是不同环节：每项只依据实际终态报告。DNSPod 未登录时继续本仓库及 GitHub Pages 独立步骤；自定义域名必须保留「待 DNS 配置」状态，不用写入 `CNAME` 文件冒充 DNS 配置。GitHub Pages 已绑定自定义域名，因此其默认 Pages URL 可能自动跳转到尚未解析的自定义域名，不能把该重定向当作可访问交付。

完成项目的提交推送必须检查完整变更、忽略规则、测试，不能把已在 Mac 构建当作线上通过。

## 不在当前范围

- 不创建、安装、发布产品 Skill；也不保留伪装成 ChatGPT Plugin 的 Codex 兼容包。
- 不在这次变更中修改 Nexum Cloud/Agent/OAuth 实现。
- 不宣称现阶段已有自动运维、数据库备份或生产 Docker Compose 部署验收。
