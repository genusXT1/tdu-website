
/**
 * ТЕЛЕГРАМ БОТ ДЛЯ САЙТА РУСЕНСК (ESM ВЕРСИЯ)
 * Исправлено: поддержка альбомов (Media Group) и сохранение массива images.
 */

import TelegramBot from 'node-telegram-bot-api';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// --- КОНФИГУРАЦИЯ ---
const token = '8582943304:AAF2HEYE-lhrZuDDEtLADoxMJk71rlCmiy8'; 

const ADMIN_EMAIL = 'kara_andrei@bk.ru'; 
const ADMIN_PASSWORD = '123123';   

const firebaseConfig = {
  apiKey: "AIzaSyAXpr_cA_eWmfepYunKfWEBBzpRUa7kicM",
  authDomain: "tdu-tr.firebaseapp.com",
  projectId: "tdu-tr",
  storageBucket: "tdu-tr.firebasestorage.app",
  messagingSenderId: "1040987079395",
  appId: "1:1040987079395:web:e15615b6061d626a4e7bd6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const bot = new TelegramBot(token, { polling: true });

// Хранилище для медиа-групп (альбомов)
const mediaGroups = new Map();

console.log('--- БОТ РУСЕНСК ЗАПУЩЕН (ПОДДЕРЖКА АЛЬБОМОВ) ---');

async function authenticate() {
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log(`✅ Авторизация успешна: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('❌ Ошибка авторизации Firebase:', error.message);
  }
}

authenticate();

// Основная функция публикации
async function publishNews(chatId, text, images, messageId) {
  try {
    if (!auth.currentUser) await authenticate();
    
    const lines = text.split('\n').filter(l => l.trim() !== '');
    const titleText = lines.length > 0 ? lines[0] : "Новость из Telegram";
    const bodyText = lines.length > 1 ? lines.slice(1).join('\n') : text;
    const excerptText = text.length > 150 ? text.substring(0, 147) + '...' : text;

    if (images.length === 0) {
        images = ['https://images.unsplash.com/photo-1523050853064-dbad350c74ee'];
    }

    await addDoc(collection(db, "news"), {
      tgMessageId: messageId,
      date: new Date().toLocaleDateString(),
      category: 'academic',
      images: images, // Теперь отправляем массив
      title: { RU: titleText, BG: titleText, EN: titleText, RO: titleText },
      excerpt: { RU: excerptText, BG: excerptText, EN: excerptText, RO: excerptText },
      fullContent: { RU: bodyText, BG: bodyText, EN: bodyText, RO: bodyText },
      timestamp: serverTimestamp()
    });

    bot.sendMessage(chatId, '✅ Новость опубликована на сайте (с вложениями)!');
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
