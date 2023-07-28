const io = require("socket.io")();
const { initGame, gameLoop, getUpdatedVelocity } = require("./backend/game");
const { FRAME_RATE } = require("./backend/constants");
const { makeid } = require("./backend/utils");

const state = {};
const clientRooms = {};

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

io.on("connection", (client) => {
  client.on("keydown", handleKeydown);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);

  const player1Color = getRandomColor();
  const player2Color = getRandomColor2();

  client.emit("playerColor", { playerId: 0, color: player1Color });
  client.emit("playerColor2", { playerId: 1, color: player2Color });

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
