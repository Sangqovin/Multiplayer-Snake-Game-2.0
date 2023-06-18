const BG_COLOUR = "#231f20";
// const PLAYER1_COLOUR = "#c2c2c2";
// const PLAYER2_COLOUR = "#c2c2c2";
const FOOD_COLOUR = "#e66916";

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

// Usage
var PLAYER1_COLOUR = getRandomColor();
var PLAYER2_COLOUR = getRandomColor2();


const socket = io("http://localhost:3000");

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);

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

  canvas.width = canvas.height = 600;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener("keydown", keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit("keydown", e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, PLAYER1_COLOUR);
  paintPlayer(state.players[1], size, PLAYER2_COLOUR);

  // socket.on("playerColor", (data) => {
  //   const { playerId, color } = data;
  //   state.players[playerId].color = color;
  //   paintGame(state);
  // });
}


function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
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
