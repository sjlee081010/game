let gamePaused = false;

document.addEventListener("visibilitychange", () => {
    gamePaused = document.hidden;
});

const player = {
    element: document.querySelector('.player'),
    maxHp: 100,
    hp: 100,
    speed: 1,
    damage: 15,
    atSpeed: 1,
    x: 0,
    y: 0,
    die: false,
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

const playerDamaged = (damage) => {
    const bar = document.querySelector('.hp_bar');

    player.hp -= damage;
    const percent = (player.hp / player.maxHp) * 100;

    bar.style.width = `${percent}%`;

    if (player.hp <= 0) {
        player.die = true;
        gamePaused = true;
        showResult(stage01, 1.5);
    }
};

const enemies = [];

const Enemy = (enemy, time, repeat) => {
    return new Promise((resolve) => {
        enemy();
        const interval = setInterval(() => {
            if (!gamePaused) enemy();
        }, repeat * 1000);

        setTimeout(() => {
            clearInterval(interval);
            resolve();
        }, time * 60 * 1000);
    });
};


const attackRange = (x, y, enemy) => {
    const rangeX = player.element.clientWidth / 2 + enemy.clientWidth / 3.5;
    const rangeY = player.element.clientHeight / 2 + enemy.clientHeight / 3.5;

    return Math.abs(x) < rangeX && Math.abs(y) < rangeY;
};

const findEnemy = () => {
    let closeEnemy, closeDistance = Infinity;
    for (const enemy of enemies) {
      const px = player.x - enemy.x;
      const py = player.y - enemy.y;
      const distance = Math.sqrt(px * px + py * py);
      if (distance < closeDistance) {
        closeDistanceDistance = distance;
        closeEnemy = enemy;
      }
    }
    return closeEnemy;
};

const weaponSpeed = 2.25;
const weapons = [];

const attack = () => {
    const boundary = document.querySelector('.box_boundary');
    const img = document.createElement('img');

    img.src = "./img/back_pack.png";
    img.style.position = "absolute";
    img.style.width = "30px";
    img.style.zIndex = "150";
    img.style.top = '40%';
    player.element.appendChild(img);

    const shoot = () => {
        const target = findEnemy();
        if (!target) return; // 적이 없으면 발사하지 않음

        const weapon = document.createElement('img');
        weapon.src = "./img/back_pack.png";
        weapon.style.position = "absolute";
        weapon.style.width = "30px";
        weapon.style.zIndex = "250";
        weapon.style.top = '40%';

        boundary.appendChild(weapon);

        const distanceX = target.x - player.x;
        const distanceY = target.y - player.y;
        const distance = Math.hypot(distanceX, distanceY);

        if (distance === 0) return;

        const vx = distanceX / distance;
        const vy = distanceY / distance;
        const angle = Math.atan2(distanceY, distanceX) * (180 / Math.PI);  
        weapon.style.transform = `rotate(${angle+90}deg)`;

        const data = { 
            element: weapon, 
            x: player.x, 
            y: player.y, 
            vx: vx, 
            vy: vy, 
            target: target,
            fired: false
        };
        weapons.push(data);

        const moveBullet = () => {
            if (gamePaused) return;

            data.x += data.vx * weaponSpeed;
            data.y += data.vy * weaponSpeed;
            data.element.style.left = `${data.x-10}px`;
            data.element.style.top = `${data.y}px`;

            if (Math.abs(data.target.x - data.x) < data.target.element.clientWidth / 2 &&
                Math.abs(data.target.y - data.y) < data.target.element.clientHeight / 2 && !data.fired) {

                data.fired = true;
                data.element.remove();
                weapons.splice(weapons.indexOf(data), 1);
                data.target.hp -= player.damage;

                if (data.target.hp <= 0) {
                    data.target.element.remove();
                    enemies.splice(enemies.indexOf(data.target), 1);
                }
            }

            if (data.x < 0 || data.x > boundary.clientWidth || data.y < 0 || data.y > boundary.clientHeight) {
                data.element.remove();
                weapons.splice(weapons.indexOf(data), 1);
                return;
            }

            if (!gamePaused) requestAnimationFrame(moveBullet);
        };
        moveBullet();
    };

    setInterval(() => {
        if (!gamePaused) shoot();
    }, player.atSpeed * 1000);
}
attack();


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

    return {enemy, leftLeg, rightLeg, enemyHead};
};

