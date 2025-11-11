import React, { useEffect, useRef } from "react";
import { Previewer } from "pagedjs";

export default function PagedPreview({ children, cssVars, showSource = false }) {
  const sourceRef = useRef(null);
  const pagesRef = useRef(null);

  useEffect(() => {
    if (!sourceRef.current || !pagesRef.current) return;

    // Xoá bản cũ
    pagesRef.current.innerHTML = "";

    // Clone nội dung nguồn để render trong iframe
    const sourceClone = sourceRef.current.cloneNode(true);
    sourceClone.style.display = "block";
    sourceClone.removeAttribute("aria-hidden");

    // CSS đảm bảo layout đúng và sidebar không tràn sang trang 2
    const style = document.createElement("style");
    style.textContent = `
      @page { size: A4; margin: 12mm 14mm; }

      /* Tính chiều cao vùng nội dung 1 trang */
      .paged-content {
        --page-content-height: calc(297mm - 12mm - 12mm);
        color: var(--text-color, #111);
        font-size: var(--content-font-size, 12pt);
        line-height: var(--line-height, 1.4);
      }

      .layout { display: flex; align-items: stretch; }

      .leftSide {
        flex: 0 0 74mm;
        padding: 10mm;
        background: gray;
        height: var(--page-content-height);
        break-inside: avoid;
        page-break-inside: avoid;
      }

      .rightSide { flex: 1; }

      .block {
        break-inside: avoid;
        page-break-inside: avoid;
        margin-bottom: 12px;
      }

      .break-before { break-before: page; page-break-before: always; }
      .break-after  { break-after: page;  page-break-after: always; }

      .page {
        box-shadow: none !important;
        border: none !important;
        background: none !important;
        width: auto !important;
        min-height: auto !important;
        padding: 0 !important;
      }
    `;
    sourceClone.prepend(style);

    (async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {}
      const previewer = new Previewer();
      await previewer.preview(sourceClone, [], pagesRef.current);
    })();

    return () => {
      if (pagesRef.current) pagesRef.current.innerHTML = "";
    };
  }, [children, cssVars]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div ref={pagesRef} />
      <div
        ref={sourceRef}
        className="paged-content"
        // style={{ display: showSource ? "block" : "none", ...(cssVars || {}) }}
        style={{ display: "block", ...(cssVars || {}) }}
        aria-hidden={!showSource}
      >
        {children}
      </div>
    </div>
  );
}
