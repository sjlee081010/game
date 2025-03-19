let gamePaused = false;

document.addEventListener("visibilitychange", () => {
    gamePaused = document.hidden;
});

let playerSpeed = 1;

const Player = () => {
    const map = document.querySelector('.map');
    const boundary = document.querySelector('.box_boundary');
    const player = document.querySelector('.player');
    const playerBody = document.querySelector('.player>img');
    const moveKeys = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    let keys = {};

    window.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });
    window.addEventListener('keyup', (event) => {
        keys[event.key] = false;
    });

    window.addEventListener('blur', () => {
        moveKeys.forEach(key => keys[key] = false);
    });

    let x = boundary.clientWidth / 2;
    let y = boundary.clientHeight / 2;

    let mapX, mapY;

    const move = () => {
        let dx = 0, dy = 0;
        if (keys['w'] || keys['ArrowUp']) dy -= playerSpeed;
        if (keys['s'] || keys['ArrowDown']) dy += playerSpeed;
        if (keys['a'] || keys['ArrowLeft']) dx -= playerSpeed;
        if (keys['d'] || keys['ArrowRight']) dx += playerSpeed;
            
        const magnitude = Math.hypot(dx, dy);
        if (magnitude > 0) {
            dx /= magnitude;
            dy /= magnitude;
        }
    
        x += dx * playerSpeed;
        y += dy * playerSpeed;
        x = Math.max(player.clientWidth / 2, Math.min(x, boundary.clientWidth - player.offsetWidth / 2));
        y = Math.max(player.clientHeight / 2, Math.min(y, boundary.clientHeight - player.offsetHeight / 2));
    
        player.style.left = `${x}px`;
        player.style.top = `${y}px`;
    
        if (dx !== 0) playerBody.style.transform = `scaleX(${Math.sign(dx)})`;

        mapX = -x + boundary.clientWidth / 2 + window.innerWidth / 2;
        mapY = -y + boundary.clientHeight / 2 + window.innerHeight / 2;
        mapX = Math.max(map.clientWidth / 4, Math.min(mapY || map.clientWidth / 2, map.clientWidth / 2));
        mapY = Math.max(map.clientHeight / 4, Math.min(mapY || map.clientHeight / 2, map.clientHeight / 2));
        map.style.top = `${mapY}px`;

        if (!gamePaused) requestAnimationFrame(move); 
    };
    move();

    const leftLeg = document.querySelector('.box_legs>img:first-child');
    const rightLeg = document.querySelector('.box_legs>img:last-child');
    let leftDeg = 0, rightDeg = 0, degDirection = -1; 

    const walk = () => {
        if (moveKeys.some(key => keys[key])) {
            leftDeg += (playerSpeed * 0.6) * degDirection;
            rightDeg -= (playerSpeed * 0.6) * degDirection;
            if (leftDeg <= -15 || leftDeg >= 15) {
              degDirection *= -1;
            }
        } else {
            if (leftDeg > 0) {
                leftDeg = Math.max(0, leftDeg - playerSpeed * 0.5);
                rightDeg = Math.min(0, rightDeg + playerSpeed * 0.5);
            } else if (leftDeg < 0) {
                leftDeg = Math.min(0, leftDeg + playerSpeed * 0.5);
                rightDeg = Math.max(0, rightDeg - playerSpeed * 0.5);
            }
        }
        leftLeg.style.transform = `rotate(${leftDeg}deg)`;
        rightLeg.style.transform = `rotate(${rightDeg}deg)`;
        if (!gamePaused) requestAnimationFrame(walk); 
    };
    walk();
};

const Enemy = (enemy, time) => {
    return new Promise((resolve) => {
        enemy;
        setTimeout(() => {resolve();}, time*60*1000);
    });
};