const attackEnemy01 = (enemy) => {
    if (enemy.isAttacking || enemy.hp <= 0) return;

    enemy.isAttacking = true;
    enemy.head.style.transition = 'transform 0.4s ease-in-out';

    const dx = player.x - enemy.x;
    const attackAngle = dx > 0 ? 45 : -45;

    enemy.head.style.transformOrigin = '50% 100%';
    enemy.head.style.transform = `rotate(${attackAngle}deg)`;

    setTimeout(() => {
        enemy.head.style.transform = 'rotate(0deg)';
        enemy.isAttacking = false;

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;

        if (attackRange(dx, dy, enemy.element)) {
            playerDamaged(enemy.damage);
        }
    }, 500);
};

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
        hp: 30,
        damage: 10,
        degDirection: -1,
        leftLegDeg: 0,
        rightLegDeg: 0,
        leftLeg: objectInfo.leftLeg,
        rightLeg: objectInfo.rightLeg,
        head: objectInfo.enemyHead,
        lastAttackTime: 0,
        attackCooldown: 1000,
        isAttacking: false
    };

    enemies.push(enemy);

    object.style.left = `${enemy.x}px`;
    object.style.top = `${enemy.y}px`;

    boundary.appendChild(object);

    const move = () => {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const currentTime = Date.now();

        if (!attackRange(dx, dy, enemy.element) && !enemy.isAttacking) {
            enemy.lastAttackTime = 0;
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

            if (currentTime - enemy.lastAttackTime >= enemy.attackCooldown) {
                attackEnemy01(enemy);
                enemy.lastAttackTime = currentTime;
            }
        }

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

        const enemyWidth = enemy.element.clientWidth;
        const enemyHeight = enemy.element.clientHeight;
        enemy.element.style.left = `${enemy.x}px`;
        enemy.element.style.top = `${enemy.y}px`;
        enemy.x = Math.max(enemyWidth / 2, Math.min(enemy.x, boundary.clientWidth - enemyWidth / 2));
        enemy.y = Math.max(enemyHeight / 2, Math.min(enemy.y, boundary.clientHeight - enemyHeight / 2));

        requestAnimationFrame(move);
    };
    move();
};

const enemy02 = () => {

};

const boss01 = () => {

}

let enemy = {
    enemy01: enemy01,
    enemy02: enemy02,
};

let boss = {
    boss01: boss01
};

const selectBox = (title, exp, func) => {
    const box = document.createElement('div');
    const h3 = document.createElement('h3');
    const img = document.createElement('img');
    const p = document.createElement('p');

    box.classList.add('upgrade_select');
    box.classList.add('rotate');

    img.src = `./img/${title}.png`;
    img.alt = `${title}`;

    parent.appendChild(box);
    box.appendChild(h3);
    box.appendChild(img);
    box.appendChild(p);

    h3.textContent = `${title}`;
    p.textContent = `${exp}`;

    box.addEventListener('click', () => {
        document.querySelector('.levelup_page').style.display = 'none';
        func();
    });
};

const rotate = () => {
    
};

const damageUp = () => {

};

const speedUp = () => {

};

const atSpeedUp = () => {

};

const hpUp = () => {

};

const circle = () => {

};

const upgrade = [rotate, damageUp, speedUp, atSpeedUp, hpUp, circle];

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
        if(gamePaused) return;
        if (stage.clear === true || player.die === true) return;
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
    item: false,
    clear: false
};

async function Stage01() {
    // await showStage("1 - 운동장", 4.5);
    Timer(stage01);
    Player();
    // levelUp();
    await Enemy(enemy.enemy01, 1.5, 3);
    // await Enemy(enemy.enemy01, 0.5, 2);
    // await Enemy(enemy.enemy02, 0.5, 3);
    // await Enemy(enemy.enemy02, 0.5, 2);
    // await Enemy(boss.boss01);
    // showResult(stage01, 1.5);
};
Stage01();