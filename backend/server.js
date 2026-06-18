import express from "express";
import nodemailer from "nodemailer";
import { PDFDocument } from "pdf-lib";
import { JSDOM } from "jsdom";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/send-pdf", async (req, res) => {
  //https://leave-of-absence-law-finder.onrender.com/send-pdf
  const { email, chatHtml } = req.body;

  try {
    // Convert HTML to text
    const dom = new JSDOM(chatHtml);
    const text = dom.window.document.body.textContent;

    // Create PDF
import { PDFDocument, StandardFonts } from "pdf-lib";

const pdfDoc = await PDFDocument.create();
const pageWidth = 612;   // Letter size width
const pageHeight = 792;  // Letter size height
const margin = 50;
const fontSize = 12;

const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

let page = pdfDoc.addPage([pageWidth, pageHeight]);
let y = pageHeight - margin;

const words = text.split(" ");
let line = "";

for (let word of words) {
  const testLine = line + word + " ";
  const testWidth = font.widthOfTextAtSize(testLine, fontSize);

  if (testWidth > pageWidth - margin * 2) {
    page.drawText(line, {
      x: margin,
      y,
      size: fontSize,
      font
    });

    line = word + " ";
    y -= fontSize + 4;

    if (y < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  } else {
    line = testLine;
  }
}

if (line.trim().length > 0) {
  page.drawText(line, {
    x: margin,
    y,
    size: fontSize,
    font
  });
}

const pdfBytes = await pdfDoc.save();


   // Email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "YOUR_EMAIL@gmail.com",
        pass: "YOUR_APP_PASSWORD"
      }
    });

    await transporter.sendMail({
      from: "YOUR_EMAIL@gmail.com",
      to: email,
      subject: "Your Chat PDF",
      text: "Attached is your chat conversation.",
      attachments: [
        {
          filename: "chat.pdf",
          content: pdfBytes
        }
      ]
    });

// Required for Render
app.get("/", (req, res) => {
  res.send("PDF service is running");
});

app.listen(3000, () => console.log("Server running on port 3000"));
