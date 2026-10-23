# 项目初始化 — 范围、验收与状态

## 当前交付

在 Mac 的 `~/Code/Nexum-Steward` 初始化独立工程、Git、需求、设计、AGENTS、Skill 插件骨架及 ChatGPT Project Instructions 源文件。不安装服务器服务，不修改 Nexum 主仓库，不发布插件。

| ID | 验收项 | 判定入口 | 当前状态 |
| --- | --- | --- | --- |
| I-01 | 新目录与本地 Git 初始化 | `git status --short --branch` | 通过：main，尚无提交 |
| I-02 | README、规范、需求与设计 | 文件、来源、交叉链接 | 通过：文件已创建，参照真实 Nexum 设计 |
| I-03 | 最小插件 manifest、Skill | JSON、Frontmatter、路径 | 通过：最小包声明及 Skill 已写入 |
| I-04 | 初始化质量门禁 | `node --test tests/plugin.test.mjs` | 通过：3/3（结构与文件契约） |
| I-05 | ChatGPT Project Instructions 维护源 | `docs/chatgpt-project.md` | 通过：已写入本地源文件 |
| I-06 | ChatGPT UI 创建并保存同名 Project | 实际 UI 写入结果 | 通过：已创建并复开核验 1172 字符 Instructions 全等 |
| I-07 | 插件绑定 Nexum MCP，真实服务器 Compose 部署 | OAuth、授权、端到端验收 | 非本次初始化范围 |

## 环境与结果证据

- 初始化时已通过实际的 Mac Agent 确认新仓库与 Nexum 主仓库均为独立目录。个人绝对路径及 Agent 名称不发布到公开仓库；后续操作通过 `project.list` 重新识别。
- Mac 已检查 Node.js 24。插件只用标准 Skill 文件，不引入编译构建依赖。
- `tests/skill-scenarios.md` 是后续模型/实机评估场景，属于文档级审查材料，本轮未实际执行其中的运维操作。
- 结构检查首次运行：`node --test tests/plugin.test.mjs`，3 个测试通过，0 失败。完成最终修改后需再次确认检查结果。
- 2026-10-23 通过 Mac `nexum-browser` 技能连接已登录的 Chrome，在维护者自己的 ChatGPT 账户创建 `Nexum Steward`。项目专属链接不公开。
- 当时已打开「项目设置」，将本地原版 Project Instructions（1172 字符）填入「说明」、保存，再次打开后执行全文字符串比较，结果为 `true`；其后为公开分发将个人路径替换成可复用的 Project 路径发现约定，须重新同步 UI 后才能声称与公开版一致。
- 项目设置中当时观察到「记忆：仅限项目」及无法使用工作模式的提示；未主动修改记忆策略，也未启用分享。
- Git 创建不意味着已提交或已推送；ChatGPT 指令文件存在不意味着 UI 已创建 Project 或保存配置。
