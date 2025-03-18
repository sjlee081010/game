let gamePaused = false;

document.addEventListener("visibilitychange", () => {
    gamePaused = document.hidden;
});

let stage01 = {
    time: 5,
    gold: 500,
    clear: false
};

let enemy = {
    enemy01: enemy01(),
    enemy02: enemy02(),
    enemy03: enemy03()
}

let boss = {
    boss01: boss01()
}

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
        console.log(mapX, mapY);
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
        setTimeout(() => {resolve();}, time*60*1000);
    });
};

const enemy01 = () => {

};

const enemy02 = () => {

};

const enemy03 = () => {

};

const boss01 = () => {

}

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

const startEvent = (text, time) => {
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

const endStage = (min, sec, stage) => {
    const page = document.getElementById('end_stage');
    const time = document.getElementById('result_time');
    const result = document.querySelector('result');

    result.textContent = 'result'
    time.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

async function Stage01() {
    await startEvent("1 - 운동장", 4.5);
    Timer(stage01);
    Player();
    await Enemy(enemy.enemy01, 1.5);
    await Enemy(enemy.enemy02, 1.5);
    await Enemy(enemy.enemy03, 1);
    await Enemy(boss.boss01);
    endStage(minutes, seconds, stage01);
};
Stage01();