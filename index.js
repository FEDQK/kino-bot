const TelegramBot = require('node-telegram-bot-api');
const config = require('./config.json');
const https = require('https');

const token = config.tokenBot;
const bot = new TelegramBot(token, {
  polling: true
});

const movieAPI = "https://api.themoviedb.org/3/discover/movie?language=ru&api_key=" + config.keyAPI;
const upcomingAPI = "https://api.themoviedb.org/3/movie/upcoming?language=ru&api_key=" + config.keyAPI;
const nowPlayingAPI = "https://api.themoviedb.org/3/movie/now_playing?language=ru&api_key=" + config.keyAPI;


function movieInfoAPI(id) {
  return "https://api.themoviedb.org/3/movie/"+ id +"?language=ru&api_key=" + config.keyAPI;
}

function getMovies(data) {
  let answer = "";
  data.results.some((movie, index) => {
    let genres = "";
    // console.log(movie);
    fetchJSONFile(movieInfoAPI(movie.id))
      .then((movieInfo) => {
        genres = movieInfo.genres.reduce((previousValue, currentValue) => {
          return previousValue + ", " + currentValue.name;
        }, "").substr(2);
      })
      .catch((err) => console.error(err));
      answer +=
     `<b>${index + 1}.</b> <a href='https://www.themoviedb.org/movie/${movie.id}?language=ru'>${movie.title}</a>
     <b>Рейтинг:</b> ${movie.vote_average}/10 (${movie.vote_count})
     <b>Дата выхода:</b> ${movie.release_date}
     <b>Жанры:</b> ${genres}\n`;
    return (index == 9);
  });
  return answer;
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
  bot.sendMessage(chatId,
    `
    /popular - популярные фильмы
    /best for 2017 - лучшие фильмы
    /upcoming - скоро в кино
    /now_playing - сейчас в кино`
  );
});

bot.onText(/\/popular/, (msg) => {
  const chatId = msg.chat.id;
  fetchJSONFile(movieAPI+"&sort_by=popularity.desc")
    .then((data) => {
      bot.sendMessage(chatId, getMovies(data), {parse_mode : "HTML"});
    })
    .catch((err) => console.error(err));
});

bot.onText(/\/best( for (.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  let year = match[2] ? "&primary_release_year=" + match[2] : "";
  fetchJSONFile(movieAPI+"&sort_by=vote_average.desc&vote_count.gte=1000"+year)
    .then((data) => {
      bot.sendMessage(chatId, getMovies(data), {parse_mode : "HTML"});
    })
    .catch((err) => console.error(err));
});

bot.onText(/\/upcoming/, (msg) => {
  const chatId = msg.chat.id;
  fetchJSONFile(upcomingAPI)
    .then((data) => {
      bot.sendMessage(chatId, getMovies(data), {parse_mode : "HTML"});
    })
    .catch((err) => console.error(err));
});
bot.onText(/\/now_playing/, (msg) => {
  const chatId = msg.chat.id;
  fetchJSONFile(nowPlayingAPI)
    .then((data) => {
      bot.sendMessage(chatId, getMovies(data), {parse_mode : "HTML"});
    })
    .catch((err) => console.error(err));
});

bot.onText(/\/sendpic/, (msg) => {
  const chatId = msg.chat.id;
  const url = 'https://telegram.org/img/t_logo.png';
  bot.sendPhoto(chatId, url);
});
