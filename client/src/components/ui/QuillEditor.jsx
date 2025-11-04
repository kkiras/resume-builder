import React, { useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function QuillEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const quillRef  = useRef(null);
  const pastingRef = useRef(false); // guard: đang paste từ prop
  const lastEmittedRef = useRef(null); // JSON string của lines đã emit

  // Helpers
  const getLines = (q) => {
    const txt = q.getText() || ""; // quill luôn kết thúc bằng \n
    // Chia theo dòng, bỏ dòng trống 100%
    return txt
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const setLines = (q, lines) => {
    // Tạo Delta bullet list từ lines
    const ops = [];
    (Array.isArray(lines) ? lines : []).forEach((l) => {
      ops.push({ insert: l });
      ops.push({ insert: "\n", attributes: { list: "bullet" } });
    });
    pastingRef.current = true;
    q.setContents({ ops }, "silent");
    Promise.resolve().then(() => {
      pastingRef.current = false;
    });
  };

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    quillRef.current = new Quill(editorRef.current, {
      theme: "snow",
      placeholder: "Nhập nội dung...",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ color: [] }, { align: [] }],
          [{ list: "bullet" }, { list: "ordered" }],
        ],
      },
    });

    const q = quillRef.current;

    // Gắn listener thay đổi nội dung
    q.on("text-change", () => {
      if (pastingRef.current) return; // bỏ qua sự kiện do sync từ prop
      const lines = getLines(q);
      const s = JSON.stringify(lines);
      // Tránh phát sự kiện khi không thay đổi thực sự
      if (s !== lastEmittedRef.current) {
        lastEmittedRef.current = s;
        onChange?.(lines);
      }
    });

    // Thiết lập giá trị khởi tạo từ prop (nếu có)
    if (Array.isArray(value) && value.length) {
      setLines(q, value);
      lastEmittedRef.current = JSON.stringify(value);
    }
  }, [onChange]);

  // Đồng bộ từ prop -> Quill (chỉ khi khác về nội dung lines)
  useEffect(() => {
    const q = quillRef.current;
    if (!q) return;
    const incoming = Array.isArray(value) ? value : [];
    const curr = getLines(q);
    const same = JSON.stringify(incoming) === JSON.stringify(curr);
    if (!same) {
      setLines(q, incoming);
    }
  }, [value]);

  return (
    <div
      ref={editorRef}
      className="quill-host"
      style={{ minHeight: 220, background: '#fff', color: '#000' }}
    />
  );
}
