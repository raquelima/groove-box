let currentStep = -1;
let totalSteps = 16;

let kickPattern = new Array(16).fill(false);
let snarePattern = new Array(16).fill(false);
let hihatPattern = new Array(16).fill(false);
let clapPattern = new Array(16).fill(false);

let isPlaying = false;

let cellSize = 60;
let startX = 130;
let startY = 250;

let bpm = 90;

// -----------------------------
// ARDUINO BUTTONS
// -----------------------------

let sequencerArduinoButtons = {
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false
};

// -----------------------------
// PRESSURE SAVE
// -----------------------------

let pressureSaveTriggered = false;

// -----------------------------
// SETUP
// -----------------------------

function setupSequencer() {

  Tone.Transport.bpm.value = bpm;

  Tone.Transport.swing = 0;

  Tone.Transport.scheduleRepeat(
    repeat,
    "16n"
  );
}

// -----------------------------
// MAIN LOOP
// -----------------------------

function repeat(time) {

  if (!isPlaying) {
    return;
  }

  currentStep++;

  if (currentStep >= totalSteps) {
    currentStep = 0;
  }

  // PLAY ONLY INSIDE DRUM PAGE
  if (
    currentPage !== "DRUMS" ||
    showSavePage
  ) {
    return;
  }

  // KICK
  if (kickPattern[currentStep]) {
    playKick(time);
  }

  // SNARE
  if (snarePattern[currentStep]) {
    playSnare(time);
  }

  // HIHAT
  if (hihatPattern[currentStep]) {
    playHiHat(time);
  }

  // CLAP
  if (clapPattern[currentStep]) {
    playClap(time);
  }
}

// -----------------------------
// UPDATE ARDUINO
// -----------------------------

function updateArduinoSequencer() {

  if (currentPage !== "DRUMS") {
    return;
  }

  handleArduinoDrumButtons();
  handleArduinoStopButton();
  handleArduinoPlayButton();
  handlePressureSave();
}

// -----------------------------
// DRUM BUTTONS
// -----------------------------

function handleArduinoDrumButtons() {

  // BUTTON 1 = KICK
  if (
    arduinoButtons[1] &&
    !sequencerArduinoButtons[1]
  ) {

    sequencerArduinoButtons[1] = true;

    playKick(Tone.now());

    if (
      isPlaying &&
      currentStep >= 0
    ) {

      kickPattern[currentStep] = true;
    }
  }

  if (
    !arduinoButtons[1] &&
    sequencerArduinoButtons[1]
  ) {

    sequencerArduinoButtons[1] = false;
  }

  // BUTTON 2 = SNARE
  if (
    arduinoButtons[2] &&
    !sequencerArduinoButtons[2]
  ) {

    sequencerArduinoButtons[2] = true;

    playSnare(Tone.now());

    if (
      isPlaying &&
      currentStep >= 0
    ) {

      snarePattern[currentStep] = true;
    }
  }

  if (
    !arduinoButtons[2] &&
    sequencerArduinoButtons[2]
  ) {

    sequencerArduinoButtons[2] = false;
  }

  // BUTTON 3 = HIHAT
  if (
    arduinoButtons[3] &&
    !sequencerArduinoButtons[3]
  ) {

    sequencerArduinoButtons[3] = true;

    playHiHat(Tone.now());

    if (
      isPlaying &&
      currentStep >= 0
    ) {

      hihatPattern[currentStep] = true;
    }
  }

  if (
    !arduinoButtons[3] &&
    sequencerArduinoButtons[3]
  ) {

    sequencerArduinoButtons[3] = false;
  }

  // BUTTON 4 = CLAP
  if (
    arduinoButtons[4] &&
    !sequencerArduinoButtons[4]
  ) {

    sequencerArduinoButtons[4] = true;

    playClap(Tone.now());

    if (
      isPlaying &&
      currentStep >= 0
    ) {

      clapPattern[currentStep] = true;
    }
  }

  if (
    !arduinoButtons[4] &&
    sequencerArduinoButtons[4]
  ) {

    sequencerArduinoButtons[4] = false;
  }
}

// -----------------------------
// BUTTON 5 = STOP
// -----------------------------

function handleArduinoStopButton() {

  if (
    arduinoButtons[5] &&
    !sequencerArduinoButtons[5]
  ) {

    sequencerArduinoButtons[5] = true;

    Tone.Transport.stop();

    Tone.Transport.position = 0;

    isPlaying = false;

    currentStep = -1;
  }

  if (
    !arduinoButtons[5] &&
    sequencerArduinoButtons[5]
  ) {

    sequencerArduinoButtons[5] = false;
  }
}

// -----------------------------
// BUTTON 6 = PLAY
// -----------------------------

function handleArduinoPlayButton() {

  if (
    arduinoButtons[6] &&
    !sequencerArduinoButtons[6]
  ) {

    sequencerArduinoButtons[6] = true;

    Tone.Transport.start();

    isPlaying = true;
  }

  if (
    !arduinoButtons[6] &&
    sequencerArduinoButtons[6]
  ) {

    sequencerArduinoButtons[6] = false;
  }
}

// -----------------------------
// PRESSURE SENSOR = SAVE
// -----------------------------

