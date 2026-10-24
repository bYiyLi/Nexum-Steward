import type { Locale } from "./content";
import zhPrompt from "../content/install-prompt.zh.txt?raw";
import enPrompt from "../content/install-prompt.en.txt?raw";
export const installationManual = "/INSTALL.md";
const labels = {
  zh: {
    title: "安装 Nexum Steward", description: "把简短提示词发送给 ChatGPT，按官方指南安装 Nexum Steward 私人插件。",
    back: "返回首页", phase: "INSTALL NEXUM STEWARD", heading: "把下面这段话发送给 ChatGPT",
    introduction: "让 ChatGPT 先了解现状，再按官方指南协助安装。无需预填信息。",
    creatorInstruction: "在 ChatGPT 输入框输入 @，选择实际可用的 Plugin Creator（插件创建器），再粘贴下方提示词发送。",
    creatorAvailability: "是否可用，以当前账户与客户端为准。",
    promptTitle: "安装提示词", copy: "复制提示词", copied: "已复制，粘贴到 ChatGPT 即可。", failed: "复制未成功。文本已选中，请手动复制；也可直接选择下方全文。",
    select: "手动选择全文", selected: "已选中完整提示词，请使用系统复制快捷键。",
    stepsTitle: "接下来，只有三步",
    steps: [["01", "读指南", "ChatGPT 核实官方版本与当前能力。"], ["02", "确认连接目标", "复用已有 Nexum，仅在必要时询问选择或登录授权。"], ["03", "核验结果", "分开核实插件、技能发现与只读连接结果。"]],
    manualLabel: "阅读完整安装指南", packageLabel: "查看官方源码", note: "插件尚未正式发布，安装能力取决于当前账户与工作区。安装不部署服务器。",
    status: "源码包含 steward-spec、steward-setup、steward-doctor、steward-deploy 及所需资源。deploy 首版不构建源码。ChatGPT 安装与发现、模型行为、真实 Linux 执行仍待验收。"
  },
  en: {
    title: "Install Nexum Steward", description: "Send a short prompt to ChatGPT to install your private Nexum Steward Plugin using the official guide.",
    back: "Back home", phase: "INSTALL NEXUM STEWARD", heading: "Send this message to ChatGPT",
    introduction: "Let ChatGPT check your current setup and follow the official guide. No form to fill in.",
    creatorInstruction: "In the ChatGPT message box, type @, choose Plugin Creator if it is available, then paste and send the prompt below.",
    creatorAvailability: "Availability varies by account and client.",
    promptTitle: "Installation prompt", copy: "Copy prompt", copied: "Copied. Paste it into ChatGPT.", failed: "Copy did not succeed. The text is selected; copy it manually or select the full text below.",
    select: "Select full prompt", selected: "Full prompt selected. Use your system copy shortcut.",
    stepsTitle: "Three simple steps",
    steps: [["01", "Read the guide", "ChatGPT checks official versions and available capabilities."], ["02", "Confirm the target", "Reuse Nexum. Ask only when a choice or sign-in authorization is needed."], ["03", "Verify the result", "Check the Plugin, Skill discovery and read-only connection separately."]],
    manualLabel: "Read the full installation guide", packageLabel: "View official source", note: "No formal Plugin release yet. Installation depends on your account and workspace. It does not deploy servers.",
    status: "Source includes steward-spec, steward-setup, steward-doctor, steward-deploy and their resources. Deploy does not build source. ChatGPT installation and discovery, model behavior and real Linux execution remain unverified."
  }
} as const;
export function getInstallCopy(locale: Locale) { return { text: labels[locale], prompt: (locale === "zh" ? zhPrompt : enPrompt).trim() }; }
