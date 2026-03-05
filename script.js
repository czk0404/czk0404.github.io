// 游戏画布和上下文
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 设置画布尺寸
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

// 初始调整尺寸并监听窗口大小变化
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 游戏状态
const gameState = {
    car: {
        x: 50,           // 初始位置：水平靠左
        y: canvas.height / 2-75,  // 初始位置：上下居中
        width: 80,       // 汽车宽度
        height: 40,      // 汽车高度
        angle: 0,        // 汽车角度（弧度）
        speed: 0,        // 汽车速度
        maxSpeed: 1.5,     // 最大速度
        acceleration: 0.2, // 加速度
        deceleration: 0.1, // 减速度
        steeringAngle: 0,   // 转向角度
        maxSteeringAngle: 0.5, // 最大转向角度
        steeringSpeed: 0.05,   // 转向速度
        gear: 'forward'  // 档位：forward 或 reverse
    },
    keys: {
        left: false,
        right: false,
        throttle: false,
        brake: false
    },
    garage: {
        roadHeight: canvas.height / 2,  // 上部道路高度
        parkingHeight:150, // 中部停车位高度
        parkingWidth: 60,   // 每个停车位宽度
        parkingX: canvas.width / 2-28,
        parkingY: canvas.height / 2      // 停车位Y坐标
    }
};

// 绘制车库和停车位
function drawGarage() {
    const { roadHeight, parkingHeight, parkingWidth, parkingX,parkingY } = gameState.garage;
    
    // 绘制上部道路
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制中部停车位区域
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(0, roadHeight-150, canvas.width, parkingHeight);
    
    // 绘制三个停车位
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        const x = i * parkingWidth;
        ctx.strokeRect(parkingX, parkingY, 60, 100);
    }
    
}

// 绘制汽车
function drawCar() {
    const { x, y, width, height, angle, steeringAngle, gear } = gameState.car;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    
    // 绘制汽车主体
    ctx.fillStyle = '#3498db';
    ctx.fillRect(-width / 2, -height / 2, width, height);
    
    // 绘制车灯
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(width / 2 - 10, -height / 4, 10, height / 2);
   
    // 绘制车轮
    ctx.fillStyle = '#333';
    // 前轮（会转向）
    ctx.save();
    ctx.translate(width / 3, height / 2);
    ctx.rotate(steeringAngle);
    ctx.fillRect(-5, -5, 15, 10);
    ctx.restore();
    
    ctx.save();
    ctx.translate(width / 3, -height / 2);
    ctx.rotate(steeringAngle);
    ctx.fillRect(-5, -5, 15, 10);
    ctx.restore();
    
    // 后轮（不转向）
    ctx.fillRect(-width / 3, height / 2 - 5, 15, 10);
    ctx.fillRect(-width / 3, -height / 2 - 5, 15, 10);
    
    ctx.restore();
}

// 更新游戏状态
function updateGame() {
    const { car, keys } = gameState;
    
    // 处理转向
    if (keys.left) {
        car.steeringAngle = Math.max(car.steeringAngle - car.steeringSpeed, -car.maxSteeringAngle);
    } else if (keys.right) {
        car.steeringAngle = Math.min(car.steeringAngle + car.steeringSpeed, car.maxSteeringAngle);
    }
    
    // 处理油门和刹车
    if (keys.throttle) {
        if (car.gear === 'forward') {
            car.speed = Math.min(car.speed + car.acceleration, car.maxSpeed);
        } else {
            car.speed = Math.max(car.speed - car.acceleration, -car.maxSpeed);
        }
    } else if (keys.brake) {
        if (car.speed > 0) {
            car.speed = Math.max(car.speed - car.deceleration, 0);
        } else if (car.speed < 0) {
            car.speed = Math.min(car.speed + car.deceleration, 0);
        }
    } else {
        // 自然减速
        if (car.speed > 0) {
            car.speed = Math.max(car.speed - car.deceleration * 0.5, 0);
        } else if (car.speed < 0) {
            car.speed = Math.min(car.speed + car.deceleration * 0.5, 0);
        }
    }
    
    // 更新汽车位置和角度
    if (car.speed !== 0) {
        // 计算转向半径
        const turnRadius = car.width / Math.sin(car.steeringAngle) || Infinity;
        // 计算角速度
        const angularVelocity = car.speed / turnRadius;
        
        // 更新角度
        car.angle += angularVelocity;
        
        // 更新位置
        car.x += Math.cos(car.angle) * car.speed;
        car.y += Math.sin(car.angle) * car.speed;
        
        // 边界检查
        car.x = Math.max(car.width / 2, Math.min(car.x, canvas.width - car.width / 2));
        car.y = Math.max(car.height / 2, Math.min(car.y, canvas.height - car.height / 2));
    }
}

