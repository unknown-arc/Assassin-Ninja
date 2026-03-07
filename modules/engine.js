// engine.js
import { canvas, ctx, FLOOR_Y, state, player, assets, ui } from './state.js';
import { isColliding, triggerGameOver, updateUI } from './utils.js';
import { showMCQ } from './mcq.js';

export function spawnObstacle() {
    if (state.currentPhase === 1) {
        const type = Math.random() > 0.5 ? 'TREE' : 'SPIKE';
        let obsWidth = type === 'TREE' ? 40 : 30;
        let obsHeight = type === 'TREE' ? 60 : 30;
        state.obstacles.push({
            x: canvas.width, y: FLOOR_Y - obsHeight, width: obsWidth, height: obsHeight, type: type
        });
    } else {
        const type = Math.random() > 0.6 ? 'DRONE' : 'LASER';
        let obsWidth = 40;
        let obsHeight = type === 'DRONE' ? 30 : 40;
        let obsY = type === 'DRONE' ? FLOOR_Y - 110 : FLOOR_Y - obsHeight;
        
        state.obstacles.push({
            x: canvas.width, y: obsY, width: obsWidth, height: obsHeight, type: type, hp: 1 
        });
    }
}

export function spawnGate() {
    state.gate = { x: canvas.width, y: FLOOR_Y - 200, width: 120, height: 200 };
    state.gateSpawned = true;
}

export function update() {
    if (state.gameState === "GAME_OVER" || state.gameState === "COMING_SOON" || state.gameState === "MCQ_PAUSE") return;

    player.velocityY += player.gravity;
    player.y += player.velocityY;

    if (player.y + player.height >= FLOOR_Y) {
        player.y = FLOOR_Y - player.height;
        player.velocityY = 0;
        player.onGround = true;
    }

    state.clouds.forEach(c => {
        c.x -= c.speed;
        if (c.x + c.size * 2 < 0) {
            c.x = canvas.width + c.size;
            c.y = Math.random() * 200 + 50;
        }
    });

    if (state.gameState === "RUN") {
        state.distance += state.speed / 8;
        state.bgOffset -= state.speed * 0.5;

        if (state.speed < 8) state.speed += 0.0005;

        if (player.onGround && Math.random() < 0.3) {
            state.particles.push({
                x: player.x + 10, y: player.y + player.height - 5,
                size: Math.random() * 4 + 2,
                speedX: Math.random() * -2 - state.speed / 2,
                speedY: Math.random() * -1, life: 1.0
            });
        }

        for (let i = state.particles.length - 1; i >= 0; i--) {
            let p = state.particles[i];
            p.x += p.speedX; p.y += p.speedY; p.life -= 0.05;
            if (p.life <= 0) state.particles.splice(i, 1);
        }

        for (let i = state.bullets.length - 1; i >= 0; i--) {
            let b = state.bullets[i];
            b.x += b.speed; 
            
            let bulletHit = false;

            for (let j = state.obstacles.length - 1; j >= 0; j--) {
                let ob = state.obstacles[j];
                
                if (ob.type === 'DRONE' && isColliding(b, ob)) {
                    state.obstacles.splice(j, 1); 
                    bulletHit = true;
                    state.score += 20; 
                    state.killCount++; // NAYA: Kill badhao!
                    
                    for(let k=0; k<15; k++) {
                        state.particles.push({
                            x: ob.x + ob.width/2, y: ob.y + ob.height/2,
                            size: Math.random() * 5 + 2,
                            speedX: (Math.random() - 0.5) * 8 + state.speed,
                            speedY: (Math.random() - 0.5) * 8,
                            life: 1.0, color: "#ffea00" 
                        });
                    }
                    break; 
                }
            }

            if (bulletHit || b.x > canvas.width) {
                state.bullets.splice(i, 1);
            }
        }

        for (let i = state.obstacles.length - 1; i >= 0; i--) {
            let ob = state.obstacles[i];
            ob.x -= state.speed;

            let padding = 10;
            let playerHitbox = {
                x: player.x + padding, y: player.y + padding,
                width: player.width - padding * 2, height: player.height - padding
            };

            if (isColliding(playerHitbox, ob)) triggerGameOver();

            if (ob.x + ob.width < 0) {
                state.obstacles.splice(i, 1);
                state.score += 5;
            }
        }

        let minSpawnGap = state.currentPhase === 1 ? 250 : 200;

        // User has to kill min.10 obstace until obstacle spawn 
        let shouldSpawn = false;
        if (state.currentPhase === 1 && state.distance < 900) shouldSpawn = true;
        if (state.currentPhase === 2 && state.killCount < 10) shouldSpawn = true;

        if (shouldSpawn) {
            let lastObsX = state.obstacles.length > 0 ? state.obstacles[state.obstacles.length - 1].x : 0;
            let gap = canvas.width - lastObsX;
            let minGap = minSpawnGap + Math.random() * 150;
            
            if (gap > minGap && Math.random() < 0.02) spawnObstacle();
        }

        // ==============================
        // NAYA: GATE SPAWN LOGIC
        // ==============================
        if (state.distance >= 1000 && !state.gateSpawned && state.currentPhase === 1) {
            spawnGate();
        }
        // Phase 2 Gate (Kill base: 10 Drones marne par aayega)
        if (state.killCount >= 10 && !state.gateSpawned && state.currentPhase === 2) {
            spawnGate();
        }

        // Gate Collision Logic
        if (state.gate) {
            state.gate.x -= state.speed;
            if (player.x + player.width / 2 > state.gate.x + state.gate.width / 2) {
                if (state.currentPhase === 1) {
                    showMCQ(); 
                } else if (state.currentPhase === 2) {
                    // Phase 2 paar kar liya! Yaha par hum 2nd floor ka code baad me lagayenge
                    state.gameState = "COMING_SOON";
                    ui.comingSoonScreen.querySelector('h2').innerText = "2ND FLOOR UNLOCKED!"; // Text update
                    ui.comingSoonScreen.classList.remove("hidden");
                }
            }
        }
    }
    updateUI();
}

