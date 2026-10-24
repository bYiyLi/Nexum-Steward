# Nexum Steward — 产品需求

## 定位

**Nexum Steward 是使用已有 Nexum MCP 的 ChatGPT 原生服务器运维插件。**

用户先安装 Nexum，在目标 Linux 服务器上安装 Nexum Agent，并在 Nexum OAuth Grant 中选择具体 Agent；ChatGPT 通过已有 Project / Files / Process Tools 在被授权服务器上完成运维和 Docker Compose 服务部署。

原阶段以**插件基础包和公开产品网站**为交付目标；当前源码范围增加共用规范、服务器环境初始化与只读环境诊断 Skill，不承诺自动后台值守。实施与验收状态见 [03 计划](development/03-steward-doctor.md)。

## 产品能力（后续集成验收）

| ID | 要求 | 证据 |
| --- | --- | --- |
| R-01 | 只连接现有 Nexum MCP，不实现额外 MCP Server/PaaS。 | 真实 `tools/list` 和仓库边界。 |
| R-02 | 用户通过 Nexum OAuth Grant 授权选定 Agent，越权目标不可访问。 | 允许/拒绝/撤销后的真实请求。 |
| R-03 | 按 `project.list` 的 Agent 名称唯一定位，不使用名称本身授权；同名/离线/不可见不猜测。 | 正负向选择案例。 |
| R-04 | 使用现有 `project.open` / Files / Process，在目标 Agent 可访问的 Project 中工作。 | MCP 上下文路由与目标权限测试。 |
| R-05 | 在用户授权范围内进行 Docker Compose 配置检查、部署、状态、日志与健康核验。 | Linux 测试主机端到端验收。 |
| R-06 | 预检端口、网络和持久化卷，对破坏性动作保留明确授权及恢复前提。 | 数据卷、冲突、异常与恢复案例。 |
| R-07 | 区分执行成功、容器运行、应用健康和数据恢复，不能虚报最终状态。 | 部分失败/不可恢复案例。 |

## 本阶段要求

| ID | 要求 | 验收 |
| --- | --- | --- |
| R-08 | 官方 ChatGPT 插件包以 `templates/` 为根目录，使用最简 `plugin.json`，不预置 MCP 连接；用户按需创建私人插件并复用现有 Nexum 应用。 | 清单格式、插件根目录与文件路径检查，不把源码视作已安装私人插件。 |
| R-09 | 共用规范 Skill 为 `templates/skills/steward-spec/SKILL.md`；规范 Agent 命名为 `steward-<节点名称>-<env>-ops`（`dev`、`qa`、`pro`、`prod`，每 Agent 一个环境），并定义 Services Root 与个人 AGENTS.md 的共同约定。 | Skill 路径、命名、服务根目录及个人指令结构检查。 |
| R-10 | 官网为独立静态产品介绍站；不得冒充可运行后台。 | 页面源码、导航与文案评审。 |
| R-11 | 官网提供简体中文与英文入口、响应式布局、清晰的产品流程及仓库链接。 | 本地构建 + 页面交互/移动端检查。 |
| R-12 | GitHub Pages 从公开源码部署至 `nexum-steward.sites.y2l.top` 并启用 HTTPS。 | workflow 成功、Pages 精确域名绑定、泛解析 DNS 与 HTTPS 实际检查。 |
| R-13 | `INSTALL.md` 位于仓库根目录，网站展示可复制的安装提示词；不使用安装目录或版本目录，版本由 Git Tag 区分。 | 文件位置、静态构建产物、安装提示词与指南链接一致。 |
| R-14 | `templates/skills/steward-setup/` 提供服务器环境初始化 Skill 及 dev、qa、pro、prod 四份 AGENTS.md 环境规则模板；支持缺失软件补齐、用户选择 Services Root、本地配置 Git、日志和个人 AGENTS.md 的首次/增量初始化，不负责业务服务部署。 | Skill 格式、模板完整性、两区域结构、已存在配置保护和敏感数据边界检查；真实服务器执行单独验收。 |
| R-15 | Steward 仅管理目标 Nexum Agent 所在服务器的本机 Docker Engine，不支持远程 Daemon；实际 endpoint 归属未确认时停止相关 Docker 操作，不能以远端成功替代本机就绪。 | 本机（含 rootless）正例、远程 context/环境变量/参数覆盖及未知归属负例；静态规则检查与真实执行证据分别记录。 |
| R-16 | `steward-doctor` 以体检、指定对象或指定症状为入口，只交付当前环境要求和证据支持的符合性、健康与异常诊断报告，不自动修复、setup、后台值守或执行健康/业务脚本。 | Skill 及[诊断场景](../tests/steward-doctor-scenarios.md)的选择/调用边界 review；模型与 Linux 实测单独验收。 |
| R-17 | doctor 的范围由用户目标、现有配置和有界发现建立，覆盖适用的身份配置、资源条件、工具运行时及当前用户可用性、服务依赖、持久化可恢复性、安全风险六维；未初始化或缺基线时继续独立事实并标受阻，不扩大为任意扫描或深度数据库审计。 | 体检清单差异、对象必要依赖、症状分支及缺失基线场景。 |
| R-18 | doctor 每项记录对象、预期及依据、证据时点/版本、判定与限制；最小字段读取并脱敏，限定等待与日志窗口/数量，拒绝提权和秘密 dump，身份/连接/状态变化后重验受影响证据。 | 缺 spec、权限拒绝、日志截断/注入、敏感输出及中断重连场景。 |
| R-19 | doctor 报告含目标与总体发现、覆盖、问题、最小后续动作四部分，状态/严重性/可信程度分开；必需项未知使整体为 partial，不能将全部有归宿当作全部通过。 | 报告契约 review 与未来独立模型报告证据。 |
| R-20 | doctor 区分瞬时高占用与故障、running 与探针/业务健康、备份存在与恢复已验证；无证据的原因保留候选，不任设容量阈值或声称全环境正常。 | 高占用、健康层次、多原因和恢复证据场景；真实运行结果另行记录。 |

R-16～R-20 来源为用户已审阅的 03 实施要求，具体运行路径见设计与 doctor Skill；文本和本地静态通过均不能代替实际运行验收。

## 非目标

- 本阶段不进行服务器部署或产品插件公开发布审核；**代码包存在不等于 ChatGPT 已安装**。
- 不自建 Docker MCP Server、PaaS、仪表盘或后台守护进程。
- 当前插件技能范围为 `steward-spec`、`steward-setup` 与 `steward-doctor`；不建立业务部署、自动修复或后台值守 Skill。ChatGPT Project 中辅助开发的通用 Skills 属不同层面。
- 不把 Docker 容器回退当作持久化数据恢复。
- 不在 GitHub Pages 运行 Nexum MCP 或存储 OAuth Token。
