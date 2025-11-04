const A4_HEIGHT_PX = 1122; // tương đương ~297mm ở 96dpi
const MAX_PAGES = 60;

function fits(element, limitPx) {
  return element.scrollHeight <= limitPx + 0.5;
}

/**
 * Tách phần .rightSide thành nhiều trang A4.
 * @param {HTMLElement} sourceEl - phần tử chứa layout Modern (gồm leftSide và rightSide)
 * @param {HTMLElement} targetEl - container .pages để render các trang
 * @param {object} styles - CSS module (modernStyles)
 */
export function paginateModern(sourceEl, targetEl, styles) {
  if (!sourceEl || !targetEl) return;

  targetEl.innerHTML = "";

  const left = sourceEl.querySelector(`.${styles.leftSide}`) || sourceEl.querySelector(".leftSide");
  const right = sourceEl.querySelector(`.${styles.rightSide}`) || sourceEl.querySelector(".rightSide");
  if (!left || !right) return;

  const leftCloneSeed = left.cloneNode(true);
  leftCloneSeed.removeAttribute("id");

  let createdPages = 0;

  const makePage = () => {
    if (createdPages >= MAX_PAGES)
      throw new Error("Pagination hard limit reached");

    const page = document.createElement("div");
    page.className = styles.page || "page";

    const layout = document.createElement("div");
    layout.className = styles.layout || "layout";

    const leftCol = document.createElement("div");
    leftCol.className = styles.leftSide || "leftSide";
    leftCol.appendChild(leftCloneSeed.cloneNode(true));

    const rightCol = document.createElement("div");
    rightCol.className = styles.rightSide || "rightSide";

    layout.appendChild(leftCol);
    layout.appendChild(rightCol);
    page.appendChild(layout);
    createdPages++;
    return page;
  };

  let page = makePage();
  targetEl.appendChild(page);
  let currentRight = page.querySelector(`.${styles.rightSide}`) || page.querySelector(".rightSide");

  const blocks = Array.from(right.children);
  for (const block of blocks) {
    const node = block.cloneNode(true);
    currentRight.appendChild(node);

    if (!fits(currentRight, A4_HEIGHT_PX)) {
      // loại bỏ node bị tràn
      currentRight.removeChild(node);

      // tạo trang mới
      page = makePage();
      targetEl.appendChild(page);
      currentRight =
        page.querySelector(`.${styles.rightSide}`) ||
        page.querySelector(".rightSide");

      // thêm node vào trang mới
      currentRight.appendChild(node);
    }
  }
}
