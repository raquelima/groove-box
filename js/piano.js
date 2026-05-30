// -----------------------------
// PIANO NOTES
// -----------------------------

let activePianoNotes = {};
let activePianoKeys = {};
let heldPianoSteps = {};
let noteStartSteps = {};

let pianoNotes = [
  "C2",
  "D2",
  "E2",
  "F2"
];

// -----------------------------
// ARDUINO BUTTONS
// -----------------------------

let pianoArduinoButtons = {
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

let pianoPressureSaveTriggered = false;

// -----------------------------
// KEYBOARD MAP
// -----------------------------

let pianoKeyboardMap = {
  'a': 0,
  's': 1,
  'd': 2,
  'f': 3
};

// -----------------------------
// PIANO ROLL
// -----------------------------

let pianoRoll = [];

for (let i = 0; i < totalSteps; i++) {
  pianoRoll.push([]);
}

let isRecordingPiano = false;

let pianoLoopStep = 0;
let pianoLoopEvent = null;

let lastRecordedStep = -1;

// -----------------------------
// SETUP
// -----------------------------

function setupPiano() {

  if (pianoLoopEvent) {

    Tone.Transport.clear(
      pianoLoopEvent
    );
  }

  pianoLoopEvent =
    Tone.Transport.scheduleRepeat(

      (time) => {

        if (
          !isPlaying ||
          currentPage !== "PIANO" ||
          showSavePage
        ) {
          return;
        }

        // PLAY RECORDED NOTES
        let recordedNotes =
          pianoRoll[pianoLoopStep] || [];

        for (
          let noteData of recordedNotes
        ) {

          if (noteData.start) {

            let duration =
              noteData.length *
              Tone.Time("16n").toSeconds();

            playPianoRecordedNote(
              noteData.note,
              duration,
              time
            );
          }
        }

        // NOTE LENGTHS
        if (isRecordingPiano) {

          for (
            let heldKey in activePianoNotes
          ) {

            let heldNote =
              activePianoNotes[heldKey];

            let startStep =
              noteStartSteps[heldKey];

            if (
              startStep !== undefined &&
              pianoRoll[startStep]
            ) {

              for (
                let noteData of pianoRoll[startStep]
              ) {

                if (
                  noteData.note === heldNote
                ) {

                  if (
                    lastRecordedStep !==
                    pianoLoopStep
                  ) {

                    if (
                      pianoLoopStep === 0 &&
                      noteData.length >=
                      totalSteps - startStep
                    ) {

                      pianoRoll[0].push({

                        note: heldNote,
                        length: 1,
                        start: true
                      });

                      noteStartSteps[heldKey] = 0;

                    } else {

                      noteData.length++;
                    }
                  }
                }
              }
            }
          }
        }

        lastRecordedStep =
          pianoLoopStep;

        pianoLoopStep++;

        if (
          pianoLoopStep >= totalSteps
        ) {

          pianoLoopStep = 0;
        }

      },

      "16n"
    );
}

// -----------------------------
// PRESSURE SAVE
// -----------------------------

function handlePianoPressureSave() {

  if (
    pressureSwitchActive &&
    !pianoPressureSaveTriggered
  ) {

    pianoPressureSaveTriggered = true;

    openSavePopup({

      type: "PIANO",

      data: pianoRoll
    });
  }

  // RESET
  if (!pressurePressed) {

    pianoPressureSaveTriggered = false;
  }
}

// -----------------------------
// ARDUINO PIANO
// -----------------------------

function handleArduinoPiano() {

  // -----------------------------
  // PRESSURE SAVE
  // -----------------------------

  handlePianoPressureSave();

  for (let i = 1; i <= 4; i++) {

    let pressed =
      arduinoButtons[i];

    // PRESS
    if (
      pressed &&
      !pianoArduinoButtons[i]
    ) {

      pianoArduinoButtons[i] = true;

      let note =
        pianoNotes[i - 1];

      activePianoKeys[i - 1] =
        true;

      activePianoNotes[
        "arduino" + i
      ] = note;

      // PLAY IMMEDIATELY
      playPianoNote(note);

      // RECORD
      if (
        isRecordingPiano &&
        isPlaying
      ) {

        let recordStep =
          pianoLoopStep;

        if (recordStep > 0) {
          recordStep--;
        }

        if (
          !pianoRoll[recordStep]
        ) {

          pianoRoll[recordStep] = [];
        }

        pianoRoll[recordStep].push({

          note: note,
          length: 1,
          start: true
        });

        noteStartSteps[
          "arduino" + i
        ] = recordStep;

        lastRecordedStep = -1;
      }
    }

    // RELEASE
    if (
      !pressed &&
      pianoArduinoButtons[i]
    ) {

      pianoArduinoButtons[i] = false;

      let note =
        activePianoNotes[
          "arduino" + i
        ];

      if (note) {

        releasePianoNote(note);

        delete activePianoNotes[
          "arduino" + i
        ];

        delete noteStartSteps[
          "arduino" + i
        ];
      }

      delete activePianoKeys[i - 1];
    }
  }

  // -----------------------------
  // BUTTON 5 = STOP
  // -----------------------------

  if (
    arduinoButtons[5] &&
    !pianoArduinoButtons[5]
  ) {

    pianoArduinoButtons[5] = true;

    Tone.Transport.stop();

    Tone.Transport.position = 0;

    isPlaying = false;

    isRecordingPiano = false;

    pianoLoopStep = 0;
  }

  if (
    !arduinoButtons[5] &&
    pianoArduinoButtons[5]
  ) {

    pianoArduinoButtons[5] = false;
  }

  // -----------------------------
  // BUTTON 6 = PLAY + RECORD
  // -----------------------------

  if (
    arduinoButtons[6] &&
    !pianoArduinoButtons[6]
  ) {

    pianoArduinoButtons[6] = true;

    Tone.Transport.start();

    isPlaying = true;

    isRecordingPiano = true;
  }

  if (
    !arduinoButtons[6] &&
    pianoArduinoButtons[6]
  ) {

    pianoArduinoButtons[6] = false;
  }
}

// -----------------------------
// DRAW PAGE
// -----------------------------

function drawPianoPage() {

  handleArduinoPiano();

  background(15);

  fill(255);

  noStroke();

  textAlign(CENTER);

  // TITLE
  textSize(48);

  text(
    "PIANO",
    width / 2,
    70
  );

  // BPM
  fill(255);

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

  // INFO
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
  if (isRecordingPiano) {

    fill(255, 0, 0);

    ellipse(
      width / 2 - 260,
      150,
      18
    );
  }

  // -----------------------------
  // PIANO KEYS
  // -----------------------------

  let pianoX = 120;
  let pianoY = 260;

  let pianoWidth =
    width - 240;

  let pianoHeight = 180;

  let sectionWidth =
    pianoWidth / 4;

  let pianoColors = [
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

    if (activePianoKeys[i]) {

      fill(
        pianoColors[i][0],
        pianoColors[i][1],
        pianoColors[i][2]
      );

    } else {

      fill(230);
    }

    stroke(40);

    strokeWeight(2);

    rect(
      pianoX + i * sectionWidth,
      pianoY,
      sectionWidth,
      pianoHeight,
      20
    );

    fill(20);

    noStroke();

    textAlign(CENTER, CENTER);

    textSize(30);

    text(
      pianoNotes[i],

      pianoX +
      i * sectionWidth +
      sectionWidth / 2,

      pianoY +
      pianoHeight / 2
    );
  }

  // -----------------------------
  // TIMELINE
  // -----------------------------

  let timelineX = 140;
  let timelineY = 520;

  let timelineWidth =
    width - 280;

  let timelineHeight = 160;

  stroke(80);

  strokeWeight(2);

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
        : 70
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
    currentPage === "PIANO"
  ) {

    let playheadX =
      timelineX +
      (pianoLoopStep / totalSteps) *
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
      pianoRoll[step] || [];

    for (
      let noteData of notes
    ) {

      let noteIndex =
        pianoNotes.indexOf(
          noteData.note
        );

        if (noteIndex >= 0) {

          let noteX =
            timelineX +
            (step / totalSteps) *
            timelineWidth;

          let noteY =
            timelineY +
            timelineHeight -
            (noteIndex + 1) * 24;

          let noteWidth =
            (timelineWidth /
              totalSteps) *
            noteData.length;

          fill(
            pianoColors[noteIndex][0],
            pianoColors[noteIndex][1],
            pianoColors[noteIndex][2]
          );

          noStroke();

          rect(
            noteX,
            noteY,
            noteWidth,
            18,
            6
          );
        }
    }
  }

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
// MOUSE INPUT
// -----------------------------

async function pianoMousePressed() {

  await Tone.start();

  let pianoX = 120;
  let pianoY = 260;

  let pianoWidth =
    width - 240;

  let pianoHeight = 180;

  if (
    mouseX > pianoX &&
    mouseX < pianoX + pianoWidth &&
    mouseY > pianoY &&
    mouseY < pianoY + pianoHeight
  ) {

    let sectionWidth =
      pianoWidth / 4;

    let index =
      floor(
        (mouseX - pianoX) /
        sectionWidth
      );

    index = constrain(
      index,
      0,
      3
    );

    let note =
      pianoNotes[index];

    playPianoRecordedNote(
      note,
      "8n"
    );
  }
}

// -----------------------------
// KEYBOARD INPUT
// -----------------------------

function pianoKeyPressed(k) {

  let keyIndex =
    pianoKeyboardMap[k];

  if (
    keyIndex === undefined
  ) {
    return;
  }

  let note =
    pianoNotes[keyIndex];

  activePianoKeys[keyIndex] =
    true;

  if (
    activePianoNotes[k]
  ) {
    return;
  }

  activePianoNotes[k] =
    note;

  playPianoNote(note);

  // RECORD
  if (
    isRecordingPiano &&
    isPlaying
  ) {

    let recordStep =
      pianoLoopStep;

    if (recordStep > 0) {
      recordStep--;
    }

    if (
      !pianoRoll[recordStep]
    ) {

      pianoRoll[recordStep] = [];
    }

    pianoRoll[recordStep].push({

      note: note,
      length: 1,
      start: true
    });

    noteStartSteps[k] =
      recordStep;

    lastRecordedStep = -1;
  }
}

function pianoKeyReleased(k) {

  let keyIndex =
    pianoKeyboardMap[k];

  let note =
    activePianoNotes[k];

  if (note) {

    releasePianoNote(note);

    delete activePianoNotes[k];

    delete noteStartSteps[k];
  }

  if (
    keyIndex !== undefined
  ) {

    delete activePianoKeys[keyIndex];
  }
}