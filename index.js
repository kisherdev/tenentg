const fs = require('fs')
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const TelegramBot = require('node-telegram-bot-api');
const { token, logs, moders, bots, emotions, rp, renders, arts, skins4d, skins } = require('./config.json');
const bot = new TelegramBot(token, { polling: true });

let adminStates = {};
let userStates = {};

const services_chats = [{ name: 'Боты', value: bots }, { name: 'Эмоции', value: emotions }, { name: 'Ресурс-Паки', value: rp }, { name: 'Рендер', value: renders }, { name: 'Арты', value: arts }, { name: '4D Скин', value: skins4d }, { name: 'Скин', value: skins }]

bot.on('text', async msg => {
    const bans = await db.get('bans')
    if (bans.filter(item => item.username === msg.from.username).length !== 0) return bot.sendMessage(msg.from.id, `❌ Вы забанены!\nПричина: ${bans.filter(item => item.username === msg.from.username)[0].reason}`);

    try {
        if (msg.text.startsWith('/start')){
            if (msg.chat.type !== 'private') return bot.sendSticker(msg.chat.id, 'CAACAgIAAxkBAAIDh2aJaMmUks8XAAGi-EBJaxdgbBtQcAACRhEAAsjbQUs6HfuNekXfLjUE');
            if (msg.from.username === 'Nicelinger' || msg.from.username === 'kishulyaa') {
                var opts = {
                    caption: `*🙋 Добро пожаловать, ${msg.from.first_name}!*\n\nПриветик! Я Тэнэн - умный помощник T&N Studio.\n\nС моей помощью ты сможешь выбрать услугу, создать описание и оформить заказ за пару минут. Выбери действие, чтобы начать работу.`,
                    parse_mode: "Markdown",
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[
                            {
                              text: '🛒 Заказать',
                              callback_data: 'order'
                            }],
                            [{
                              text: '🆘 Поддержка',
                              callback_data: 'help'
                            }],
                            [{
                              text: '🛍 Мои заказы',
                              callback_data: 'orders'
                            }],
                            
                            [{
                                text: '🔐 Админ панель',
                                callback_data: 'admin'
                            }]
                          ]
                    })
                }
            } else {
                var opts = {
                    caption: `*🙋 Добро пожаловать, ${msg.from.first_name}!*\n\nПриветик! Я Тэнэн - умный помощник T&N Studio.\n\nС моей помощью ты сможешь выбрать услугу, создать описание и оформить заказ за пару минут. Выбери действие, чтобы начать работу.`,
                    parse_mode: "Markdown",
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[
                            {
                              text: '🛒 Заказать',
                              callback_data: 'order'
                            }],
                            [{
                              text: '🆘 Поддержка',
                              callback_data: 'help'
                            }],
                            [{
                              text: '🛍 Мои заказы',
                              callback_data: 'orders'
                            }]
                          ]
                    })
                }
            }
            await bot.sendPhoto(msg.chat.id, 'https://media.discordapp.net/attachments/1085997899931987978/1258372537021370378/tg_start_2.png?ex=6687ce40&is=66867cc0&hm=32dcccf7985d2533c66dfd649dd2cf213b4d02a7363b2f16098309b7511449f1&=&format=webp&quality=lossless&width=719&height=404', opts)
            if (await db.get(`orders_${msg.from.id}`) === null || await db.get(`orders_${msg.from.id}`) === undefined) return await db.set(`orders_${msg.from.id}`, []);
        }
    } catch(err) {
        await bot.sendMessage(msg.chat.id, 'Упс... Что-то пошло не так!')
        console.log(err)
    }
})

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
    const action = callbackQuery.data;
    const messageId = callbackQuery.message.message_id;
    const chatId = callbackQuery.message.chat.id;

    const bans = await db.get('bans')
    if (bans.filter(item => item.username === callbackQuery.from.username).length !== 0) return bot.sendMessage(chatId, `❌ Вы забанены!\nПричина: ${bans.filter(item => item.username === callbackQuery.from.username)[0].reason}`);

    let services = await db.get('services')

    if (action === 'help') {
        bot.sendMessage(chatId, `📝 Пожалуйста, отправьте ваше сообщение и оно будет пересалано нашей тех. поддержке.`)

        bot.once('message', async msg => {
            if (userStates[chatId] !== undefined) return;
            if (!msg.photo) {
                let opts = {
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[
                            {
                              text: '✏️ Ответить',
                              callback_data: `ans_${msg.from.id}_${msg.from.username}`
                            }],
                            [{
                                text: '🧨 Забанить',
                                callback_data: `ban_${msg.from.id}_${msg.from.username}`
                            }]
                          ]
                    })
                }
                await bot.sendMessage(moders, `✏️ Сообщение от @${msg.from.username}:\n\n${msg.text}\n\n#вопрос`, opts)
            } else {
                const username = msg.from.username || msg.from.first_name || 'Анонимный пользователь'; 
                const photoArray = msg.photo; const fileId = photoArray[photoArray.length - 1].file_id; // Берем файл с наивысшим разрешением // Собираем подпись, включая текст сообщения пользователя, если он есть 
                let caption = `✏️ Сообщение от @${username}:`; 
                if (msg.caption) { 
                    caption += `\n\n${msg.caption}\n\n#вопрос`; 
                }
                
                let opts = {
                    caption: caption,
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[
                            {
                              text: '✏️ Ответить',
                              callback_data: `ans_${msg.from.id}_${msg.from.username}`
                            }],
                            [{
                                text: '🧨 Забанить',
                                callback_data: `ban_${msg.from.id}_${msg.from.username}`
                            }]
                          ]
                    })
                }
                bot.sendPhoto(moders, fileId, opts)
            }
            
            await bot.sendMessage(msg.from.id, '✅ Ваше сообщение было успешно отправлено тех. поддержке!')
        })
    } else if (action === 'orders'){
        let orders = await db.get(`orders_${callbackQuery.from.id}`)
        const opts = {
            parse_mode: "Markdown",
            reply_markup: JSON.stringify({
                inline_keyboard: [[
                    {
                      text: '🗑 Удалить сообщение',
                      callback_data: 'delmsg'
                    }]
                  ]
            })
        }
        if (orders.length < 1) {
            await bot.sendMessage(chatId, `😔 Кажется, у вас нет заказов.`, opts)
        } else {
            await bot.sendMessage(chatId, `🛍 Ваши заказы:\n\n${orders.map((id) => `Заказ №${id.number}\n\`${id.item} | ${id.date}\``).join('\n')}`, opts)
        }
    } else if (action.startsWith('ans_')) {
        user = action.slice(4).split('_')
        supportChatId = -4272369779

        await bot.sendMessage(chatId, '📝 Пожалуйста, введите ответ пользователю.');

        const onReplyMessage = async msg => {
            if (msg.text && msg.chat.id === supportChatId) {
                await bot.sendMessage(user[0], `👨‍💻 Ответ от тех. поддержки: ${msg.text}\n\nЕсли у вас остались вопросы, то обратитесь к [тех.поддержке](https://t.me/Nicelinger)`, {
                    parse_mode: 'Markdown',
                    disable_web_page_preview: true
                });
                await bot.sendMessage(msg.chat.id, `👨‍💻 Пользователь: @${user[1]} получил ответ от тех. поддержки.`);
                bot.removeListener('message', onReplyMessage);
            } else {
                console.log(msg)
                await bot.sendMessage(msg.chat.id, 'Сообщение должно содержать текст.');
            }
        };

        bot.on('message', onReplyMessage);
    } else if (action === 'admin') {
        services = await db.get('services')
        caption = `🔓 *Добро пожаловать в панель управления Тэнэн!*\n\n✏️ Добавить услугу - Вам необходимо отправить 1 фотографию товара, название, описание, цену и принимаемые валюты.\n✂️ Удалить услугу - Вам необходимо отправить название товара.`
        
        let opts = {
            caption: caption,
            parse_mode: "Markdown",
            reply_markup: JSON.stringify({
                inline_keyboard: [[
                    {
                      text: '✏️ Добавить услугу',
                      callback_data: 'add'
                    }],
                    [{
                      text: '✂️ Удалить услугу',
                      callback_data: 'del'
                    }]
                  ]
            })
        }

        await bot.sendPhoto(chatId, 'https://media.discordapp.net/attachments/1224403802317393930/1224410298903957646/pattern2_preview_1.png?ex=668784b3&is=66863333&hm=87db7c02703d3bd32857ea6ff99a071e4cea1573e7876e7a83cc22af68d88481&=&format=webp&quality=lossless&width=719&height=404', opts)
    } else if (action === 'delmsg') {
        try {
            await bot.deleteMessage(chatId, messageId);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    } else if (action.startsWith('ban_')) {
        user = action.slice(4).split('_')
        await db.push('bans', { username: user[1], chatId: user[0], reason: 'Неадекватный вопрос в тех. поддержку.' })
        await bot.sendMessage(chatId, `✅ @${user[1]} был забанен по причине: Неадекватный вопрос в тех. поддержку.`)
        await bot.sendMessage(user[0], `🔔 Вы получили бан!\nПричина: Неадекватный вопрос в тех. поддержку.`)
    } else if (action === 'add') {
        adminStates[chatId] = { step: 'get_name' };
        await bot.sendMessage(chatId, 'Введите название товара:');
    } else if (action === 'del') {
        let services = await db.get('services')
        buttons = []
        for (let i of services) {
            buttons.push([{ text: `🗑 ${i.name}`, callback_data: i.name.toLowerCase() }])
        } 

        let opts = {
            parse_mode: "Markdown",
            reply_markup: JSON.stringify({
                inline_keyboard: buttons
            })
        }

        await bot.sendMessage(chatId, `Чтобы удалить услугу - нажмите на кнопку с названием этой услуги!`, opts)
    } else if (services.filter(item => item.name.toLowerCase() === action).length !== 0) {
        if (callbackQuery.from.username === 'kishulyaa' || callbackQuery.from.username === 'Nicelinger') {
            bot.deleteMessage(chatId, callbackQuery.message.message_id)
            s = services.filter(item => item.name.toLowerCase() === action)
            service = services.filter(item => item.name.toLowerCase() !== action)
            await db.set('services', service)
            await bot.sendMessage(chatId, `✅ Услуга: ${action} была удалена!`)

            await bot.sendPhoto(logs, s[0].photos[0], { 
                caption: `🗑 Удаление услуги ${s[0].name}\n\nОписание: ${s[0].description}\nЦена: ${s[0].price}\nСпособы оплаты: ${s[0].paymentMethods}\n\nДействие выполнил: @${callbackQuery.from.username}`,
                parse_mode: 'Markdown' 
            })
        }
    } else if (action === 'order') {
        userStates[chatId] = { step: 'choose_payment' };
        
        const services = await db.get('services') || [];
        const paymentMethods = [...new Set(services.flatMap(service => service.paymentMethods))];
        
        const paymentButtons = paymentMethods.map(method => [{
            text: method,
            callback_data: `payment_${method}`
        }]);

        await bot.sendMessage(chatId, 'Выберите способ оплаты:', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: paymentButtons
            }
        });
    } else if (action.startsWith('payment_')) {
        const selectedPayment = action.split('_')[1];
        userStates[chatId].paymentMethod = selectedPayment;
        userStates[chatId].step = 'choose_service';
        
        const services = await db.get('services') || [];
        
        const filteredServices = services.filter(service => service.paymentMethods.includes(selectedPayment));

        const serviceButtons = filteredServices.map(service => [{
            text: service.name,
            callback_data: `service_${service.name}`
        }]);

        await bot.editMessageText('Выберите услугу:', {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
                inline_keyboard: serviceButtons
            }
        });
    } else if (action.startsWith('service_')) {
        const serviceName = action.split('_')[1];
        userStates[chatId].service = serviceName;
        userStates[chatId].step = 'get_description';

        const selectedService = services.filter(service => service.name === serviceName);
        let price = ''
        if (userStates[chatId].paymentMethod === 'Рубли') {
            price = selectedService[0].price[0]
        } else {
            price = selectedService[0].price[1]
        }

        await bot.editMessageText(`*${selectedService[0].name}*\n\n${selectedService[0].description}\n*💵 Цена:* ${price}\n\n📝 \`Пожалуйста, введите описание заказа.\``, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown'
        })
    } else if (action === 'send_order') {
        const userOrder = userStates[chatId];
        const orderMessage = `🔔 Заказ №${userOrder.number}\n\n*👤 Заказчик:* @${callbackQuery.from.username}\n*💵 Способ оплаты:* ${userOrder.paymentMethod}\n*📚 Услуга:* ${userOrder.service}\n*📝 Описание:* \`${userOrder.description || 'Не указано'}\``;
        const supportChatId = services_chats.find(item => item.name === userOrder.service);

        if (userOrder.photo === null) {
            await bot.sendMessage(supportChatId.value, orderMessage, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📨 Взять заказ', callback_data: `take_order_${chatId}` }]
                    ]
                },
                parse_mode: 'Markdown'
            });
        } else {
            await bot.sendPhoto(supportChatId.value, userOrder.photo, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📨 Взять заказ', callback_data: `take_order_${chatId}` }]
                    ]
                },
                parse_mode: 'Markdown',
                caption: orderMessage
            });
        }

        function formatDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
        
            return `${day}.${month}.${year} ${hours}:${minutes}`;
        }
        
        const now = new Date();
        const formattedDate = formatDate(now);

        await db.push(`orders_${chatId}`, { number: userOrder.number, item: userOrder.service, date: formattedDate })

        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });
        await bot.sendMessage(chatId, 'Ваш заказ был отправлен.');
        delete userStates[chatId];
    } else if (action === 'delete_order') {
        try {
            await bot.deleteMessage(chatId, messageId);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
        await bot.sendMessage(chatId, 'Ваш заказ был удален.');
        delete userStates[chatId];
    } else if (action.startsWith('take_order_')) {
        const orderChatId = action.split('_')[2];

        await bot.sendMessage(orderChatId, `Ваш заказ был взят!\nЗаказ взял: @${callbackQuery.from.username}`);
        await bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });
        await bot.editMessageText(`${callbackQuery.message.text}\n\nЗаказ взял: @${callbackQuery.from.username}`, {
            chat_id: chatId, 
            message_id: messageId 
        })
    }
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (!adminStates[chatId]) return;

    switch (adminStates[chatId].step) {
        case 'get_name':
            adminStates[chatId].name = msg.text;
            adminStates[chatId].step = 'get_description';
            await bot.sendMessage(chatId, 'Введите описание товара:');
            break;

        case 'get_description':
            adminStates[chatId].description = msg.text;
            adminStates[chatId].step = 'get_photos';
            await bot.sendMessage(chatId, 'Отправьте фотографии товара:');
            break;

        case 'get_photos':
            if (msg.photo) {
                const photoArray = msg.photo; const fileId = photoArray[photoArray.length - 1].file_id; // Берем файл с наивысшим разрешением // Собираем подпись, включая текст сообщения пользователя, если он есть 
                if (!adminStates[chatId].photos) {
                    adminStates[chatId].photos = [];
                }
                adminStates[chatId].photos.push(fileId);
            } else {
                await bot.sendMessage(chatId, 'Пожалуйста, отправьте фотографию товара.');
                return;
            }
            adminStates[chatId].step = 'get_price';
            await bot.sendMessage(chatId, 'Введите цену товара:');
            break;

        case 'get_price':
            adminStates[chatId].price = msg.text.split('/');
            adminStates[chatId].step = 'get_payment_methods';
            await bot.sendMessage(chatId, 'Введите способы оплаты:');
            break;

        case 'get_payment_methods':
            adminStates[chatId].paymentMethods = msg.text.split('/');
            opts = {
                caption: `✅ Товар успешно добавлен.\n\nНазвание: ${adminStates[chatId].name}\nОписание: ${adminStates[chatId].description}\nЦена: ${adminStates[chatId].price}\nСпособы оплаты: ${adminStates[chatId].paymentMethods}`
            }
            await bot.sendPhoto(chatId, adminStates[chatId].photos[0], opts);
            console.log(adminStates[chatId])
            await bot.sendPhoto(logs, adminStates[chatId].photos[0], { 
                caption: `✅ Добавление услуги ${adminStates[chatId].name}\n\nОписание: ${adminStates[chatId].description}\nЦена: ${adminStates[chatId].price}\nСпособы оплаты: ${adminStates[chatId].paymentMethods}\n\nДействие выполнил: @${msg.from.username}`
            })
            await db.push('services', adminStates[chatId])
            delete adminStates[chatId];
            break;

        default:
            await bot.sendMessage(chatId, 'Что-то пошло не так. Начните заново.');
            delete adminStates[chatId];
            break;
    }
});

