const letters = document.querySelectorAll(".letter");

function randomLetter() {
  const randomLetterSpan = letters[Math.floor(Math.random() * letters.length)];
  randomLetterSpan.style.animation = "anim 1s ease-in-out";
  randomLetterSpan.onanimationend = () => {
    randomLetterSpan.style.animation = "";
  };
}

setInterval(randomLetter, 500);
