let players = [];
let numTimes = null;
let maxPlayers = 48;

// ------------------ Navegação ------------------
function startSetup() {
  const select = document.getElementById("numTimesSelect");
  numTimes = parseInt(select.value);

  if (!numTimes || numTimes < 2 || numTimes > 8) {
    alert("Escolha o número de times (entre 2 e 8).");
    return;
  }

  document.getElementById("homePage").style.display = "none";
  document.getElementById("setupPage").style.display = "flex";
}

function goToPlayers() {
  startSetup();
}

function restart() {
  players = [];
  numTimes = null;
  document.getElementById("numTimesSelect").value = "";
  document.getElementById("playerList").innerHTML = "";
  document.getElementById("homePage").style.display = "flex";
  document.getElementById("setupPage").style.display = "none";
  document.getElementById("resultPage").style.display = "none";
}

// ------------------ Adicionar Jogador ------------------
function addPlayerFromInput() {
  const name = document.getElementById("playerName").value.trim();
  const skill = parseInt(document.getElementById("playerSkill").value);

  if (!name || isNaN(skill) || skill < 0 || skill > 10) {
    alert("Preencha nome e nota de 0 a 10");
    return;
  }

  if (players.length >= maxPlayers) {
    alert("Número máximo de jogadores atingido (48)");
    return;
  }

  players.push({ name, skill });
  updatePlayerList();
  document.getElementById("playerName").value = "";
  document.getElementById("playerSkill").value = "";
}

function updatePlayerList() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  players.forEach((p, index) => {
    const li = document.createElement("li");
    li.textContent = `${p.name} - Nota: ${p.skill}`;
    list.appendChild(li);
  });
}

// ------------------ Funções de Balanceamento ------------------
function skillSum(team) {
  return team.reduce((acc, p) => acc + p.skill, 0);
}

function skillDifference(teamA, teamB) {
  return Math.abs(skillSum(teamA) - skillSum(teamB));
}

// Backtracking (2 times, até 10 jogadores)
function balanceTeamsBacktracking(players) {
  const n = players.length;
  const half = Math.floor(n / 2);
  let bestDiff = Infinity;
  let bestSplit = null;

  function backtrack(index, teamA, teamB) {
    if (index === n) {
      if (teamA.length === half && teamB.length === n - half) {
        const diff = skillDifference(teamA, teamB);
        if (diff < bestDiff) {
          bestDiff = diff;
          bestSplit = { teamA: [...teamA], teamB: [...teamB] };
        }
      }
      return;
    }

    if (teamA.length < half) {
      teamA.push(players[index]);
      backtrack(index + 1, teamA, teamB);
      teamA.pop();
    }
    if (teamB.length < n - half) {
      teamB.push(players[index]);
      backtrack(index + 1, teamA, teamB);
      teamB.pop();
    }
  }

  backtrack(0, [], []);
  return [bestSplit.teamA, bestSplit.teamB];
}

// Simulated Annealing (2 times, 11+ jogadores)
function balanceTeamsSimulatedAnnealing(players) {
  const n = players.length;
  const half = Math.floor(n / 2);

  let teamA = [];
  let teamB = [];
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  teamA = shuffled.slice(0, half);
  teamB = shuffled.slice(half);

  let temperature = 1000;
  const coolingRate = 0.99;
  let currentDiff = skillDifference(teamA, teamB);

  while (temperature > 1) {
    const i = Math.floor(Math.random() * teamA.length);
    const j = Math.floor(Math.random() * teamB.length);

    const newTeamA = [...teamA];
    const newTeamB = [...teamB];
    [newTeamA[i], newTeamB[j]] = [newTeamB[j], newTeamA[i]];

    const newDiff = skillDifference(newTeamA, newTeamB);
    const delta = newDiff - currentDiff;

    if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
      teamA = newTeamA;
      teamB = newTeamB;
      currentDiff = newDiff;
    }
    temperature *= coolingRate;
  }
  return [teamA, teamB];
}

// Distribuição heurística para 3 a 8 times
function balanceMultipleTeams(players, numTimes) {
  const teams = Array.from({ length: numTimes }, () => []);
  const sorted = [...players].sort((a, b) => b.skill - a.skill);

  sorted.forEach((player, i) => {
    teams[i % numTimes].push(player);
  });

  return teams;
}

