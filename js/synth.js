// -----------------------------
// SYNTH NOTES
// -----------------------------

let synthNotes = [
  "C3",
  "D3",
  "E3",
  "F3"
];

// -----------------------------
// ARDUINO BUTTONS
// -----------------------------

let synthArduinoButtons = {
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

let synthPressureSaveTriggered = false;

// -----------------------------
// KEYBOARD MAP
// -----------------------------

let synthKeyboardMap = {
  'a': 0,
  's': 1,
  'd': 2,
  'f': 3
};

// -----------------------------
// SYNTH RECORDING
// -----------------------------

let synthRoll = [];

for (let i = 0; i < totalSteps; i++) {
  synthRoll.push([]);
}

let activeSynthNotes = {};
let activeSynthKeys = {};
let synthNoteStartSteps = {};

let isRecordingSynth = false;

let synthLoopStep = 0;
let synthLoopEvent = null;

let lastSynthRecordedStep = -1;

// -----------------------------
// SYNTH CONTROLS
// -----------------------------

let synthFilterValue = 800;
let synthModValue = 10;

let draggingFilter = false;
let draggingMod = false;

// -----------------------------
// SETUP
// -----------------------------

function setupSynth() {

  if (synthLoopEvent) {

    Tone.Transport.clear(
      synthLoopEvent
    );
  }

  synthLoopEvent =
    Tone.Transport.scheduleRepeat(

      (time) => {

        if (
          !isPlaying ||
          currentPage !== "SYNTH" ||
          showSavePage
        ) {
          return;
        }

        // PLAY RECORDED NOTES
        let recordedNotes =
          synthRoll[synthLoopStep] || [];

        for (
          let noteData of recordedNotes
        ) {

          if (noteData.start) {

            let duration =
              noteData.length *
              Tone.Time("16n").toSeconds();

            playSynthRecordedNote(
              noteData.note,
              duration,
              time
            );
          }
        }

        // NOTE LENGTHS
        if (isRecordingSynth) {

          for (
            let heldKey in activeSynthNotes
          ) {

            let heldNote =
              activeSynthNotes[heldKey];

            let startStep =
              synthNoteStartSteps[heldKey];

            if (
              startStep !== undefined &&
              synthRoll[startStep]
            ) {

              for (
                let noteData of synthRoll[startStep]
              ) {

                if (
                  noteData.note === heldNote
                ) {

                  if (
                    lastSynthRecordedStep !==
                    synthLoopStep
                  ) {

                    if (
                      synthLoopStep === 0 &&
                      noteData.length >=
                      totalSteps - startStep
                    ) {

                      synthRoll[0].push({

                        note: heldNote,
                        length: 1,
                        start: true
                      });

                      synthNoteStartSteps[heldKey] = 0;

                    } else {

                      noteData.length++;
                    }
                  }
                }
              }
            }
          }
        }

        lastSynthRecordedStep =
          synthLoopStep;

        synthLoopStep++;

        if (
          synthLoopStep >= totalSteps
        ) {

          synthLoopStep = 0;
        }

      },

      "16n"
    );
}

// -----------------------------
// PRESSURE SAVE
// -----------------------------

function handleSynthPressureSave() {

  if (
    pressureSwitchActive &&
    !synthPressureSaveTriggered
  ) {

    synthPressureSaveTriggered = true;

    openSavePopup({

      type: "SYNTH",

      data: synthRoll
    });
  }

  // RESET
  if (!pressurePressed) {

    synthPressureSaveTriggered = false;
  }
}

// -----------------------------
// ARDUINO SYNTH
// -----------------------------

function handleArduinoSynth() {

  // -----------------------------
  // PRESSURE SAVE
  // -----------------------------

  handleSynthPressureSave();

  for (let i = 1; i <= 4; i++) {

    let pressed =
      arduinoButtons[i];

    // -----------------------------
    // PRESS
    // -----------------------------

    if (
      pressed &&
      !synthArduinoButtons[i]
    ) {

      synthArduinoButtons[i] = true;

      let note =
        synthNotes[i - 1];

      activeSynthKeys[i - 1] =
        true;

      activeSynthNotes[
        "arduino" + i
      ] = note;

      // PLAY IMMEDIATELY
      playSynthNote(note);

      // -----------------------------
      // RECORD
      // -----------------------------

      if (
        isRecordingSynth &&
        isPlaying
      ) {

        let recordStep =
          synthLoopStep;

        if (recordStep > 0) {
          recordStep--;
        }

        if (
          !synthRoll[recordStep]
        ) {

          synthRoll[recordStep] = [];
        }

        synthRoll[recordStep].push({

          note: note,
          length: 1,
          start: true
        });

        synthNoteStartSteps[
          "arduino" + i
        ] = recordStep;

        lastSynthRecordedStep = -1;
      }
    }

    // -----------------------------
    // RELEASE
    // -----------------------------

    if (
      !pressed &&
      synthArduinoButtons[i]
    ) {

      synthArduinoButtons[i] = false;

      let note =
        activeSynthNotes[
          "arduino" + i
        ];

      if (note) {

        releaseSynthNote(note);

        delete activeSynthNotes[
          "arduino" + i
        ];

        delete synthNoteStartSteps[
          "arduino" + i
        ];
      }

      delete activeSynthKeys[i - 1];
    }
  }

  // -----------------------------
  // BUTTON 5 = STOP
  // -----------------------------

  if (
    arduinoButtons[5] &&
    !synthArduinoButtons[5]
  ) {

    synthArduinoButtons[5] = true;

    Tone.Transport.stop();

    Tone.Transport.position = 0;

    isPlaying = false;

    isRecordingSynth = false;

    synthLoopStep = 0;
  }

  if (
    !arduinoButtons[5] &&
    synthArduinoButtons[5]
  ) {

    synthArduinoButtons[5] = false;
  }

  // -----------------------------
  // BUTTON 6 = PLAY + RECORD
  // -----------------------------

  if (
    arduinoButtons[6] &&
    !synthArduinoButtons[6]
  ) {

    synthArduinoButtons[6] = true;

    Tone.Transport.start();

    isPlaying = true;

    isRecordingSynth = true;
  }

  if (
    !arduinoButtons[6] &&
    synthArduinoButtons[6]
  ) {

    synthArduinoButtons[6] = false;
  }
}

// -----------------------------
// DRAW PAGE
// -----------------------------

function drawSynthPage() {

  // -----------------------------
  // ALWAYS READ ARDUINO
  // -----------------------------

  handleArduinoSynth();

  background(8);

  fill(255);

  noStroke();

  textAlign(CENTER);

  // TITLE
  textSize(48);

  text(
    "SYNTH",
    width / 2,
    70
  );

  // -----------------------------
  // INFO
  // -----------------------------

  fill(255);

  noStroke();

  textAlign(CENTER);

  textSize(16);

  text(
    "1 2 3 4 = NOTES",
    width / 2,
    120
  );

  text(
    "5 = STOP",
    width / 2 - 140,
    150
  );

  text(
    "6 = PLAY + RECORD",
    width / 2 + 140,
    150
  );

  text(
    "PRESSURE STRIP = SAVE",
    width / 2,
    180
  );

  // RECORD DOT
  if (isRecordingSynth) {

    fill(255, 0, 0);

    ellipse(
      width / 2 - 260,
      150,
      18
    );
  }

  // -----------------------------
  // BPM
  // -----------------------------

  fill(255);

  noStroke();

  textAlign(LEFT);

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

  // -----------------------------
  // VOLUME
  // -----------------------------

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

  // -----------------------------
  // FILTER
  // -----------------------------

  fill(255);

  textAlign(LEFT);

  textSize(16);

  text(
    "FILTER",
    120,
    70
  );

  stroke(255);
  strokeWeight(4);

  line(
    120,
    110,
    260,
    110
  );

  let filterKnobX = map(
    synthFilterValue,
    200,
    5000,
    120,
    260
  );

  fill(255);

  noStroke();

  ellipse(
    filterKnobX,
    110,
    18
  );

  // -----------------------------
  // MOD
  // -----------------------------

  fill(255);

  textSize(16);

  text(
    "MOD",
    120,
    150
  );

  stroke(255);
  strokeWeight(4);

  line(
    120,
    190,
    260,
    190
  );

  let modKnobX = map(
    synthModValue,
    1,
    50,
    120,
    260
  );

  fill(255);

  noStroke();

  ellipse(
    modKnobX,
    190,
    18
  );

  // -----------------------------
  // SYNTH KEYS
  // -----------------------------

  let synthX = 120;
  let synthY = 300;

  let synthWidth =
    width - 240;

  let synthHeight = 170;

  let sectionWidth =
    synthWidth / 4;

  let synthColors = [
    [255, 80, 80],
    [255, 160, 60],
    [255, 230, 80],
    [80, 255, 120]
  ];

  for (
    let i = 0;
    i < 4;
    i++
  ) {

    if (activeSynthKeys[i]) {

      fill(
        synthColors[i][0],
        synthColors[i][1],
        synthColors[i][2]
      );

    } else {

      fill(35);
    }

    stroke(255);

    strokeWeight(2);

    rect(
      synthX + i * sectionWidth,
      synthY,
      sectionWidth,
      synthHeight,
      18
    );

    fill(255);

    noStroke();

    textAlign(CENTER, CENTER);

    textSize(28);

    text(
      synthNotes[i],

      synthX +
      i * sectionWidth +
      sectionWidth / 2,

      synthY +
      synthHeight / 2
    );
  }

  // -----------------------------
  // TIMELINE
  // -----------------------------

  let timelineX = 140;
  let timelineY = 560;

  let timelineWidth =
    width - 280;

  let timelineHeight = 140;

  stroke(70);

  line(
    timelineX,
    timelineY +
    timelineHeight / 2,

    timelineX + timelineWidth,

    timelineY +
    timelineHeight / 2
  );

  // GRID
  for (
    let i = 0;
    i <= totalSteps;
    i++
  ) {

    let x =
      timelineX +
      (i / totalSteps) *
      timelineWidth;

    stroke(
      i % 4 === 0
        ? 255
        : 60
    );

    line(
      x,
      timelineY,
      x,
      timelineY +
      timelineHeight
    );
  }

  // PLAYHEAD
  if (
    isPlaying &&
    currentPage === "SYNTH"
  ) {

    let playheadX =
      timelineX +
      (synthLoopStep / totalSteps) *
      timelineWidth;

    stroke(255, 0, 0);

    strokeWeight(4);

    line(
      playheadX,
      timelineY - 10,

      playheadX,
      timelineY +
      timelineHeight + 10
    );
  }

  // DRAW NOTES
  for (
    let step = 0;
    step < totalSteps;
    step++
  ) {

    let notes =
      synthRoll[step] || [];

    for (
      let noteData of notes
    ) {

      let noteIndex =
        synthNotes.indexOf(
          noteData.note
        );

      if (noteIndex >= 0) {

        let x =
          timelineX +
          (step / totalSteps) *
          timelineWidth;

        let y =
          timelineY +
          timelineHeight -
          (noteIndex + 1) * 24;

        let w =
          (timelineWidth / totalSteps) *
          noteData.length;

        fill(
          synthColors[noteIndex][0],
          synthColors[noteIndex][1],
          synthColors[noteIndex][2]
        );

        noStroke();

        rect(
          x,
          y,
          w,
          18,
          5
        );
      }
    }
  }

  // -----------------------------
  // SAVE BUTTON
  // -----------------------------

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
// SYNTH SLIDER INTERACTION
// -----------------------------

function synthMousePressed() {

  // FILTER
  if (
    mouseX > 120 &&
    mouseX < 260 &&
    mouseY > 90 &&
    mouseY < 130
  ) {

    draggingFilter = true;

    updateSynthFilter();
  }

  // MOD
  if (
    mouseX > 120 &&
    mouseX < 260 &&
    mouseY > 170 &&
    mouseY < 210
  ) {

    draggingMod = true;

    updateSynthMod();
  }
}

function synthMouseDragged() {

  if (draggingFilter) {
    updateSynthFilter();
  }

  if (draggingMod) {
    updateSynthMod();
  }
}

function synthMouseReleased() {

  draggingFilter = false;
  draggingMod = false;
}

function updateSynthFilter() {

  synthFilterValue = map(
    mouseX,
    120,
    260,
    200,
    5000
  );

  synthFilterValue = constrain(
    synthFilterValue,
    200,
    5000
  );
}

function updateSynthMod() {

  synthModValue = map(
    mouseX,
    120,
    260,
    1,
    50
  );

  synthModValue = constrain(
    synthModValue,
    1,
    50
  );
}