bot.on('message', async msg => {
    const chatId = msg.from.id
    const userState = userStates[chatId];
    if (!userState) return;
    
    if (userState.step === 'get_description') {
        
        min = 100000
        max = 999999
        let rand = await Math.floor(Math.random() * (max - min + 1)) + min;

        userState.number = rand
        userState.step = 'confirm_order';
        if (msg.photo) {
            userState.description = msg.caption;
            const photoArray = msg.photo; const fileId = photoArray[photoArray.length - 1].file_id;
            userState.photo = fileId
            const confirmationMessage = `*Способ оплаты:* ${userState.paymentMethod}\n*Услуга:* ${userState.service}\n*Описание:* \`${userState.description || 'Не указано'}\``;
    
            await bot.sendPhoto(chatId, userState.photo, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Отправить', callback_data: 'send_order' }],
                        [{ text: 'Удалить', callback_data: 'delete_order' }]
                    ]
                }, 
                parse_mode: 'Markdown',
                caption: confirmationMessage
            });
        } else {
            userState.description = msg.text || '';
            userState.photo = null
            const confirmationMessage = `*Способ оплаты:* ${userState.paymentMethod}\n*Услуга:* ${userState.service}\n*Описание:* \`${userState.description || 'Не указано'}\``;

            await bot.sendMessage(chatId, confirmationMessage, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Отправить', callback_data: 'send_order' }],
                        [{ text: 'Удалить', callback_data: 'delete_order' }]
                    ]
                }, 
                parse_mode: 'Markdown'
            });
        }
    }
})

console.log('Бот успешно запущен.')
