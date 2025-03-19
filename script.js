let gamePaused = false;

document.addEventListener("visibilitychange", () => {
    gamePaused = document.hidden;
});

const player = {
    element: document.querySelector('.player'),
    speed: 1,
    hp: 100,
    x: 0,
    y: 0,
}

const Player = () => {
    const map = document.querySelector('.map');
    const boundary = document.querySelector('.box_boundary');
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

    player.x = boundary.clientWidth / 2;
    player.y = boundary.clientHeight / 2;

    let mapX, mapY;

    const move = () => {
        let dx = 0, dy = 0;
        if (keys['w'] || keys['ArrowUp']) dy -= player.speed;
        if (keys['s'] || keys['ArrowDown']) dy += player.speed;
        if (keys['a'] || keys['ArrowLeft']) dx -= player.speed;
        if (keys['d'] || keys['ArrowRight']) dx += player.speed;
            
        const magnitude = Math.hypot(dx, dy);
        if (magnitude > 0) {
            dx /= magnitude;
            dy /= magnitude;
        }
    
        player.x += dx * player.speed;
        player.y += dy * player.speed;
        player.x = Math.max(player.element.clientWidth/2, Math.min(player.x, boundary.clientWidth - player.element.clientWidth/2));
        player.y = Math.max(player.element.clientHeight/2, Math.min(player.y, boundary.clientHeight - player.element.clientHeight/2));
    
        player.element.style.left = `${player.x}px`;
        player.element.style.top = `${player.y}px`;
    
        if (dx !== 0) playerBody.style.transform = `scaleX(${Math.sign(dx)})`;

        mapX = -player.x + boundary.clientWidth/2 + window.innerWidth /2;
        mapY = -player.y + boundary.clientHeight/2 + window.innerHeight /2;
        if (map.clientHeight > window.innerWidth) {
            mapX = Math.max(map.clientWidth/4, Math.min(mapX || map.clientWidth/2, map.clientWidth/2));
            map.style.left = `${mapX}px`;
        }
        if (map.clientHeight > window.innerHeight) {
            mapY = Math.max(map.clientHeight/4, Math.min(mapY || map.clientHeight/2, map.clientHeight/2));
            map.style.top = `${mapY}px`;
        }

        if (!gamePaused) requestAnimationFrame(move); 
    };
    move();

    const leftLeg = document.querySelector('.box_legs>img:first-child');
    const rightLeg = document.querySelector('.box_legs>img:last-child');
    let leftDeg = 0, rightDeg = 0, degDirection = -1; 

    const walk = () => {
        if (moveKeys.some(key => keys[key])) {
            leftDeg += (player.speed * 0.6) * degDirection;
            rightDeg -= (player.speed * 0.6) * degDirection;
            if (leftDeg <= -15 || leftDeg >= 15) {
              degDirection *= -1;
            }
        } else {
            if (leftDeg > 0) {
                leftDeg = Math.max(0, leftDeg - player.speed * 0.5);
                rightDeg = Math.min(0, rightDeg + player.speed * 0.5);
            } else if (leftDeg < 0) {
                leftDeg = Math.min(0, leftDeg + player.speed * 0.5);
                rightDeg = Math.max(0, rightDeg - player.speed * 0.5);
            }
        }
        leftLeg.style.transform = `rotate(${leftDeg}deg)`;
        rightLeg.style.transform = `rotate(${rightDeg}deg)`;
        if (!gamePaused) requestAnimationFrame(walk); 
    };
    walk();
};

const isColliding = (object1, object2) => {
    const x1 = object1.offsetLeft + object1.clientWidth / 2;
    const y1 = object1.offsetTop + object1.clientHeight / 2;
    const x2 = object2.x + object2.element.clientWidth / 2;
    const y2 = object2.y + object2.element.clientHeight / 2;

    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const combinedRadius = (object1.clientWidth + object2.element.clientWidth) / 2;

    return distance <= combinedRadius;
};

const destroyEnemy = (enemy) => {
    enemy.element.remove();
    enemies = enemies.filter(e => e !== enemy);
};

