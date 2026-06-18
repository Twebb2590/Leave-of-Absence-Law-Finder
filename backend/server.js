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
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(text.substring(0, 3000));

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
