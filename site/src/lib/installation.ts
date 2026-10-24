import type { Locale } from "./content";
import zhPrompt from "../content/install-prompt.zh.txt?raw";
import enPrompt from "../content/install-prompt.en.txt?raw";

export const installationManual = "/INSTALL.md";
export const installationTemplate = "https://github.com/bYiyLi/Nexum-Steward/blob/main/templates/plugin.json";

const labels = {
  zh: {
    title: "创建你的 Nexum Steward 私人插件",
    description: "Nexum Steward 官方 ChatGPT 私人插件安装引导、AI 手册和可复制提示词。",
    back: "返回首页",
    phase: "OFFICIAL PRIVATE PLUGIN SETUP",
    heading: "创建属于你的 ChatGPT 运维插件。",
    introduction: "先确认 Nexum Agent 和 OAuth 授权范围，再将提示词发送给 ChatGPT。安装 Agent 会核对实际连接、官方模板与已有定制，协助你创建私人插件。",
    note: "当前源码包含 steward-spec、steward-setup、steward-doctor 和 steward-deploy 四技能及所需资源；deploy 先规划确认再变更，首版不构建源码。ChatGPT 发现、独立模型与真实 Linux 执行仍待验收。无内置 MCP 连接。网站不会接收凭证，也不会执行服务器命令。",
    stepsTitle: "安装流程",
    steps: [
      ["01", "准备 Nexum", "已在需要管理的服务器上安装 Nexum Agent。"],
      ["02", "连接 ChatGPT", "优先复用已有的 Nexum MCP 应用；未连接则完成 OAuth 授权。"],
      ["03", "描述需求", "填写目标账户、Agent 名称、私人插件名称与个人使用偏好。"],
      ["04", "核对与安装", "审阅生成方案，创建私有插件并用只读查询验证。"]
    ],
    promptTitle: "复制完整提示词",
    promptIntro: "替换方括号中的内容，没有的填“无”或“待确认”。不要在聊天中粘贴密钥或 Token。",
    copy: "复制提示词",
    copied: "提示词已复制，可以粘贴到 ChatGPT",
    failed: "复制失败，请选中下面的文本手动复制",
    resourcesTitle: "官方安装资源",
    manualLabel: "AI 安装手册 INSTALL.md",
    packageLabel: "官方插件模板",
    caveatTitle: "保留你的权限边界",
    caveatText: "Agent 名称不是权限凭证，真实可见机器由 Nexum OAuth Grant 决定。私人插件创建、安装和能否调用工具是不同状态。旧私人插件与共享连接在新版本验收前应保留。"
  },
  en: {
    title: "Create your Nexum Steward private Plugin",
    description: "Official Nexum Steward private ChatGPT Plugin guide, AI manual, and copyable installation prompt.",
    back: "Back home",
    phase: "OFFICIAL PRIVATE PLUGIN SETUP",
    heading: "Create your private ChatGPT operations Plugin.",
    introduction: "Verify your existing Nexum Agents and OAuth permissions, then send the prompt to ChatGPT. The installation Agent will inspect the current connection, official template, and existing customizations.",
    note: "Current source includes steward-spec, steward-setup, steward-doctor and steward-deploy with their required resources. Deploy requires a confirmed plan and does not build source. ChatGPT discovery, independent model behavior and real Linux execution remain unverified. There is no bundled MCP connection. The website does not collect credentials or run server commands.",
    stepsTitle: "Installation workflow",
    steps: [
      ["01", "Prepare Nexum", "Install Nexum Agents on the servers you want to manage."],
      ["02", "Connect ChatGPT", "Reuse your existing Nexum MCP app, or connect with OAuth if necessary."],
      ["03", "Describe your needs", "Specify the account, Agent names, private Plugin name, and preferences."],
      ["04", "Review and install", "Review the plan, create the private Plugin, and verify with read-only calls."]
    ],
    promptTitle: "Copy the full prompt",
    promptIntro: "Replace the bracketed fields; use “none” or “to be confirmed” when appropriate. Never paste secrets or tokens.",
    copy: "Copy installation prompt",
    copied: "Prompt copied. Paste it into ChatGPT.",
    failed: "Copy failed. Select and copy the text manually.",
    resourcesTitle: "Official installation resources",
    manualLabel: "AI manual INSTALL.md",
    packageLabel: "Official Plugin template",
    caveatTitle: "Keep authorization in your hands",
    caveatText: "Agent names are not credentials; Nexum OAuth grants control access. Creating a private Plugin, installing it, and verifying tools are distinct. Preserve old Plugins and shared connections until the new version passes checks."
  }
} as const;

export function getInstallCopy(locale: Locale) {
  return { text: labels[locale], prompt: locale === "zh" ? zhPrompt.trim() : enPrompt.trim() };
}
