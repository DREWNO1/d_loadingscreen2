const letters = document.querySelectorAll(".letter");
const canvas = document.getElementById("camoCanvas");
const ctx = canvas.getContext("2d");

// Dopasowanie rozmiaru canvasu do okna przeglądarki
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Inicjalizacja Simplex Noise
const simplex = new SimplexNoise();

// Parametry kamuflażu i brudu
const camoColors = ["#4B5320", "#6B8E23", "#556B2F", "#8B4513", "#2E8B57"];
const noiseScale = 0.02; // Skalowanie szumu kamuflażu
const dirtyNoiseScale = 0.1; // Skalowanie szumu brudu
let time = 0;
let frameCount = 0; // Licznik klatek

// Tworzenie dodatkowych canvasów do generowania szumu
const lowResCanvas = document.createElement("canvas");
const lowResCtx = lowResCanvas.getContext("2d");
const dirtyCanvas = document.createElement("canvas");
const dirtyCtx = dirtyCanvas.getContext("2d");
const vignetteCanvas = document.createElement("canvas");
const vignetteCtx = vignetteCanvas.getContext("2d");

lowResCanvas.width = 1920 / 4; // Niższa rozdzielczość do obliczeń kamuflażu
lowResCanvas.height = 1080 / 4;
dirtyCanvas.width = 100; // Jeszcze niższa rozdzielczość dla brudnej warstwy
dirtyCanvas.height = 100;
vignetteCanvas.width = 200; // Winieta na większym płótnie
vignetteCanvas.height = 200;

// Funkcja konwertująca kolor HEX na RGB
function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

// Funkcja do pobierania koloru z palety kamuflażu
function getColorFromNoise(value) {
  const index = Math.floor(value * camoColors.length);
  return camoColors[Math.max(0, Math.min(index, camoColors.length - 1))];
}

// Funkcja rysująca kamuflaż na niskiej rozdzielczości canvasie
function drawCamoPattern() {
  const imgData = lowResCtx.createImageData(
    lowResCanvas.width,
    lowResCanvas.height
  );

  for (let y = 0; y < lowResCanvas.height; y++) {
    for (let x = 0; x < lowResCanvas.width; x++) {
      const noiseValue =
        (simplex.noise3D(x * noiseScale, y * noiseScale, time) + 1) / 2;
      const color = getColorFromNoise(noiseValue);
      const colorArray = hexToRgb(color);

      const index = (y * lowResCanvas.width + x) * 4;
      imgData.data[index] = colorArray.r;
      imgData.data[index + 1] = colorArray.g;
      imgData.data[index + 2] = colorArray.b;
      imgData.data[index + 3] = 255; // Pełna przezroczystość
    }
  }

  lowResCtx.putImageData(imgData, 0, 0);
}

// Funkcja do generowania brudnej warstwy
function drawDirtyLayer() {
  const imgData = dirtyCtx.createImageData(
    dirtyCanvas.width,
    dirtyCanvas.height
  );

  for (let y = 0; y < dirtyCanvas.height; y++) {
    for (let x = 0; x < dirtyCanvas.width; x++) {
      const noiseValue =
        (simplex.noise3D(x * dirtyNoiseScale, y * dirtyNoiseScale, time + 200) +
          1) /
        2;
      const alpha = Math.floor(noiseValue * 150); // Niższa przezroczystość dla brudu

      const index = (y * dirtyCanvas.width + x) * 4;
      imgData.data[index] = 0; // Czarny (R)
      imgData.data[index + 1] = 0; // Czarny (G)
      imgData.data[index + 2] = 0; // Czarny (B)
      imgData.data[index + 3] = alpha; // Ustawienie przezroczystości
    }
  }

  dirtyCtx.putImageData(imgData, 0, 0);
}

// Funkcja generująca winietę
function drawVignette() {
  const radius = Math.min(vignetteCanvas.width, vignetteCanvas.height) / 1.5;
  const centerX = vignetteCanvas.width / 2;
  const centerY = vignetteCanvas.height / 2;

  // Skala dla sinusoidalnego promienia
  const scale = 1.5; // Możesz dostosować tę wartość
  const power = 2; // Możesz dostosować tę wartość

  // Przeskalowanie sinusoidalnego promienia
  const vignetteRadius = Math.pow(Math.sin(time * scale), power) * radius * 1.5;

  // Upewnij się, że gradient jest widoczny
  const gradient = vignetteCtx.createRadialGradient(
    centerX,
    centerY,
    vignetteRadius * 0.5,
    centerX,
    centerY,
    radius
  );

  gradient.addColorStop(0, "rgba(0, 0, 0, 0)"); // Środek przezroczysty
  gradient.addColorStop(1, "rgba(0, 0, 0, 1)"); // Brzegi ciemniejsze

  vignetteCtx.clearRect(0, 0, vignetteCanvas.width, vignetteCanvas.height); // Wyczyść canvas
  vignetteCtx.fillStyle = gradient;
  vignetteCtx.fillRect(0, 0, vignetteCanvas.width, vignetteCanvas.height);
}

// W ramach funkcji animacji (dodać do funkcji animate)
function animate() {
  frameCount++;

  // Skipowanie co drugiej klatki dla większej płynności
  if (frameCount % 2 === 0) {
    time += 0.01; // Powolne przesunięcie czasu
    drawCamoPattern();
    drawDirtyLayer();
    drawVignette(); // Generowanie winiety

    // Renderowanie kamuflażu i brudnej warstwy na głównym canvasie
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Skalowanie niskiej rozdzielczości canvasów na pełen rozmiar
    ctx.drawImage(lowResCanvas, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(dirtyCanvas, 0, 0, canvas.width, canvas.height); // Nakładanie brudnej warstwy
    ctx.drawImage(vignetteCanvas, 0, 0, canvas.width, canvas.height); // Nakładanie winiety
  }

  requestAnimationFrame(animate);
}

// Rozpoczęcie animacji
animate();

function randomLetter() {
  const randomLetterSpan = letters[Math.floor(Math.random() * letters.length)];
  randomLetterSpan.style.animation = "anim 1s ease-in-out";
  randomLetterSpan.onanimationend = () => {
    randomLetterSpan.style.animation = "";
  };
}

setInterval(randomLetter, 500);