function handlePressureSave() {

  if (
    pressureSwitchActive &&
    !pressureSaveTriggered
  ) {

    pressureSaveTriggered = true;

    openSavePopup({

      type: "DRUMS",

      kick: [...kickPattern],
      snare: [...snarePattern],
      hihat: [...hihatPattern],
      clap: [...clapPattern]
    });
  }

  // RESET
  if (!pressurePressed) {

    pressureSaveTriggered = false;
  }
}

// -----------------------------
// DRAW
// -----------------------------

function drawSequencer() {

  background(20);

  updateArduinoSequencer();

  let tracks = [
    {
      name: "KICK",
      pattern: kickPattern,
      color: [0, 255, 0]
    },
    {
      name: "SNARE",
      pattern: snarePattern,
      color: [0, 100, 255]
    },
    {
      name: "HIHAT",
      pattern: hihatPattern,
      color: [255, 255, 0]
    },
    {
      name: "CLAP",
      pattern: clapPattern,
      color: [255, 0, 255]
    }
  ];

  // TITLE
  fill(255);

  textAlign(CENTER);

  textSize(48);

  text(
    "DRUM SEQUENCER",
    width / 2,
    70
  );

  // STATUS
  textSize(18);

  text(
    isPlaying
      ? "PLAYING"
      : "STOPPED",
    width / 2,
    120
  );

  // BPM
  textAlign(LEFT);

  fill(255);

  noStroke();

  textSize(16);

  text(
    "BPM",
    width - 360,
    70
  );

  textSize(42);

  text(
    bpm,
    width - 365,
    120
  );

  // VOLUME
  textSize(16);

  text(
    "VOL",
    width - 220,
    70
  );

  textSize(42);

  text(
    masterVolume,
    width - 225,
    120
  );

  // GRID
  for (let row = 0; row < tracks.length; row++) {

    fill(255);

    textAlign(LEFT, CENTER);

    // SMALLER TRACK LABELS
    textSize(28);

    text(
      tracks[row].name,
      20,
      startY + row * cellSize + 25
    );

    for (
      let step = 0;
      step < totalSteps;
      step++
    ) {

      let x =
        startX +
        step * cellSize;

      let y =
        startY +
        row * cellSize;

      // PLAYHEAD
      if (
        step === currentStep &&
        isPlaying
      ) {

        fill(255, 0, 0);

      } else {

        fill(40);
      }

      stroke(90);

      rect(
        x,
        y,
        50,
        50,
        8
      );

      // BAR
      if (step % 4 === 0) {

        stroke(255);

        strokeWeight(3);

        noFill();

        rect(
          x,
          y,
          50,
          50,
          8
        );

        strokeWeight(1);
      }

      // ACTIVE
      if (
        tracks[row].pattern[step]
      ) {

        fill(
          tracks[row].color[0],
          tracks[row].color[1],
          tracks[row].color[2]
        );

        noStroke();

        ellipse(
          x + 25,
          y + 25,
          20
        );
      }
    }
  }

  // INFO
  fill(255);

  noStroke();

  textAlign(LEFT);

  textSize(16);

  text(
    "1 = KICK",
    130,
    620
  );

  text(
    "2 = SNARE",
    340,
    620
  );

  text(
    "3 = HIHAT",
    560,
    620
  );

  text(
    "4 = CLAP",
    780,
    620
  );

  text(
    "5 = STOP",
    260,
    660
  );

  text(
    "6 = PLAY",
    700,
    660
  );

  text(
    "PRESSURE STRIP = SAVE",
    width / 2 - 120,
    700
  );

  // SAVE BUTTON
  fill(40);

  stroke(255);

  strokeWeight(2);

  rect(
    width - 220,
    height - 90,
    160,
    50,
    10
  );

  fill(255);

  noStroke();

  textAlign(CENTER, CENTER);

  textSize(20);

  text(
    "SAVE",
    width - 140,
    height - 65
  );
}

// -----------------------------
// CLEAR
// -----------------------------

function clearPatterns() {

  kickPattern.fill(false);
  snarePattern.fill(false);
  hihatPattern.fill(false);
  clapPattern.fill(false);
}

// -----------------------------
// MOUSE INPUT
// -----------------------------

function mousePressedSequencer() {

  let tracks = [
    kickPattern,
    snarePattern,
    hihatPattern,
    clapPattern
  ];

  for (
    let row = 0;
    row < tracks.length;
    row++
  ) {

    for (
      let step = 0;
      step < totalSteps;
      step++
    ) {

      let x =
        startX +
        step * cellSize;

      let y =
        startY +
        row * cellSize;

      if (
        mouseX > x &&
        mouseX < x + 50 &&
        mouseY > y &&
        mouseY < y + 50
      ) {

        tracks[row][step] =
          !tracks[row][step];
      }
    }
  }

  // SAVE BUTTON
  if (
    mouseX > width - 220 &&
    mouseX < width - 60 &&
    mouseY > height - 90 &&
    mouseY < height - 40
  ) {

    openSavePopup({

      type: "DRUMS",

      kick: [...kickPattern],
      snare: [...snarePattern],
      hihat: [...hihatPattern],
      clap: [...clapPattern]
    });

    return;
  }
}