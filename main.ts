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
let tomb = ScriptApp.loadSpritesheet('tomb.png');

const STATE_INIT = 3000;
const STATE_READY = 3001;
const STATE_PLAYING = 3002;
const STATE_JUDGE = 3004;
const STATE_END = 3005;

let _start = false;
let _quizAnswer = false;
let _players = ScriptApp.players;
let _initPlayer = [];
let _seeker = null;
let _frozenTime = 20;
let _seekerFrozen = false;
let _widget = null;
let _gameEnd = false;
let _state = STATE_INIT;
let _stateTimer = 0;
let objectList = [chair, desk, cicleChair, musicStand];
let transformCount = 0;
let _answerCount = 0;

function initApp() {
  if(_players.length >= 2) {
    for(let i=0; i<_players.length; i++){
      _players[i].spawnAt(37+i, 85, 4);
    }
    _players[0].sprite = monster;
    _players[0].sendUpdated();
    _seeker = _players[0];
    let seekerOption = {
      content: '당신은 술래입니다.\n\n 하이더(숨는사람)을 찾아내어 잡으세요! \n\n 술래는 문제를 내서 하이더(숨는사람)들의 탈출을 어렵게 만들 수 있습니다. 하이더(숨는사람)는 사물(오브젝트)로 변신할 수 있습니다. \n\n 하이더(숨는사람)로 의심되는 오브젝트를 찌르기(z)로 사람인지 확인하세요 \n\n 하이더(숨는사람)들이 문제를 풀기 전에 모두 찾아내어 게임에서 승리하세요!', // 설명
      confirmText: '확인',// 확인 버튼 텍스트
      };
    let hiderOption = {
      content: `당신은 하이더(숨는사람)입니다.\n\n 술래를 피해서 숨고 도망치세요! \n\n 하이더(숨는사람)는 "Q"버튼을 눌러 \n 사물(오브젝트)로 위장할 수 있습니다.\n(오브젝트 종류는 랜덤, 횟수제한: 5번) \n\n 사물로 변신해서 술래에게 들키지 않고 숨어보세요! 술래가 제출한 문제를 찾아서 풀고 게임에서 승리하세요.`, // 설명
      confirmText: '확인',// 확인 버튼 텍스트
    }
    for(let i = 0; i < _initPlayer.length; ++i) {
      if(_seeker === _initPlayer[i]) {
        _initPlayer[i].showAlert("룰 설명", function () {
          readyApp(1) },
          seekerOption);
      } else {
        _initPlayer[i].showAlert("룰 설명", function () {
          readyApp(1) },
          hiderOption);
      }
    }
    
  } else {
    ScriptApp.showCenterLabel("End Game")
    startState(STATE_END);
  }
}

function readyApp(player) {
  _answerCount += player
  if(_answerCount === _players.length){
    for(let i=0; i<_players.length; i++){
      _players[i].moveSpeed = 0;
      _players[i].sendUpdated();
    }
    _widget = _seeker.showWidget("wiget.html", "top", 200, 300); // 화면 상단, 200x300 영역에 위젯을 보여줌
    _widget.onMessage.Add(function (player, msg){
      ScriptApp.getStorage(function () {
        let appStorage = JSON.parse(ScriptApp.storage);
        appStorage.quiz = msg.quiz;
        appStorage.answer = msg.answer;
        // App.setStorage를 사용해 변경내용을 저장합니다.
        ScriptApp.setStorage(JSON.stringify(appStorage));
      });
      ScriptApp.showCenterLabel(`문제 출제 완료`);
      _widget.destroy();
      _start = true;
    });
  }
}

function startState(state?) {
  _state = state;
  _stateTimer = 0;

  switch(_state) {
    case STATE_INIT:
      initApp();
      break;
    case STATE_READY:
      ScriptApp.showCenterLabel("게임이 곧 시작됩니다.")
      _seekerFrozen = true;
    case STATE_PLAYING:
      break;
    case STATE_END:
      _start = false;
      ScriptApp.showCenterLabel(`게임 끝`);
      for(let i in _players)
      {
        let p = _players[i];
        p.moveSpeed = 80;
        p.title = null;
        p.sprite = null;
        p.sendUpdated();
      }
      break;
  }
}

