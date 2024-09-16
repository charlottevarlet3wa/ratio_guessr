const textElement = document.getElementById("text");
const textContainerElem = document.getElementById("text-container");
const ratioInput = document.getElementById("ratioInput");
const feedbackElement = document.getElementById("feedback");

let actualContrastRatio = 0;
let score = 0;
let colorCombinations = [];
let currentCombinationIndex = 0;

// Fonction pour charger le fichier JSON avec les combinaisons de couleurs
fetch("colors.json")
  .then((response) => response.json())
  .then((data) => {
    colorCombinations = data;
    generateNewColors();
  });

// Fonction pour calculer la luminance relative
function luminance(r, g, b) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Fonction pour calculer le ratio de contraste
function contrastRatio(rgb1, rgb2) {
  const lum1 = luminance(rgb1.r, rgb1.g, rgb1.b) + 0.05;
  const lum2 = luminance(rgb2.r, rgb2.g, rgb2.b) + 0.05;
  return lum1 > lum2 ? lum1 / lum2 : lum2 / lum1;
}

// Fonction pour convertir une chaîne rgb en objet
function rgbStringToObject(rgbString) {
  const rgbValues = rgbString.match(/\d+/g).map(Number);
  return { r: rgbValues[0], g: rgbValues[1], b: rgbValues[2] };
}

// Fonction pour générer un nouveau jeu de couleurs et calculer le ratio
function generateNewColors() {
  if (colorCombinations.length === 0) return;

  // Choisir une combinaison de couleurs aléatoire
  currentCombinationIndex = Math.floor(
    Math.random() * colorCombinations.length
  );
  const { color, background } = colorCombinations[currentCombinationIndex];

  // Appliquer les couleurs au texte et au fond
  textElement.style.color = color;
  //   textElement.style.backgroundColor = background;
  textContainerElem.style.backgroundColor = background;

  const textRgb = rgbStringToObject(color);
  const bgRgb = rgbStringToObject(background);

  actualContrastRatio = contrastRatio(textRgb, bgRgb).toFixed(2);
  feedbackElement.textContent = "";
  ratioInput.value = "";
}

// Fonction pour vérifier l'estimation de l'utilisateur
function check() {
  const userRatio = parseFloat(ratioInput.value);
  if (isNaN(userRatio)) {
    feedbackElement.textContent = "Veuillez entrer un nombre valide.";
    return;
  }

  const difference = Math.abs(actualContrastRatio - userRatio);
  if (difference <= 0.5) {
    score++;
    feedbackElement.textContent = `Bravo ! Vous avez deviné correctement. Score: ${score}. Ratio réel: ${actualContrastRatio}`;
  } else {
    feedbackElement.textContent = `Dommage ! Le ratio réel est ${actualContrastRatio}. Essayez encore !`;
  }
}

// Fonction pour révéler le ratio réel
function reveal() {
  feedbackElement.textContent = `Le ratio réel est ${actualContrastRatio}.`;
}

// Fonction pour passer à la combinaison suivante
function next() {
  generateNewColors();
}

// Initialiser la première série de couleurs
generateNewColors();

// Event listener pour le champ d'entrée du ratio, pour vérifier l'estimation lorsque l'utilisateur appuie sur "Enter"
ratioInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    check();
  }
});

// Event listener pour le document, pour passer à la couleur suivante lorsque l'utilisateur appuie sur "n"
document.addEventListener("keydown", (e) => {
  if (e.key === "n") {
    next();
    // reveal()
  } else if (e.key === "r") {
    reveal();
  }
});

document.getElementById("checkButton").addEventListener("click", check);
document.getElementById("nextButton").addEventListener("click", next);
