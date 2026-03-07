// main.js
import { canvas, state, assets } from './modules/state.js';
import { setupControls } from './modules/controls.js';
import { update, draw } from './modules/engine.js';
import { loadQuestions } from './modules/mcq.js';

// Setup Image Loading
assets.playerImg.src = 'https://static.vecteezy.com/system/resources/previews/045/654/268/non_2x/athlete-running-on-transparent-background-png.png';
assets.treeImg.src = 'assets/obs_tree.png';
assets.spikeImg.src = 'assets/obs_spike.png';

assets.playerImg.onload = () => assets.loaded.player = true;
assets.treeImg.onload = () => assets.loaded.tree = true;
assets.spikeImg.onload = () => assets.loaded.spike = true;

// Setup Initial Clouds
for (let i = 0; i < 5; i++) {
    state.clouds.push({
        x: Math.random() * canvas.width,
        y: Math.random() * 200 + 50,
        size: Math.random() * 20 + 20,
        speed: Math.random() * 0.5 + 0.2
    });
}

async function initGame() {
    await loadQuestions(); // Wait till JSON is fetched
    gameLoop(); // Uske baad hi game start karo
}

// Initialize Controls
setupControls();

// The Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start Game
initGame();