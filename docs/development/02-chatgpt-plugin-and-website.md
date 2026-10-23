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
| P-05 | GitHub Pages 自动构建 | `main` 推送触发，构建产物和 Actions 成功 | 通过：`269df13` 的 Actions 构建、插件测试与 Pages 部署均为 success |
| P-06 | 自定义域名与 HTTPS | Pages 精确绑定 `nexum-steward.sites.y2l.top`，复用 `*.sites.y2l.top` 泛解析，HTTPS 页面可访问 | Pages 绑定与 DNS 通过；证书状态 approved，但实际 HTTPS 主机名校验尚未通过 |
| P-07 | 交付核查 | Mac/远程 Git SHA 一致，公开内容无密钥或个人路径，实际链接打开验证 | 历史版本已通过 Git 核对与公开内容检查；新域名的代码发布和 HTTPS 终态仍待验证 |

## 技术依据

- 2026-10-23 检查 Mac 中 KG OS 源仓库 `distribution/site` 和 `distribution/.github/workflows/pages.yml`，确认它使用 Astro 7、双语网页、深浅色主题，以及 `upload-pages-artifact` / `deploy-pages` 静态部署。
- 已实际读取 Nexum Cloud 公共 `/mcp`，未认证请求返回 `401` 和 OAuth 资源发现 Header；这证明服务器端点存在，不证明插件已完成 OAuth。
- `y2l.top` 公开 DNS NS 为 DNSPod（`horse.dnspod.net`、`dean.dnspod.net`）；`kghub.y2l.top` 现有 CNAME 指向 `byiyli.github.io`。首次检查新子域还没有 CNAME，必须独立完成 DNS 配置。
- 2026-10-23 已通过具有仓库管理权限的 GitHub CLI 创建该仓库的 GitHub Pages 站点（`build_type=workflow`），并在 Pages 设置中绑定 `nexum-steward.y2l.top`。DNSPod 控制台访问跳转至腾讯云登录；未越过认证，也没有创建 DNS 记录。后续需在 DNSPod 添加主机记录 `nexum-steward`、类型 `CNAME`、目标 `byiyli.github.io`，等待证书签发后再次验证 HTTPS。
- 发布提交 `269df13b3dad6f602cc67dc425fa4a9726254e5a`，对应 [GitHub Pages Actions #39936771797](https://github.com/bYiyLi/Nexum-Steward/actions/runs/39936771797)：插件检查、Astro 构建、静态产物检查、Pages 部署两个 Job 均成功；Mac 与远端 `origin/main` SHA 已比对一致，且公开源码共 26 个文件已进行 Mac 绝对路径、个人 ChatGPT 项目链接、邮箱与常见密钥格式初检。
- 官方 Agent Plugins 1.0 在线 JSON Schema 校验：`plugin.json`、`mcp.json` 均通过。官网本地 `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build` 与 `node --test tests/plugin.test.mjs tests/site.test.mjs` 通过（6/6）。
- 发布后 GitHub Pages 设置返回 `cname=nexum-steward.y2l.top`、`https_certificate=null`、`https_enforced=false`；DNSPod 权威服务器尚无 `nexum-steward.y2l.top` 的 CNAME。公开 URL 的 HTTPS 检查失败，GitHub 默认仓库 Pages URL 返回跳转到尚未解析的自定义域名。因此网站**已部署但自定义域名未上线**。
- Mac Chrome 已验证中文桌面页面、390px 手机布局（无横向溢出）、深浅色主题及移动导航，英文 `/en/` 页面亦已打开核实。已恢复浏览器默认视口并关闭测试标签。
- 网站不安装任何真实 Nexum Agent，也不触碰部署服务、Docker socket 或数据库。

## 2026-10-23 域名迁移（最新）

- 用户决定将官网从旧的 `nexum-steward.y2l.top` 迁到 **`nexum-steward.sites.y2l.top`**。上文旧域名与 DNSPod 登录阻塞记录为当时的历史事实，不再是当前目标配置。
- Mac 实际 DNS 查询验证：DNSPod 的两台权威服务器均解析 `nexum-steward.sites.y2l.top` 到 `byiyli.github.io`，随机子域也解析成功，证明已有 `*.sites.y2l.top` 泛解析可复用，无须给本项目再添加独立 DNS 记录。
- 已在 GitHub Pages 设置中将本仓库精确域名绑定改成新地址，API 返回 `cname=nexum-steward.sites.y2l.top`、HTTPS certificate state `approved`，但实测 HTTPS 仍报「证书主机名不匹配」，`https_enforced=false`。仅凭 approved 状态不宣称 HTTPS 已上线。
- 当前通配符 DNS 的存在不替代 **每个 GitHub 仓库对应的精确 Pages 域名绑定**；GitHub 对指向 Pages 的通配符记录有接管风险提示，后续应评估更安全的自动化 DNS 管理方案。本次未修改整个 DNS zone。
- 已更新官网源码中的 SEO canonical/hreflang、Astro 站点基址、插件 `homepage`、README 与测试。需继续验证新提交的 GitHub Actions 和实际 HTTPS 服务。

## 发布与验收边界

本阶段获授权修改本仓库并实施指定域名的产品官网。GitHub Actions / Pages / DNS / TLS 是不同环节：每项只依据实际终态报告。旧域名因 DNSPod 未登录未能解析，详见上方历史记录；新域名已经通过现有 `*.sites.y2l.top` 泛解析获得 DNS 记录，不需要再添加单独的 DNSPod 记录。仍须检查 GitHub Pages 的精确域名绑定、新版构建和 HTTPS 证书实际生效，不能用 DNS 或 GitHub API 的单项成功代替全链路验收。

完成项目的提交推送必须检查完整变更、忽略规则、测试，不能把已在 Mac 构建当作线上通过。

## 不在当前范围

- 不创建、安装、发布产品 Skill；也不保留伪装成 ChatGPT Plugin 的 Codex 兼容包。
- 不在这次变更中修改 Nexum Cloud/Agent/OAuth 实现。
- 不宣称现阶段已有自动运维、数据库备份或生产 Docker Compose 部署验收。