const handleAttack = (enemy) => {
    enemy.health -= 10;
    if (enemy.health <= 0) {
        destroyEnemy(enemy);
    }
};

const createRotatingObject = (player) => {
    const rotatingObject = document.createElement('div');
    rotatingObject.style.position = 'absolute';
    rotatingObject.style.width = '20px';
    rotatingObject.style.height = '20px';
    rotatingObject.style.backgroundColor = 'red';
    rotatingObject.style.borderRadius = '50%';
    document.body.appendChild(rotatingObject);

    let angle = 0;
    const radius = 150;
    const speed = 0.01;

    const updateRotatingObject = () => {
        const centerX = player.x;
        const centerY = player.y;

        angle += speed;
        if (angle >= 2 * Math.PI) angle = 0;

        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        rotatingObject.style.left = `${x - rotatingObject.clientWidth / 2}px`;
        rotatingObject.style.top = `${y - rotatingObject.clientHeight / 2}px`;

        enemies.forEach(enemy => {
            if (isColliding(rotatingObject, enemy)) {
                handleAttack(enemy);
            }
        });

        requestAnimationFrame(updateRotatingObject);
    };

    updateRotatingObject();
};


const enemies = [];

const Enemy = (enemy, time, repeat) => {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (!gamePaused) enemy();
        }, repeat * 1000);

        setTimeout(() => {
            clearInterval(interval);
            resolve();
        }, time * 60 * 1000);
    });
};

const spawnPosition = () => {
    const boundary = document.querySelector('.box_boundary');

    const side = Math.floor(Math.random() * 4);
    let x, y, far = 100;
    if (side === 0) {
        x = Math.floor(Math.random() * ((boundary.clientWidth-far) - far/2) + far/2);
        y = far;
    } else if (side === 1) { 
        x = Math.floor(Math.random() * ((boundary.clientWidth-far) * far/2) + far/2);
        y = boundary.clientHeight - far;
    } else if (side === 2) {
        x = far;
        y = Math.floor(Math.random() * ((boundary.clientHeight-far) * far/2) + far/2);
    } else if (side === 3) {
        x = boundary.clientWidth - far;
        y = Math.floor(Math.random() * ((boundary.clientHeight-far) * far/2) + far/2);
    }

    return {x, y};
};  

const attackRange = (x, y) => {
    return Math.abs(x) < player.element.clientWidth / 2 && Math.abs(y) < player.element.clientHeight / 2;
};

const spawnEnemy01 = () => {
    const enemy = document.createElement('div');
    enemy.classList.add('enemy01');

    const enemyHead = document.createElement('img');
    enemyHead.src = './img/enemy01_head.png';
    enemyHead.alt = 'enemy01_head';

    const enemyBody = document.createElement('img');
    enemyBody.src = './img/enemy01_body.png';
    enemyBody.alt = 'enemy01_body';

    const legsContainer = document.createElement('div');

    const leftLeg = document.createElement('img');
    leftLeg.src = './img/enemy01_leg.png';
    leftLeg.alt = 'enemy01_left_leg';

    const rightLeg = document.createElement('img');
    rightLeg.src = './img/enemy01_leg.png';
    rightLeg.alt = 'enemy01_right_leg';

    legsContainer.appendChild(leftLeg);
    legsContainer.appendChild(rightLeg);

    enemy.appendChild(enemyHead);
    enemy.appendChild(enemyBody);
    enemy.appendChild(legsContainer);

    return {enemy, leftLeg, rightLeg};
};

spawnEnemy01()