export function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isP2 = state.currentPhase === 2;
    const bgColor = isP2 ? "#2a0808" : "#1e293b"; 
    const neonColor = isP2 ? "#ff0055" : "#00ffcc"; 
    const cloudColor = isP2 ? "rgba(255, 0, 85, 0.05)" : "rgba(0, 255, 204, 0.08)";
    const gridColor = isP2 ? "rgba(255, 0, 85, 0.1)" : "rgba(0, 255, 204, 0.1)";

    ctx.fillStyle = cloudColor;
    state.clouds.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 0.8, c.y - c.size * 0.4, c.size * 0.8, 0, Math.PI * 2);
        ctx.arc(c.x + c.size * 1.5, c.y, c.size * 0.9, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    let startX = state.bgOffset % 50;
    for (let i = startX; i < canvas.width; i += 50) {
        ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height);
    }
    for (let i = 0; i < canvas.height; i += 50) {
        ctx.moveTo(0, i); ctx.lineTo(canvas.width, i);
    }
    ctx.stroke();

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);
    ctx.fillStyle = neonColor;
    ctx.fillRect(0, FLOOR_Y, canvas.width, 2);

    state.particles.forEach(p => {
        ctx.fillStyle = p.color ? p.color : `rgba(${isP2 ? '255, 0, 85' : '0, 255, 204'}, ${p.life})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    });

    if (assets.loaded.player) {
        ctx.drawImage(assets.playerImg, player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = "white";
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    state.obstacles.forEach(ob => {
        if (ob.type === 'TREE') {
            if (assets.loaded.tree) ctx.drawImage(assets.treeImg, ob.x, ob.y, ob.width, ob.height);
            else { ctx.fillStyle = "green"; ctx.fillRect(ob.x, ob.y, ob.width, ob.height); }
        } else if (ob.type === 'SPIKE') {
            if (assets.loaded.spike) ctx.drawImage(assets.spikeImg, ob.x, ob.y, ob.width, ob.height);
            else {
                ctx.fillStyle = "#ff0055";
                ctx.beginPath();
                ctx.moveTo(ob.x, ob.y + ob.height);
                ctx.lineTo(ob.x + ob.width / 2, ob.y);
                ctx.lineTo(ob.x + ob.width, ob.y + ob.height);
                ctx.fill();
            }
        } else if (ob.type === 'DRONE') {
            ctx.shadowBlur = 10; ctx.shadowColor = "#ffea00";
            ctx.fillStyle = "#222";
            ctx.fillRect(ob.x, ob.y, ob.width, ob.height); 
            ctx.fillStyle = "#ff0055";
            ctx.fillRect(ob.x + 10, ob.y + 10, 20, 10); 
            ctx.shadowBlur = 0;
        } else if (ob.type === 'LASER') {
            ctx.fillStyle = "#333";
            ctx.fillRect(ob.x, ob.y + ob.height - 10, ob.width, 10); 
            ctx.shadowBlur = 15; ctx.shadowColor = "#ff0055";
            ctx.fillStyle = "#ff0055"; 
            ctx.fillRect(ob.x + 10, ob.y, ob.width - 20, ob.height - 10);
            ctx.shadowBlur = 0;
        }
    });

    if (state.gate) {
        ctx.shadowBlur = 15;
        ctx.strokeStyle = isP2 ? "#00ffcc" : "#b700ff";
        ctx.shadowColor = isP2 ? "#00ffcc" : "#b700ff"; 
        ctx.lineWidth = 4;
        ctx.strokeRect(state.gate.x, state.gate.y, state.gate.width, state.gate.height);
        ctx.fillStyle = isP2 ? "rgba(0, 255, 204, 0.2)" : "rgba(183, 0, 255, 0.2)";
        ctx.fillRect(state.gate.x + 10, state.gate.y + 10, state.gate.width - 20, state.gate.height - 10);
        ctx.shadowBlur = 0;
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffea00";
    state.bullets.forEach(b => {
        ctx.fillStyle = b.color || "#ffea00";
        ctx.fillRect(b.x, b.y, b.width, b.height);
        
        ctx.fillStyle = "white";
        ctx.fillRect(b.x + b.width - 5, b.y + 2, 5, b.height - 4);
    });
    ctx.shadowBlur = 0;


    if (isP2) {
        ctx.fillStyle = "#ffea00";
        ctx.font = "bold 20px sans-serif";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#ff0055";
        // Top Center me dikhayega
        ctx.fillText(`🎯 TARGET KILLS: ${state.killCount} / 10`, canvas.width / 2 - 110, 40);
        ctx.shadowBlur = 0;
    }
}