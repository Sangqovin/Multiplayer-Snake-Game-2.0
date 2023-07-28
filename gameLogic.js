// gameLogic.js 
function handleKeydown(keyCode, client, clientRooms, state) {
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

// Definisikan fungsi terkait lainnya di sini jika diperlukan...

module.exports = {
  handleKeydown,
  // Ekspor fungsi lainnya jika diperlukan...
};
