// printModernPdf.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Export Modern template (single long page + cut lines) to a multi-page PDF.
 *
 * @param {HTMLElement|{current:HTMLElement}} elementOrRef - Container cuộn hoặc chính node .page
 * @param {Object} options
 * @param {string}  [options.fileName="resume.pdf"]
 * @param {number}  [options.scale=2]              // >1 cho ảnh nét hơn
 * @param {"p"|"l"} [options.orientation="p"]      // portrait/landscape
 * @param {string}  [options.format="a4"]
 * @param {string}  [options.backgroundColor="#ffffff"] // màu nền khi render
 * @param {boolean} [options.includeCutLines=false]     // nếu true sẽ giữ cutOverlay khi export
 */
export async function exportModernToPdf(elementOrRef, options = {}) {
  const root = elementOrRef?.current ?? elementOrRef;
  if (!root) {
    console.error("[exportModernToPdf] element/ref is null");
    return;
  }

  // Đích chụp: ưu tiên .page (Modern render 1 page dài)
  const pageEl =
    root.matches?.(".page") ? root :
    root.querySelector?.(".page") || root;

  const {
    fileName = "resume.pdf",
    scale = 2,
    orientation = "p",
    format = "a4",
    backgroundColor = "#ffffff",
    includeCutLines = false,
  } = options;

  // 1) Tạm ẩn overlay (cut lines) nếu không muốn xuất ra PDF
  const cutOverlay = pageEl.querySelector?.(".cutOverlay");
  const prevCutDisplay = cutOverlay?.style?.display;
  if (cutOverlay && !includeCutLines) {
    cutOverlay.style.display = "none";
  }

  // 2) Loại các hiệu ứng trang trí khi export (shadow/border...)
  const originalBorder = pageEl.style.border;
  const originalBoxShadow = pageEl.style.boxShadow;
  pageEl.style.border = "none";
  pageEl.style.boxShadow = "none";

  // 3) Render toàn bộ chiều cao nội dung sang canvas
  const width = pageEl.scrollWidth;
  const height = pageEl.scrollHeight;
  const canvas = await html2canvas(pageEl, {
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

  // Khôi phục style sau khi chụp
  pageEl.style.border = originalBorder;
  pageEl.style.boxShadow = originalBoxShadow;
  if (cutOverlay && !includeCutLines) {
    cutOverlay.style.display = prevCutDisplay ?? "";
  }

  // 4) Chuyển canvas thành PDF nhiều trang chuẩn A4
  const pdf = new jsPDF({ orientation, unit: "mm", format });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // quy đổi: vẽ ảnh theo chiều rộng trang, giữ tỉ lệ
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  const imgData = canvas.toDataURL("image/png");

  // Vẽ trang đầu
  let remainH = imgH;
  let posYmm = 0;
  pdf.addImage(imgData, "PNG", 0, posYmm, imgW, imgH);
  remainH -= pageH;

  // Các trang sau: dịch âm theo mm để “cuộn” ảnh
  while (remainH > 0) {
    pdf.addPage();
    posYmm = -(imgH - remainH);
    pdf.addImage(imgData, "PNG", 0, posYmm, imgW, imgH);
    remainH -= pageH;
  }

  pdf.save(fileName);
}

/**
 * Tiện ích: in thẳng ra cửa sổ in của trình duyệt (để người dùng chọn máy in/PDF).
 * Dùng khi muốn preview nhanh, không phụ thuộc jsPDF.
 * Lưu ý: kết quả phụ thuộc trình duyệt.
 */
export function printModernInBrowser(elementOrRef) {
  const root = elementOrRef?.current ?? elementOrRef;
  if (!root) return;

  const pageEl =
    root.matches?.(".page") ? root :
    root.querySelector?.(".page") || root;

  const printWin = window.open("", "_blank");
  if (!printWin) return;

  // Copy CSS hiện tại (tối thiểu)
  const css = Array.from(document.styleSheets)
    .map((s, i) => {
      try {
        return Array.from(s.cssRules || []).map(r => r.cssText).join("\n");
      } catch {
        return ""; // bỏ qua cross-origin stylesheet
      }
    })
    .join("\n");

  printWin.document.write(`
    <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          @page { size: A4; margin: 0; }
          body { margin: 0; }
          ${css}
          /* Ẩn overlay cắt trên bản in */
          .cutOverlay { display: none !important; }
        </style>
      </head>
      <body>${pageEl.outerHTML}</body>
    </html>
  `);
  printWin.document.close();
  printWin.focus();
  printWin.print();
  printWin.close();
}
