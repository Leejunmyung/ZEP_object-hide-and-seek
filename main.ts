import "zep-script"
let monster = ScriptApp.loadSpritesheet('monster.png', 96, 96, {
  // defined base anim
  left: [8, 9, 10, 11],
  up: [12, 13, 14, 15],
  down: [4, 5, 6, 7],
  right: [16, 17, 18, 19],
}, 8);

let testOJ = ScriptApp.loadSpritesheet('monster.png', 96, 96, {
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

let _ruleCheck = false;
let _start = false;
let _players = ScriptApp.players;
let _initPlayer = null;
let _seeker = null;
let _frozenTime = 20;
let _seekerFrozen = false;
let _widget = null;
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
    _players[1].sprite = monster;
    _players[1].sendUpdated();
    _seeker = _players[1];
    _initPlayer.showAlert("Alert", function () {
      if(_initPlayer !== _seeker) return;
      ScriptApp.sayToAll("ok") },
      {
          content: '당신은 술래입니다. <br/> 하이더(숨는사람)을 찾아내어 잡으세요!', // 설명
          confirmText: '확인',// 확인 버튼 텍스트
      });
    _initPlayer.showAlert("Alert", function () {
      if(_initPlayer === _seeker) return;
      ScriptApp.sayToAll("ok") },
      {
          content: '당신은 하이더(숨는사람)입니다. /n 술래를 피해서 숨고, 도망치세요!', // 설명
          confirmText: '확인',// 확인 버튼 텍스트
      });
    if(_ruleCheck){
      _widget = _seeker.showWidget("wiget.html", "top", 200, 300); // 화면 상단, 200x300 영역에 위젯을 보여줌
      _widget.onMessage.Add(function (player, msg){
        ScriptApp.showCenterLabel(`문제 출제 완료`);
        ScriptApp.getStorage(function () {
          let appStorage = JSON.parse(ScriptApp.storage);
          appStorage.quiz = msg.quiz;
          appStorage.answer = msg.answer;
          ScriptApp.sayToAll(`quiz: ${appStorage.quiz}`)
          ScriptApp.sayToAll(`answer: ${appStorage.answer}`)
          // App.setStorage를 사용해 변경내용을 저장합니다.
          ScriptApp.setStorage(JSON.stringify(appStorage));
        });
        _widget.destroy();
        _start = true;
      });
    }
  } else {
    ScriptApp.showCenterLabel("End Game")
    startState(STATE_END);
  }
}

function startState(state?) {
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
      ScriptApp.showCenterLabel(`End Game`);
      break;
  }
}

function settingObject(player) {
  let appStorage = JSON.parse(ScriptApp.storage);
  player.showPrompt("문제", function (inputText) {
    if (inputText == appStorage.answer) {
        player.showCenterLabel("정답");
    } else {
        player.showCenterLabel("오답");
    }
    },
    {
        content: `${appStorage.quiz}`, // 설명
        cancelText: '취소', // 취소 버튼 텍스트
        confirmText: '확인',// 확인 버튼 텍스트
        placeholder: '정답을 입력하세요',// 입력칸의 placeholder
        textType: 'text' // 입력 텍스트의 표시 형식 'text' | 'password'
    }
  );
}

function freezeSeeker(dt) {
  // "플레이" 상태에서 술래(Seeker)가 얼린 시간을 카운트 다운
  _frozenTime -= dt;
  ScriptApp.showCenterLabel(`술래가 ${_frozenTime.toFixed(0)}초 동안 못움직입니다. 도망치세요!`);
  _seeker.moveSpeed = 0;
  _seeker.displayRatio = 5;
  _seeker.sendUpdated();
  
  if (_frozenTime <= 0) {
    // 시간이 다 되면 술래(Seeker)를 해제하고 게임을 시작
    _seekerFrozen = false;
    _seeker.moveSpeed = 100;
    _seeker.displayRatio = 1;
    _seeker.sendUpdated();
    ScriptApp.showCenterLabel("다들 잘 숨었나? 찾으러 가볼까? 흐흐");
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
// 플레이어가 채팅을 입력할 때 동작합니다.
ScriptApp.onSay.Add(function(player, text) {
  let _answer = "ok";
  let _answerCount = 0;
  if(_answer === text){
    _answerCount++
  }
  if(_players.length === _answerCount){
    _ruleCheck = true;
  }
});
// 플레이어가 F 상호작용 할때
ScriptApp.onTriggerObject.Add(function(player, layer, x, y){
  if(player === _seeker) return;
  settingObject(player);
});
// App이 최초로 시작될 때
ScriptApp.onInit.Add(function(){
	// 이 시점에 App에는 플레이어들이 참가하지 않은 상태
  // App의 나머지 필요한 부분을 초기화시킨다.
});

// 플레이어가 들어올 때
ScriptApp.onJoinPlayer.Add(function(player){
  // 해당하는 모든 플레이어가 이 이벤트를 통해 App에 입장
  _initPlayer = player
  player.tag = {
		alive: true,
	};
	player.sendUpdated();
});

// 플레이어가 모두 입장한 뒤에 한번 호출
ScriptApp.onStart.Add(function(){
  _players = ScriptApp.players;
  if(ScriptApp.storage == null){
		ScriptApp.setStorage(JSON.stringify({
      quiz: "",
      answer: ""
    }));
	}
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
        _seekerFrozen = true;
        startState(STATE_PLAYING);
      break;
    case STATE_PLAYING:
      if(_seekerFrozen){
        freezeSeeker(dt);
      }
      if(transformCount < 5){
        transformObject();
      }
      break;
  }
})

// App이 종료될 때
ScriptApp.onDestroy.Add(function(){
   // 이미 모든 플레이어가 App에서 나간 상태
   // App을 나머지를 정리한다.
})