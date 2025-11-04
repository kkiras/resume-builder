import { MAX_PAGES } from "./constants.js";
import { fitsByScroll, cloneAsShell, isListLike, removeIdsDeep } from "./dom.js";
import { splitTextInto } from "./splitText.js";

export function paginateTwoCols(sidebarSeed, sourceRightEl, targetEl, makePage, mainMaxHeightPx) {
  if (!sidebarSeed || !sourceRightEl || !targetEl) return;
  targetEl.innerHTML = "";

  let createdPages = 0;
  const makePageWithSidebar = () => {
    if (createdPages++ > 60) throw new Error("Pagination hard limit reached");
    const p = makePage();
    const sb =
      p.querySelector(".sidebar") || p.querySelector('[class*="sidebar"]');
    if (sb) sb.appendChild(sidebarSeed.cloneNode(true));
    return p;
  };

  let page = makePageWithSidebar();
  targetEl.appendChild(page);
  let currentMain =
    page.querySelector(".main") || page.querySelector('[class*="main"]');

  // ✅ Lấy trực tiếp các .block ở cấp 1
  const blocks = Array.from(sourceRightEl.querySelectorAll(":scope > .block"));
  for (const block of blocks) {
    const node = block.cloneNode(true);
    stripIds(node);
    currentMain = appendOrPaginateModern(
      node,
      currentMain,
      makePageWithSidebar,
      targetEl,
      mainMaxHeightPx
    );
  }
}

function stripIds(node) {
  node.removeAttribute?.("id");
  node.querySelectorAll?.("[id]")?.forEach((n) => n.removeAttribute("id"));
}

function appendOrPaginateModern(node, currentMain, makePage, target, limitPx) {
  currentMain.appendChild(node);
  if (fitsByScroll(currentMain, limitPx)) return currentMain;

  currentMain.removeChild(node);

  if (node.nodeType === Node.ELEMENT_NODE) {
    const shell = cloneAsShell(node);
    currentMain.appendChild(shell);

    if (!fitsByScroll(currentMain, limitPx)) {
      currentMain.removeChild(shell);
        const newPage = makePage();
        target.appendChild(newPage);
        const nextMain = newPage.querySelector(".main") || newPage.querySelector('[class*="main"]');
        nextMain.appendChild(node); // giữ nguyên phần tử
        return nextMain;
    }

    const children = Array.from(node.childNodes);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (child.nodeType === Node.TEXT_NODE) {
        const splitter = splitTextInto(shell, currentMain, limitPx);
        const { rest } = splitter(child.nodeValue || "");
        if (rest.length) {
          while (rest.length) {
            const newPage = makePage();
            target.appendChild(newPage);
            const nextMain = newPage.querySelector(".main") || newPage.querySelector('[class*="main"]');
            const span = document.createElement("span");
            span.style.whiteSpace = "pre-wrap";
            span.style.wordBreak = "break-word";
            nextMain.appendChild(span);
            const reSplit = splitTextInto(nextMain, nextMain, limitPx);
            const r = reSplit(rest);
            rest = r.rest;
            currentMain = nextMain;
          }
        }
      } else {
        const childClone = removeIdsDeep(child.cloneNode(true));
        shell.appendChild(childClone);

        if (!fitsByScroll(currentMain, limitPx)) {
          shell.removeChild(childClone);

          if (isListLike(childClone)) {
            let run = childClone.cloneNode(false);
            shell.appendChild(run);
            const parts = Array.from(childClone.childNodes).map(n => n.cloneNode(true));
            for (const part of parts) {
              run.appendChild(part);
              if (!fitsByScroll(currentMain, limitPx)) {
                run.removeChild(part);
                const newPage = makePage();
                target.appendChild(newPage);
                const nextMain = newPage.querySelector(".main") || newPage.querySelector('[class*="main"]');
                const nextShell = cloneAsShell(node);
                nextMain.appendChild(nextShell);
                run = childClone.cloneNode(false);
                nextShell.appendChild(run);
                run.appendChild(part);
                currentMain = nextMain;
              }
            }

            for (let j = i + 1; j < children.length; j++) {
              const sib = removeIdsDeep(children[j].cloneNode(true));
              currentMain = appendOrPaginateModern(sib, currentMain, makePage, target, limitPx);
            }
            return currentMain;
          }

          const newPage = makePage();
          target.appendChild(newPage);
          const nextMain = newPage.querySelector(".main") || newPage.querySelector('[class*="main"]');
          currentMain = appendOrPaginateModern(childClone, nextMain, makePage, target, limitPx);

          for (let j = i + 1; j < children.length; j++) {
            const sib = removeIdsDeep(children[j].cloneNode(true));
            currentMain = appendOrPaginateModern(sib, currentMain, makePage, target, limitPx);
          }
          return currentMain;
        }
      }
    }
    return currentMain;
  }

  // TEXT_NODE
  const span = document.createElement("span");
  span.style.whiteSpace = "pre-wrap";
  span.style.wordBreak = "break-word";
  currentMain.appendChild(span);

  const splitter = splitTextInto(currentMain, currentMain, limitPx);
  let { rest } = splitter(node.nodeValue || "");
  while (rest.length) {
    const newPage = makePage();
    target.appendChild(newPage);
    const nextMain = newPage.querySelector(".main") || newPage.querySelector('[class*="main"]');
    const span2 = document.createElement("span");
    span2.style.whiteSpace = "pre-wrap";
    span2.style.wordBreak = "break-word";
    nextMain.appendChild(span2);
    const reSplit = splitTextInto(nextMain, nextMain, limitPx);
    const r = reSplit(rest);
    rest = r.rest;
    currentMain = nextMain;
  }
  return currentMain;
}
