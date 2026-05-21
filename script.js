const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");

let score = 0;
let gameRunning = false;
let items = [];
let gameLoopId;
let spawnTimeoutId;

// Estrutura do Jogador (A Plataforma da Fazenda)
const player = {
    x: 160,
    y: 360,
    width: 80,
    height: 20,
    speed: 25,
    color: "#4caf50"
};

// Elementos do jogo
const itemTypes = [
    { text: "💧", type: "good", points: 10 },
    { text: "☀️", type: "good", points: 15 },
    { text: "🚫", type: "bad", points: -20 }
];

// Controle por Teclado
document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    if (e.key === "ArrowLeft" && player.x > 0) {
        player.x -= player.speed;
    } else if (e.key === "ArrowRight" && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
});

// Controle por Toque / Clique (Mobile Friendly)
canvas.addEventListener("click", (e) => {
    if (!gameRunning) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    
    if (clickX < canvas.width / 2 && player.x > 0) {
        player.x -= player.speed * 1.2;
    } else if (clickX >= canvas.width / 2 && player.x < canvas.width - player.width) {
        player.x += player.speed * 1.2;
    }
});

// Função para criar novos itens caindo
function spawnItem() {
    if (!gameRunning) return;
    
    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
    items.push({
        x: Math.random() * (canvas.width - 30) + 10,
        y: 0,
        size: 26,
        speed: 3 + Math.random() * 4,
        ...randomType
    });

    // Cria um novo item a cada 900 milissegundos
    spawnTimeoutId = setTimeout(spawnItem, 900);
}

// Loop principal de renderização e física
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar a base do jogador
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Texto em cima da base
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("AGRO-ECO", player.x + 12, player.y + 14);

    // Gerenciar os itens na tela
    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.y += item.speed;

        // Desenha o Emoji
        ctx.font = `${item.size}px sans-serif`;
        ctx.fillText(item.text, item.x, item.y);

        // Verificação de colisão mecânica
        if (
            item.y >= player.y - 10 && 
            item.y <= player.y + player.height &&
            item.x >= player.x - 15 && 
            item.x <= player.x + player.width
        ) {
            score += item.points;
            if (score < 0) score = 0; // Evita pontuação negativa abaixo de zero
            scoreDisplay.textContent = score;
            
            // Efeito visual rápido de colisão alterando a cor do jogador temporariamente
            player.color = item.type === "good" ? "#81c784" : "#e57373";
            setTimeout(() => player.color = "#4caf50", 150);

            items.splice(i, 1);
            continue;
        }

        // Remove se passar dos limites inferiores do Canvas
        if (item.y > canvas.height + 20) {
            items.splice(i, 1);
        }
    }

    if (gameRunning) {
        gameLoopId = requestAnimationFrame(update);
    }
}

// Função disparada ao clicar no botão
function startGame() {
    // Limpa instâncias e timers antigos para evitar bugs de velocidade acelerada
    cancelAnimationFrame(gameLoopId);
    clearTimeout(spawnTimeoutId);
    
    score = 0;
    items = [];
    player.x = 160;
    scoreDisplay.textContent = score;
    gameRunning = true;
    
    document.getElementById("btn-start").textContent = "Reiniciar Desafio";
    
    spawnItem();
    update();
}

// Tela inicial estática no Canvas
ctx.fillStyle = "#ffffff";
ctx.font = "16px sans-serif";
ctx.textAlign = "center";
ctx.fillText("Clique em 'Iniciar Jogo' para Começar!", canvas.width / 2, canvas.height / 2);
