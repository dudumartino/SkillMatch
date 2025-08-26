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