const enemy01 = () => {
    const creat = () => {
        if (gamePaused) return;
    
        // 적 생성 위치 결정
        const side = Math.floor(Math.random() * 4);
        let randomX, randomY;
        if (side === 0) { // 상단
          randomX = Math.floor(Math.random() * (map.clientWidth - far * 2 + 1) + far);
          randomY = far;
        } else if (side === 1) { // 하단
          randomX = Math.floor(Math.random() * (map.clientWidth - far * 2 + 1) + far);
          randomY = map.clientHeight - far;
        } else if (side === 2) { // 좌측
          randomX = far;
          randomY = Math.floor(Math.random() * (map.clientHeight - far * 2 + 1) + far);
        } else if (side === 3) { // 우측
          randomX = map.clientWidth - far;
          randomY = Math.floor(Math.random() * (map.clientHeight - far * 2 + 1) + far);
        }
    
        // 적 요소 생성 (innerHTML 대신 createElement 사용)
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
    
        // 적 머리 생성
        const enemyHead = document.createElement('img');
        enemyHead.src = './img/enemy_head.png';
        enemyHead.alt = 'enemy_head';
    
        // 적 몸통 생성
        const enemyBody = document.createElement('img');
        enemyBody.src = './img/enemy_body.png';
        enemyBody.alt = 'enemy_body';
    
        // 다리 컨테이너 생성
        const legsContainer = document.createElement('div');
        legsContainer.classList.add('enemy-legs');
    
        // 왼쪽 다리 생성
        const enemyLeftLeg = document.createElement('img');
        enemyLeftLeg.src = './img/enemy_leg.png';
        enemyLeftLeg.alt = 'enemy_left_leg';
    
        // 오른쪽 다리 생성
        const enemyRightLeg = document.createElement('img');
        enemyRightLeg.src = './img/enemy_leg.png';
        enemyRightLeg.alt = 'enemy_right_leg';
    
        // 다리 컨테이너에 다리 추가
        legsContainer.appendChild(enemyLeftLeg);
        legsContainer.appendChild(enemyRightLeg);
    
        // 적 요소에 머리, 몸통, 다리 컨테이너 추가
        enemy.appendChild(enemyHead);
        enemy.appendChild(enemyBody);
        enemy.appendChild(legsContainer);
    
        // 적의 위치 및 스타일 설정
        enemy.style.left = `${randomX}px`;
        enemy.style.top = `${randomY}px`;
    
        map.appendChild(enemy);
    
        // enemyData 객체 생성 (다리 요소 참조 포함)
        const enemyData = {
          element: enemy,
          x: randomX,
          y: randomY,
          speed: enemySpeed,
          hp: enemyHp,
          degDirection: -1,
          leftLegDeg: 0,
          rightLegDeg: 0,
          enemyLeftLeg: enemyLeftLeg,
          enemyRightLeg: enemyRightLeg
        };
        enemies.push(enemyData);
    
        // 적 이동 및 공격 함수 (이전 코드와 동일)
        const move = () => {
          if (gamePaused) {
            requestAnimationFrame(move);
            return;
          }
    
          const px = x - enemyData.x;
          const py = y - enemyData.y;
          const distance = Math.sqrt(px * px + py * py);
          const attackRange = player.offsetWidth;
          let currentTime = Date.now();
    
          if (distance > attackRange) {
            enemyData.lastAttackTime = null;
            enemyData.x += (px / distance) * enemyData.speed;
            enemyData.y += (py / distance) * enemyData.speed;
    
            // 적 다리 애니메이션 업데이트 (플레이어의 걷기와 유사)
            enemyData.leftLegDeg += (enemyData.speed * 0.6) * enemyData.degDirection;
            enemyData.rightLegDeg -= (enemyData.speed * 0.6) * enemyData.degDirection;
            if (enemyData.leftLegDeg <= -15 || enemyData.leftLegDeg >= 15) {
              enemyData.degDirection *= -1;
            }
            enemyData.enemyLeftLeg.style.transform = `rotate(${enemyData.leftLegDeg}deg)`;
            enemyData.enemyRightLeg.style.transform = `rotate(${enemyData.rightLegDeg}deg)`;
    
            // 적 간의 충돌(분리) 처리
            for (const other of enemies) {
              if (other === enemyData) continue;
              const ex = other.x - enemyData.x;
              const ey = other.y - enemyData.y;
              const enemyDistance = Math.sqrt(ex * ex + ey * ey);
              if (enemyDistance < player.offsetWidth) {
                enemyData.x -= (ex / enemyDistance) * enemyData.speed;
                enemyData.y -= (ey / enemyDistance) * enemyData.speed;
              }
            }
          } else {
            if (enemyData.leftLegDeg > 0) {
              enemyData.leftLegDeg = Math.max(0, enemyData.leftLegDeg - enemyData.speed * 0.6);
              enemyData.rightLegDeg = Math.min(0, enemyData.rightLegDeg + enemyData.speed * 0.6);
            } else if (enemyData.leftLegDeg < 0) {
              enemyData.leftLegDeg = Math.min(0, enemyData.leftLegDeg + enemyData.speed * 0.6);
              enemyData.rightLegDeg = Math.max(0, enemyData.rightLegDeg - enemyData.speed * 0.6);
            }
            
            enemyData.enemyLeftLeg.style.transform = `rotate(${enemyData.leftLegDeg}deg)`;
            enemyData.enemyRightLeg.style.transform = `rotate(${enemyData.rightLegDeg}deg)`;
          }
    
          const enemyWidth = enemyData.element.offsetWidth;
          const enemyHeight = enemyData.element.offsetHeight;
          enemyData.x = Math.max(enemyWidth / 2, Math.min(enemyData.x, map.clientWidth - enemyWidth / 2));
          enemyData.y = Math.max(enemyHeight / 2, Math.min(enemyData.y, map.clientHeight - enemyHeight / 2));
          enemyData.element.style.left = `${enemyData.x}px`;
          enemyData.element.style.top = `${enemyData.y}px`;
    
          requestAnimationFrame(move);
        };
        move();
      };
    
      setInterval(() => {
        if (!gamePaused) creat();
      }, createTime);
};