const enemy01 = () => {
    const boundary = document.querySelector('.box_boundary');
    const objectInfo = spawnEnemy01();
    const object = objectInfo.enemy;
    const position = spawnPosition();

    const enemy = {
        element: object,
        x: position.x,
        y: position.y,
        speed: 0.8,
        hp: 50,
        degDirection: -1,
        leftLegDeg: 0,
        rightLegDeg: 0,
        leftLeg: objectInfo.leftLeg,
        rightLeg: objectInfo.rightLeg
    };
    enemies.push(enemy);

    object.style.left = `${enemy.x}px`;
    object.style.top = `${enemy.y}px`;

    boundary.appendChild(object);

    const move = () => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
  
        if (!attackRange(dx, dy)) {
            enemy.lastAttackTime = null;
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
  
            enemy.leftLegDeg += (enemy.speed * 0.6) * enemy.degDirection;
            enemy.rightLegDeg -= (enemy.speed * 0.6) * enemy.degDirection;
            if (enemy.leftLegDeg <= -15 || enemy.leftLegDeg >= 15) {
                enemy.degDirection *= -1;
            }
            enemy.leftLeg.style.transform = `rotate(${enemy.leftLegDeg}deg)`;
            enemy.rightLeg.style.transform = `rotate(${enemy.rightLegDeg}deg)`;
  
            for (const other of enemies) {
                if (other === enemy) continue;
            
                const ex = other.x - enemy.x;
                const ey = other.y - enemy.y;
                const enemyDistance = Math.sqrt(ex * ex + ey * ey);
            
                const minDistance = (enemy.element.clientWidth / 2) + (other.element.clientWidth / 2);
            
                if (enemyDistance < minDistance) {
                    const overlap = minDistance - enemyDistance;
            
                    const pushX = (ex / enemyDistance) * overlap * 0.5;
                    const pushY = (ey / enemyDistance) * overlap * 0.5;
                    enemy.x -= pushX;
                    enemy.y -= pushY;
            
                    other.x += pushX;
                    other.y += pushY;
                }
            }
        } else {
            if (enemy.leftLegDeg > 0) {
                enemy.leftLegDeg = Math.max(0, enemy.leftLegDeg - enemy.speed * 0.6);
                enemy.rightLegDeg = Math.min(0, enemy.rightLegDeg + enemy.speed * 0.6);
            } else if (enemy.leftLegDeg < 0) {
                enemy.leftLegDeg = Math.min(0, enemy.leftLegDeg + enemy.speed * 0.6);
                enemy.rightLegDeg = Math.max(0, enemy.rightLegDeg - enemy.speed * 0.6);
            }
            enemy.leftLeg.style.transform = `rotate(${enemy.leftLegDeg}deg)`;
            enemy.rightLeg.style.transform = `rotate(${enemy.rightLegDeg}deg)`;

            // attackEnemy01();
        }

        const enemyWidth = enemy.element.clientWidth;
        const enemyHeight = enemy.element.clientHeight;
        enemy.element.style.left = `${enemy.x}px`;
        enemy.element.style.top = `${enemy.y}px`;
        enemy.x = Math.max(enemyWidth/2, Math.min(enemy.x, boundary.clientWidth - enemyWidth/2));
        enemy.y = Math.max(enemyHeight/2, Math.min(enemy.y, boundary.clientHeight - enemyHeight/2));

        requestAnimationFrame(move);
    };
    move();
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
    const box = document.createElement('div');
    const h3 = document.createElement('h3');
    const img = document.createElement('img');
    const p = document.createElement('p');

    box.classList.add('upgrade_select');
    box.classList.add('rotate');

    img.src = './img/rotate.png';
    img.alt = 'rotate';

    parent.appendChild(box);
    box.appendChild(h3);
    box.appendChild(img);
    box.appendChild(p);

    h3.textContent = 'rotate';
    p.textContent = '회전하는 표창 추가';

    box.addEventListener('click', () => {
        document.querySelector('.levelup_page').style.display = 'none';
        createRotatingObject(player);  
    });
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
        document.querySelector('.levelup_page').style.display = 'none';
    });
};

const upgrade = [rotate, shooting];

const levelUp = () => {
    document.querySelector('.levelup_page').style.display = 'flex';
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
    // await showStage("1 - 운동장", 4.5);
    Timer(stage01);
    Player();
    levelUp();
    await Enemy(enemy.enemy01, 1.5, 3);
    // await Enemy(enemy.enemy01, 0.5, 2);
    // await Enemy(enemy.enemy01, 0.5, 1);
    // await Enemy(boss.boss01);
    showResult(stage01, 1.5);
};
Stage01();