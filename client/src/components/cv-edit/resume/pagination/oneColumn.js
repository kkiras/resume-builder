import { fitsByScroll, cloneAsShell, isListLike, removeIdsDeep } from "./dom.js";
import { splitTextInto } from "./splitText.js";

export function paginateByHeight(sourceEl, targetEl, getPage, limitPx) {
  if (!sourceEl || !targetEl) return;
  targetEl.innerHTML = "";

  let currentPage = getPage();
  targetEl.appendChild(currentPage);

  const blocks = Array.from(sourceEl.children);
  for (const block of blocks) {
    const node = removeIdsDeep(block.cloneNode(true));
    currentPage = appendOrPaginate(node, currentPage, getPage, targetEl, limitPx);
  }
}

function appendOrPaginate(node, currentPage, makePage, target, limitPx) {
  currentPage.appendChild(node);
  if (fitsByScroll(currentPage, limitPx)) return currentPage;

  currentPage.removeChild(node);

  if (node.nodeType === Node.ELEMENT_NODE) {
    const shell = cloneAsShell(node);
    currentPage.appendChild(shell);

    if (!fitsByScroll(currentPage, limitPx)) {
      currentPage.removeChild(shell);
      currentPage = makePage();
      target.appendChild(currentPage);
      currentPage.appendChild(shell);
    }

    const children = Array.from(node.childNodes);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (child.nodeType === Node.TEXT_NODE) {
        const splitter = splitTextInto(shell, currentPage, limitPx);
        const { rest } = splitter(child.nodeValue || "");
        if (rest.length) {
          while (rest.length) {
            currentPage = makePage();
            target.appendChild(currentPage);
            const span = document.createElement("span");
            span.style.whiteSpace = "pre-wrap";
            span.style.wordBreak = "break-word";
            currentPage.appendChild(span);
            const reSplit = splitTextInto(currentPage, currentPage, limitPx);
            const r = reSplit(rest);
            rest = r.rest;
          }
        }
      } else {
        const childClone = removeIdsDeep(child.cloneNode(true));
        shell.appendChild(childClone);

        if (!fitsByScroll(currentPage, limitPx)) {
          shell.removeChild(childClone);

          if (isListLike(childClone)) {
            let run = childClone.cloneNode(false);
            shell.appendChild(run);
            const parts = Array.from(childClone.childNodes).map(n => n.cloneNode(true));

            for (const part of parts) {
              run.appendChild(part);
              if (!fitsByScroll(currentPage, limitPx)) {
                run.removeChild(part);
                currentPage = makePage();
                target.appendChild(currentPage);
                const nextShell = cloneAsShell(node);
                currentPage.appendChild(nextShell);
                run = childClone.cloneNode(false);
                nextShell.appendChild(run);
                run.appendChild(part);
              }
            }

            for (let j = i + 1; j < children.length; j++) {
              const sib = removeIdsDeep(children[j].cloneNode(true));
              currentPage = appendOrPaginate(sib, currentPage, makePage, target, limitPx);
            }
            return currentPage;
          }

          currentPage = makePage();
          target.appendChild(currentPage);
          const shellNext = cloneAsShell(node);
          currentPage.appendChild(shellNext);
          currentPage = appendOrPaginate(childClone, currentPage, makePage, target, limitPx);

          for (let j = i + 1; j < children.length; j++) {
            const sib = removeIdsDeep(children[j].cloneNode(true));
            currentPage = appendOrPaginate(sib, currentPage, makePage, target, limitPx);
          }
          return currentPage;
        }
      }
    }
    return currentPage;
  }

  // TEXT_NODE (trường hợp node gốc đã là text)
  const span = document.createElement("span");
  span.style.whiteSpace = "pre-wrap";
  span.style.wordBreak = "break-word";
  currentPage.appendChild(span);
  const splitter = splitTextInto(currentPage, currentPage, limitPx);
  let { rest } = splitter(node.nodeValue || "");

  while (rest.length) {
    const newPage = makePage();
    target.appendChild(newPage);
    const span2 = document.createElement("span");
    span2.style.whiteSpace = "pre-wrap";
    span2.style.wordBreak = "break-word";
    newPage.appendChild(span2);
    const reSplit = splitTextInto(newPage, newPage, limitPx);
    const r = reSplit(rest);
    rest = r.rest;
    currentPage = newPage;
  }
  return currentPage;
}
