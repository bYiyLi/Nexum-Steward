# Nexum Steward — 工程约定

## 真源与职责

- 产品需求：`docs/requirements.md`
- 技术设计：`docs/design.md`
- 初始化开发记录及验收：`docs/development/01-initialization.md`
- ChatGPT Project Instructions 维护源：`docs/chatgpt-project.md`

需求定义承诺，设计定义职责与接口，代码和实机工具结果证明实现，开发记录提供验收证据；不得把目标描述为已完成事实。

## 基本规则

- 开发资料采用简体中文；API、MCP Tool、CLI 和配置键保持原名称。
- 先检查真实文件、Git、工具与环境；再按最小需求修改、验证和 review。讨论及评审默认只读，只有授权的实施请求才可写入。
- 本仓库只拥有 ChatGPT 运维插件与 Skill，不拥有 Nexum Cloud / Agent / OAuth；不可直接更改外部 Nexum 源仓库。其本机位置必须从实时 Nexum Project 列表中确认。
- 复用 Nexum 实际提供的 `project.*`、`files.*`、`process.*`；不要声称 `compose.*` 之类未实现的 MCP Tool 已存在。
- Agent 名称用来匹配目标；安全授权使用实时 `project.list` 返回的稳定 Agent ID 和 Nexum 后端 Grant。不要从名称推导 ID 或越过服务端权限。
- `process.exec` 不提供命令沙箱；Docker socket、秘密与持久化数据需要系统最小权限和操作审批。ChatGPT 的 Skill 不能替代强制安全边界。
- 保留现有用户数据、工作区和并发修改。不为猜想需求引入运维面板、守护进程、抽象层或新依赖。

## 工程检查与交付

- 插件文件：`.codex-plugin/plugin.json`；Skill：`skills/nexum-steward/SKILL.md`。
- 在仓库根目录运行 `node --test tests/plugin.test.mjs`（Node 24，标准库）。
- 修改 Skill 时，检查选择条件、工具来源、权限/错误/恢复分支和完成证据；文本检查不等于模型端到端测试。
- 完成后检查 `git status` 和真实文件变更。严格区分已创建文件、已运行测试、已提交、已推送、已安装插件、已创建 ChatGPT Project 和已部署服务器。
- Git 提交/推送、ChatGPT UI 写入以及真实服务器变更需要各自的授权与结果，不因文档或初始化自动推定。
