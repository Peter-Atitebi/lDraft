const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");

const app = express();
app.use(cors());
app.use(express.json());

// --- HELPER: STYLED TEXT PARSER ---
function printStyledText(doc, text, baseFont, fontSize, lineGap, alignValue) {
  const parts = text.split(/(_[^_]+_|\*[^*]+\*)/g);
  doc
    .fontSize(fontSize)
    .font(baseFont)
    .text("", { align: alignValue, continued: true });

  parts.forEach((part) => {
    let font = baseFont;
    let cleanText = part;
    if (part.startsWith("_") && part.endsWith("_")) {
      cleanText = part.slice(1, -1);
      if (baseFont.includes("Times")) font = "Times-Italic";
      else if (baseFont.includes("Helvetica")) font = "Helvetica-Oblique";
    } else if (part.startsWith("*") && part.endsWith("*")) {
      cleanText = part.slice(1, -1);
      if (baseFont.includes("Times")) font = "Times-Bold";
      else if (baseFont.includes("Helvetica")) font = "Helvetica-Bold";
    }
    doc.font(font).text(cleanText, { continued: true });
  });
  // End the line
  doc.text("", { lineGap: lineGap });
}

app.post("/create-pdf", (req, res) => {
  const { content, settings } = req.body;

  // Start with 1 page automatically
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 72, bottom: 72, left: 72, right: 72 },
    autoFirstPage: true,
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=project.pdf`);
  doc.pipe(res);

  // --- SETTINGS ---
  const fontName = settings?.font || "Times-Roman";
  const fontBold = fontName === "Times-Roman" ? "Times-Bold" : "Helvetica-Bold";
  const fontSize = parseInt(settings?.fontSize) || 12;
  const spacingFactor = parseFloat(settings?.lineSpacing) || 1.5;
  const lineGap = (spacingFactor - 1) * fontSize;

  // --- BODY CONTENT ---
  doc.font(fontName).fontSize(fontSize);

  // Safety check: ensure content exists
  const safeContent = content || "";
  const lines = safeContent.split("\n");

  lines.forEach((line, index) => {
    const cleanLine = line.trim();
    const upperLine = cleanLine.toUpperCase();

    if (cleanLine.length === 0) {
      doc.moveDown();
      return;
    }

    // SMART FORMATTING: CHAPTERS & REFERENCES
    if (upperLine.startsWith("CHAPTER") || upperLine === "REFERENCES") {
      // Only add a new page if it's NOT the very first line
      if (index > 0) {
        doc.addPage();
      }

      // Center & Bold
      doc.font(fontBold).text(cleanLine, { align: "center", lineGap: lineGap });
      doc.font(fontName); // Reset to regular
      doc.moveDown();
    } else {
      // Standard Body Text (Flush Left)
      printStyledText(doc, cleanLine, fontName, fontSize, lineGap, "left");
      doc.moveDown();
    }
  });

  doc.end();
});

app.listen(5000, () => console.log("Server running on port 5000"));
