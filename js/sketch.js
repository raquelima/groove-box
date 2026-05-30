function setup() {

  createCanvas(windowWidth, windowHeight);

  textFont('monospace');

  textAlign(CENTER, CENTER);

  currentPage = "menu";

  setupAudio();

  setupSequencer();

  setupPiano();

  setupSynth();

  setupExportRecorder();
}

function draw() {

  drawCurrentPage();
}

function mousePressed() {

  handlePageMousePressed();

  // SYNTH SLIDERS
  if (currentPage === "SYNTH") {

    synthMousePressed();
  }
}

function mouseDragged() {

  // SYNTH SLIDERS
  if (currentPage === "SYNTH") {

    synthMouseDragged();
  }
}

function mouseReleased() {

  // SYNTH SLIDERS
  if (currentPage === "SYNTH") {

    synthMouseReleased();
  }
}

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}