// ------------------ Controlador ------------------
function balanceAndShowTeams() {
  const numPlayers = players.length;

  if (numPlayers === 0) {
    alert("Adicione pelo menos 1 jogador");
    return;
  }

  let teams;

  if (numTimes === 2) {
    if (numPlayers <= 10) {
      teams = balanceTeamsBacktracking(players);
    } else {
      teams = balanceTeamsSimulatedAnnealing(players);
    }
  } else {
    teams = balanceMultipleTeams(players, numTimes);
  }

  displayResult(teams);
}

// ------------------ Exibir ------------------
function displayResult(teams) {
  document.getElementById("setupPage").style.display = "none";
  document.getElementById("resultPage").style.display = "flex";

  const container = document.getElementById("teamsContainer");
  container.innerHTML = "";

  teams.forEach((team, idx) => {
    const div = document.createElement("div");
    div.className = "team-box";
    div.innerHTML = `<h3>Time ${idx + 1}</h3>`;
    team.forEach((p) => {
      const playerDiv = document.createElement("div");
      playerDiv.textContent = `${p.name}`;
      div.appendChild(playerDiv);
    });
    container.appendChild(div);
  });
}
// ------------------ Modal "Como Balancear?" ------------------

// Espera o documento HTML carregar completamente
document.addEventListener("DOMContentLoaded", () => {
  // Seleciona os elementos do HTML que vamos usar
  const openModalBtn = document.getElementById("open-modal-btn");
  const modal = document.getElementById("how-to-modal");
  const backdrop = document.getElementById("modal-backdrop");
  const closeModalBtn = document.querySelector("#how-to-modal .close-btn");

  // Função para abrir o modal
  const openModal = () => {
    backdrop.classList.add("active");
    modal.classList.add("active");
  };

  // Função para fechar o modal
  const closeModal = () => {
    backdrop.classList.remove("active");
    modal.classList.remove("active");
  };

  // Adiciona os "escutadores de eventos"
  // 1. Clicar no link "Como Balancear?" abre o modal
  openModalBtn.addEventListener("click", (event) => {
    event.preventDefault(); // Previne o comportamento padrão do link (de recarregar a página)
    openModal();
  });

  // 2. Clicar no 'X' fecha o modal
  closeModalBtn.addEventListener("click", closeModal);

  // 3. Clicar fora do modal (no fundo desfocado) também fecha
  backdrop.addEventListener("click", closeModal);
});

// Obtém o botão do hambúrguer e o menu de links
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".navbar-right");
const body = document.body; // Adicionado: Seleciona o elemento body

// Adiciona um "ouvinte de eventos" de clique ao botão do hambúrguer
hamburger.addEventListener("click", () => {
  // Alterna a classe 'active' para mostrar/esconder o menu
  navLinks.classList.toggle("active");

  // Alterna a classe 'active' no hambúrguer para animar o ícone (opcional)
  hamburger.classList.toggle("active");

  // NOVO: Alterna a classe 'no-scroll-x' no body para evitar a rolagem horizontal
  body.classList.toggle("no-scroll-x");
});

//------------------------------------placar-----------------------------------
let pointsBlue = 0;
let pointsRed = 0;
let setsBlue = 0;
let setsRed = 0;

function addPoint(team) {
  if (team === "blue") {
    pointsBlue++;
    document.getElementById("points-blue").innerText = pointsBlue;
  } else {
    pointsRed++;
    document.getElementById("points-red").innerText = pointsRed;
  }
}

function addSet(team) {
  if (team === "blue") {
    setsBlue++;
    document.getElementById("sets-blue").innerText = setsBlue;
    pointsBlue = 0;
    pointsRed = 0;
  } else {
    setsRed++;
    document.getElementById("sets-red").innerText = setsRed;
    pointsBlue = 0;
    pointsRed = 0;
  }
  document.getElementById("points-blue").innerText = pointsBlue;
  document.getElementById("points-red").innerText = pointsRed;
}

function resetScoreboard() {
  // Obtém os elementos de pontuação e sets de cada time
  const setsBlue = document.getElementById("sets-blue");
  const pointsBlue = document.getElementById("points-blue");
  const setsRed = document.getElementById("sets-red");
  const pointsRed = document.getElementById("points-red");

  // Zera os valores
  setsBlue.innerHTML = "0";
  pointsBlue.innerHTML = "0";
  setsRed.innerHTML = "0";
  pointsRed.innerHTML = "0";
}
