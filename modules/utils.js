import { state, player, ui } from './state.js';

export function isColliding(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

export function updateUI() {
    let currentDist = Math.floor(state.distance);

    if (currentDist > state.highDistance) {
        state.highDistance = currentDist;
        localStorage.setItem("dinoHighDist", state.highDistance); 
    }

    let formattedCurrent = currentDist.toString().padStart(5, '0');
    let formattedHigh = state.highDistance.toString().padStart(5, '0');

    ui.dist.innerText = formattedCurrent;
    ui.hiDist.innerText = `HI ${formattedHigh}`;
}

export function triggerGameOver() {
    state.gameState = "GAME_OVER";
    ui.gameOverScreen.classList.remove("hidden");
}

export function resetGame() {
    state.gameState = "RUN";
    state.currentPhase = 1;
    state.killCount = 0;
    state.weapon = null;
    state.distance = 0;
    state.speed = state.baseSpeed;
    state.score = 0;
    player.x = 100;
    state.bullets = [];
    state.obstacles = [];
    state.particles = [];
    state.gate = null;
    state.gateSpawned = false;

    ui.gameOverScreen.classList.add("hidden");
    ui.comingSoonScreen.classList.add("hidden");
    
    if(ui.fireBtn) ui.fireBtn.classList.add("hidden"); 
}