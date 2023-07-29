const io = require("socket.io")();
const { initGame, gameLoop, getUpdatedVelocity } = require("./backend/game");
const { FRAME_RATE } = require("./backend/constants");
const { makeid } = require("./backend/utils");
let playerColor = getRandomColor();
let playerColor2 = getRandomColor2();
let KeyCode;

const state = {};
const clientRooms = {};

function getRandomColor() {
  var color = "#" + Math.floor(Math.random() * 16777215).toString(16);
  return color;
}

function getRandomColor2() {
  var color = "#" + Math.floor(Math.random() * 16777215).toString(16);
  return color;
}

// function handleRandomColor(color) {
//   playerColor = color;
// }

// function handleRandomColor2(color2) {
//   playerColor2 = color2;
// }

io.on("connection", (client) => {
  client.on("keydown", handleKeydown);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);

  client.emit("randomColor", playerColor);
  client.emit("randomColor2", playerColor2);

  // client.on("disconnect", () => {
  //   playerColor = getRandomColor();
  //   playerColor2 = getRandomColor2();

  //   io.emit("randomColor", playerColor);
  //   io.emit("randomColor2", playerColor2);
  // });

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit("unknownCode");
      return;
    } else if (numClients > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit("init", 2);

    startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    console.log(keyCode);
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      try {
        state[roomName].players[client.number - 1].vel = vel;
      } catch (error) {
        return;
      }
    }
    keyCode = KeyCode;
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName]);
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room).emit("gameState", JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room).emit("gameOver", JSON.stringify({ winner }));
}

io.listen(3000);

console.log("Ready!");

module.exports = {
  KeyCode,
};
