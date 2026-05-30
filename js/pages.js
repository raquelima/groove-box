function drawMenu() {

  background(10);

  fill(255);

  textAlign(CENTER);

  // TITLE
  textSize(60);

  text(
    "GROOVEBOX",
    width / 2,
    140
  );

  // SUBTITLE
  textSize(20);

  text(
    "SELECT AN INSTRUMENT",
    width / 2,
    200
  );

  // BUTTON STYLE
  fill(40);

  stroke(255);

  strokeWeight(2);

  // DRUMS
  rect(
    width / 2 - 200,
    280,
    400,
    80,
    12
  );

  // SYNTH
  rect(
    width / 2 - 200,
    420,
    400,
    80,
    12
  );

  // PIANO
  rect(
    width / 2 - 200,
    560,
    400,
    80,
    12
  );

  fill(255);

  noStroke();

  textSize(32);

  text(
    "1 = DRUMS",
    width / 2,
    330
  );

  text(
    "2 = SYNTH",
    width / 2,
    470
  );

  text(
    "3 = PIANO",
    width / 2,
    610
  );

  // -----------------------------
  // CONNECT BUTTON
  // -----------------------------

  let connectX = width - 260;
  let connectY = height - 90;
  let connectW = 220;
  let connectH = 50;

  // BUTTON COLOR
  if (isArduinoConnected) {

    fill(0, 160, 80);

  } else if (isArduinoError) {

    fill(180, 40, 40);

  } else {

    fill(40);
  }

  stroke(255);

  strokeWeight(2);

  rect(
    connectX,
    connectY,
    connectW,
    connectH,
    10
  );

  fill(255);

  noStroke();

  textSize(16);

  text(

    isArduinoConnected
      ? "ARDUINO CONNECTED"

      : isArduinoError
      ? "CONNECTION ERROR"

      : "CONNECT ARDUINO",

    connectX + connectW / 2,
    connectY + connectH / 2 + 1
  );
}

function drawCurrentPage() {

  // SAVE PAGE
  if (showSavePage) {

    drawSavePage();
    return;
  }

  // MENU
  if (currentPage === "menu") {

    drawMenu();
    return;
  }

  // DRUMS
  if (currentPage === "DRUMS") {

    drawSequencer();
    return;
  }

  // PIANO
  if (currentPage === "PIANO") {

    drawPianoPage();
    return;
  }

  // SYNTH
  if (currentPage === "SYNTH") {

    drawSynthPage();
    return;
  }

  // FINAL SONG
  if (currentPage === "FINAL") {

    // -----------------------------
    // ARDUINO CONTROLS
    // -----------------------------

    handleFinalSongArduino();

    background(10);

    fill(255);

    textAlign(CENTER);

    textSize(52);

    text(
      "FINAL SONG",
      width / 2,
      100
    );

    textSize(22);

    text(
      savedTracks.length + " TRACKS",
      width / 2,
      160
    );

    textSize(18);

    text(
      "BUTTON 4 = EXPORT WAV",
      width / 2,
      210
    );

    text(
      isFinalSongPlaying
        ? "SPACE OR BUTTON 5 = STOP SONG"
        : "SPACE OR BUTTON 6 = PLAY SONG",
      width / 2,
      240
    );

    // TRACKS
    let startY = 300;

    for (
      let i = 0;
      i < savedTracks.length;
      i++
    ) {

      let track =
        savedTracks[i];

      fill(25);

      stroke(255);

      rect(
        120,
        startY + i * 110,
        width - 240,
        80,
        14
      );

      fill(255);

      noStroke();

      textAlign(LEFT, CENTER);

      textSize(22);

      text(
        track.type,
        150,
        startY + i * 110 + 20
      );

      // MINI TIMELINE
      let timelineX = 320;

      let timelineY =
        startY + i * 110 + 18;

      let timelineWidth =
        width - 500;

      let timelineHeight = 30;

      // GRID
      for (
        let s = 0;
        s <= totalSteps;
        s++
      ) {

        let x =
          timelineX +
          (s / totalSteps) *
          timelineWidth;

        stroke(
          s % 4 === 0
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
      if (isFinalSongPlaying) {

        let playheadX =
          timelineX +
          (finalSongStep / totalSteps) *
          timelineWidth;

        stroke(255, 0, 0);

        strokeWeight(3);

        line(
          playheadX,
          timelineY - 5,
          playheadX,
          timelineY +
          timelineHeight + 5
        );

        strokeWeight(1);
      }

      // DRUM VISUAL
      if (track.type === "DRUMS") {

        let drumTracks = [
          track.kick,
          track.snare,
          track.hihat,
          track.clap
        ];

        for (
          let row = 0;
          row < 4;
          row++
        ) {

          for (
            let step = 0;
            step < totalSteps;
            step++
          ) {

            if (
              drumTracks[row][step]
            ) {

              let x =
                timelineX +
                (step / totalSteps) *
                timelineWidth;

              let y =
                timelineY +
                row * 7;

              fill(255);

              noStroke();

              rect(
                x,
                y,
                12,
                5,
                2
              );
            }
          }
        }
      }

      // PIANO VISUAL
      if (track.type === "PIANO") {

        for (
          let step = 0;
          step < totalSteps;
          step++
        ) {

          let notes =
            track.data[step] || [];

          for (
            let noteData of notes
          ) {

            let noteIndex =
              pianoNotes.indexOf(
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
                noteIndex * 3;

              let w =
                (timelineWidth / totalSteps) *
                noteData.length;

              fill(255);

              noStroke();

              rect(
                x,
                y,
                w,
                3,
                2
              );
            }
          }
        }
      }

      // SYNTH VISUAL
      if (track.type === "SYNTH") {

        for (
          let step = 0;
          step < totalSteps;
          step++
        ) {

          let notes =
            track.data[step] || [];

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
                noteIndex * 3;

              let w =
                (timelineWidth / totalSteps) *
                noteData.length;

              fill(255);

              noStroke();

              rect(
                x,
                y,
                w,
                3,
                2
              );
            }
          }
        }
      }
    }

    return;
  }
}

