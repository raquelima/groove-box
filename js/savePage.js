let showSavePage = false;

let pendingTrack = null;

let savedTracks = [];

let previewStep = 0;
let previewEvent = null;
let isPreviewPlaying = false;

let finalSongEvent = null;
let isFinalSongPlaying = false;
let finalSongStep = 0;

// -----------------------------
// ARDUINO SAVE PAGE
// -----------------------------

let savePageArduinoButtons = {
  1: false,
  2: false,
  5: false,
  6: false
};

// -----------------------------
// FINAL PAGE ARDUINO
// -----------------------------

let finalPageArduinoButtons = {
  4: false,
  5: false,
  6: false
};

// -----------------------------
// OPEN SAVE POPUP
// -----------------------------

function openSavePopup(trackData) {

  pendingTrack = trackData;

  showSavePage = true;

  Tone.Transport.stop();
  Tone.Transport.position = 0;

  currentStep = -1;
  pianoLoopStep = 0;
  synthLoopStep = 0;

  isPlaying = false;

  isRecordingPiano = false;
  isRecordingSynth = false;

  previewStep = 0;

  isPreviewPlaying = false;

  if (isFinalSongPlaying) {

    stopFinalSongPlayback();
  }
}

// -----------------------------
// DRAW SAVE PAGE
// -----------------------------

function drawSavePage() {

  if (!showSavePage) {
    return;
  }

  handleArduinoSavePage();

  background(10);

  fill(255);

  noStroke();

  textAlign(CENTER);

  // TITLE
  textSize(52);

  text(
    "TRACK PREVIEW",
    width / 2,
    90
  );

  // TRACK TYPE
  if (pendingTrack) {

    textSize(24);

    text(
      pendingTrack.type,
      width / 2,
      140
    );
  }

  // PLAY STATUS
  textSize(16);

  text(
    isPreviewPlaying
      ? "BUTTON 5 = STOP PREVIEW"
      : "BUTTON 6 = PLAY PREVIEW",
    width / 2,
    180
  );

  // PREVIEW AREA
  fill(25);

  stroke(255);
  strokeWeight(2);

  rect(
    120,
    220,
    width - 240,
    260,
    20
  );

  // -----------------------------
  // DRUM PREVIEW
  // -----------------------------

  if (
    pendingTrack &&
    pendingTrack.type === "DRUMS"
  ) {

    let previewTracks = [
      pendingTrack.kick,
      pendingTrack.snare,
      pendingTrack.hihat,
      pendingTrack.clap
    ];

    let previewColors = [
      [0, 255, 0],
      [0, 120, 255],
      [255, 255, 0],
      [255, 0, 255]
    ];

    let startX = 180;
    let startY = 270;

    for (let row = 0; row < 4; row++) {

      for (let step = 0; step < totalSteps; step++) {

        let x = startX + step * 55;
        let y = startY + row * 45;

        if (
          step === previewStep &&
          isPreviewPlaying
        ) {

          fill(255, 0, 0);

        } else {

          fill(40);
        }

        stroke(90);

        rect(
          x,
          y,
          40,
          40,
          8
        );

        if (
          previewTracks[row][step]
        ) {

          fill(
            previewColors[row][0],
            previewColors[row][1],
            previewColors[row][2]
          );

          noStroke();

          ellipse(
            x + 20,
            y + 20,
            18
          );
        }
      }
    }
  }

  // -----------------------------
  // PIANO PREVIEW
  // -----------------------------

  if (
    pendingTrack &&
    pendingTrack.type === "PIANO"
  ) {

    drawPianoPreview();
  }

  // -----------------------------
  // SYNTH PREVIEW
  // -----------------------------

  if (
    pendingTrack &&
    pendingTrack.type === "SYNTH"
  ) {

    drawSynthPreview();
  }

  // -----------------------------
  // BUTTON 1
  // -----------------------------

  fill(40);

  stroke(255);
  strokeWeight(2);

  rect(
    width / 2 - 250,
    height - 170,
    500,
    70,
    14
  );

  fill(255);

  noStroke();

  textSize(24);

  text(
    "1 = SAVE AND ADD TRACK",
    width / 2,
    height - 125
  );

  // -----------------------------
  // BUTTON 2
  // -----------------------------

  fill(40);

  stroke(255);
  strokeWeight(2);

  rect(
    width / 2 - 250,
    height - 80,
    500,
    70,
    14
  );

  fill(255);

  noStroke();

  text(
    "2 = SAVE AND GO TO FINAL SONG",
    width / 2,
    height - 35
  );
}

// -----------------------------
// DRAW PIANO PREVIEW
// -----------------------------

