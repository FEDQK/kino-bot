const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const https = require('https');

const token = config.tokenBot;
const bot = new TelegramBot(token, {
  polling: true
});

let movieAPI = "https://api.themoviedb.org/3/discover/movie?language=ru&api_key=" + config.keyAPI;

function movieInfoAPI(id) {
  return "https://api.themoviedb.org/3/discover/movie/"+ id +"?language=ru&api_key=" + config.keyAPI;
}

const fetchJSONFile = function(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? require('https') : require('http');
    const request = lib.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
         reject(new Error('Failed to load page, status code: ' + response.statusCode));
       }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(JSON.parse(body.join(''))));
    });
    request.on('error', (err) => reject(err))
    })
};
// let answer = "";
//
// fetchJSONFile(movieAPI+"&sort_by=popularity.desc")
//   .then((data) => {
//     data.results.forEach((movie, index) => {
//       answer +=
//       `${index + 1}. ${movie.title}
//       Рейтинг: ${movie.vote_average}/10
//       Дата выхода: ${movie.release_date}
//
//       `;
//     });
//   })
//   .catch((err) => console.error(err));

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "/фильмы\nпопулярные");
});

bot.onText(/\/популярные/, (msg) => {
  const chatId = msg.chat.id;
  let answer = "";
  fetchJSONFile(movieAPI+"&sort_by=popularity.desc")
    .then((data) => {
      data.results.some((movie, index) => {
        let genres = "";
        let sApi = movieInfoAPI(movie.id);
        fetchJSONFile(sApi)
          .then((movieInfo) => {
            console.log(movieInfo);
            genres = movieInfo.genres.reduce((previousValue, currentValue) => {
              return previousValue + ", " + currentValue.name;
            });
          })
          .catch((err) => console.error(err));
          console.log(genres);
        answer +=
        `
        ${index + 1}. ${movie.title}
        Рейтинг: ${movie.vote_average}/10
        Дата выхода: ${movie.release_date}
        Жанры: ${genres}

        `;
        return (index == 1);
      });
      console.log(answer);
      bot.sendMessage(chatId, answer);
    })
    .catch((err) => console.error(err));

});

bot.onText(/\/sendpic/, (msg) => {
  const chatId = msg.chat.id;
  const url = 'https://telegram.org/img/t_logo.png';
  bot.sendPhoto(chatId, url);
});