function handlePageMousePressed() {

  // SAVE PAGE
  if (showSavePage) {

    handleSavePopupMousePressed();
    return;
  }

  // MENU
  if (currentPage === "menu") {

    // DRUMS
    if (
      mouseX > width / 2 - 200 &&
      mouseX < width / 2 + 200 &&
      mouseY > 280 &&
      mouseY < 360
    ) {

      currentPage = "DRUMS";

      return;
    }

    // SYNTH
    if (
      mouseX > width / 2 - 200 &&
      mouseX < width / 2 + 200 &&
      mouseY > 420 &&
      mouseY < 500
    ) {

      currentPage = "SYNTH";

      return;
    }

    // PIANO
    if (
      mouseX > width / 2 - 200 &&
      mouseX < width / 2 + 200 &&
      mouseY > 560 &&
      mouseY < 640
    ) {

      currentPage = "PIANO";

      return;
    }

    // CONNECT ARDUINO
    if (
      mouseX > width - 260 &&
      mouseX < width - 40 &&
      mouseY > height - 90 &&
      mouseY < height - 40
    ) {

      connectArduino();

      return;
    }
  }

  // PIANO PAGE
  if (currentPage === "PIANO") {

    // SAVE BUTTON
    if (
      mouseX > width - 220 &&
      mouseX < width - 60 &&
      mouseY > height - 90 &&
      mouseY < height - 40
    ) {

      openSavePopup({
        type: "PIANO",
        data: pianoRoll
      });

      return;
    }

    pianoMousePressed();

    return;
  }

  // SYNTH PAGE
  if (currentPage === "SYNTH") {

    // SAVE BUTTON
    if (
      mouseX > width - 220 &&
      mouseX < width - 60 &&
      mouseY > height - 90 &&
      mouseY < height - 40
    ) {

      openSavePopup({
        type: "SYNTH",
        data: synthRoll
      });

      return;
    }

    return;
  }

  // DRUM PAGE
  if (currentPage === "DRUMS") {

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

    mousePressedSequencer();

    return;
  }
}