function drawPianoPreview() {

  let timelineX = 180;
  let timelineY = 270;

  let timelineWidth =
    width - 360;

  let timelineHeight = 140;

  let pianoColors = [
    [255, 80, 80],
    [255, 160, 60],
    [255, 230, 80],
    [80, 255, 120]
  ];

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
      timelineY + timelineHeight
    );
  }

  // PLAYHEAD
  if (isPreviewPlaying) {

    let playheadX =
      timelineX +
      (previewStep / totalSteps) *
      timelineWidth;

    stroke(255, 0, 0);

    strokeWeight(4);

    line(
      playheadX,
      timelineY - 10,
      playheadX,
      timelineY + timelineHeight + 10
    );
  }

  // NOTES
  for (
    let step = 0;
    step < totalSteps;
    step++
  ) {

    let notes =
      pendingTrack.data[step] || [];

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
}

// -----------------------------
// DRAW SYNTH PREVIEW
// -----------------------------

function drawSynthPreview() {

  let timelineX = 180;
  let timelineY = 270;

  let timelineWidth =
    width - 360;

  let timelineHeight = 140;

  let synthColors = [
    [255, 80, 80],
    [255, 160, 60],
    [255, 230, 80],
    [80, 255, 120]
  ];

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
      timelineY + timelineHeight
    );
  }

  // PLAYHEAD
  if (isPreviewPlaying) {

    let playheadX =
      timelineX +
      (previewStep / totalSteps) *
      timelineWidth;

    stroke(255, 0, 0);

    strokeWeight(4);

    line(
      playheadX,
      timelineY - 10,
      playheadX,
      timelineY + timelineHeight + 10
    );
  }

  // NOTES
  for (
    let step = 0;
    step < totalSteps;
    step++
  ) {

    let notes =
      pendingTrack.data[step] || [];

    for (
      let noteData of notes
    ) {

      let noteIndex =
        synthNotes.indexOf(
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
          synthColors[noteIndex][0],
          synthColors[noteIndex][1],
          synthColors[noteIndex][2]
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
}

// -----------------------------
// ARDUINO SAVE PAGE CONTROLS
// -----------------------------

function handleArduinoSavePage() {

  if (!showSavePage) {
    return;
  }

  // BUTTON 1
  if (
    arduinoButtons[1] &&
    !savePageArduinoButtons[1]
  ) {

    savePageArduinoButtons[1] = true;

    savedTracks.push(
      cloneTrackData(pendingTrack)
    );

    stopPreviewPlayback();

    showSavePage = false;

    pendingTrack = null;

    kickPattern.fill(false);
    snarePattern.fill(false);
    hihatPattern.fill(false);
    clapPattern.fill(false);

    for (let i = 0; i < totalSteps; i++) {
      pianoRoll[i] = [];
    }

    for (let i = 0; i < totalSteps; i++) {
      synthRoll[i] = [];
    }

    currentPage = "menu";
  }

  if (
    !arduinoButtons[1] &&
    savePageArduinoButtons[1]
  ) {

    savePageArduinoButtons[1] = false;
  }

  // BUTTON 2
  if (
    arduinoButtons[2] &&
    !savePageArduinoButtons[2]
  ) {

    savePageArduinoButtons[2] = true;

    savedTracks.push(
      cloneTrackData(pendingTrack)
    );

    stopPreviewPlayback();

    showSavePage = false;

    pendingTrack = null;

    kickPattern.fill(false);
    snarePattern.fill(false);
    hihatPattern.fill(false);
    clapPattern.fill(false);

    for (let i = 0; i < totalSteps; i++) {
      pianoRoll[i] = [];
    }

    for (let i = 0; i < totalSteps; i++) {
      synthRoll[i] = [];
    }

    currentPage = "FINAL";
  }

  if (
    !arduinoButtons[2] &&
    savePageArduinoButtons[2]
  ) {

    savePageArduinoButtons[2] = false;
  }

  // BUTTON 5
  if (
    arduinoButtons[5] &&
    !savePageArduinoButtons[5]
  ) {

    savePageArduinoButtons[5] = true;

    stopPreviewPlayback();
  }

  if (
    !arduinoButtons[5] &&
    savePageArduinoButtons[5]
  ) {

    savePageArduinoButtons[5] = false;
  }

  // BUTTON 6
  if (
    arduinoButtons[6] &&
    !savePageArduinoButtons[6]
  ) {

    savePageArduinoButtons[6] = true;

    startPreviewPlayback();
  }

  if (
    !arduinoButtons[6] &&
    savePageArduinoButtons[6]
  ) {

    savePageArduinoButtons[6] = false;
  }
}

// -----------------------------
// FINAL PAGE ARDUINO CONTROLS
// -----------------------------

function handleFinalSongArduino() {

  if (currentPage !== "FINAL") {
    return;
  }

  // BUTTON 4
  if (
    arduinoButtons[4] &&
    !finalPageArduinoButtons[4]
  ) {

    finalPageArduinoButtons[4] = true;

    exportFinalSong();
  }

  if (
    !arduinoButtons[4] &&
    finalPageArduinoButtons[4]
  ) {

    finalPageArduinoButtons[4] = false;
  }

  // BUTTON 5
  if (
    arduinoButtons[5] &&
    !finalPageArduinoButtons[5]
  ) {

    finalPageArduinoButtons[5] = true;

    stopFinalSongPlayback();
  }

  if (
    !arduinoButtons[5] &&
    finalPageArduinoButtons[5]
  ) {

    finalPageArduinoButtons[5] = false;
  }

  // BUTTON 6
  if (
    arduinoButtons[6] &&
    !finalPageArduinoButtons[6]
  ) {

    finalPageArduinoButtons[6] = true;

    startFinalSongPlayback();
  }

  if (
    !arduinoButtons[6] &&
    finalPageArduinoButtons[6]
  ) {

    finalPageArduinoButtons[6] = false;
  }
}

// -----------------------------
// START PREVIEW
// -----------------------------

function startPreviewPlayback() {

  if (previewEvent) {
    Tone.Transport.clear(previewEvent);
  }

  previewStep = 0;

  previewEvent = Tone.Transport.scheduleRepeat((time) => {

    if (!pendingTrack) {
      return;
    }

    if (pendingTrack.type === "DRUMS") {

      if (pendingTrack.kick[previewStep]) {
        playKick(time);
      }

      if (pendingTrack.snare[previewStep]) {
        playSnare(time);
      }

      if (pendingTrack.hihat[previewStep]) {
        playHiHat(time);
      }

      if (pendingTrack.clap[previewStep]) {
        playClap(time);
      }
    }

    if (pendingTrack.type === "PIANO") {

      let notes =
        pendingTrack.data[previewStep] || [];

      for (let noteData of notes) {

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
    }

    if (pendingTrack.type === "SYNTH") {

      let notes =
        pendingTrack.data[previewStep] || [];

      for (let noteData of notes) {

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
    }

    previewStep++;

    if (previewStep >= totalSteps) {
      previewStep = 0;
    }

  }, "16n");

  Tone.Transport.start();

  isPreviewPlaying = true;
}

// -----------------------------
// STOP PREVIEW
// -----------------------------

function stopPreviewPlayback() {

  Tone.Transport.stop();
  Tone.Transport.position = 0;

  if (previewEvent) {

    Tone.Transport.clear(previewEvent);

    previewEvent = null;
  }

  previewStep = 0;

  isPreviewPlaying = false;
}

// -----------------------------
// FINAL SONG PLAYBACK
// -----------------------------

function startFinalSongPlayback() {

  if (finalSongEvent) {
    Tone.Transport.clear(finalSongEvent);
  }

  finalSongStep = 0;

  finalSongEvent = Tone.Transport.scheduleRepeat((time) => {

    for (let track of savedTracks) {

      if (track.type === "DRUMS") {

        if (track.kick[finalSongStep]) {
          playKick(time);
        }

        if (track.snare[finalSongStep]) {
          playSnare(time);
        }

        if (track.hihat[finalSongStep]) {
          playHiHat(time);
        }

        if (track.clap[finalSongStep]) {
          playClap(time);
        }
      }

      if (track.type === "PIANO") {

        let notes =
          track.data[finalSongStep] || [];

        for (let noteData of notes) {

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
      }

      if (track.type === "SYNTH") {

        let notes =
          track.data[finalSongStep] || [];

        for (let noteData of notes) {

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
      }
    }

    finalSongStep++;

    if (finalSongStep >= totalSteps) {
      finalSongStep = 0;
    }

  }, "16n");

  Tone.Transport.start();

  isFinalSongPlaying = true;
}

// -----------------------------
// STOP FINAL SONG
// -----------------------------

function stopFinalSongPlayback() {

  Tone.Transport.stop();
  Tone.Transport.position = 0;

  if (finalSongEvent) {

    Tone.Transport.clear(finalSongEvent);

    finalSongEvent = null;
  }

  finalSongStep = 0;

  isFinalSongPlaying = false;
}

// -----------------------------
// CLONE TRACK
// -----------------------------

function cloneTrackData(track) {

  if (track.type === "DRUMS") {

    return {
      type: "DRUMS",

      kick: [...track.kick],
      snare: [...track.snare],
      hihat: [...track.hihat],
      clap: [...track.clap]
    };
  }

  if (track.type === "PIANO") {

    return {
      type: "PIANO",

      data: track.data.map(step =>
        step.map(note => ({ ...note }))
      )
    };
  }

  if (track.type === "SYNTH") {

    return {
      type: "SYNTH",

      data: track.data.map(step =>
        step.map(note => ({ ...note }))
      )
    };
  }

  return JSON.parse(JSON.stringify(track));
}