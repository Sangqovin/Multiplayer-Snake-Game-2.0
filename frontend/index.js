const socket = io("http://localhost:3000");
const BG_COLOUR = "#231f20";
const FOOD_COLOUR = "#e66916";
let playerColor;
let playerColor2;

function getRandomColor() {
  // Generate a random hexadecimal value
  var color = "#" + Math.floor(Math.random() * 16777215).toString(16);

  return color;
}

function getRandomColor2() {
  // Generate a random hexadecimal value
  var color = "#" + Math.floor(Math.random() * 16777215).toString(16);

  return color;
}

function handleRandomColor(color) {
  playerColor = color;
}

function handleRandomColor2(color2) {
  playerColor2 = color2;
}

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);
socket.on("randomColor", handleRandomColor);
socket.on("randomColor2", handleRandomColor2);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

function newGame() {
  socket.emit("newGame");
  init();
}

function joinGame() {
  if (gameCodeInput.value === "") {
    return;
  }
  const code = gameCodeInput.value;
  socket.emit("joinGame", code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = canvas.height = 500;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit("keydown", e.keyCode);
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  drawPlayer(state.players[0], size, playerColor);
  drawPlayer2(state.players[1], size, playerColor2);
}

function drawPlayer(state, size, color) {
  paintPlayer(state, size, color);
  console.log(playerColor2);
}

function drawPlayer2(state, size, color) {
  paintPlayer(state, size, color);
  console.log(playerColor2);
}

function handleInit(number) {
  playerNumber = number;
}
function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}
function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  socket.removeListener("randomColor", handleRandomColor);
  socket.removeListener("randomColor2", handleRandomColor2);
  console.log("listener telah dihapus");
  data = JSON.parse(data);

  if (data.winner === playerNumber) {
    alert("You win!");
  } else {
    alert("You lose!");
  }
  gameActive = false;
}
function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}
function handleUnknownGame() {
  reset();
  alert("Unknown game code");
}
function handleTooManyPlayers() {
  reset();
  alert("This game is already in progress");
}
function reset() {
  (playerNumber = null), (gameCodeInput.value = "");
  gameCodeDisplay.innerText = "";
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
