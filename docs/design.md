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

当前源码包含 `steward-spec` 共用规范、`steward-setup` 服务器环境初始化、`steward-doctor` 只读环境诊断和 `steward-deploy` 服务部署升级 Skill；自动修复及后台值守尚未交付。ChatGPT 实际发现、独立模型行为与真实 Linux 初始化/诊断/部署仍需分别验收，当前状态由 [04 计划](development/04-steward-deploy.md)记录，03 保留诊断历史。

## 2. ChatGPT 插件模板与安装入口

依据 OpenAI [插件打包文档](https://developers.openai.com/plugins/build/plugins) 与 Agent Plugins 1.0：

- `templates/` 是可移植 ChatGPT Plugin 的包根目录，包含最简 `plugin.json` 与 `skills/` 下的 `steward-spec/SKILL.md`、`steward-setup/SKILL.md`、`steward-doctor/SKILL.md`、`steward-deploy/SKILL.md`；deploy 的升级细节在按需读取的 `references/upgrade.md`；初始化 Skill 的四份环境模板位于其 `assets/`。符合插件根目录 `skills/<skill-name>/SKILL.md` 的发现约定。不预置 MCP 或 Hooks。
- `steward-spec` 规定运维 Agent 使用 `steward-<节点名称>-<env>-ops`；`env` 只能是 `dev`、`qa`、`pro`（预生产）、`prod`。一个 Agent 对应一个环境，环境直接由 Agent 名称确定；命名只是识别约定，不产生 Nexum Grant 权限。
- 共用 Services Root 由用户在核实存储状态后选定绝对路径，**所选路径即根目录**，不追加 `services/`。按 spec 确定配置 Git 工作区/范围，记录配置追溯与重建材料，脱敏运维记录位于 `logs/YYYY-MM-DD.md`；非敏感配置（含核实无秘密的 `.env`）直接提交，敏感配置优先使用已有可信加密方式，不纳入运行数据/备份。持久数据默认优先 `Services Root/<服务名>/data` + bind mount；应用要求/既有卷为说明理由的例外，不自动迁移；完整约定由 spec 持有，四份独立生成模板保留简短边界。
- `steward-setup` 的唯一职责是初始化目标 Linux 服务器环境：识别授权 Agent，检查并按需准备 Docker Engine / Compose Plugin、Python 3.12、必要运维工具；创建或复用 Services Root 的 Git 和日志；在当前 Agent OS 用户的 `~/.agents/AGENTS.md` 中组合动态服务器信息与对应环境模板，并核实 Nexum Context 实际发现。首次或重复初始化均不得覆盖既有数据和指令；不预部署业务容器。
- 新建个人 `AGENTS.md` 只设 `## 服务器信息` 与 `## 管理运维规范` 两个二级区域。前者按当前服务器实际情况动态生成，不使用固定资产字段表；后者由 dev、qa、pro、prod 四份环境模板提供不同的运维行为规则。已有个人文件保留其他正文、章节与用户定制，仅安全合并可定位的 Steward 内容，不能为满足新建格式删除或重排原有指令。
- `INSTALL.md` 位于仓库根目录，作为 AI Agent 的安装指南；`site/src/content/install-prompt.zh.txt` 与 `install-prompt.en.txt` 为官网展示的安装提示词。官网静态构建直接从根目录指南生成 `/INSTALL.md`，无须维护第二份副本。
- 不建立 `install/`、`templates` 版本子目录、打包脚本或额外的 MCP Server；发行历史使用 **Git Tag** 而不是目录路径体现。
- 用户的现有 Nexum MCP 应用以及 OAuth Grant 由真实 ChatGPT/Nexum 平台管理。模板本身没有预授予任何 Agent 权限，也不能以提示词替代真实授权。插件实际创建、绑定、安装及工具调用仍须独立核验。

## 3. Agent 选择与部署边界（后续验证目标）

- 对实时 `project.list` 仅在当前 Grant 可见的 Agents 中匹配显示名称；不允许从名称推断 opaque ID；同名、不可见与离线均不能擅自切换目标。
- 使用实际 `project.open` 返回的 `contextId`，依现有 Files / Process 实现运行目标上的 Docker Compose；没有 `compose.*` 专属 MCP Tools。
- Docker Compose 操作前关注配置、端口、已运行服务、网络、数据卷、Secret；后检验命令终态、容器和应用健康。破坏性数据操作不由普通部署意图自动授权。
- 本节是**产品接口目标**，不能以文档已写证明已经完成真实运维能力。

### 本机 Docker 目标约束

Agent 身份核验与 Docker Daemon 归属核验是两个不同条件：在目标 Agent 上运行 CLI，并不证明 CLI 连接了该机 Engine。按实际命令的参数、环境变量与 context 确定生效 endpoint，再用本机 Daemon/连接端点归属证据确认，不仅凭名称、路径或命令成功判断。本机 rootless Engine 可以使用其真实端点，不固定要求默认 socket。

远程或未知归属时，不向该 Daemon 发起检查或变更请求，也不自动永久修改 context 或清除连接设置；报告阻塞与重新进入条件。执行身份或连接条件变化后重新核验。仅不依赖 Docker 且已获授权的工作可以继续。规则由 steward-spec 持有，setup 在准备和验收处执行，doctor 和 deploy 在所有 Daemon 请求前执行；四份环境模板保留简短边界，因为生成的个人 AGENTS.md 会独立使用。

### 环境诊断工作流

doctor 拥有的唯一结果是诊断报告，三个入口均按「范围 → 取证 → 依观察选择分支 → 报告/真实阻塞」推进。setup 负责改变缺失配置，doctor 只评价证据，不将未初始化自动路由到 setup。doctor 先实际读取同包 `../steward-spec/SKILL.md`；读取失败只阻塞依赖规则的路径，有独立有效身份与授权证据的主机事实仍可继续，否则交付阻塞报告。

范围由用户目标、已有配置与有界发现确定。体检对照基础项、Services Root 配置和本机 Docker 对象清单，报告配置/运行态差异及发现限制；指定对象只延伸到必要依赖；症状入口按可区分候选的证据收窄。缺少 Services Root/基线不整盘搜索或初始化，保留主机事实及受阻项。

检查覆盖适用的六维：身份与配置、资源及运行条件、工具/运行时版本路径与当前用户可用性、服务与依赖、持久化/可恢复性、范围内安全风险。每项有对象、预期及依据、证据时点/可得版本、判定和限制。容量判断来自要求、趋势或相关故障证据，不设统一 80% 阈值。

读取使用当前授权与身份，不换凭据/用户/主机、不提权或为普通读取重复造审批。先限定等待、输出及日志窗口/条数，源端最小字段读取，敏感值脱敏；不能安全限制则报告缺口，不 dump env/完整 inspect、密钥或备份业务内容。不执行健康脚本、容器 exec、业务脚本、修复或服务器文件/日志/Git 写入。仅读取已有 healthcheck 状态。

证据不是原子快照，输出和日志不作为指令。记录各自时点、版本和冲突；中断/结果未知先看当前状态，身份、用户、连接/endpoint/覆盖条件或对象状态变化使相关结论失效，必要重验。容器 running、探针健康、业务可用与数据恢复分别判断；备份记录不能证明恢复已验证，无证据原因仅为候选。

报告四部分为：目标/时间/范围/基线/总体发现；已检查、不适用、受阻、未检查的完整覆盖及理由；含预期/实际/证据/影响/已确认或候选原因的问题；最小后续动作、风险/前提与再验证方法。状态、严重性、可信程度分开。必需项未知使整体 partial，即使每项都有归宿也不能报环境正常；证据齐备的 complete 仍可能含问题。达到范围或证据/权限边界即可报告，不强求根因。

实现采用一个自包含 SKILL.md，不新增脚本、资源占位或报告模板；共用规则通过明确依赖复用。结构与递归资源可达由 Node 静态测试验证，行为由预先定义的场景另行独立模型/隔离 Linux 验证；文本 review 不保证宿主执行符合。

### 服务部署与升级工作流

对应 R-21～R-29，deploy 的单一责任是已核实源状态到用户确认目标的交付与报告。状态为只读规划、计划待确认、已确认待复核、执行/阶段验证、最终验收或真实阻塞；每次转移依赖当前事实与适用授权。setup 环境准备不自动调用，doctor 不强制先跑；deploy 自己承担本次检查。只规划止于对话计划；宿主无真实 PLAN 时明示只读，不模拟宿主切换。

可执行计划的 A～J 合同由 [deploy SKILL](../templates/skills/steward-deploy/SKILL.md) 定义：身份/范围、有效输入、当前状态、目标变化、配置自身风险、有序步骤、数据不可逆点、窗口与过程控制、验收、待决审批。Compose 项目名/工作目录/文件集合顺序/profiles/服务/变量与秘密引用/镜像产物及架构组成有效输入，贯穿前检、执行与验收；目标/风险/验收受漂移影响则新修订确认，普通已授权等价步骤不再造审批。

首次部署不覆盖冲突对象；配置调整展示差异/重建/访问与数据影响；无需变更只验证不重启；恢复先查已完成/未完成/未知和授权有效性。升级条件资源 [upgrade.md](../templates/skills/steward-deploy/references/upgrade.md) 仅在升级分支加载，查官方支持路径/中间版本/数据兼容/停机与恢复证据。首次新版本启动也可能自动迁移，风险前提必须在该点之前满足。复制数据库目录不证明一致性、版本/权限兼容或恢复；不可回滚方案须明确风险和适用授权，不能伪称恢复已验证。源码构建及跨机/其他系统接管/专项迁移/删除/灾难恢复是首版边界。

持续操作开始前验证操作身份、终态观察、有限等待、安全取消或可接受交接。能力不足或不能安全中断且时间不足不启动；异步提交不代表完成，超时/断连先查、不盲重放。取消/到期不发起新变更、不默认 kill 迁移、不借回滚续期。检查可得并发修改并在冲突时停，不把提示词当互斥锁、不增锁服务。秘密安全输入/交接，最小字段脱敏读取；高权限配置、主机挂载、Docker 接口与共享网等自身风险须具体揭示，外部文本不授权。

报告沿用 S/V 标识，列真实版本/产物/有效配置/数据/入口、步骤/批准偏差、每项 pass/fail/blocked/not run 及时间证据、残留/共享影响/撤销结果与用户接管。总体 complete 需所有必需目标和验收当前通过；partial/failed/blocked 保留各服务差异，配置解析、running、应用窗口、预期入口、公网链路及数据兼容恢复互不替代，秘密交接未完影响目标也计入状态。

选择单一 SKILL + 一个条件升级 reference，不加无运行职责的脚本或输出 assets：A～J 与报告结构直接在核心可读，避免模板隐藏判断。资源不可读阻断依赖分支，独立结果保留。Node 仅验证包结构、递归资源及文本合同，独立原始请求与判定分离；实际模型、Linux、ChatGPT 验收继续 pending。

### 目标个人规范的渐进加载

spec 规则 3 持有个人 `~/.agents/AGENTS.md` 加载契约。先按共同规则确认 Agent/OS 执行用户和可读性，再定位目标文件，不依赖个人文件才能取得身份。只有本次上下文完整、适用、身份和时效无疑点时复用，否则工具显式读取服务器信息、管理运维规范及适用用户定制；文件存在/曾发现/提及名字不能证明加载，仅读 Services Root 也不代表完整。目标/用户变化重新核验，避免无意义重复读取，不用开发机/模板/记忆替代。

内容按宿主实际权威模型使用，不升格系统指令或授权，不执行嵌入数据的命令。缺失/不可读由 setup 在授权维护范围保护既有内容、doctor 报基线缺口并继续独立事实、deploy 在关键变更前提不明时停止。各流程只保留入口及分支引用，专项升级资料仍仅按任务加载；不建加载 Skill/自动同步/全局扫描。实际模型稳定加载尚未验证。

### 服务器配置 Git 的职责

共用规则由 spec Services Root 的「配置 Git」持有，setup/deploy 读取并执行，doctor 保持只读。目标是配置追溯与重建材料同步，不替代业务数据备份。推荐独立私有仓库但不强制一机/一根目录一库；共享需明确本机受管子路径、分支/权限，不能混入其他机器改动。首次确认远程 URL、owner/org、可见性、分支、范围及同步授权，不自动建远程/凭证。

按内容分类，非敏感 `.env` 可提交、敏感配置优先现有可信加密方案，密钥不与密文同库，安全获取/恢复前提不可省。能力缺失报告，不新增加密/密钥系统。明文秘密远程传输遵守宿主对具体数据/目标/历史持久风险的逐次确认，私有可见性不自动降低保护。忽略规则保护 data/备份/数据库/应用运行日志/缓存/镜像，允许脱敏运维记录，已有追踪不靠新增 ignore 清历史。

有意义且检查完成的变更先检查 staged diff/范围及时定向提交，再在已确认同步授权内推送并核对远端包含提交；保留用户修改，拒绝强推、重写与自动清冲突，失败留本地提交，未知先查。修改/本地提交/远端同步/业务验证各自报告；远端留档是否必需由具体计划定义，不能用部署成功冒充同步完成。四份独立个人模板保留必要边界，其他流程通过引用复用；不新增 GitOps 平台。

## 4. 产品官网

- 网站责任：介绍产品愿景、用户授权流程、安全边界、开发状态、公开源码；**不运行控制面服务，不接受凭证**。
- 参考 KG OS 源仓库的 `distribution/site/`：其 Astro 静态构建、响应式布局、双语、深浅主题与 GitHub Pages Actions 发布方式。仅借鉴工程模式与结构，不直接复制其带许可的源文件。
- 本项目网站位于 `site/`，Astro 静态输出 `site/dist/`；简体中文默认 `/`，英文 `/en/`。
- 安装引导页面为 `/install/` 和 `/en/install/`，只展示与复制站点源文件中的安装提示词；AI 指南统一从仓库根目录 `INSTALL.md` 生成网页可访问的 `/INSTALL.md`。
- GitHub Actions 工作流从 `main` 构建，`actions/upload-pages-artifact` 仅发布 `site/dist`，`actions/deploy-pages` 部署。静态站不加载服务器机密与私有 Nexum 源码。
- 自定义域名：`nexum-steward.sites.y2l.top`；沿用已有 DNSPod `*.sites.y2l.top` → `byiyli.github.io` 泛解析。**仍需为本 GitHub Pages 仓库单独绑定精确域名**（Pages `cname`）并验证 HTTPS。通配符 DNS 不会自动把不同项目路由到不同仓库，也不能代替 GitHub Pages 站点绑定；GitHub 官方不建议直接使用通配符指向 Pages，需关注域名接管风险，后续可改为自动化管理精确 DNS 记录。
- 只对真实已交付的事实说“已完成”；规划中的部署、自动诊断和 Skill 必须以“设计方向 / 开发中”展示。

## 5. 不属于网站的系统

官网与 ChatGPT 产品插件相互独立：Pages 不接收 OAuth 回调，不调用用户 MCP，不收集服务器登录信息，不能作为运营后台。真实插件分发、身份映射、多账户 OAuth 与运维闭环将在后续阶段由 ChatGPT/Nexum 实测后确认。

本项目当前未选定开源许可证，不能从公开仓库可见性推出可再分发许可。
