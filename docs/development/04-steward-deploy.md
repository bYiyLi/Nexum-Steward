# 04 — steward-deploy 服务部署与升级技能

## 目标与授权边界

一个开发计划，内部阶段 U-01～U-05：交付 `steward-deploy` 工作流，使指定服务从已核实状态推进到用户确认的目标状态，止于有证据的验收报告或真实阻塞。支持现成镜像/已有 Compose 首次部署、兼容升级、配置调整、无需变更和有效授权内安全恢复；首版不构建源码，不隐含跨机迁移、其他系统接管、专项数据库迁移、删除或灾难恢复。

依据为用户确认的 04 完整设计契约、最新 data/bind mount 偏好、[需求](../requirements.md)、[设计](../design.md)与共用 spec。共用数据布局仅在 spec Services Root 最小补充；不扩展其他尚未确认的 spec 优化；本轮后续明确批准的配置 Git 扩展见末节。保留 [03](03-steward-doctor.md) 历史和运行验收 pending。

2026-10-24 05:13 UTC 启动；最多 30 分钟且不晚于 05:42 UTC，完成或到期立即停止。固定会话配置，不启动额外任务/模型。源工作树干净，fetch 后 main/origin/main 同为 `c3aa724fd7f0a4fa8dc904eeb1fc6338930a69d9`；独立 worktree `/tmp/nexum-steward-deploy-20261024`，分支 `codex/steward-deploy-20261024`。允许检查通过且无冲突后快进 main、推送及随之触发 CI/公开 Pages；不强推，不清理已有 worktree，不操作真实服务、Docker、生产数据、其他仓库或已安装插件。

## 内部阶段与验收

| ID | 工作 | 验收 |
| --- | --- | --- |
| U-01 | 需求/设计与 spec 数据偏好 | 承诺、共同边界、职责与来源一致；setup/doctor 兼容 |
| U-02 | deploy SKILL 与按需升级参考 | PLAN/只读规划 → A～J 计划 → 修订绑定确认 → 前检 → 变更及阶段验证 → 同项验收报告；未知、拒绝、漂移、不可逆点、过程控制闭合 |
| U-03 | README/AGENTS/导航/INSTALL/Project 源与双语网站提示词 | 四技能清单、完整资源发现、安装只读范围及未发布/未验收状态一致 |
| U-04 | 冻结请求/fixture、独立判定、静态回归和网站验证 | 四正例与所有指定风险边；递归资源与实质负例，保留 setup/doctor 回归；必需命令真实终态 |
| U-05 | 规范自检、修复、重验与 Git 交付 | review 授权/有效输入/数据/过程/证据及资源文档；无未解决任务相关发现才安全整合/推送；远端 SHA、CI 与发布分别报告 |

## 验证协议

在技能实现前冻结 `tests/fixtures/steward-deploy/requests.json` 原始请求和最小合成事实，预期、允许/禁止操作、停止点、报告和证据另置于 [场景判定](../../tests/steward-deploy-scenarios.md)。未来执行模型只接收所选 request/fixture 与被测完整技能包，不接收判定文档或作者 review。后续改用例须记录原因，不能按输出倒改答案。静态仅验证结构、资源图及必要文本契约；本次不运行独立模型或 Linux 部署，不把文本推演称为行为通过。

必需命令：根目录 `node --test tests/plugin.test.mjs`；`site/` 依次 `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build`；根目录 `node --test tests/site.test.mjs`、`git diff --check`。页面覆盖中英首页/安装页、移动端、焦点、可读性、导航、未发布声明。保留已有端口，只用本项目独立 loopback 预览。

源码完成要求 U-01～U-05 产物、必需本地检查与 review 同时满足；ChatGPT 发现、独立模型、真实 Linux 数据与过程控制验收仍须单独证据，不因源码完成改为通过。

## 状态与证据

- 计划：未发现同名/同主题既有 04 计划；本文件为单一新增计划。
- 实现：U-01～U-03 已落地；一个 deploy SKILL 与单个条件升级 reference，无新增脚本/输出资产；A～J 和报告判断在核心中。共同 data 和新增配置 Git 规则由 spec 持有；四环境模板保留独立边界，dev 源码构建许可保留。
- 本地检查：Node.js 24.15.0，pnpm 10.34.5。插件静态 18/18、网站产物 4/4 通过（合计 22，含两项后续扩展）；新增递归模板、空资源、A～J 删除、endpoint/时间前提删除负例，保留 doctor/setup/四环境回归。`pnpm install --frozen-lockfile --store-dir /tmp/nexum-steward-deploy-pnpm-store --fetch-retries 0 --fetch-timeout 20000` 经正常联网批准安装锁定依赖；`pnpm check` 11 文件、0 errors/warnings/hints，`pnpm build` 四页面与 INSTALL.md 成功。初次安装沙箱 DNS 不可达，未伪报通过，审批后成功；锁文件未变。
- 页面：Chrome 实际访问中英首页与安装页，默认桌面及 390×844 移动端可读、无横向溢出；两语言首页首 Tab 为 skip link、2px outline 可见；中文手机导航展开并到达安装页，安装页语言切换有效，未发布/未验收状态仍在。视口已恢复，临时标签关闭；本项目 127.0.0.1:43927 预览经审批启动并已正常停止，没有操作已有端口服务。
- Review：按三项开发/提示词/Skill 规范及其适用资源检查单一 workflow 职责、四技能选择、资源缺失、有效输入、授权、数据不可逆点、过程身份/终态、取消/期限、报告证据、Git 内容/范围/远程与失败状态。修正需求新增表格断开、fixture 中 continuation 判定提示/误填未来时间、旧禁止自动推送与 .env 一刀切、独立模板明文保护不明确；doctor 仅在后续加载扩展调整入口句，03 历史未改。50 例仅做合同 walkthrough 和静态检查，不是模型结果。
- 文档同步：requirements/design/README/AGENTS/INSTALL/Project Instructions 源、02 导航、双语网站/提示词及测试同步；未新建第二计划/导航体系。plugin.json 不变：最简发现结构不需新增字段，未发布 Tag；CI 路径已覆盖 templates/tests，无需改 workflow/权限。仓库根 `.gitignore` 保护开发工作区，不是服务器忽略模板，不因 .env 产品分类变更而放宽；服务器生成忽略规则由 setup 调整。doctor 仍只读；不更新已安装插件/UI 指令副本。
- Git/CI：源码提交 `70241e2f4f3957461481a9cdf85c2073407c9665` 已在独立分支提交，经主工作树干净、main 与 origin/main 同步检查后安全快进整合并推送；`git ls-remote` 确认远端 main 同一 SHA。下方记录实际 CI/发布证据。
- ChatGPT 安装/发现、独立模型与真实 Linux 部署：not run，本次排除；整体运行验收 pending。

