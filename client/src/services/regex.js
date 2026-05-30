export const extractTextFromReactChildren = (children) => {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromReactChildren).join("");
  }
  if (
    children &&
    typeof children === "object" &&
    children.props &&
    children.props.children
  ) {
    return extractTextFromReactChildren(children.props.children);
  }
  return "";
};

export function generateId(children) {
  if (!children) return window.crypto.randomUUID().toString();

  const rawText = extractTextFromReactChildren(children);
  if (!rawText) return window.crypto.randomUUID().toString();

  return rawText
    .toLowerCase()
    .replace(/<\/?u>/g, "")
    .replace(/\$\$[\s\S]*?\$\$/g, "")
    .replace(/\$[^$]*?\$/g, "")
    .replace(/\\\[[\s\S]*?\\\]/g, "")
    .replace(/\\\([\s\S]*?\\\)/g, "")
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
