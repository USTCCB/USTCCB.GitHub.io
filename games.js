// Snake Game Logic
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameInterval;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
document.getElementById('highScore').innerText = highScore;

function startSnake() {
    clearInterval(gameInterval);
    snake = [{x: 10, y: 10}];
    food = generateFood();
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    updateScore();
    gameInterval = setInterval(gameLoop, 100);
}

function generateFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
}

function updateScore() {
    document.getElementById('score').innerText = score;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').innerText = highScore;
    }
}

function showModal(title, message, restartAction) {
    const modal = document.getElementById('game-modal');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    modal.classList.remove('hidden');
    
    // Store the restart action for the "Play Again" button
    window.currentRestartAction = restartAction;
}

function closeModal() {
    document.getElementById('game-modal').classList.add('hidden');
}

function closeModalAndRestart() {
    closeModal();
    if (window.currentRestartAction) window.currentRestartAction();
}

function gameLoop() {
    direction = nextDirection;
    const head = { ...snake[0] };

    switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Check collision with walls
    if (head.x < 0 || head.x >= canvas.width / gridSize || head.y < 0 || head.y >= canvas.height / gridSize) {
        clearInterval(gameInterval);
        showModal('游戏结束', `撞墙了! 最终得分: ${score}`, startSnake);
        return;
    }

    // Check collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        clearInterval(gameInterval);
        showModal('游戏结束', `撞到自己了! 最终得分: ${score}`, startSnake);
        return;
    }

    snake.unshift(head);

    // Check food
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        food = generateFood();
    } else {
        snake.pop();
    }

    draw();
}

function draw() {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Food
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw Snake
    ctx.fillStyle = '#6366f1';
    snake.forEach((segment, index) => {
        if (index === 0) ctx.fillStyle = '#818cf8'; // Head color
        else ctx.fillStyle = '#6366f1';
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': if (direction !== 'down') nextDirection = 'up'; break;
        case 'ArrowDown': if (direction !== 'up') nextDirection = 'down'; break;
        case 'ArrowLeft': if (direction !== 'right') nextDirection = 'left'; break;
        case 'ArrowRight': if (direction !== 'left') nextDirection = 'right'; break;
    }
});

// Tic Tac Toe Logic
const tttBoard = document.getElementById('tttBoard');
const tttStatus = document.getElementById('ttt-status');
let tttState = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;

function initTTT() {
    tttBoard.innerHTML = '';
    tttState.forEach((cell, index) => {
        const cellDiv = document.createElement('div');
        cellDiv.classList.add('ttt-cell');
        cellDiv.dataset.index = index;
        cellDiv.addEventListener('click', handleCellClick);
        tttBoard.appendChild(cellDiv);
    });
}

function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (tttState[index] || !gameActive) return;

    tttState[index] = currentPlayer;
    e.target.innerText = currentPlayer;
    e.target.classList.add(currentPlayer.toLowerCase());

    if (checkWin()) {
        tttStatus.innerText = `🎉 玩家 ${currentPlayer} 获胜!`;
        gameActive = false;
        showModal('游戏结束', `🎉 玩家 ${currentPlayer} 获胜!`, resetTTT);
        return;
    }

    if (!tttState.includes(null)) {
        tttStatus.innerText = '🤝 平局!';
        gameActive = false;
        showModal('游戏结束', '🤝 平局!', resetTTT);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    tttStatus.innerText = `玩家 ${currentPlayer} 的回合`;
}

function checkWin() {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winConditions.some(condition => {
        return condition.every(index => {
            return tttState[index] === currentPlayer;
        });
    });
}

function resetTTT() {
    tttState = Array(9).fill(null);
    currentPlayer = 'X';
    gameActive = true;
    tttStatus.innerText = '玩家 X 的回合';
    initTTT();
}

// Init TTT on load
initTTT();