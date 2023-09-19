import "zep-script"
let monster = ScriptApp.loadSpritesheet('monster.png', 96, 96, {
  // defined base anim
  left: [8, 9, 10, 11],
  up: [12, 13, 14, 15],
  down: [4, 5, 6, 7],
  right: [16, 17, 18, 19],
}, 8);
const STATE_INIT = 3000;
const STATE_READY = 3001;
const STATE_PLAYING = 3002;
const STATE_JUDGE = 3004;
const STATE_END = 3005;
