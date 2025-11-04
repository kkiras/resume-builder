import { measurePageInnerHeight } from "../shared/utils";

// Classic's proven one-column pagination algorithm
function fits(pageEl, limitPx) {
  return pageEl.scrollHeight <= limitPx + 0.5; // small buffer to offset layout jitter
}

function appendTextNodeSplit(textNode, containerEl, currentPage, makePage, target, limitPx) {
  const tmp = document.createElement("span");
  tmp.style.whiteSpace = "pre-wrap";
  tmp.style.wordBreak = "break-word";
  containerEl.appendChild(tmp);

  const text = textNode.nodeValue || "";
  let lo = 0, hi = text.length, ok = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    tmp.textContent = text.slice(0, mid);
    if (fits(currentPage, limitPx)) { ok = mid; lo = mid + 1; } else { hi = mid - 1; }
  }
  tmp.textContent = text.slice(0, ok);

  if (ok < text.length) {
    let rest = text.slice(ok);
    while (rest.length) {
      currentPage = makePage();
      target.appendChild(currentPage);
      const span = document.createElement("span");
      span.style.whiteSpace = "pre-wrap";
      span.style.wordBreak = "break-word";
      currentPage.appendChild(span);

      let lo2 = 0, hi2 = rest.length, ok2 = 0;
      while (lo2 <= hi2) {
        const mid2 = (lo2 + hi2) >> 1;
        span.textContent = rest.slice(0, mid2);
        if (fits(currentPage, limitPx)) { ok2 = mid2; lo2 = mid2 + 1; } else { hi2 = mid2 - 1; }
      }
      span.textContent = rest.slice(0, ok2);
      rest = rest.slice(ok2);
    }
  }
  return currentPage;
}

function appendOrPaginate(node, currentPage, makePage, target, limitPx) {
  // Try appending as-is first
  currentPage.appendChild(node);
  if (fits(currentPage, limitPx)) return currentPage;

  // Doesn't fit: remove and split
  currentPage.removeChild(node);

  if (node.nodeType === Node.ELEMENT_NODE) {
    // Create a shell to preserve styles
    const shell = node.cloneNode(false);
    currentPage.appendChild(shell);

    if (!fits(currentPage, limitPx)) {
      // Even shell doesn't fit, start a new page
      currentPage.removeChild(shell);
      currentPage = makePage();
      target.appendChild(currentPage);
      currentPage.appendChild(shell);
    }

    const children = Array.from(node.childNodes);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];

      if (child.nodeType === Node.TEXT_NODE) {
        currentPage = appendTextNodeSplit(child, shell, currentPage, makePage, target, limitPx);
      } else {
        const childClone = child.cloneNode(true);
        shell.appendChild(childClone);

        if (!fits(currentPage, limitPx)) {
          // remove the overflowing child
          shell.removeChild(childClone);

          // Special-case list/content containers: split their items over pages
          const tag = childClone.tagName ? childClone.tagName.toLowerCase() : "";
          const isListLike = tag === 'ul' || (childClone.classList && childClone.classList.contains('sectionContent'));
          if (isListLike) {
            let runContainer = childClone.cloneNode(false);
            shell.appendChild(runContainer);
            const parts = Array.from(childClone.childNodes).map(n => n.cloneNode(true));
            for (const part of parts) {
              runContainer.appendChild(part);
              if (!fits(currentPage, limitPx)) {
                runContainer.removeChild(part);
                // New page; continue content without repeating the section title
                currentPage = makePage();
                target.appendChild(currentPage);
                const nextShell = node.cloneNode(false);
                currentPage.appendChild(nextShell);
                runContainer = childClone.cloneNode(false);
                nextShell.appendChild(runContainer);
                runContainer.appendChild(part);
              }
            }

            // append remaining siblings
            for (let j = i + 1; j < children.length; j++) {
              const sib = children[j].cloneNode(true);
              currentPage = appendOrPaginate(sib, currentPage, makePage, target, limitPx);
            }
            return currentPage;
          }

          // Fallback: move the overflowing child to next page and split there
          currentPage = makePage();
          target.appendChild(currentPage);
          const shellNext = node.cloneNode(false);
          currentPage.appendChild(shellNext);
          currentPage = appendOrPaginate(childClone, currentPage, makePage, target, limitPx);

          for (let j = i + 1; j < children.length; j++) {
            const sib = children[j].cloneNode(true);
            currentPage = appendOrPaginate(sib, currentPage, makePage, target, limitPx);
          }
          return currentPage;
        }
      }
    }
    return currentPage;
  }

  if (node.nodeType === Node.TEXT_NODE) {
    // Split long text across pages by binary search on characters
    const span = document.createElement('span');
    span.style.whiteSpace = 'pre-wrap';
    span.style.wordBreak = 'break-word';
    currentPage.appendChild(span);
    const text = node.nodeValue || '';
    let lo = 0, hi = text.length, ok = 0;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      span.textContent = text.slice(0, mid);
      if (fits(currentPage, limitPx)) { ok = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    span.textContent = text.slice(0, ok);
    if (ok < text.length) {
      let rest = text.slice(ok);
      while (rest.length) {
        currentPage = makePage();
        target.appendChild(currentPage);
        const span2 = document.createElement('span');
        span2.style.whiteSpace = 'pre-wrap';
        span2.style.wordBreak = 'break-word';
        currentPage.appendChild(span2);
        let lo2 = 0, hi2 = rest.length, ok2 = 0;
        while (lo2 <= hi2) {
          const mid2 = (lo2 + hi2) >> 1;
          span2.textContent = rest.slice(0, mid2);
          if (fits(currentPage, limitPx)) { ok2 = mid2; lo2 = mid2 + 1; } else { hi2 = mid2 - 1; }
        }
        span2.textContent = rest.slice(0, ok2);
        rest = rest.slice(ok2);
      }
    }
    return currentPage;
  }

  // Other node types: force new page and append
  currentPage = makePage();
  target.appendChild(currentPage);
  currentPage.appendChild(node);
  return currentPage;
}

function paginateByHeight(sourceEl, targetEl, getPage, pageInnerMaxHeightPx) {
  if (!sourceEl || !targetEl) return;
  targetEl.innerHTML = ""; // clear previous pages

  let currentPage = getPage();
  targetEl.appendChild(currentPage);

  const blocks = Array.from(sourceEl.children); // each section is a .block
  for (const block of blocks) {
    const node = block.cloneNode(true);
    currentPage = appendOrPaginate(node, currentPage, getPage, targetEl, pageInnerMaxHeightPx);
  }
}

// Public API used by Classic template
export function paginateOneColumn(sourceEl, targetEl, styles) {
  if (!sourceEl || !targetEl || !styles) return;
  const pageClass = styles.page || "page";
  const limit = measurePageInnerHeight(targetEl, pageClass);

  const getPage = () => {
    const page = document.createElement("div");
    page.className = pageClass;
    return page;
  };

  paginateByHeight(sourceEl, targetEl, getPage, limit);
}
