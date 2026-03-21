export function generateId(children) {
  const isPlainObject = (value) => {
    return (
      value !== null &&
      typeof value === "object" &&
      value.constructor === Object
    );
  };

  if (!children) return window.crypto.randomUUID().toString();

  let resId = "";
  if (Array.isArray(children)) {
    /*
    if children is an array, iterate through it,
    if string ok,
    else if object then find: object.props.children,
    now concatenate with hyphen
    */
    for (const elm of children) {
      if (isPlainObject(elm)) {
        resId += elm?.props?.children || "-";
      } else {
        resId += elm;
      }
      resId += "-";
    }
  } else {
    resId = children;
  }
  return resId
    .toString()
    .toLowerCase()
    // Remove LaTeX expressions before processing (e.g., $...$, \[...\], \(...\))
    .replace(/\$\$[\s\S]*?\$\$/g, "") // remove display math $$...$$
    .replace(/\$[^$]*?\$/g, "") // remove inline math $...$
    .replace(/\\\[[\s\S]*?\\\]/g, "") // remove \[...\]
    .replace(/\\\([\s\S]*?\\\)/g, "") // remove \(...\)
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, "") // remove LaTeX commands like \frac{...}
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars except space and hyphen
    .replace(/\s+/g, "-") // replace spaces/tabs with hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim hyphens from start/end
}
