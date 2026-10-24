export function bindInstallPrompt(root: Document, clipboard: Pick<Clipboard, "writeText"> | undefined) {
  const content = root.getElementById("guide-prompt-content");
  const copy = root.querySelector<HTMLButtonElement>("[data-copy-install]");
  const select = root.querySelector<HTMLButtonElement>("[data-select-install]");
  const status = root.querySelector<HTMLElement>("[data-copy-status]");
  if (!content || !copy || !select || !status) return;
  const selectAll = () => {
    content.focus();
    const range = root.createRange();
    range.selectNodeContents(content);
    const selection = root.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  };
  select.addEventListener("click", () => { selectAll(); status.textContent = select.dataset.selected ?? ""; });
  copy.addEventListener("click", async () => {
    // The same visible paragraphs provide every copied character, including line breaks.
    const text = Array.from(content.children, p => p.textContent ?? "").join("\n");
    try {
      if (!clipboard) throw new Error("Clipboard unavailable");
      await clipboard.writeText(text);
      status.textContent = copy.dataset.success ?? "";
    } catch {
      selectAll();
      status.textContent = copy.dataset.error ?? "";
    }
  });
}
