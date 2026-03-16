
import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import TelegramBot from "node-telegram-bot-api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;

async function startServer() {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: "tdu-tr" 
      });
      console.log("Firebase Admin initialized");
    }
    db = admin.firestore();
  } catch (e) {
    console.error("Firebase Admin initialization failed:", e);
  }

  // Initialize Telegram Bot
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const adminTgId = process.env.ADMIN_TG_ID;

  let bot: TelegramBot | null = null;
  if (token) {
    try {
      bot = new TelegramBot(token, { polling: true });
      console.log("Telegram Bot initialized");
    } catch (e) {
      console.error("Telegram Bot initialization failed:", e);
    }
  }

  if (bot) {
    // Bot State Management
    const userState: Record<number, { step: string, data: any }> = {};
    const mediaGroups = new Map<string, { images: string[], text: string, timer: NodeJS.Timeout | null, chatId: number, messageId: number }>();

    const isAdmin = async (tgId: number) => {
      if (!db) return false;
      if (adminTgId && tgId.toString() === adminTgId) return true;
      try {
        const userDoc = await db.collection("bot_admins").doc(tgId.toString()).get();
        return userDoc.exists;
      } catch (e) {
        console.error("Error checking admin status:", e);
        return false;
      }
    };

    const publishNewsToFirestore = async (chatId: number, text: string, images: string[], messageId: number) => {
      if (!db || !bot) return;
      try {
        const lines = text.split('\n').filter(l => l.trim() !== '');
        const titleText = lines.length > 0 ? lines[0] : "Новость из Telegram";
        const bodyText = lines.length > 1 ? lines.slice(1).join('\n') : text;
        const excerptText = text.length > 150 ? text.substring(0, 147) + '...' : text;

        const newsData = {
          title: { RU: titleText, BG: titleText, EN: titleText, RO: titleText },
          excerpt: { RU: excerptText, BG: excerptText, EN: excerptText, RO: excerptText },
          fullContent: { RU: bodyText, BG: bodyText, EN: bodyText, RO: bodyText },
          category: "academic",
          images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1523050853064-dbad350c74ee'],
          date: new Date().toLocaleDateString(),
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          author: "Telegram Bot",
          tgMessageId: messageId
        };

        await db.collection("news").add(newsData);
        bot.sendMessage(chatId, '✅ Новость успешно опубликована на сайте!');
        
        // Also post to channel if configured
        const targetChannelId = process.env.TELEGRAM_CHAT_ID;
        if (targetChannelId && targetChannelId !== chatId.toString()) {
           const caption = `<b>${titleText}</b>\n\n${bodyText}`;
           if (images.length > 0) {
             if (images.length === 1) {
               await bot.sendPhoto(targetChannelId, images[0], { caption, parse_mode: "HTML" });
             } else {
               const media = images.map((url, i) => ({
                 type: 'photo',
                 media: url,
                 caption: i === 0 ? caption : '',
                 parse_mode: 'HTML'
               }));
               await bot.sendMediaGroup(targetChannelId, media as any);
             }
           } else {
             await bot.sendMessage(targetChannelId, caption, { parse_mode: "HTML" });
           }
        }
      } catch (e: any) {
        console.error('Ошибка публикации:', e);
        bot.sendMessage(chatId, `❌ Ошибка публикации: ${e.message}`);
      }
    };

    bot.onText(/\/start/, async (msg) => {
      const fromId = msg.from?.id;
      if (!fromId) return;

      if (!(await isAdmin(fromId))) {
        return bot?.sendMessage(fromId, "У вас нет доступа к управлению этим ботом.");
      }

      const menu = {
        reply_markup: {
          keyboard: [
            [{ text: "➕ Добавить новость" }, { text: "👥 Управление пользователями" }],
            [{ text: "📊 Статистика" }, { text: "⚙️ Настройки" }]
          ],
          resize_keyboard: true
        }
      };

      bot?.sendMessage(fromId, "Добро пожаловать в панель управления филиалом Русенского университета!", menu);
    });

    bot.on("message", async (msg) => {
      const fromId = msg.from?.id;
      const chatId = msg.chat.id;
      if (!fromId || !bot) return;
      if (msg.text?.startsWith("/")) return;

      if (!(await isAdmin(fromId))) return;

      const state = userState[fromId];
      const text = msg.text || msg.caption || '';

      // Handle Buttons
      if (msg.text === "➕ Добавить новость") {
        userState[fromId] = { step: "WAITING_TITLE", data: {} };
        return bot.sendMessage(fromId, "Введите заголовок новости:");
      }

      if (msg.text === "📊 Статистика") {
        if (!db) return bot.sendMessage(fromId, "❌ БД не готова.");
        const newsCount = (await db.collection("news").get()).size;
        const appsCount = (await db.collection("applications").get()).size;
        const adminsCount = (await db.collection("bot_admins").get()).size;
        
        const stats = `📊 <b>Статистика системы:</b>\n\n` +
                      `• Новостей: ${newsCount}\n` +
                      `• Заявок: ${appsCount}\n` +
                      `• Админов бота: ${adminsCount + 1}\n`;
        return bot.sendMessage(fromId, stats, { parse_mode: "HTML" });
      }

      if (msg.text === "⚙️ Настройки") {
        return bot.sendMessage(fromId, "⚙️ <b>Настройки:</b>\n\nБот работает в режиме интеграции с Firestore.\nКанал для репоста: " + (process.env.TELEGRAM_CHAT_ID || "Не настроен"), { parse_mode: "HTML" });
      }

      if (msg.text === "👥 Управление пользователями") {
        if (!db) return bot.sendMessage(fromId, "❌ База данных не инициализирована.");
        const admins = await db.collection("bot_admins").get();
        let list = "Список администраторов бота:\n";
        admins.forEach(doc => {
          list += `- ${doc.id} (${doc.data().name || "Без имени"})\n`;
        });
        list += "\nЧтобы добавить: /promote [ID] [Имя]\nЧтобы удалить: /demote [ID]";
        return bot.sendMessage(fromId, list);
      }

      // Handle Wizard Steps
      if (state?.step === "WAITING_TITLE") {
        state.data.title = msg.text;
        state.step = "WAITING_CONTENT";
        return bot.sendMessage(fromId, "Теперь введите основной текст новости:");
      }

      if (state?.step === "WAITING_CONTENT") {
        state.data.content = msg.text;
        state.step = "WAITING_IMAGE";
        return bot.sendMessage(fromId, "Отправьте изображение для новости (или напишите 'нет'):");
      }

      if (state?.step === "WAITING_IMAGE") {
        if (msg.text?.toLowerCase() === 'нет') {
          await publishNewsToFirestore(fromId, state.data.title + "\n" + state.data.content, [], msg.message_id);
          delete userState[fromId];
          return;
        }

        let imageUrl = "";
        if (msg.photo) {
          const fileId = msg.photo[msg.photo.length - 1].file_id;
          const file = await bot.getFile(fileId);
          imageUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
          await publishNewsToFirestore(fromId, state.data.title + "\n" + state.data.content, [imageUrl], msg.message_id);
          delete userState[fromId];
          return;
        } else {
          return bot.sendMessage(fromId, "Пожалуйста, отправьте фото или напишите 'нет'.");
        }
      }

      // Handle Direct Posting (Media Groups / Single Photos with Caption)
      if (msg.media_group_id) {
        if (!mediaGroups.has(msg.media_group_id)) {
          mediaGroups.set(msg.media_group_id, {
            images: [],
            text: '',
            timer: null,
            chatId: chatId,
            messageId: msg.message_id
          });
        }

        const group = mediaGroups.get(msg.media_group_id)!;
        if (text && !group.text) group.text = text;
        
        if (msg.photo) {
          const fileId = msg.photo[msg.photo.length - 1].file_id;
          const file = await bot.getFile(fileId);
          group.images.push(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
        }

        if (group.timer) clearTimeout(group.timer);
        group.timer = setTimeout(async () => {
          const finalGroup = mediaGroups.get(msg.media_group_id!)!;
          await publishNewsToFirestore(finalGroup.chatId, finalGroup.text || "Новость без текста", finalGroup.images, finalGroup.messageId);
          mediaGroups.delete(msg.media_group_id!);
        }, 1500);
      } else if (msg.photo && text && !state) {
        // Single photo with caption, not in wizard
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        const file = await bot.getFile(fileId);
        const imageUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
        await publishNewsToFirestore(chatId, text, [imageUrl], msg.message_id);
      }
    });

    bot.onText(/\/promote (\d+) (.+)/, async (msg, match) => {
      const fromId = msg.from?.id;
      if (!fromId || !match) return;
      if (adminTgId && fromId.toString() !== adminTgId) return;

      const targetId = match[1];
      const name = match[2];

      if (!db) return bot?.sendMessage(fromId, "❌ База данных не инициализирована.");
      await db.collection("bot_admins").doc(targetId).set({ name, addedAt: new Date() });
      bot?.sendMessage(fromId, `✅ Пользователь ${name} (${targetId}) теперь администратор бота.`);
    });

    bot.onText(/\/demote (\d+)/, async (msg, match) => {
      const fromId = msg.from?.id;
      if (!fromId || !match) return;
      if (adminTgId && fromId.toString() !== adminTgId) return;

      const targetId = match[1];
      if (!db) return bot?.sendMessage(fromId, "❌ База данных не инициализирована.");
      await db.collection("bot_admins").doc(targetId).delete();
      bot?.sendMessage(fromId, `❌ Пользователь ${targetId} удален из администраторов.`);
    });
  }

  const app = express();
  const PORT = 3000;

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Configure Multer for local storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = path.parse(file.originalname).name;
      cb(null, `${name}-${uniqueSuffix}${ext}`);
    },
  });

  const upload = multer({ storage });

  // Data Persistence
  const dataFile = path.join(__dirname, "data.json");
  const ensureDataFile = () => {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify({}));
    }
  };
  ensureDataFile();

  // API Routes
  app.use(express.json());

  // Site Data Endpoints
  app.get("/api/site", (req, res) => {
    try {
      const data = fs.readFileSync(dataFile, "utf8");
      res.json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: "Failed to read site data" });
    }
  });

  app.post("/api/site", (req, res) => {
    try {
      const clientSecret = req.headers['x-upload-auth'];
      const serverSecret = process.env.UPLOAD_SECRET || 'default-secret-change-me';
      
      if (clientSecret !== serverSecret) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      fs.writeFileSync(dataFile, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save site data" });
    }
  });

  app.post("/api/programs", (req, res) => {
    try {
      const clientSecret = req.headers['x-upload-auth'];
      const serverSecret = process.env.UPLOAD_SECRET || 'default-secret-change-me';
      
      if (clientSecret !== serverSecret) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // In a real app, we'd save this to a collection. 
      // For now, we'll just acknowledge it as the user is using Firestore for programs mostly.
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed" });
    }
  });

  // Local Upload Endpoint with Compression
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      // Security Check
      const clientSecret = req.headers['x-upload-auth'];
      const serverSecret = process.env.UPLOAD_SECRET || 'default-secret-change-me';
      
      if (clientSecret !== serverSecret) {
        return res.status(403).json({ error: "Unauthorized upload attempt" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname;
      const ext = path.extname(originalName).toLowerCase();
      const isImage = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);

      if (isImage) {
        const uniqueName = path.parse(req.file.filename).name;
        const webpName = `${uniqueName}.webp`;
        const webpPath = path.join(uploadsDir, webpName);
        
        await sharp(filePath)
          .webp({ quality: 80 })
          .toFile(webpPath);
        
        // Remove original uploaded file
        fs.unlinkSync(filePath);
        
        return res.json({ url: `/uploads/${webpName}` });
      }

      // For non-images, just return the path with original name
      return res.json({ url: `/uploads/${req.file.filename}` });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to process upload" });
    }
  });

  // Serve static uploads
  app.use("/uploads", express.static(uploadsDir));

  // Safety net for API routes to prevent falling through to Vite's SPA fallback
  app.use("/api", (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built files
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
