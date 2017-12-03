var TelegramBot = require('node-telegram-bot-api');
var config = require('./config.json');

var token = config.tokenBot;
var bot = new TelegramBot(token, {polling: true});

bot.onText(/\/echo (.+)/, function (msg, match) {
    var fromId = msg.from.id;
    var resp = match[1];
    bot.sendMessage(fromId, resp);
});

bot.on('message', function (msg) {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Received your message');
});