function interactionObject(player) {
  let appStorage = JSON.parse(ScriptApp.storage);
  player.showPrompt("문제", function (inputText) {
    if (inputText == appStorage.answer) {
      _quizAnswer = true;
      player.showCenterLabel(`정답을 맞히셨습니다! 하이더 승!`);
      endGameJudge();
    }else {
      player.showAlert("알림", function () {},
        {
          content: '오답입니다',
          confirmText: '확인',// 확인 버튼 텍스트
        });
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
  return;
}

function freezeSeeker(dt) {
  // "플레이" 상태에서 술래(Seeker)가 얼린 시간을 카운트 다운
  _frozenTime -= dt;
  ScriptApp.showCenterLabel(`술래가 ${_frozenTime.toFixed(0)}초 동안 못움직입니다. 도망치세요!`);
  for(let i=1; i<_players.length; i++){
    _players[i].moveSpeed = 80;
    _players[i].sendUpdated();
  }
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

function endGameJudge(dt?) {
  let alive = 0;
	for(let i=1; i < _players.length; i++ ){
    if(_players[i].tag.alive){
      alive++
    }
  }
  if(alive === 0 || _quizAnswer){
    if(alive === 0){
    ScriptApp.showCenterLabel("술래 승! 술래가 하이더들을 모두 잡았습니다!");
    }
    setTimeout(() => {
      startState(STATE_END);
    }, 2000);
  }
}

// 플레이어가 F 상호작용 할때
ScriptApp.onTriggerObject.Add(function(player, layer, x, y){
  if(player === _seeker) return;
  if(player.tag.alive === false) return;
  interactionObject(player);
});

ScriptApp.addOnKeyDown(81, function(player) {
  if(_seeker === player) return;
  if(transformCount < 11){
    const index = Math.floor(Math.random() * objectList.length);
    player.sprite = objectList[index];
    player.sendUpdated();
    transformCount++;
  }
});

// App이 최초로 시작될 때
ScriptApp.onInit.Add(function(){
	// 이 시점에 App에는 플레이어들이 참가하지 않은 상태
  // App의 나머지 필요한 부분을 초기화시킨다.
});

ScriptApp.onUnitAttacked.Add(function(sender, x, y, target) {
  if(sender !== _seeker) return;
  target.sprite = tomb;
  target.tag.alive = false;
  target.sendUpdated();
  endGameJudge();
});

// 플레이어가 들어올 때
ScriptApp.onJoinPlayer.Add(function(player){
  // 해당하는 모든 플레이어가 이 이벤트를 통해 App에 입장
  _initPlayer.push(player);
  player.tag = {
		alive: true,
	};
  player.moveSpeed = 80;
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
});

// 플레이어가 떠날 때
ScriptApp.onLeavePlayer.Add(function(player){
  // 플레이어가 단순히 중간에 나갔을 때
  // App이 종료될 때에서 이 이벤트를 통해 모두 App에서 퇴장합니다.
  startState(STATE_END);
});

// 매 20ms(0.02초) 마다 실행
ScriptApp.onUpdate.Add(function(dt){
  if(!_start) return;

  _stateTimer += dt;

  switch(_state){
    case STATE_INIT:
      if(_stateTimer >= 5)
        startState(STATE_READY);
      break;
    case STATE_READY:
      if(_stateTimer >= 3)
        startState(STATE_PLAYING);
      break;
    case STATE_PLAYING:
      if(_seekerFrozen){
        freezeSeeker(dt);
      }
      break;
    case STATE_JUDGE:
      break;
    case STATE_END:
      break;  
  }
});

// App이 종료될 때
ScriptApp.onDestroy.Add(function(){
   // 이미 모든 플레이어가 App에서 나간 상태
   // App을 나머지를 정리한다.
  startState(STATE_END);
});