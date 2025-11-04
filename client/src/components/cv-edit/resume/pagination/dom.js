import { EPSILON } from "./constants.js";

export const fitsByScroll = (el, limitPx) =>
  el.scrollHeight <= limitPx + EPSILON;

export const removeIdsDeep = (node) => {
  if (node?.removeAttribute) node.removeAttribute("id");
  node?.querySelectorAll?.("[id]")?.forEach(n => n.removeAttribute("id"));
  return node;
};

export const cloneAsShell = (node) => node.cloneNode(false);

export const isListLike = (el) => {
  if (!el || !el.tagName) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === "ul" ||
    (el.classList && el.classList.contains("sectionContent"))
  );
};
