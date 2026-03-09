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
        x: 50,           // 初始位置
        y: canvas.height *0.5-50,  // 初始位置
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
        roadHeight: 150,  // 道路高度
        roadWidth: canvas.width, // 道路宽度
        parkingWidth: 60,
        parkingHeight: 100,// 停车位高度
        parkingX: canvas.width *0.4,
        parkingY: canvas.height *0.5      // 停车位Y坐标
    },
    timer: {
        seconds: 0,
        minutes: 0,
        interval: null
    },
    isParkingSuccess: false // 停车是否成功
};

// 绘制车库和停车位
function drawGarage() {
    const { roadWidth,roadHeight,parkingX,parkingY,parkingHeight,parkingWidth } = gameState.garage;
    
    // 绘制车库
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制道路
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(0, parkingY-roadHeight, roadWidth, roadHeight);
    
    // 绘制停车位
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(parkingX, parkingY, parkingWidth, parkingHeight);
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
        // 修复转向半径（避免除以0）
        const steeringAngle = car.steeringAngle === 0 ? 0.001 : car.steeringAngle;
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

// 检查停车是否成功
function checkParkingSuccess() {
    const { car, garage } = gameState;
    
    // 检查汽车是否静止
    if (Math.abs(car.speed) > 0.1) return false;
          
    // 计算汽车的四个顶点坐标（朝上为0角度）
    const vertices = [
        // 左上角
        { x: car.x - car.width/2 * Math.cos(car.angle) - car.height/2 * Math.sin(car.angle),
          y: car.y - car.width/2 * Math.sin(car.angle) + car.height/2 * Math.cos(car.angle) },
        // 左下角
        { x: car.x - car.width/2 * Math.cos(car.angle) + car.height/2 * Math.sin(car.angle),
          y: car.y - car.width/2 * Math.sin(car.angle) - car.height/2 * Math.cos(car.angle) },
        // 右下角
        { x: car.x + car.width/2 * Math.cos(car.angle) + car.height/2 * Math.sin(car.angle),
          y: car.y + car.width/2 * Math.sin(car.angle) - car.height/2 * Math.cos(car.angle) },
        // 右上角
        { x: car.x + car.width/2 * Math.cos(car.angle) - car.height/2 * Math.sin(car.angle),
          y: car.y + car.width/2 * Math.sin(car.angle) + car.height/2 * Math.cos(car.angle) }
    ];
    
    // 计算停车位的边界
    const parkingLeft = garage.parkingX;
    const parkingRight = garage.parkingX + garage.parkingWidth;
    const parkingTop = garage.parkingY;
    const parkingBottom = garage.parkingY + garage.parkingHeight;
    
    // 检查所有顶点是否在停车位内
    for (const vertex of vertices) {
        if (vertex.x < parkingLeft || vertex.x > parkingRight || vertex.y < parkingTop || vertex.y > parkingBottom) {
            return false;
        }
    }
    
    return true;
}

// 显示停车成功消息
function showParkingSuccess() {
    if (gameState.isParkingSuccess) return;
    
    gameState.isParkingSuccess = true;
    clearInterval(gameState.timer.interval);
    
    // 创建成功消息元素
    const successMessage = document.createElement('div');
    successMessage.style.position = 'fixed';
    successMessage.style.top = '20%';
    successMessage.style.left = '50%';
    successMessage.style.transform = 'translate(-50%, -50%)';
    successMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    successMessage.style.color = 'white';
    successMessage.style.padding = '30px';
    successMessage.style.borderRadius = '10px';
    successMessage.style.fontSize = '24px';
    successMessage.style.fontWeight = 'bold';
    successMessage.style.textAlign = 'center';
    successMessage.style.zIndex = '1000';
    successMessage.style.boxShadow = '0 0 20px rgba(0, 0, 0, 0.5)';
    
    const { minutes, seconds } = gameState.timer;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    successMessage.innerHTML = `
        <h2>停车成功！</h2>
        <p>用时：${formattedMinutes}:${formattedSeconds}</p>
        <button onclick="resetGame()" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; font-weight: bold; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">再玩一次</button>
    `;
    
    document.body.appendChild(successMessage);
}

// 游戏主循环
function gameLoop() {
    if (!gameState.isParkingSuccess) {
        updateGame();
        renderGame();
        
        // 检查停车是否成功
        if (checkParkingSuccess()) {
            showParkingSuccess();
        }
    }
    requestAnimationFrame(gameLoop);
}
// 更新计时器显示
function updateTimerDisplay() {
    const { minutes, seconds } = gameState.timer;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${formattedMinutes}:${formattedSeconds}`;
}

// 开始计时
function startTimer() {
    if (gameState.timer.interval) return;
    
    gameState.timer.interval = setInterval(() => {
        gameState.timer.seconds++;
        if (gameState.timer.seconds >= 60) {
            gameState.timer.seconds = 0;
            gameState.timer.minutes++;
        }
        updateTimerDisplay();
    }, 1000);
}

// 重置计时器
function resetTimer() {
    clearInterval(gameState.timer.interval);
    gameState.timer.seconds = 0;
    gameState.timer.minutes = 0;
    gameState.timer.interval = null;
    updateTimerDisplay();
}

// 重置游戏
function resetGame() {
    // 重置停车成功状态
    gameState.isParkingSuccess = false;
    
    // 移除成功消息元素
    const successMessage = document.querySelector('div[style*="z-index: 1000"]');
    if (successMessage) {
        successMessage.remove();
    }
    
    gameState.car.x = 50;
    gameState.car.y = canvas.height *0.5-50;
    gameState.car.angle = 0;
    gameState.car.speed = 0;
    gameState.car.steeringAngle = 0;
    gameState.car.gear = 'forward';
    gameState.keys = { left: false, right: false, throttle: false, brake: false };
    // 重置计时器
    resetTimer();
    startTimer();
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
        provideTouchFeedback(this);
    });
    
    rightBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        gameState.keys.right = true;
        provideTouchFeedback(this);
    });
    
    throttleBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        gameState.keys.throttle = true;
        provideTouchFeedback(this);
    });
    
    brakeBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        gameState.keys.brake = true;
        provideTouchFeedback(this);
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
    
    // 触摸移动事件（防止页面滚动）
    document.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTouchEnd < 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // 防止触摸时的文本选择
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
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
    // 检查必要的DOM元素是否存在
    const requiredElements = [
        'gameCanvas', 'timer', 'restartBtn', 'forwardBtn', 'reverseBtn',
        'leftBtn', 'rightBtn', 'throttleBtn', 'brakeBtn'
    ];
    
    for (const id of requiredElements) {
        if (!document.getElementById(id)) {
            console.error(`缺少必要的DOM元素: ${id}`);
            return;
        }
    }
    
    setupEventListeners();
    startTimer();
    gameLoop();
}

// 启动游戏
initGame();


