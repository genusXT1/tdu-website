
/**
 * ТЕЛЕГРАМ БОТ ДЛЯ САЙТА РУСЕНСК (ESM ВЕРСИЯ)
 * Исправлено: поддержка альбомов (Media Group) и сохранение массива images.
 */

import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- КОНФИГУРАЦИЯ ---
const token = '8582943304:AAF2HEYE-lhrZuDDEtLADoxMJk71rlCmiy8'; 

const DB_PATH = path.join(__dirname, 'data', 'news.json');

function readData() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeData(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const bot = new TelegramBot(token, { polling: true });
const mediaGroups = new Map();

console.log('--- БОТ РУСЕНСК ЗАПУЩЕН (ЛОКАЛЬНАЯ БД) ---');

async function publishNews(chatId, text, images, messageId) {
  try {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    const titleText = lines.length > 0 ? lines[0] : "Новость из Telegram";
    const bodyText = lines.length > 1 ? lines.slice(1).join('\n') : text;
    const excerptText = text.length > 150 ? text.substring(0, 147) + '...' : text;

    if (images.length === 0) {
        images = ['https://images.unsplash.com/photo-1523050853064-dbad350c74ee'];
    }

    const news = readData();
    const newItem = {
      id: Date.now().toString(),
      tgMessageId: messageId,
      date: new Date().toLocaleDateString(),
      category: 'academic',
      images: images,
      title: { RU: titleText, BG: titleText, EN: titleText, RO: titleText },
      excerpt: { RU: excerptText, BG: excerptText, EN: excerptText, RO: excerptText },
      fullContent: { RU: bodyText, BG: bodyText, EN: bodyText, RO: bodyText },
      timestamp: Date.now()
    };

    news.unshift(newItem);
    writeData(news);

    bot.sendMessage(chatId, '✅ Новость опубликована на сайте локально!');
    console.log(`Опубликовано: ${titleText}, Фото: ${images.length}`);
  } catch (error) {
    console.error('Ошибка публикации:', error);
    bot.sendMessage(chatId, `❌ Ошибка: ${error.message}`);
  }
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || msg.caption || '';

  if (text === '/start') {
    bot.sendMessage(chatId, 'Привет! Отправьте новость (одну или несколько фото сразу), и я опубликую их одной записью.');
    return;
  }

  // Если это часть альбома
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

    const group = mediaGroups.get(msg.media_group_id);
    
    // Собираем текст (обычно он только в первом сообщении альбома)
    if (text && !group.text) group.text = text;
    
    // Собираем фото
    if (msg.photo) {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const file = await bot.getFile(fileId);
      const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
      group.images.push(url);
    }

    // Сбрасываем таймер ожидания остальных частей альбома (500мс достаточно)
    if (group.timer) clearTimeout(group.timer);
    group.timer = setTimeout(() => {
      const finalGroup = mediaGroups.get(msg.media_group_id);
      publishNews(finalGroup.chatId, finalGroup.text || "Новость без текста", finalGroup.images, finalGroup.messageId);
      mediaGroups.delete(msg.media_group_id);
    }, 1000);

  } else {
    // Обычное одиночное сообщение
    let images = [];
    if (msg.photo) {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const file = await bot.getFile(fileId);
      images.push(`https://api.telegram.org/file/bot${token}/${file.file_path}`);
    }
    publishNews(chatId, text, images, msg.message_id);
  }
});
