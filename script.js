// ===== Персонажи и подсказки =====
// У каждой подсказки: emoji + caption.
// Чтобы показать свою картинку, добавьте поле img: "images/файл.jpg"
const characters = [
  // Розы и шампанское
  { name: "Чон Ли Вон", manhwa: "Розы и шампанское", clues: [
    { img: "Lee-Won/images/lemon.png", caption: "лемон" },
    { img: "Lee-Won/images/images.jpg", caption: "Корея" },
    { img: "Lee-Won/images/lawer.png", caption: "юрист" } ] },
  { name: "Цезарь Александрович Сергеев", manhwa: "Розы и шампанское", clues: [
    { img: "Cezar/images/Champagne.jpg", caption: "Шампанское" },
    { img: "Cezar/images/mafia.png", caption: "мафия" },
    { img: "Cezar/images/царь.jpeg", caption: "царь" } ] },

  // Кодовое имя Анастасия
  { name: "Квон Тэкджу", manhwa: "Кодовое имя Анастасия", clues: [
    { img: "Tekdju/images/agent.jpg", caption: "Агент под прикрытием" },
    { img: "Tekdju/images/Anastasia.png", caption: "«Анастасия»" },
    { img: "Tekdju/images/chokolate.png", caption: "шоколадка" } ] },
  { name: "Женя Богданов", manhwa: "Кодовое имя Анастасия", clues: [
    { img: "Zenja/images/Sibir.png", caption: "Русская зима" },
    { img: "Zenja/images/semja.jpg", caption: "Влиятельная семья" },
    { img: "Zenja/images/crocodile.jpg", caption: "крокодил" } ] },

  // Стыки
  { name: "Джейк Гиллан", manhwa: "Стыки", clues: [
    { img: "Jake/images/America.png", caption: "Америка" },
    { img: "Jake/images/CIA.png", caption: "ЦРУ" },
    { img: "Jake/images/ezhik.jpg", caption: "белый ёжик" } ] },
  { name: "Мун Шин Гон", manhwa: "Стыки", clues: [  
    { img: "Shin/images/kljuch.jpg", caption: "гаечный ключ" },
    { img: "Shin/images/malboro.png", caption: "сигареты" },
    { img: "Shin/images/mashina.png", caption: "машина" } ] },

  // Страстное влечение
  { name: "Чон Тэ Ый", manhwa: "Страстное влечение", clues: [
    { img: "Tey/images/armija.png", caption: "Тренировочный лагерь" },
    { img: "Tey/images/gips.png", caption: "гипс на ноге" },
    { img: "Tey/images/pivo.png", caption: "пиво" } ] },
  { name: "Илай Ригроу", manhwa: "Страстное влечение", clues: [
    { img: "Elay/images/germanija.png", caption: "Германия" },
    { img: "Elay/images/les.png", caption: "горящий лес" },
    { img: "Elay/images/ognevo.jpg", caption: "серебренная зажигалка" } ] },

  // Джинкс
  { name: "Джу Дже Гён", manhwa: "Джинкс", clues: [
    { img: "DjeGen/images/MMA.png", caption: "Боец ММА" },
    { img: "DjeGen/images/chempion.jpg", caption: "чемпион" },
    { img: "DjeGen/images/vaza.png", caption: "секретик" } ] },
  { name: "Ким Дан", manhwa: "Джинкс", clues: [
    { img: "KimDan/images/fizio.jpg", caption: "физиотерапевт" },
    { img: "KimDan/images/babulja.png", caption: "бабушка" },
    { img: "KimDan/images/homjak.png", caption: "хомяк" } ] },
];

const ROUND_TIME = 30;

// ===== Состояние игры =====
let queue = [];
let current = null;
let score = 0;
let timeLeft = ROUND_TIME;
let timerId = null;
let locked = false;

// ===== Элементы =====
const $ = (id) => document.getElementById(id);
const screens = { start: $("start"), play: $("play"), end: $("end") };

// ===== Вспомогательные функции =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("active"));
  screens[name].classList.add("active");
}

function flash(color) {
  const f = $("flash");
  f.className = "";
  void f.offsetWidth; // перезапуск анимации
  f.className = color;
}

// ===== Логика =====
function startGame() {
  queue = shuffle(characters);
  score = 0;
  $("score").textContent = score;
  $("total").textContent = characters.length;
  showScreen("play");
  nextRound();
}

function nextRound() {
  if (queue.length === 0) return win();

  locked = false;
  current = queue.pop();

  // Подсказки
  const cluesBox = $("clues");
  cluesBox.innerHTML = "";
  current.clues.forEach((c) => {
    const div = document.createElement("div");
    div.className = "clue";
    div.innerHTML = c.img
      ? `<img src="${c.img}" alt=""><div class="caption">${c.caption || ""}</div>`
      : `<div class="emoji">${c.emoji}</div><div class="caption">${c.caption || ""}</div>`;
    cluesBox.appendChild(div);
  });

  // Варианты: 1 верный и 2 неверных
  const wrong = shuffle(characters.filter((c) => c.name !== current.name)).slice(0, 2);
  const options = shuffle([current, ...wrong]);

  const optBox = $("options");
  optBox.innerHTML = "";
  options.forEach((o) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = o.name;
    btn.onclick = () => choose(btn, o.name);
    optBox.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  clearInterval(timerId);
  timeLeft = ROUND_TIME;
  updateTimer();
  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timerId);
      lose("Время вышло!");
    }
  }, 1000);
}

function updateTimer() {
  $("time").textContent = timeLeft;
  const bar = $("timebar");
  bar.style.width = (timeLeft / ROUND_TIME) * 100 + "%";
  bar.classList.toggle("low", timeLeft <= 10);
}

function choose(btn, name) {
  if (locked) return;
  locked = true;
  clearInterval(timerId);

  const buttons = document.querySelectorAll(".option");
  buttons.forEach((b) => {
    b.disabled = true;
    if (b.textContent === current.name) b.classList.add("correct");
  });

  if (name === current.name) {
    score++;
    $("score").textContent = score;
    flash("green");
    setTimeout(nextRound, 900);
  } else {
    btn.classList.add("wrong");
    lose("Неправильно!");
  }
}

function lose(reason) {
  locked = true;
  flash("red");
  document.querySelectorAll(".option").forEach((b) => (b.disabled = true));
  setTimeout(() => {
    $("endTitle").textContent = "🔴 " + reason;
    $("endText").textContent =
      `Это был(а) ${current.name} из манхвы «${current.manhwa}». Твой счёт: ${score}. Игра начнётся заново.`;
    showScreen("end");
  }, 1300);
}

function win() {
  clearInterval(timerId);
  $("endTitle").textContent = "🏆 Победа!";
  $("endText").textContent = `Ты угадал(а) всех ${characters.length} персонажей!`;
  showScreen("end");
}

// ===== Кнопки =====
$("startBtn").onclick = startGame;
$("restartBtn").onclick = startGame;