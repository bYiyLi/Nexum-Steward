---
name: steward-spec
description: Nexum Steward 的共用规范；适用于运维 Agent 命名与目标选择、Services Root、运维日志和服务器个人 AGENTS.md 的建立与维护。
---

# Steward 规范

## 规则 1：Nexum Agent 命名

- Steward 专用的服务器运维 Agent 统一使用 `steward-<节点名称>-<env>-ops`，例如 `steward-vps01-dev-ops`、`steward-vps02-prod-ops`。
- `steward` 表示所属产品；`<节点名称>` 是节点标识，在同一管理范围内保持唯一；`<env>` 表示环境；`ops` 表示服务器综合运维职责。
- 节点名称仅使用小写英文字母、数字及连字符，且以字母或数字开头和结尾。
- `<env>` 只允许四种值：`dev`（开发）、`qa`（测试）、`pro`（预生产）、`prod`（生产）。
- 一个 Steward Agent 只对应一个环境，环境由 Agent 名称中的 `<env>` 唯一确定，不在同一个 Agent 下混用多个环境。
- 识别 Steward 运维目标时，从 Nexum 实时 `project.list` 返回的授权可见 Agent 中按完整名称唯一匹配。名称不符合该格式的 Agent 不作为 Steward 运维目标；缺失、重名或离线时不猜测替代对象。

Agent 名称仅用于识别和分类，不能授予权限。实际访问范围仍由 Nexum OAuth Grant 与稳定 Agent ID 校验。

## 规则 2：Services Root

- 由用户根据目标服务器的真实存储和挂载情况确定 **Services Root 绝对路径**；选定路径本身就是根目录，不额外追加 `services/`。
- 在 Services Root 中使用本地 `.git/`、`.gitignore` 管理需要版本化的非敏感配置，以 `logs/YYYY-MM-DD.md` 记录重要运维变更；每个业务服务直接使用独立子目录。
- Git 不得意外包含运行数据、备份或明文密钥；含秘密的 `.env` 不直接提交明文。不要自动配置远程仓库或推送。
- 运维日志按目标服务器的实际时区保存为 `logs/YYYY-MM-DD.md`。每次重要变更使用三级标题 `### <ISO 8601 时间> · <目标>`，记录操作与原因、实际结果、验证依据，以及适用时的配置 Git Commit、遗留风险或恢复信息；没有 Commit 时写「未提交」，不能编造版本或记录秘密。

## 规则 3：个人 AGENTS.md

- 服务器规范属于目标 Nexum Agent **OS 执行用户**的 `~/.agents/AGENTS.md`，不属于 ChatGPT 账户。
- 新建个人文件时正文只设两个二级区域：`## 服务器信息` 与 `## 管理运维规范`；已有文件中的其他用户指令和结构不得为了满足模板格式而被擅自删除或重排，无法安全合并时说明冲突并保留原文件。
- 「服务器信息」根据真实检查与用户确认的信息动态维护，必须包含 Services Root 绝对路径，不维护固定资产字段表。
- 「管理运维规范」采用 Agent 名称对应的 `dev`、`qa`、`pro` 或 `prod` 环境模板；已有指令和定制不得无故覆盖。