// 渲染游戏
function renderGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGarage();
    drawCar();
}

// 游戏主循环
function gameLoop() {
    updateGame();
    renderGame();
    requestAnimationFrame(gameLoop);
}

// 重置游戏
function resetGame() {
    gameState.car.x = 50;
    gameState.car.y = canvas.height / 2-75;
    gameState.car.angle = 0;
    gameState.car.speed = 0;
    gameState.car.steeringAngle = 0;
    gameState.car.gear = 'forward';
    
    // 更新档位按钮状态
    document.getElementById('forwardBtn').classList.add('active');
    document.getElementById('reverseBtn').classList.remove('active');
}

// 事件监听器
function setupEventListeners() {
    // 按钮事件
    document.getElementById('restartBtn').addEventListener('click', resetGame);
    
    document.getElementById('forwardBtn').addEventListener('click', function() {
        gameState.car.gear = 'forward';
        this.classList.add('active');
        document.getElementById('reverseBtn').classList.remove('active');
    });
    
    document.getElementById('reverseBtn').addEventListener('click', function() {
        gameState.car.gear = 'reverse';
        this.classList.add('active');
        document.getElementById('forwardBtn').classList.remove('active');
    });
    
    // 触摸事件处理
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const throttleBtn = document.getElementById('throttleBtn');
    const brakeBtn = document.getElementById('brakeBtn');
    
    // 触摸开始
    leftBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        gameState.keys.left = true;
    });
    
    rightBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        gameState.keys.right = true;
    });
    
    throttleBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        gameState.keys.throttle = true;
    });
    
    brakeBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        gameState.keys.brake = true;
    });
    
    // 触摸结束
    leftBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        gameState.keys.left = false;
    });
    
    rightBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        gameState.keys.right = false;
    });
    
    throttleBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        gameState.keys.throttle = false;
    });
    
    brakeBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        gameState.keys.brake = false;
    });
    
    // 鼠标事件（用于桌面测试）
    leftBtn.addEventListener('mousedown', function() {
        gameState.keys.left = true;
    });
    
    rightBtn.addEventListener('mousedown', function() {
        gameState.keys.right = true;
    });
    
    throttleBtn.addEventListener('mousedown', function() {
        gameState.keys.throttle = true;
    });
    
    brakeBtn.addEventListener('mousedown', function() {
        gameState.keys.brake = true;
    });
    
    document.addEventListener('mouseup', function() {
        gameState.keys.left = false;
        gameState.keys.right = false;
        gameState.keys.throttle = false;
        gameState.keys.brake = false;
    });
    
    // 键盘事件（用于桌面测试）
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                gameState.keys.left = true;
                break;
            case 'ArrowRight':
                gameState.keys.right = true;
                break;
            case 'ArrowUp':
                gameState.keys.throttle = true;
                break;
            case 'ArrowDown':
                gameState.keys.brake = true;
                break;
        }
    });
    
    document.addEventListener('keyup', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                gameState.keys.left = false;
                break;
            case 'ArrowRight':
                gameState.keys.right = false;
                break;
            case 'ArrowUp':
                gameState.keys.throttle = false;
                break;
            case 'ArrowDown':
                gameState.keys.brake = false;
                break;
        }
    });
}

// 初始化游戏
function initGame() {
    setupEventListeners();
    gameLoop();
}

// 启动游戏
initGame();

