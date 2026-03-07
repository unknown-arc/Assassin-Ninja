import { state, ui } from './state.js';
import { triggerGameOver } from './utils.js';

let questions = [];
const weaponsList = ["🔥 Laser Gun", "🗡️ Ninja Knives", "💥 Plasma Bullets", "⚡ EMP Blaster", "🔫 Shuriken Shooter"];

export async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        questions = await response.json();
    } catch (error) {
        console.error("Error loading questions:", error);
    }
}

export function showMCQ() {
    if (!questions || questions.length === 0) return;

    state.gameState = "MCQ_PAUSE"; 
    ui.mcqScreen.classList.remove("hidden");

    const randomIndex = Math.floor(Math.random() * questions.length);
    const q = questions[randomIndex];

    ui.mcqQuestion.innerText = q.question;
    ui.mcqOptions.innerHTML = ""; 

    const allButtons = [];

    q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.className = "mcq-btn"; 
        btn.style.pointerEvents = "all";
        btn.style.cursor = "pointer";

        allButtons.push(btn);

        const handleAnswer = (e) => {
            e.preventDefault(); 
            e.stopPropagation(); 
            
            allButtons.forEach(b => b.disabled = true);

            if (opt === q.answer) {
                btn.classList.add("correct"); 
                
                setTimeout(() => {
                    showRewardScreen();
                }, 1000);

            } else {
                btn.classList.add("wrong"); 
                
                allButtons.forEach(b => {
                    if (b.innerText === q.answer) b.classList.add("correct");
                });

                setTimeout(() => {
                    ui.mcqScreen.classList.add("hidden");
                    triggerGameOver();
                }, 1500);
            }
        };

        btn.onpointerdown = handleAnswer;
        ui.mcqOptions.appendChild(btn);
    });
}

function showRewardScreen() {
    ui.mcqScreen.classList.add("hidden"); 

    const randomWeapon = weaponsList[Math.floor(Math.random() * weaponsList.length)];
    state.weapon = randomWeapon; 

    ui.rewardText.innerText = `You got: ${randomWeapon}`;
    ui.rewardScreen.classList.remove("hidden");

    ui.rewardContinue.onpointerdown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        ui.rewardScreen.classList.add("hidden"); 
        
        state.currentPhase = 2;
        state.gameState = "RUN"; 
        state.gate = null; 
        state.speed = 6.0; 
        state.score += 100; 
        
        ui.fireBtn.classList.remove("hidden");
        ui.fireBtn.addEventListener('pointerdown', window.fireWeapon); 
        
        console.log("Phase 2 Started with weapon:", state.weapon);
    };
}