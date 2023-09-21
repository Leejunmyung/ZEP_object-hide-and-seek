import "zep-script"
let monster = ScriptApp.loadSpritesheet('monster.png', 96, 96, {
  // defined base anim
  left: [8, 9, 10, 11],
  up: [12, 13, 14, 15],
  down: [4, 5, 6, 7],
  right: [16, 17, 18, 19],
}, 8);

let chair = ScriptApp.loadSpritesheet('chair.png', 55, 74, {
  // defined base anim
  left: [8, 9, 10, 11],
  up: [12, 13, 14, 15],
  down: [4, 5, 6, 7],
  right: [16, 17, 18, 19],
}, 8);


let desk = ScriptApp.loadSpritesheet('desk.png', 130, 115, {
  // defined base anim
  left: [8, 9, 10, 11],
  up: [12, 13, 14, 15],
  down: [4, 5, 6, 7],
  right: [16, 17, 18, 19],
}, 8);

let cicleChair = ScriptApp.loadSpritesheet('circleChair.png');
let musicStand = ScriptApp.loadSpritesheet('musicStand.png');

const STATE_INIT = 3000;
const STATE_READY = 3001;
const STATE_PLAYING = 3002;
const STATE_JUDGE = 3004;
const STATE_END = 3005;

let _start = false;
let _players = ScriptApp.players;
let _seeker = null;
let _frozenTime = 20;
let _seekerFrozen = false;
let _gameEnd = false;
let _state = STATE_INIT;
let _stateTimer = 0;
let objectList = [chair, desk, cicleChair, musicStand];
let currentIndex = 0;
let transformCount = 0;


function startApp() {
  if(_players.length >= 2) {
    for(let i = 1; i < _players.length; ++i) {
      _players[i].moveSpeed = 80;
      _players[i].sendUpdated();
    }
    _players[0].sprite = monster;
    _players[0].sendUpdated();
    _seeker = _players[0];
    _start = true;
  } else {
    ScriptApp.showCenterLabel("onup start else")
    startState(STATE_END);
  }
}

function startState(state) {
  _state = state;
  _stateTimer = 0;

  switch(_state) {
    case STATE_INIT:
      startApp();
      break;
    case STATE_READY:
      ScriptApp.showCenterLabel(`${_players}`);
      
    case STATE_PLAYING:
      break;
    case STATE_END:
      _start = false;
      ScriptApp.showCenterLabel(`${_players.length}end Game`);
      break;
  }
}

function freezeSeeker(dt) {
  // "플레이" 상태에서 술래(Seeker)가 얼린 시간을 카운트 다운
  _frozenTime -= dt;
  ScriptApp.showCenterLabel(`술래가 ${_frozenTime.toFixed(0)}초 동안 못움직입니다.`);
  _seeker.moveSpeed = 0;
  _seeker.displayRatio = 5;
  _seeker.sendUpdated();
  
  if (_frozenTime <= 0) {
    // 시간이 다 되면 술래(Seeker)를 해제하고 게임을 시작
    _seekerFrozen = false;
    _seeker.moveSpeed = 100;
    _seeker.displayRatio = 1;
    _seeker.sendUpdated();
    ScriptApp.showCenterLabel("땡");
  }
  return;
}

function transformObject() {
  ScriptApp.addOnKeyDown(81, function(player) {
    if(_seeker === player) return;
    const index = Math.floor(Math.random() * objectList.length);
    currentIndex = index;
    player.sprite = objectList[currentIndex];
    player.sendUpdated();
    transformCount++
  })
}
// App이 최초로 시작될 때
ScriptApp.onInit.Add(function(){
	// 이 시점에 App에는 플레이어들이 참가하지 않은 상태
  // App의 나머지 필요한 부분을 초기화시킨다.
});

// 플레이어가 들어올 때
ScriptApp.onJoinPlayer.Add(function(player){
  // 해당하는 모든 플레이어가 이 이벤트를 통해 App에 입장
});

// 플레이어가 모두 입장한 뒤에 한번 호출
ScriptApp.onStart.Add(function(){
  _players = ScriptApp.players;
  startState(STATE_INIT);
})

// 플레이어가 떠날 때
ScriptApp.onLeavePlayer.Add(function(player){
  // 플레이어가 단순히 중간에 나갔을 때
  // App이 종료될 때에서 이 이벤트를 통해 모두 App에서 퇴장합니다.
})

// 매 20ms(0.02초) 마다 실행
ScriptApp.onUpdate.Add(function(dt){
  if(!_start) return;

  _stateTimer += dt;

  switch(_state){
    case STATE_INIT:
      ScriptApp.showCenterLabel("게임이 곧 시작됩니다.")
      if(_stateTimer >= 5)
        startState(STATE_READY);
      break;
    case STATE_READY:
      if(_stateTimer >= 3)
        ScriptApp.showCenterLabel("onup Ready")
        _seekerFrozen = true;
        startState(STATE_PLAYING);
      break;
    case STATE_PLAYING:
      if(_seekerFrozen){
        freezeSeeker(dt);
      }
      transformObject();
      break;
  }
})

// App이 종료될 때
ScriptApp.onDestroy.Add(function(){
   // 이미 모든 플레이어가 App에서 나간 상태
   // App을 나머지를 정리한다.
})

