import { useState, useContext, useRef } from "react";
import { SelectPicker, Slider } from "rsuite";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./leftPanel.module.css";
import CVContext from "../CVContext";

const PANEL_WIDTH = 300;

export default function LeftPanel({
    textColor,
    setTextColor,
    contentFontSize,
    setContentFontSize,
    titleFontSize,
    setTitleFontSize,
    lineHeight,
    setLineHeight,
    subTitleFontSize,
    setSubTitleFontSize,
}) {
    const [open, setOpen] = useState(false);
    const { setResumeData } = useContext(CVContext);

    const updateStyle = (key, value) => {
        if (!setResumeData) return;
        setResumeData(prev => ({
            ...prev,
            styles: {
                ...(prev?.styles || {}),
                [key]: value,
            }
        }));
    };

    // Debounce line-height persistence to avoid jitter during drag
    const lhTimer = useRef(null);
    const handleLineHeightChange = (val) => {
        setLineHeight && setLineHeight(val);
        if (lhTimer.current) clearTimeout(lhTimer.current);
        lhTimer.current = setTimeout(() => updateStyle('lineHeight', val), 120);
    };

    const swatches = [
        "#000000", "#1f2937", "#374151", "#6b7280",
        "#9ca3af", "#d1d5db", "#111827", "#2563eb",
        "#f59e0b", "#ef4444", "#ea580c", "#8b5cf6", "#22c55e",
    ];
    const fontSizes = [
        '10px','11px','12px','13px','14px','15px','16px','18px','20px','24px'
    ].map(
        v => ({ label: v, value: v })
    );

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.button
            aria-label="Close settings"
            className={styles.backdrop}
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Side Panel */}
      <motion.aside
        className={styles.panel}
        style={{ width: PANEL_WIDTH }}
        initial={false}
        animate={open ? "open" : "closed"}
        variants={{
        //   open:   { x: 0, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
            open:   { x: 0 },
            closed: { x: -PANEL_WIDTH+32, boxShadow: "none" },
        }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <div className={styles.panelContent}>
          <div>
            <h3 className={styles.title}>Theme Color</h3>
            <div className={styles.swatchGrid}>
              {swatches.map((c) => (
                <motion.button
                  key={c}
                  className={styles.swatch}
                  style={{ background: c, outline: c === textColor ? '2px solid #444' : 'none' }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Choose ${c}`}
                  onClick={() => { setTextColor && setTextColor(c); updateStyle('textColor', c); }}
                />
              ))}
            </div>
          </div>

          <div className={styles.typoField}>
            <h3 className={styles.title}>Typography</h3>

            <div className={styles.userInput}>
              <label>Line Height:</label>
              <Slider 
                min={1} 
                max={2} 
                step={0.05} 
                value={lineHeight}
                onChange={handleLineHeightChange}
              />
            </div>

            <div className={styles.userInput}>
              <label>Base Font Size:</label>
              <SelectPicker 
                data={fontSizes} 
                searchable={false} 
                value={contentFontSize}
                onChange={(val) => { setContentFontSize && setContentFontSize(val); updateStyle('contentFontSize', val); }}
              />
            </div>

            <div className={styles.userInput}>
              <label>Section Header Size:</label>
              <SelectPicker 
                data={fontSizes} 
                searchable={false} 
                value={titleFontSize}
                onChange={(val) => { setTitleFontSize && setTitleFontSize(val); updateStyle('titleFontSize', val); }}
              />
            </div>

            <div className={styles.userInput}>
              <label>Subsection Header Size:</label>
              <SelectPicker 
                data={fontSizes} 
                searchable={false} 
                value={subTitleFontSize}
                onChange={(val) => { setSubTitleFontSize && setSubTitleFontSize(val); updateStyle('subTitleFontSize', val); }}
              />
            </div>
          </div>
        </div>

        {/* Toggle */}
        <motion.button
            type="button"
            className={styles.toggleBtn}
            aria-label={open ? "Close settings" : "Open settings"}
            onClick={() => setOpen(v => !v)}
            style={{ x: open  ? 4 : 8 }}                 // mặc định như translateX(8px)
            whileHover={{ x: open ? -2 : 14 }}           // hover như translateX(16px)
            whileTap={{ scale: 0.95 }} 
        >
          <motion.span
            className={styles.toggleIcon}
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "tween", duration: 0.2 }}
          >
            ❯
          </motion.span>
        </motion.button>
      </motion.aside>
    </>
  );
}
