let img;
let bg;
let sound;
let amplitude;
let circleColor;
let particles = [];
let textSizeVal = 100;

let beamX, beamY;
let beamR = 120;          
let vignetteAlpha = 230;  
let clueLayer;

function preload() {
  img = loadImage('glass.png');
  bg = loadImage('scary_alleyway.jpeg');
  sound = loadSound('scary.wav');
}

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('canvas-holder');
  cnv.id('sketch');

  amplitude = new p5.Amplitude();
  circleColor = color(255, 165, 0, 200); // initialize default circle color

  beamX = width / 2;
  beamY = height / 2;
  clueLayer = createGraphics(width, height);
  drawClues(clueLayer);

  // Volume slider
  const vol = document.getElementById('vol');
  const volVal = document.getElementById('volVal');
  sound.setVolume(parseFloat(vol.value));
  volVal.textContent = parseFloat(vol.value).toFixed(2);

  vol.addEventListener('input', () => {
    const v = parseFloat(vol.value);
    sound.setVolume(v);
    volVal.textContent = v.toFixed(2);
  });

  // Random color circle button
  document.getElementById('random-circle-color').addEventListener('click', () => {
    circleColor = color(random(255), random(255), random(255), 200);
  });

  // Hook up text size slider
  const textSizeSlider = document.getElementById('text-size');
  const textSizeDisplay = document.getElementById('textSizeVal');

  textSizeSlider.addEventListener('input', () => {
    textSizeVal = parseInt(textSizeSlider.value);
    textSizeDisplay.textContent = textSizeVal;
  });

  // Play/Stop button
  const toggleBtn = document.getElementById('toggle-sound');
  toggleBtn.addEventListener('click', () => {
    if (!sound.isPlaying()) {
      sound.play();
      sound.setLoop(true);
      toggleBtn.textContent = 'Stop Music';
    } else {
      sound.stop();
      toggleBtn.textContent = 'Play Music';
    }
  });
}

function draw() {
  if (bg) image(bg, 0, 0, width, height); // alley background
  image(clueLayer, 0, 0);                 // hidden clues

  // darkness erased by "flashlight"
  push();
  fill(0, vignetteAlpha);
  noStroke();
  rect(0, 0, width, height);   // darken everything
  erase();                     // flashlight "hole"
  circle(beamX, beamY, beamR * 2);

  for (let i = 1; i <= 3; i++) {
    circle(beamX, beamY, (beamR + i * 28) * 2);
  }
  noErase();
  pop();

  const level = amplitude.getLevel();
  const circleSize = map(level, 0, 0.3, 50, 200);

  fill(circleColor);
  noStroke();
  circle(mouseX, mouseY, circleSize); // music-reactive circle at cursor

  for (let i = 0; i < 3; i++) {
    particles.push(new Particle(mouseX, mouseY));
  }
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].display();
    if (particles[i].finished()) particles.splice(i, 1);
  }

  // text not hidden by the "darkness"
  textAlign(CENTER, CENTER);
  textSize(textSizeVal);
  fill(139, 0, 0);
  noStroke();
  text("are you there?", width / 2, height * 0.33);

  // cursor image
  if (img) image(img, mouseX, mouseY, 30, 30);

  // flashlight outline
  noFill();
  stroke(255, 180);
  strokeWeight(2);
  circle(beamX, beamY, beamR * 2);
}

function mousePressed() {
  // Toggle between colors red and black
  if (red(circleColor) === 255 && green(circleColor) === 0 && blue(circleColor) === 0) {
    circleColor = color(0, 0, 0, 200);
  } else {
    circleColor = color(255, 0, 0, 200);
  }
}

// move flashlight with hover
function mouseDragged() {
  beamX = constrain(mouseX, 0, width);
  beamY = constrain(mouseY, 0, height);
  return false;
}
function mouseMoved() {
  beamX = constrain(mouseX, 0, width);
  beamY = constrain(mouseY, 0, height);
}

// --- OPTIONAL: tune beam at runtime ---
function keyPressed() {
  if (key === '+' || key === '=') beamR = min(beamR + 10, 240);
  if (key === '-' || key === '_') beamR = max(beamR - 10, 60);
  if (key === 'D') vignetteAlpha = constrain(vignetteAlpha + 10, 0, 255);
  if (key === 'L') vignetteAlpha = constrain(vignetteAlpha - 10, 0, 255);
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1);
    this.vy = random(-2, -0.5);
    this.alpha = 255;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 4;
  }
  display() {
    noStroke();
    fill(200, this.alpha);
    ellipse(this.x, this.y, 12);
  }
  finished() {
    return this.alpha < 0;
  }
}

// --- NEW: hidden clues drawn on an offscreen layer (only visible through beam) ---
function drawClues(g) {
  g.clear();
  g.textAlign(CENTER, CENTER);

  // Main hidden clue (fits your "Cipher Alley" theme)
  g.push();
  g.fill(245, 235, 200, 230);
  g.textSize(36);
  g.text("Cipher key: 4517", g.width / 2, g.height / 2);
  g.pop();

  // Subtle marks/atmosphere
  g.push();
  g.noFill();
  g.stroke(220, 220);
  g.strokeWeight(2);
  g.circle(g.width * 0.78, g.height * 0.65, 40);
  g.pop();

  g.push();
  g.fill(220, 90);
  g.textSize(22);
  g.text("S H A D O W S", g.width * 0.25, g.height * 0.72);
  g.pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  clueLayer = createGraphics(width, height); // also resize clue layer
  drawClues(clueLayer); // redraw clue
}
