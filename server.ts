import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";

// OCR.space accepts "helloworld" for limited testing or use API key from env
const OCR_API_KEY = process.env.OCR_API_KEY || "helloworld";

// Setup multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware
  app.use(express.json());

  // API constraints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // OCR Endpoint
  app.post("/api/ocr", upload.single("document"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Prepare form data for OCR.space
      const form = new FormData();
      form.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      form.append("language", "por"); // Portuguese default
      form.append("isOverlayRequired", "false");
      form.append("isTable", "true"); // helpful for forms

      // Send to OCR.space
      const ocrRes = await axios.post("https://api.ocr.space/parse/image", form, {
        headers: {
          apikey: OCR_API_KEY,
          ...form.getHeaders(),
        },
      });

      if (ocrRes.data && ocrRes.data.IsErroredOnProcessing) {
        return res.status(500).json({ 
          error: "OCR Error", 
          details: ocrRes.data.ErrorMessage 
        });
      }

      const parsedText = ocrRes.data?.ParsedResults?.[0]?.ParsedText || "";

      res.json({ text: parsedText, raw: ocrRes.data });
    } catch (error: any) {
      console.error("OCR API Error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Failed to process document",
        details: error.message
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support Express v5 wildcard syntax if express 5 is used, but we're likely on v4
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
}

startServer();
