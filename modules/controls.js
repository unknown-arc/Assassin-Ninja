// controls.js
import { canvas, state, player, ui } from './state.js'; // FIX: ui import kiya
import { resetGame } from './utils.js';

export function setupControls() {

    window.fireWeapon = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }

        if (state.currentPhase === 2 && state.gameState === "RUN" && state.bullets.length < 5) {
            state.bullets.push({
                x: player.x + player.width,
                y: player.y + player.height / 2 - 5,
                width: 25,
                height: 8,
                speed: 15,
                color: "#ffea00" 
            });
        }
    };

    if(ui.fireBtn) {
       ui.fireBtn.addEventListener('pointerdown', window.fireWeapon);
    }

    // ==============================
    // DESKTOP KEYBOARD CONTROLS 
    // ==============================
    window.addEventListener("keydown", (e) => {
        state.keys[e.code] = true;
        if ((e.code === "KeyR" || e.code === "Space") && state.gameState === "GAME_OVER") resetGame();

        if ((e.code === "Space" || e.code === "ArrowUp") && player.onGround && state.gameState === "RUN") {
            player.velocityY = player.jumpForce;
            player.onGround = false;
        }

        if (e.code === "KeyX") window.fireWeapon(); // X dabane par fire
    });

    window.addEventListener("keyup", (e) => {
        state.keys[e.code] = false;
        if ((e.code === "Space" || e.code === "ArrowUp") && player.velocityY < 0) {
            player.velocityY *= 0.5;
        }
    });

    // ==============================
    // MOUSE & TOUCH CONTROLS (Sirf CANVAS par)
    // ==============================
    const handleJump = (e) => {
       if (state.gameState === "GAME_OVER") resetGame();
       else if (state.gameState === "RUN" && player.onGround) {
           player.velocityY = player.jumpForce;
           player.onGround = false;
       }
    };

    canvas.addEventListener("mousedown", handleJump);
    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); handleJump(e); }, { passive: false });

    canvas.addEventListener("mouseup", () => {
        if (player.velocityY < 0) player.velocityY *= 0.5;
    });
    canvas.addEventListener("touchend", (e) => {
        e.preventDefault();
        if (player.velocityY < 0) player.velocityY *= 0.5;
    }, { passive: false });
}