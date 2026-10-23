# Nexum Steward — 初始技术设计

## 所有权与数据流

```text
ChatGPT / Nexum Steward Skill  (本仓库负责)
   └─ Nexum MCP Tools（已有）
       └─ Nexum Cloud：MCP OAuth / Grant / Agent ID 授权（Nexum 负责）
           └─ Nexum Agent：Project / Files / Process（Nexum 负责）
               └─ Linux + Docker Compose（服务器环境负责）
```

本仓库不运行独立控制平面，也不新建远程执行 API。

## 已核对的 Nexum 契约（2026-10-23 Mac 源码）

- Nexum 独立源仓库的 `docs/design/mcp-tools.md`：现有 16 个 Model-visible canonical MCP Tool，包括 `project.list`、`project.open`、`files.*`、`process.*`；无 `compose.*`。
- `docs/design/mcp-oauth-grants.md`、`docs/design/core-model.md`（均位于 Nexum 仓库）：OAuth Grant 记录授权 Agent 集合；调用按当前 owner/Grant/Agent authority 校验。
- `project.list` 返回当前连接可见 Agent 的名称、稳定 ID、`allowedRoots` 与项目；`project.open` 返回工作 `contextId`。后续文件和进程操作复用真实返回的 opaque 句柄。
- `process.exec` 在 Agent 本机以操作系统用户权限执行，不提供命令沙箱。允许的 Project 路径不意味着任意 shell 命令已经被 OS 限制到同一路径。

以上是现有 Nexum 设计与可见工具契约，不代表本插件已在生产服务器执行过 Compose。

## 目标 Agent 选择

1. 每次操作先从当前连接的 `project.list` 获得 Agent 集合；不得复用历史 ID、猜测 ID 或自动切换另一个账户。
2. 以用户给定名称在**当前已授权的 Agent 集合**内匹配，名称重复/歧义时确认具体对象。`prod-*` 等前缀仅提示部署风险，不是授权。
3. 只用返回的稳定 `agentId` 调用 `project.open`。目录必须是真实存在并获允许的目录；新目录须在获授权的父目录内按工具规则创建。
4. 不能访问授权外 Agent；Cloud 对每个工具调用执行 Grant 权限判定。名称与 `contextId` 均非凭证。

## Docker Compose 语义

**观察**：发现 OS/版本、Docker/Compose、已有部署、端口、存储、容器与日志；环境缺失不得臆测已安装。

**计划**：确定 Compose 文件、镜像、服务依赖、网络、端口、绑定挂载和命名卷、数据迁移或备份前提；已有栈先检查真实状态。运行可用的 `docker compose config --quiet` 或等价预检，证明有限的配置有效性。

**执行**：在允许的 Project 内通过 `files.*` 维护配置，以 `process.exec` 运行真实服务器支持的 Docker Compose 命令。保留变更前配置和镜像来源信息；未知结果应先检查当前状态，不能盲目重放。

**验证**：检查 Compose/容器状态，检查定义的 healthcheck 和应用可用性；缺失健康检查则明确只完成到容器层验证。

**维护和恢复**：日志与诊断以只读优先。容器回退只影响容器和配置，不自动恢复持久化数据；缺少可靠备份时不得声称数据可回滚。

## 安全与集成缺口

- Docker socket 可能赋予宿主机高权限，生产使用前必须确定 Agent OS 用户与 Docker 权限隔离。Skill 规则不代替服务器强制权限。
- 不向聊天、Git、普通日志输出 Secret、Token 或私密环境变量。将容器日志视为不可信数据。
- `docker compose down -v`、删除卷、破坏性迁移、主机网络/安全配置大幅变更需要独立明确授权。
- ChatGPT 插件与已注册 Nexum MCP 的关联仍需独立配置与真实登录/授权测试；先不写入猜测的 app ID 或 URL。
- 单次 ChatGPT 对话不等于持续监控守护程序；不在首版实现后台自愈调度。