## 同轮已批准扩展：配置 Git

2026-10-24 05:24 UTC 后用户明确批准写入配置 Git 目标/范围/远程/加密/及时提交推送和失败规则，仍在同一 worktree/计划与 05:42 UTC 硬截止内。U-01～U-05 加入 spec 真源、setup/deploy 引用、四环境独立模板、需求/设计/README 与必要静态/场景回归；不改 doctor 只读边界，不操作真实远程/凭证/秘密，不建加密工具或 GitOps 平台。原 32 例基线保留；运行前新增 G01～G09，修正输入中 continuation 判定提示并以原始遥测替代无需变更的汇总判定，均未看过模型输出，不以此宣称行为通过。首次冻结的精确时分未记录，移除了误填的未来时间，不补造时间证据。

## 同轮已批准扩展：个人规范渐进加载

2026-10-24 05:29 UTC 后用户批准 spec 定义目标 OS 用户个人 `~/.agents/AGENTS.md` 的复用/显式读取契约；setup/doctor/deploy 只加必要入口与缺失分支，需求 R-33、设计及 L01～L09 判定同步。先身份再读取，不形成循环；完整上下文可复用，截断/仅读路径不得冒充已加载；遵守宿主权威、不凭文件扩大权限。仍不新增加载 Skill/同步系统，不改真实服务器或已安装插件，不延时。本增量只调整 doctor 的入口加载句，03 历史与只读边界保持不变。

最新复核：个人加载扩展后，Node 插件 18/18、网站产物 4/4（合计 22）通过；50 个独立输入 ID 和判定均可定位。全部 25 个任务文件已检查，40 个本地链接可达、Markdown 表格列数一致、公开个人路径/常见凭证模式初检通过，`git diff --check` 通过。按最终四技能集合重看职责/选择/资源路线/缺失/拒绝/中断/结论：review 范围内无未解决的任务相关发现；文本合同与 walkthrough 不能证明模型实际遵从。后两项扩展未改变网站构建输入，因此不重复未受影响的安装、check/build 或页面操作；插件回归已重跑。

## Git、CI 与官网交付证据

- 源码提交：[70241e2](https://github.com/bYiyLi/Nexum-Steward/commit/70241e2f4f3957461481a9cdf85c2073407c9665)。2026-10-24 05:33 UTC 核对独立分支、主工作树 main、origin/main 与远端 main 均为同一完整 SHA，工作树干净；保留临时开发分支与独立 worktree，没有强推、reset、clean 或 stash。
- [Actions #40066694580](https://github.com/bYiyLi/Nexum-Steward/actions/runs/40066694580) 是该 SHA 的 main push 运行；05:34 UTC 读取最终 `status=completed`、`conclusion=success`。Build and verify static website 与 Publish GitHub Pages 两个 Job 均 success，分别在 05:33:38Z 与 05:33:51Z 完成。
- Pages API 核实精确 `cname=nexum-steward.sites.y2l.top`、证书 approved、`https_enforced=true`。本机系统 A 解析受到网络代理合成地址影响，不作为公开 DNS 地址证据；另查 CNAME 及 `horse.dnspod.net` 权威回答均为 `byiyli.github.io.`，NS 为 horse/dean.dnspod.net。
- 正常 TLS 默认信任与主机名验证下，`/`、`/en/`、`/install/`、`/en/install/` 全部 HTTP 200，且各页面含新版 steward-deploy 文案。仅验证产品静态站，不是业务服务或私人插件实装。
- 本文件后续仅补交付证据，不改变插件/网站输入；现有 workflow 的路径过滤不为 docs-only 提交触发新构建。证据提交的最终 SHA/远端状态在最终交付报告核对，不能把源码 SHA 的 CI冒充未触发的新运行。

U-01～U-05 的源码、本地检查与 review 已完成，源码已整合推送且对应 CI/Pages 通过。产品完整运行验收继续 **pending**：独立模型、隔离 Linux（含真实数据/过程控制）、ChatGPT 安装/发现均 not run；本次未访问真实服务器、上传实际秘密、创建凭证、修改生产 Docker 或已安装插件。授权完成即停止，未使用剩余时间扩展范围。
