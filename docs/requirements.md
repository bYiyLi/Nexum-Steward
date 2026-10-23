# Nexum Steward — 产品需求

## 目标

让已安装 Nexum 的用户为目标 Linux 服务器安装 Nexum Agent，选定允许 ChatGPT 插件管理的 Agent，然后由 ChatGPT 使用现有 Nexum MCP 与 Docker Compose 完成服务器检查、服务部署和日常运维。以用户可读 Agent 名称交流，以服务端 Agent ID 授权。

## 验收需求

| ID | 需求 | 可观察的验收 |
| --- | --- | --- |
| R-01 | 复用 Nexum Cloud、OAuth、Agent 和现有 MCP 工具，不建立新的运维 MCP Server。 | 当前 `tools/list` 与插件包检查。 |
| R-02 | 用户通过 OAuth Grant 明确选择可管理的 Agent，未授权目标必须不可操作。 | 检查授权内、授权外及撤销后的调用。 |
| R-03 | AI 依 `project.list` 中名称确定目标；同名、模糊、离线或缺失时不能猜测。 | 负面匹配案例。 |
| R-04 | 使用对应 Agent 的 `project.open` / Files / Process，遵守 `allowedRoots`。 | 上下文路由与目录限制实际验证。 |
| R-05 | 支持 Docker Compose 的配置预检、部署、状态与健康验证。 | 在授权的隔离 Linux 服务器上端到端验证。 |
| R-06 | 支持查看 Compose 服务日志、诊断和用户要求的维护动作。 | 验证实时工具输出和结束状态。 |
| R-07 | 变更需要核对端口、服务、Secret 与数据卷，破坏性操作不得由普通部署指令自动授权。 | 端口冲突、持久化卷及拒绝案例。 |
| R-08 | 区分命令执行成功、服务健康、数据恢复能力；失败和中断可如实恢复或停止。 | 部分成功、不可回滚场景验证。 |
| R-09 | 有可维护的 ChatGPT 插件 Skill 模板与单独的 ChatGPT 开发 Project。 | 分别核实本地包和 ChatGPT UI 结果。 |

上述为产品目标，未标为已实现；初始化的完成程度由 `docs/development/01-initialization.md` 记录。

## 本次范围

建立 Mac 上独立项目、Git、规范文档、可解析插件骨架和初版 Skill，准备 ChatGPT Project Instructions，并尽可能在具备写权限的 UI 中创建同名 Project。

## 明确非目标

- 不开发 Dokploy 类 PaaS、Web 运维控制台或 Docker 专用 MCP Tool。
- 不在初始化时修改 Nexum 主仓库、登录服务器、安装 Docker、部署生产服务。
- 不承诺 ChatGPT 离线时持续监控或自行进行后台计划任务。
- 不将 `docker compose` 容器回滚误认为数据库/数据卷回滚。
