import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { supabase } from "./supabase";

const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function registerRoutes(app: Express): Promise<Server> {

  app.get("/api/media/:userId/:fileName", async (req: Request, res: Response) => {
    try {
      const { userId, fileName } = req.params;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('chat-media')
        .download(filePath);

      if (error || !data) {
        console.error("Download error:", error);
        return res.status(404).json({ error: "File not found" });
      }

      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const contentType = data.type || 'application/octet-stream';
      const isPdf = contentType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

      res.setHeader('Content-Type', isPdf ? 'application/pdf' : contentType);
      res.setHeader('Content-Length', buffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Accept-Ranges', 'bytes');
      
      if (isPdf) {
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      }
      
      res.send(buffer);
    } catch (error) {
      console.error("Media proxy error:", error);
      res.status(500).json({ error: "Failed to retrieve file" });
    }
  });

  app.post("/api/upload", upload.single("file"), async (req: MulterRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return res.status(500).json({ error: "Failed to upload file" });
      }

      const proxiedUrl = `/api/media/${user.id}/${fileName}`;

      res.json({
        url: proxiedUrl,
        fileName: req.file.originalname,
        fileSize: `${(req.file.size / 1024).toFixed(2)} KB`,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
