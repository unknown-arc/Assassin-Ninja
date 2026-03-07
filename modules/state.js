export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 500;
export const FLOOR_Y = 460;

export const ui = {
    hiDist: document.getElementById("ui-hi-dist"),
    dist: document.getElementById("ui-dist"),
    score: document.getElementById("ui-score"),
    gameOverScreen: document.getElementById("game-over-screen"),
    comingSoonScreen: document.getElementById("coming-soon-screen"),
    mcqScreen: document.getElementById("mcq-screen"),
    mcqQuestion: document.getElementById("mcq-question"),
    mcqOptions: document.getElementById("mcq-options"),
    rewardScreen: document.getElementById("reward-screen"),
    rewardText: document.getElementById("reward-text"),
    rewardContinue: document.getElementById("reward-continue"),
    fireBtn: document.getElementById("mobile-fire-btn")    
};

export const state = {
    gameState: "RUN",
    currentPhase : 1,
    weapon: null,
    killCount: 0,
    distance: 0,
    baseSpeed: 4.0,
    speed: 3.0,
    highDistance: localStorage.getItem("dinoHighDist") ? parseInt(localStorage.getItem("dinoHighDist")) : 0,
    gameOver: false,
    score: 0,
    bgOffset: 0,
    gateSpawned: false,
    bullets: [],
    obstacles: [],
    gate: null,
    clouds: [],
    particles: [],
    keys: {}
};

export const player = {
    x: 100, y: 400, width: 50, height: 70,
    velocityY: 0, gravity: 0.7, jumpForce: -14, onGround: true
};

export const assets = {
    playerImg: new Image(),
    treeImg: new Image(),
    spikeImg: new Image(),
    loaded: { player: false, tree: false, spike: false }
};