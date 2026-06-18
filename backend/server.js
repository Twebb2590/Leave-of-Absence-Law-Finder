import express from "express";
import nodemailer from "nodemailer";
import { PDFDocument } from "pdf-lib";
import { JSDOM } from "jsdom";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/send-pdf", async (req, res) => {
  //https://leave-of-absence-law-finder.onrender.com/send-pdf
});
  const { email, chatHtml } = req.body;

  try {
    const dom = new JSDOM(chatHtml);
    const text = dom.window.document.body.textContent;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(text.substring(0, 3000));

    const pdfBytes = await pdfDoc.save();

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

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(3000);
