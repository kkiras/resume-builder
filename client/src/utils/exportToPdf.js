import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Export a DOM element (or React ref) to a multi-page PDF.
 * Optimized for this app's resume: it will auto-target `.pages`
 * inside the passed container so the entire paginated content is captured
 * instead of just the scroll viewport.
 *
 * @param {HTMLElement|{current:HTMLElement}} elementOrRef
 * @param {Object} options
 * @param {string} [options.fileName]
 * @param {number} [options.scale]
 * @param {string} [options.orientation] 'p' or 'l'
 * @param {string} [options.format] e.g. 'a4'
 * @param {string} [options.backgroundColor] hex without '#'
 */
export async function exportElementToPdf(elementOrRef, options = {}) {
  const root = elementOrRef?.current ?? elementOrRef;
  if (!root) {
    console.error("exportElementToPdf: element/ref is null");
    return;
  }

  // If the container is the scroll wrapper, capture its full content `.pages`
  const target = root.querySelector?.('.pages') || root;

  const {
    fileName = "document.pdf",
    scale = 2,
    orientation = "p",
    format = "a4",
    backgroundColor = "ffffff",
  } = options;

  // Temporarily remove visual gaps/borders for export only
  const originalGap = target.style.gap;
  const pageEls = Array.from(target.children);
  const originalBorders = pageEls.map((el) => el.style.border);
  const originalShadows = pageEls.map((el) => el.style.boxShadow);

  target.style.gap = "0mm";
  pageEls.forEach((el) => {
    el.style.border = "none";
    el.style.boxShadow = "none";
  });

  // Snapshot to canvas with explicit full size to include all pages
  const width = target.scrollWidth;
  const height = target.scrollHeight;

  let canvas;
  try {
    canvas = await html2canvas(target, {
      scale,
      backgroundColor,
      useCORS: true,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
    });
  } finally {
    // Restore styles
    target.style.gap = originalGap;
    pageEls.forEach((el, i) => {
      el.style.border = originalBorders[i];
      el.style.boxShadow = originalShadows[i];
    });
  }

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation, unit: "mm", format });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    pdf.addPage();
    position = -(imgHeight - heightLeft);
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(fileName);
}
