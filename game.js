class Car {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 20;
        this.angle = 0;
        this.speed = 0;
        this.maxSpeed = 5;
        this.acceleration = 0.2;
        this.deceleration = 0.1;
        this.turnSpeed = 0.05;
        this.gear = 'forward'; // 'forward' or 'reverse'
    }

    update() {
        // 应用摩擦力
        if (this.speed > 0) {
            this.speed = Math.max(0, this.speed - this.deceleration);
        } else if (this.speed < 0) {
            this.speed = Math.min(0, this.speed + this.deceleration);
        }

        // 更新位置
        const radians = this.angle * Math.PI / 180;
        this.x += Math.cos(radians) * this.speed;
        this.y += Math.sin(radians) * this.speed;

        // 边界碰撞检测
        if (this.x < 0) this.x = 0;
        if (this.x > canvas.width - this.width) this.x = canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > canvas.height - this.height) this.y = canvas.height - this.height;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-this.width / 2 + 5, -this.height / 2 + 3, 10, 14);
        ctx.fillRect(this.width / 2 - 15, -this.height / 2 + 3, 10, 14);
        ctx.restore();
    }

    accelerate() {
        if (this.gear === 'forward') {
            this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration);
        } else {
            this.speed = Math.max(-this.maxSpeed, this.speed - this.acceleration);
        }
    }

    brake() {
        if (this.speed > 0) {
            this.speed = Math.max(0, this.speed - this.deceleration * 2);
        } else if (this.speed < 0) {
            this.speed = Math.min(0, this.speed + this.deceleration * 2);
        }
    }

    turnLeft() {
        if (this.speed !== 0) {
            this.angle -= this.turnSpeed * Math.abs(this.speed);
        }
    }

    turnRight() {
        if (this.speed !== 0) {
            this.angle += this.turnSpeed * Math.abs(this.speed);
        }
    }

    setGear(gear) {
        this.gear = gear;
    }

    reset() {
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height / 2 - this.height / 2;
        this.angle = 0;
        this.speed = 0;
    }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const car = new Car(canvas.width / 2 - 20, canvas.height / 2 - 10);

let isThrottlePressed = false;
let isBrakePressed = false;
let isLeftPressed = false;
let isRightPressed = false;

function handleKeyDown(e) {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
            isThrottlePressed = true;
            break;
        case 'ArrowDown':
        case 's':
            isBrakePressed = true;
            break;
        case 'ArrowLeft':
        case 'a':
            isLeftPressed = true;
            break;
        case 'ArrowRight':
        case 'd':
            isRightPressed = true;
            break;
    }
}

function handleKeyUp(e) {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
            isThrottlePressed = false;
            break;
        case 'ArrowDown':
        case 's':
            isBrakePressed = false;
            break;
        case 'ArrowLeft':
        case 'a':
            isLeftPressed = false;
            break;
        case 'ArrowRight':
        case 'd':
            isRightPressed = false;
            break;
    }
}

function gameLoop() {
    // 清空画布
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制道路
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, canvas.height / 2 - 2, canvas.width, 4);

    // 处理输入
    if (isThrottlePressed) {
        car.accelerate();
    }
    if (isBrakePressed) {
        car.brake();
    }
    if (isLeftPressed) {
        car.turnLeft();
    }
    if (isRightPressed) {
        car.turnRight();
    }

    // 更新和绘制汽车
    car.update();
    car.draw(ctx);

    requestAnimationFrame(gameLoop);
}

// 按钮事件监听
const throttleBtn = document.getElementById('throttleBtn');
const brakeBtn = document.getElementById('brakeBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reverseBtn = document.getElementById('reverseBtn');
const restartBtn = document.getElementById('restartBtn');

// 触摸事件优化
function setupTouchEvents(button, onStart, onEnd) {
    button.addEventListener('mousedown', onStart);
    button.addEventListener('mouseup', onEnd);
    button.addEventListener('mouseleave', onEnd);
    button.addEventListener('touchstart', onStart);
    button.addEventListener('touchend', onEnd);
}

setupTouchEvents(throttleBtn, () => isThrottlePressed = true, () => isThrottlePressed = false);
setupTouchEvents(brakeBtn, () => isBrakePressed = true, () => isBrakePressed = false);
setupTouchEvents(leftBtn, () => isLeftPressed = true, () => isLeftPressed = false);
setupTouchEvents(rightBtn, () => isRightPressed = true, () => isRightPressed = false);

forwardBtn.addEventListener('click', () => {
    car.setGear('forward');
    forwardBtn.classList.add('active');
    reverseBtn.classList.remove('active');
});

reverseBtn.addEventListener('click', () => {
    car.setGear('reverse');
    reverseBtn.classList.add('active');
    forwardBtn.classList.remove('active');
});

restartBtn.addEventListener('click', () => {
    car.reset();
});

// 键盘事件监听
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

// 开始游戏循环
gameLoop();

// 响应式调整
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    const width = container.clientWidth;
    const height = width * 0.75; // 4:3 比例
    canvas.width = width;
    canvas.height = height;
    car.reset();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();