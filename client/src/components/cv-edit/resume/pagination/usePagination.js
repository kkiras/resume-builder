import { useEffect, useRef } from "react";
import { MAX_PAGES } from "./constants.js";
import { measureModernMainHeight, measurePageInnerHeight } from "./measure.js";
import { paginateByHeight } from "./oneColumn.js";
import { paginateTwoCols } from "./twoColumns.js";

export default function usePagination({
  templateName,
  pageClass,
  modernStyles,
  sourceRef,
  pagesRef,
}) {
  const paginatingRef = useRef(false);

  useEffect(() => {
    const targetEl = pagesRef.current;
    const sourceEl = sourceRef.current;
    if (!targetEl || !sourceEl || paginatingRef.current) return;

    paginatingRef.current = true;
    const cancel = () => { paginatingRef.current = false; };

    try {
      requestAnimationFrame(() => {
        try {
          if (templateName === "Modern") {
            const leftEl = sourceEl.querySelector("#cv-left");
            const rightEl = sourceEl.querySelector("#cv-right");
            if (!leftEl || !rightEl) return cancel();

            const mainMaxPx = measureModernMainHeight(targetEl, pageClass, modernStyles);

            const makePage = () => {
              const page = document.createElement("div");
              page.className = pageClass;
              const cols = document.createElement("div");
              cols.className = modernStyles.columns || "columns";
              const sb = document.createElement("div");
              sb.className = modernStyles.sidebar || "sidebar";
              const mn = document.createElement("div");
              mn.className = modernStyles.main || "main";
              cols.appendChild(sb); cols.appendChild(mn); page.appendChild(cols);
              return page;
            };

            const sidebarSeed = leftEl.cloneNode(true);
            sidebarSeed.removeAttribute("id");

            paginateTwoCols(sidebarSeed, rightEl, targetEl, makePage, mainMaxPx);
            return;
          }

          // Classic / Minimalist
          const pageInnerMaxHeightPx = measurePageInnerHeight(targetEl, pageClass);

          let createdPages = 0;
          const getPage = () => {
            if (createdPages >= MAX_PAGES) throw new Error("Pagination hard limit reached");
            const page = document.createElement("div");
            page.className = pageClass;
            createdPages++;
            return page;
          };

          paginateByHeight(sourceEl, targetEl, getPage, pageInnerMaxHeightPx);
        } catch (e) {
          console.error("paginate error", e);
        } finally {
          cancel();
        }
      });
    } catch {
      cancel();
    }
  }, [templateName, pageClass, modernStyles, sourceRef, pagesRef]);
}