const enemy02 = () => {

};

const enemy03 = () => {

};

const boss01 = () => {

}

let enemy = {
    enemy01: enemy01,
    enemy02: enemy02,
    enemy03: enemy03
};

let boss = {
    boss01: boss01
};

const rotate = (parent) => {
    // const box = document.createElement('div');
    // const h3 = document.createElement('h3');
    // const img = document.createElement('img');
    // const p = document.createElement('p');

    // box.classList.add('upgrade_select');
    // box.classList.add('rotate');

    // img.src = './img/rotate.png';
    // img.alt = 'rotate';

    // parent.appendChild(box);
    // box.appendChild(h3);
    // box.appendChild(img);
    // box.appendChild(p);

    // h3.textContent = 'rotate';
    // p.textContent = '회전하는 표창 추가';

    // box.addEventListener('click', () => {
    //     document.getElementById('btn_end').style.display = 'none';
    // });
    const shuriken = document.createElement('img');
    shuriken.src = './img/shuriken.png';
    shuriken.alt = '.shuriken';
};

const shooting = (parent) => {
    const box = document.createElement('div');
    const h3 = document.createElement('h3');
    const img = document.createElement('img');
    const p = document.createElement('p');

    box.classList.add('upgrade_select');
    box.classList.add('shooting');

    img.src = './img/shooting.png';
    img.alt = 'shooting';

    parent.appendChild(box);
    box.appendChild(h3);
    box.appendChild(img);
    box.appendChild(p);

    h3.textContent = 'shooting';
    p.textContent = '총알 1개 추가';

    box.addEventListener('click', () => {
        document.getElementById('btn_end').style.display = 'none';
    });
};

const upgrade = [rotate, shooting];

const levelUp = () => {
    const levelUpBox = document.querySelectorAll('#level_up>div');

    upgrade[Math.floor(Math.random() * upgrade.length)](levelUpBox[0]);
    upgrade[Math.floor(Math.random() * upgrade.length)](levelUpBox[1]);
    upgrade[Math.floor(Math.random() * upgrade.length)](levelUpBox[2]);
};

let seconds = 0, minutes = 0;

const Timer = (stage) => {
    const timer = document.getElementById('timer');

    setInterval(() => {
        if (stage.clear === true) return;
        seconds++;
        if (seconds === 60) {
            seconds = 0;
            minutes++;
        }
        timer.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }, 1000);
};

const showStage = (text, time) => {
    return new Promise((resolve) => {
        const eventBox = document.getElementById('start_event');
        const textBox = eventBox.querySelector('span');
        textBox.textContent = `${text}`;
        time = ((time*1000-500)/2);
        console.log(time);

        eventBox.style.display = 'flex';
        eventBox.style.transition = `opacity ${time/1000}s`;
        setTimeout(()=>{
            eventBox.style.opacity = '1';
            setTimeout(()=>{
                eventBox.style.opacity = '0';
                setTimeout(()=>{
                    eventBox.style.display = 'none';
                    resolve();
                },time);
            },time);
        },500);
    });
};

const showResult = (stage, time) => {
    const page = document.getElementById('end_stage');
    const playTime = document.getElementById('result_time');
    const result = document.querySelector('.result');
    const get = document.getElementById('get_item');
    const btnClose = document.getElementById('btn_end');

    stage.clear === true ? result.textContent = '승리' : result.textContent = '실패';
    playTime.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    page.style.display = 'flex';
    page.style.transition = `opacity ${time}s`;
    setTimeout(()=>{
        page.style.opacity = '1';
        setTimeout(() => {
            btnClose.style.cursor = 'pointer';
            btnClose.addEventListener("click", () => {closeStage()});
        },time*1000+500);
    },500);
};

const closeStage = () => {

};

let stage01 = {
    time: 5,
    gold: 500,
    clear: false
};

async function Stage01() {
    await showStage("1 - 운동장", 4.5);
    Timer(stage01);
    Player();
    // levelUp();
    await Enemy(enemy.enemy01, 1.5);
    // await Enemy(enemy.enemy02, 1.5);
    // await Enemy(enemy.enemy03, 1);
    // await Enemy(boss.boss01);
    showResult(stage01, 1.5);
};
Stage01();