# 03 — steward-doctor 环境诊断技能

## 目标与范围

在现有 ChatGPT 插件包中增加 `steward-doctor`，以体检、指定对象或指定症状为入口，交付基于当前要求和证据的符合性、健康与异常诊断报告。报告是唯一结果，不自动修复、不后台值守，也不以诊断触发 setup。

本计划是一个开发单元，D-01～D-05 为内部阶段。依据为用户已审阅的本计划实施要点、[需求](../requirements.md)、[设计](../design.md)与现有 steward-spec；不改写 [02 历史交付](02-chatgpt-plugin-and-website.md)。

## 前提与交付约束

- 2026-10-24 从干净 `main` fetch 并快进到 `571e92eb7cd80ebaaf8dad7d9b152b3259605541`；本任务在 `feat/steward-doctor` 独立分支进行。源码取自当前工作树，不沿用其他任务的通过记录。
- 仅本仓库的实现、文档、静态测试与网站构建；允许本分支提交、推送。不得推 main、合并、发布 Tag、主动部署网站、修改已安装私人插件、运行真实服务器诊断或 Docker 变更。
- 本次截止 2026-10-24 05:05 UTC；完成或到期停止。独立模型行为测试和真实 Linux 验收不在本次执行范围，完整运行验收保持 pending。

## 内部阶段与验收

| 阶段 | 工作与交付 | 验收入口 |
| --- | --- | --- |
| D-01 | 需求增加诊断范围和证据标准；设计明确三入口、六维检查、范围建立及失效/受阻分支 | 需求与设计的当前约束一致，无自动修复或虚构健康承诺 |
| D-02 | `templates/skills/steward-doctor/SKILL.md`：范围 → 取证 → 按观察分支 → 报告/真实阻塞 | 加载 spec 的可达路径与失败边界；Docker 请求前本机归属；最小读取、权限、时效和停止条件闭合 |
| D-03 | README、AGENTS、INSTALL、Project Instructions 维护源、双语网站与提示词；扩展包资源校验和场景文件 | 三技能发现清单一致；保留 setup/四环境回归；引用缺失及大小写错误可被静态测试检出；02 仅新增导航 |
| D-04 | 本地插件测试、网站依赖安装/check/build、静态产物测试与差异检查 | 下列实际命令终态；[诊断场景](../../tests/steward-doctor-scenarios.md)预先定义任务、fixture、调用边界、停止和证据标准 |
| D-05 | 对选择重叠、闭合分支、资源可达、权限、敏感证据、结论和文档同步进行 review；修复并重验受影响项 | 记录真实发现和证据等级，分支提交/推送状态与 CI 分开报告 |

## 验证标准

必需本地命令：根目录 `node --test tests/plugin.test.mjs`；`site/` 中依次 `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build`；根目录 `node --test tests/site.test.mjs` 与 `git diff --check`。检查中英文、移动端、键盘焦点、可读性、导航与未发布状态；不能把构建或静态关键词匹配当作模型行为。依赖或授权阻塞时记录未运行的命令，不擅自替代。

诊断场景覆盖选择边界、目标拒绝、缺失规范/基线、Docker endpoint 与 rootless、当前用户不可用、资源高占用、健康层次、发现限制、敏感/注入日志、多候选原因、状态变化与恢复证据。未来故障测试仅在隔离且另行授权的环境运行，不破坏生产。

源码完成标准是 D-01～D-05 的产物、本地必需检查和范围内 review 同时满足；完整产品运行验收还须独立模型运行、真实 Linux 证据和 ChatGPT 实际发现。后者未运行不能删去标准或宣称环境正常。

## 执行证据与剩余验收

本节记录 2026-10-24 本地 checkout `feat/steward-doctor`、基线 `571e92eb7cd80ebaaf8dad7d9b152b3259605541` 之上的源码提交 [`1dc53d71aafd8af266ce3f8347302d10963fa24c`](https://github.com/bYiyLi/Nexum-Steward/commit/1dc53d71aafd8af266ce3f8347302d10963fa24c)。检查使用 Node.js 24.15.0、pnpm 10.34.5；后续文档提交仅补记本节的 Git/CI 交付证据。

| 状态层次 | 本次证据 |
| --- | --- |
| 计划 | 本文件已保存，未发现同名或同主题现有计划 |
| 源码 | D-01～D-03 已实现：一个自包含 doctor 工作流，需求/设计/安装/Project Instructions 维护源与双语网站同步，未修改 02 的历史结果、现有 spec/setup/四环境模板和 workflow |
| 本地检查 | 插件 `node --test tests/plugin.test.mjs` 11/11；网站 `pnpm check` 11 文件、0 错误/警告/提示；`pnpm build` 四页面及 INSTALL.md 成功；`node --test tests/site.test.mjs` 3/3；`git diff --check` 通过。资源图测试含递归、循环、缺失、大小写与包外路径负例；保留 setup/四环境回归 |
| 页面检查 | Chrome 实际打开本地构建的中英首页与安装页；默认桌面和 390×844 移动布局无横向溢出，状态说明可读；两语言键盘首焦点可见（2px outline），移动导航可展开并到达安装页，语言切换有效，未发布/待验收声明保留。临时视口已恢复；没有发布网站 |
| Review | D-05 源码/文本 review 覆盖选择与职责、依赖可读、Docker 请求前归属、只读权限、日志/敏感输出、证据时效与报告归宿；发现并修正旧提示词“空模板”、安装页漏列 doctor、既有指令表述和必需项范围歧义。进一步明确相关性不等于因果。受影响检查重跑；当前 review 范围内无未解决的任务相关发现，不代表模型行为或运行无缺陷 |
| 提交 / 推送 / CI | 源码 `1dc53d7` 已提交并推送 `origin/feat/steward-doctor`；本地/跟踪 ref 一致、工作树干净，GitHub 插件已读取同一 SHA。2026-10-24 04:51 UTC 的 `gh run list` 按分支及完整 SHA 查询返回空数组；CI 未触发，不是通过。现有 workflow 仅 main push / 手动触发，本次不改触发器、不推 main、不手动运行部署 |
| ChatGPT 实际发现 | 未运行；本次不修改已安装私人插件 |
| 独立模型行为 | 未运行；本次未授权执行此类验收 |
| Linux 实测 | 未运行；本次禁止真实服务器诊断，隔离环境仍需另行授权 |

首次依赖安装因默认 Node 22 和非交互重建中止；随后使用本机已有 Node 24.15.0、`CI=true` 与临时 store，沙箱 DNS 失败后经宿主批准联网执行 `pnpm install --frozen-lockfile --store-dir /tmp/nexum-steward-pnpm-store --fetch-retries 0 --fetch-timeout 20000`，成功安装锁定依赖。未改变锁文件；移除了本任务失败安装产生的仓库缓存。页面预览常用端口被已有站点占用，改用当前项目独立 loopback 端口；未操作其他仓库或其服务。

本地静态交付已验证；整体运行验收：**pending**。以上场景文件是执行前的验收定义，没有将文本推演记为模型或 Linux 已通过。
