import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { fileURLToPath } from "url";
import "dotenv/config";
import admin from "firebase-admin";
import TelegramBot from "node-telegram-bot-api";

// --- FIX ENV ---
delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
delete process.env.FIREBASE_CONFIG;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db: admin.firestore.Firestore;

async function startServer() {
  try {
    // -----------------------------
    // 1️⃣ FIREBASE INIT
    // -----------------------------
    if (admin.apps.length > 0) {
      await Promise.all(admin.apps.map(app => app.delete()));
    }

    const keyPath = path.resolve(__dirname, "unikey_tdu_tr.json");
    if (!fs.existsSync(keyPath)) {
      throw new Error("Firebase key not found");
    }

    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });

    db = admin.firestore();
    console.log("✅ Firebase connected");

    // -----------------------------
    // 2️⃣ TELEGRAM INIT
    // -----------------------------
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const adminTgId = process.env.ADMIN_TG_ID;
    const channelId = process.env.TELEGRAM_CHAT_ID;

    let bot: TelegramBot | null = null;

    if (token) {
      bot = new TelegramBot(token, { polling: true });
      console.log("✅ Telegram Bot started");
    }

    if (bot) {
      // -----------------------------------------------------
      // 🧠 TELEGRAM STATE MACHINE
      // -----------------------------------------------------
      const userStates = new Map<number, 'IDLE' | 'AWAITING_NEWS' | 'AWAITING_GALLERY_PHOTO' | 'AWAITING_NEW_ADMIN' | 'AWAITING_DEL_ADMIN'>();
      const userTempData = new Map<number, any>();

      const adminKeyboard = {
        reply_markup: {
          keyboard: [
            [{ text: "📰 Добавить новость" }, { text: "🖼 Добавить в галерею" }],
            [{ text: "👥 Управление ролями" }, { text: "❌ Отмена" }]
          ],
          resize_keyboard: true,
          persistent: true
        }
      };

      const cancelKeyboard = {
        reply_markup: {
          keyboard: [[{ text: "❌ Отмена" }]],
          resize_keyboard: true
        }
      };

      const sysadminMenuKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "➕ Добавить Telegram ID", callback_data: "add_tg_admin" }],
            [{ text: "➖ Удалить Telegram ID", callback_data: "del_tg_admin" }]
          ]
        }
      };

      const isAdmin = async (tgId: number) => {
        if (adminTgId && tgId.toString() === adminTgId) return true;
        const doc = await db.collection("bot_admins").doc(tgId.toString()).get();
        return doc.exists;
      };

      const publishNews = async (
        chatId: number,
        text: string,
        images: string[],
        fileId?: string
      ) => {
        const titleStr = text.split("\n")[0] || "Новость";
        let bodyStr = text;
        if (text.includes("\n")) {
          bodyStr = text.substring(text.indexOf("\n") + 1).trim();
        }

        const dateStr = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

        await db.collection("news").add({
          title: { RU: titleStr, BG: titleStr },
          excerpt: { RU: bodyStr.substring(0, 150) + (bodyStr.length > 150 ? '...' : ''), BG: bodyStr.substring(0, 150) + (bodyStr.length > 150 ? '...' : '') },
          fullContent: { RU: bodyStr, BG: bodyStr },
          category: 'event', // default category for Telegram news
          date: dateStr,
          images,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          slug: `tg-${Date.now()}`
        });

        // 🌟 Auto-sync News images to Gallery
        if (images && images.length > 0) {
          const promises = images.map(imgUrl => {
            return db.collection("gallery").add({
              title: { RU: titleStr, BG: titleStr, EN: titleStr, RO: titleStr },
              category: "Новости",
              image: imgUrl,
              timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
          });
          await Promise.allSettled(promises);
        }

        await bot!.sendMessage(chatId, "✅ Опубликовано на сайте");

        if (channelId && channelId !== chatId.toString()) {
          if (fileId) {
            await bot!.sendPhoto(channelId, fileId, {
              caption: `<b>${titleStr}</b>\n\n${bodyStr}`,
              parse_mode: "HTML"
            });
          } else {
            await bot!.sendMessage(channelId, `<b>${titleStr}</b>\n\n${bodyStr}`, {
              parse_mode: "HTML"
            });
          }
        }
      };

      bot.onText(/\/start/, async (msg) => {
        if (!msg.from) return;

        if (!(await isAdmin(msg.from.id))) {
          return bot!.sendMessage(msg.from.id, "У вас нет прав администратора в бота.");
        }

        userStates.set(msg.from.id, 'IDLE');
        bot!.sendMessage(msg.from.id, "<b>Панель управления активна!</b>\n\nВыберите действие из меню ниже 👇", { ...adminKeyboard, parse_mode: 'HTML' });
      });

      // -----------------------------------------------------
      // 🎮 INTERACTIVE BUTTON EVENTS
      // -----------------------------------------------------
      bot.on("callback_query", async (query) => {
        const userId = query.from.id;
        const data = query.data;
        if (!bot) return;

        if (!(await isAdmin(userId))) return;

        // Ensure user is sysadmin to add/del roles
        const sysDocs = await db.collection("bot_admins").doc(userId.toString()).get();
        const isSysAdmin = (adminTgId && userId.toString() === adminTgId) || (sysDocs.exists && sysDocs.data()?.role === 'sysadmin');

        if (!isSysAdmin) {
          bot.answerCallbackQuery(query.id, { text: "Доступно только sysadmin", show_alert: true });
          return;
        }

        if (data === "add_tg_admin") {
          userStates.set(userId, 'AWAITING_NEW_ADMIN');
          bot.sendMessage(userId, "Отправьте <b>Telegram ID</b> нового администратора (цифры).\nНапример: 123456789", { ...cancelKeyboard, parse_mode: 'HTML' });
        } else if (data === "del_tg_admin") {
          userStates.set(userId, 'AWAITING_DEL_ADMIN');
          bot.sendMessage(userId, "Отправьте <b>Telegram ID</b> администратора для удаления.", { ...cancelKeyboard, parse_mode: 'HTML' });
        }

        bot.answerCallbackQuery(query.id);
      });

      // -----------------------------------------------------
      // 📬 MESSAGE LISTENER (STATE MACHINE)
      // -----------------------------------------------------
      bot.on("message", async (msg) => {
        if (!msg.from || !bot) return;
        if (msg.text?.startsWith("/")) return; // Ignore commands
        if (!(await isAdmin(msg.from.id))) return;

        const userId = msg.from.id;
        const text = msg.text || msg.caption || "";
        const state = userStates.get(userId) || 'IDLE';

        // --- CANCEL ACTION ---
        if (text === "❌ Отмена") {
          userStates.set(userId, 'IDLE');
          userTempData.delete(userId);
          bot.sendMessage(userId, "Действие отменено. Выберите в меню 👇", adminKeyboard);
          return;
        }

        // --- MENU ROUTING ---
        if (state === 'IDLE') {
          if (text === "📰 Добавить новость") {
            userStates.set(userId, 'AWAITING_NEWS');
            bot.sendMessage(userId, "Отправьте фото и текст новости в одном сообщении.\n<i>Для нескольких фото отправляйте как альбом, текст к первой фото.</i>", { ...cancelKeyboard, parse_mode: 'HTML' });
          } else if (text === "🖼 Добавить в галерею") {
            userStates.set(userId, 'AWAITING_GALLERY_PHOTO');
            bot.sendMessage(userId, "Отправьте фото для галереи.\nВ подписи (caption) укажите название.", { ...cancelKeyboard, parse_mode: 'HTML' });
          } else if (text === "👥 Управление ролями") {
            const sysDocs = await db.collection("bot_admins").doc(userId.toString()).get();
            const isSysAdmin = (adminTgId && userId.toString() === adminTgId) || (sysDocs.exists && sysDocs.data()?.role === 'sysadmin');
            if (!isSysAdmin) {
              bot.sendMessage(userId, "Только Sysadmin может управлять ролями через бота.", adminKeyboard);
            } else {
              bot.sendMessage(userId, "Выберите действие:", sysadminMenuKeyboard);
            }
          } else {
            bot.sendMessage(userId, "Пожалуйста, используйте кнопки меню 👇", adminKeyboard);
          }
          return;
        }

        // --- STATE EXECUTIONS ---
        const processPhotoUpload = async (fileId: string) => {
          try {
            const file = await bot!.getFile(fileId);
            const telegramUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
            const unique = Date.now();
            const ext = path.extname(file.file_path || ".jpg");
            const destPath = path.join(__dirname, "uploads", `${unique}-tg${ext}`);

            const response = await fetch(telegramUrl);
            const buffer = await response.arrayBuffer();
            fs.writeFileSync(destPath, Buffer.from(buffer));

            const webpPath = destPath + ".webp";
            await sharp(destPath).webp({ quality: 80 }).toFile(webpPath);
            fs.unlinkSync(destPath);
            return `/uploads/${path.basename(webpPath)}`;
          } catch (e: any) {
            console.error("Фото процессинг ошибка:", e.message);
            throw new Error("Не удалось обработать фото");
          }
        };

        if (state === 'AWAITING_NEWS') {
          if (!text && !msg.photo) {
            bot.sendMessage(userId, "Пожалуйста, отправьте текст (или фото с текстом).", cancelKeyboard);
            return;
          }

          try {
            if (msg.photo) {
              const fileId = msg.photo[msg.photo.length - 1].file_id;
              const localUrl = await processPhotoUpload(fileId);
              await publishNews(msg.chat.id, text || "Новость без заголовка", [localUrl], fileId);
            } else {
              await publishNews(msg.chat.id, text, []);
            }
            userStates.set(userId, 'IDLE');
            bot.sendMessage(userId, "✅ Успешно опубликовано в новостях!", adminKeyboard);
          } catch (err: any) {
            bot.sendMessage(userId, `❌ Ошибка: ${err.message}`, adminKeyboard);
            userStates.set(userId, 'IDLE');
          }
        }

        else if (state === 'AWAITING_GALLERY_PHOTO') {
          if (!msg.photo) {
            bot.sendMessage(userId, "Пожалуйста, отправьте <b>Фотографию</b> (со сжатием).", { ...cancelKeyboard, parse_mode: 'HTML' });
            return;
          }
          try {
            const fileId = msg.photo[msg.photo.length - 1].file_id;
            const localUrl = await processPhotoUpload(fileId);
            const titleStr = text || `Фото ${new Date().toLocaleDateString('ru-RU')}`;

            await db.collection("gallery").add({
              title: { RU: titleStr, BG: titleStr, EN: titleStr, RO: titleStr },
              category: "Университет", // Default valid category
              image: localUrl,
              timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            // If there's a channel configured, also send to the public channel
            if (channelId && channelId !== msg.chat.id.toString()) {
              await bot.sendPhoto(channelId, fileId, {
                caption: `📸 <b>Новое фото в Галерее:</b>\n${titleStr}`,
                parse_mode: 'HTML'
              });
            }

            userStates.set(userId, 'IDLE');
            bot.sendMessage(userId, `✅ Фото добавлено в галерею!\nНазвание: ${titleStr}`, adminKeyboard);
          } catch (err: any) {
            bot.sendMessage(userId, `❌ Ошибка загрузки: ${err.message}`, adminKeyboard);
            userStates.set(userId, 'IDLE');
          }
        }

        else if (state === 'AWAITING_NEW_ADMIN') {
          if (!/^\d+$/.test(text.trim())) {
            bot.sendMessage(userId, "ID должен состоять только из цифр. Попробуйте еще раз.", cancelKeyboard);
            return;
          }
          await db.collection("bot_admins").doc(text.trim()).set({
            tgId: text.trim(),
            role: 'admin',
            addedBy: userId,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
          });
          userStates.set(userId, 'IDLE');
          bot.sendMessage(userId, `✅ Telegram ID <code>${text}</code> добавлен как администратор бота!`, { ...adminKeyboard, parse_mode: 'HTML' });
        }

        else if (state === 'AWAITING_DEL_ADMIN') {
          if (!/^\d+$/.test(text.trim())) {
            bot.sendMessage(userId, "ID должен состоять только из цифр. Попробуйте еще раз.", cancelKeyboard);
            return;
          }
          await db.collection("bot_admins").doc(text.trim()).delete();
          userStates.set(userId, 'IDLE');
          bot.sendMessage(userId, `✅ Telegram ID <code>${text}</code> удален из администраторов.`, { ...adminKeyboard, parse_mode: 'HTML' });
        }
      });
    }

    // -----------------------------
    // 3️⃣ EXPRESS INIT
    // -----------------------------
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // Upload folder
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const storage = multer.diskStorage({
      destination: uploadsDir,
      filename: (req, file, cb) => {
        const unique = Date.now();
        cb(null, `${unique}-${file.originalname}`);
      }
    });

    const upload = multer({ storage });

    app.post("/api/upload", upload.single("file"), async (req, res) => {
      if (!req.file) return res.status(400).json({ error: "No file" });

      const filePath = req.file.path;

      // Check if uploaded file is a PDF
      if (req.file.mimetype === "application/pdf") {
        return res.json({ url: `/uploads/${req.file.filename}` });
      }

      // Otherwise, assume it's an image and convert to WebP
      try {
        const webpPath = filePath + ".webp";
        await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
        fs.unlinkSync(filePath);
        res.json({ url: `/uploads/${path.basename(webpPath)}` });
      } catch (e) {
        console.error("Error converting image to WebP:", e);
        // Fallback: just return the original if Sharp fails
        res.json({ url: `/uploads/${req.file.filename}` });
      }
    });

    // --- MISSING API ROUTES ---

    // Site Data API (Public read, Protected write)
    app.get("/api/site", async (req, res) => {
      try {
        const doc = await db.collection("system").doc("siteData").get();
        if (doc.exists) {
          res.json(doc.data());
        } else {
          res.json({}); // Return empty object if not initialized
        }
      } catch (e) {
        console.error("Error fetching site data:", e);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.post("/api/site", async (req, res) => {
      const authHeader = req.headers["x-upload-auth"];
      const secret = authHeader ? decodeURIComponent(authHeader as string) : undefined;
      if (secret !== process.env.VITE_UPLOAD_SECRET && secret !== "default-secret-change-me") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      try {
        await db.collection("system").doc("siteData").set(req.body, { merge: true });
        res.json({ success: true });
      } catch (e) {
        console.error("Error saving site data:", e);
        res.status(500).json({ error: "Server error" });
      }
    });

    // Admin Logs API
    app.post("/api/admin/log", async (req, res) => {
      try {
        await db.collection("logs").add({
          ...req.body,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true });
      } catch (e) {
        console.error("Log error:", e);
        res.status(500).json({ error: "Server error" });
      }
    });

    // Admin Bootstrap
    app.post("/api/admin/bootstrap", async (req, res) => {
      try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });
        await db.collection("admin_users").doc(email).set({
          email,
          role: "sysadmin",
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true, message: "Bootstrap user registered" });
      } catch (e) {
        console.error("Bootstrap error:", e);
        res.status(500).json({ error: "Server error" });
      }
    });

    // Admin User Management
    app.post("/api/admin/create-user", async (req, res) => {
      const authHeader = req.headers["x-upload-auth"];
      const secret = authHeader ? decodeURIComponent(authHeader as string) : undefined;
      if (secret !== process.env.VITE_UPLOAD_SECRET && secret !== "default-secret-change-me") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      try {
        const { uniqueId, password, role, firstName, lastName } = req.body;
        const virtualEmail = `${uniqueId}@tdu-tr.edu`;

        await admin.auth().createUser({
          uid: uniqueId,
          email: virtualEmail,
          password: password,
          displayName: `${firstName} ${lastName}`.trim()
        });

        await db.collection("admin_users").doc(uniqueId).set({
          uniqueId,
          email: virtualEmail,
          role,
          firstName,
          lastName,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true });
      } catch (e: any) {
        console.error("Create user error:", e);
        res.status(500).json({ error: e.message || "Server error" });
      }
    });

    app.post("/api/admin/delete-user", async (req, res) => {
      const authHeader = req.headers["x-upload-auth"];
      const secret = authHeader ? decodeURIComponent(authHeader as string) : undefined;
      if (secret !== process.env.VITE_UPLOAD_SECRET && secret !== "default-secret-change-me") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      try {
        const { uniqueId } = req.body;
        await admin.auth().deleteUser(uniqueId).catch(console.warn);

        const snapshot = await db.collection("admin_users").where("uniqueId", "==", uniqueId).get();
        snapshot.forEach(doc => doc.ref.delete());

        res.json({ success: true });
      } catch (e: any) {
        console.error("Delete user error:", e);
        res.status(500).json({ error: e.message || "Server error" });
      }
    });

    // Facebook sync stub (if it doesn't exist yet, we just return a success to prevent 404s)
    app.post("/api/sync/facebook", async (req, res) => {
      res.json({ success: true, syncedCount: 0, message: "Stub endpoint" });
    });

    app.use("/uploads", express.static(uploadsDir));

    // -----------------------------
    // 4️⃣ VITE
    // -----------------------------
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.join(__dirname, "dist")));
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err: any) {
    console.error("❌ START ERROR:", err.message);
    process.exit(1);
  }
}

startServer();