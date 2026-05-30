async function keyPressed() {

  await Tone.start();

  // SAVE PAGE PREVIEW
  if (showSavePage && key === ' ') {

    if (isPreviewPlaying) {

      stopPreviewPlayback();

    } else {

      startPreviewPlayback();
    }

    return;
  }

  // FINAL SONG PLAYBACK
  if (
    currentPage === "FINAL" &&
    key === ' '
  ) {

    if (isFinalSongPlaying) {

      stopFinalSongPlayback();

    } else {

      startFinalSongPlayback();
    }

    return;
  }

  // -----------------------------
  // PIANO PAGE
  // -----------------------------

  if (currentPage === "PIANO") {

    // PLAY / STOP + RECORD
    if (key === ' ') {

      if (Tone.Transport.state === "started") {

        Tone.Transport.stop();
        Tone.Transport.position = 0;

        currentStep = -1;
        pianoLoopStep = 0;

        isPlaying = false;
        isRecordingPiano = false;

      } else {

        Tone.Transport.start();

        isPlaying = true;
        isRecordingPiano = true;
      }

      return;
    }

    // BPM DOWN
    if (keyCode === DOWN_ARROW) {

      bpm--;

      if (bpm < 40) {
        bpm = 40;
      }

      Tone.Transport.bpm.rampTo(
        bpm,
        0.05
      );

      return;
    }

    // BPM UP
    if (keyCode === UP_ARROW) {

      bpm++;

      if (bpm > 240) {
        bpm = 240;
      }

      Tone.Transport.bpm.rampTo(
        bpm,
        0.05
      );

      return;
    }

    // CLEAR
    if (key === 'c') {

      for (let i = 0; i < totalSteps; i++) {

        pianoRoll[i] = [];
      }

      return;
    }

    pianoKeyPressed(key);

    return;
  }

  // -----------------------------
  // SYNTH PAGE
  // -----------------------------

  if (currentPage === "SYNTH") {

    // PLAY / STOP + RECORD
    if (key === ' ') {

      if (Tone.Transport.state === "started") {

        Tone.Transport.stop();
        Tone.Transport.position = 0;

        synthLoopStep = 0;

        isPlaying = false;
        isRecordingSynth = false;

      } else {

        Tone.Transport.start();

        isPlaying = true;
        isRecordingSynth = true;
      }

      return;
    }

    // CLEAR
    if (key === 'c') {

      for (let i = 0; i < totalSteps; i++) {

        synthRoll[i] = [];
      }

      return;
    }

    // BPM DOWN
    if (keyCode === DOWN_ARROW) {

      bpm--;

      if (bpm < 40) {
        bpm = 40;
      }

      Tone.Transport.bpm.rampTo(
        bpm,
        0.05
      );

      return;
    }

    // BPM UP
    if (keyCode === UP_ARROW) {

      bpm++;

      if (bpm > 240) {
        bpm = 240;
      }

      Tone.Transport.bpm.rampTo(
        bpm,
        0.05
      );

      return;
    }

    let keyIndex =
      synthKeyboardMap[key];

    if (
      keyIndex !== undefined
    ) {

      let note =
        synthNotes[keyIndex];

      activeSynthKeys[keyIndex] = true;

      if (!activeSynthNotes[key]) {

        activeSynthNotes[key] = note;

        playSynthNote(note);

        // RECORD
        if (
          isRecordingSynth &&
          isPlaying
        ) {

          let recordStep =
            synthLoopStep;

          if (recordStep > 0) {
            recordStep--;
          }

          if (!synthRoll[recordStep]) {

            synthRoll[recordStep] = [];
          }

          synthRoll[recordStep].push({

            note: note,
            length: 1,
            start: true
          });

          synthNoteStartSteps[key] =
            recordStep;

          lastSynthRecordedStep = -1;
        }
      }
    }

    return;
  }

  // -----------------------------
  // DRUM PAGE
  // -----------------------------

  if (currentPage === "DRUMS") {

    // PLAY / STOP
    if (key === ' ') {

      if (Tone.Transport.state === "started") {

        Tone.Transport.stop();
        Tone.Transport.position = 0;

        currentStep = -1;

        isPlaying = false;

      } else {

        Tone.Transport.start();

        isPlaying = true;
      }

      return;
    }

    // BPM DOWN
    if (keyCode === DOWN_ARROW) {

      bpm--;

      if (bpm < 40) {
        bpm = 40;
      }

      Tone.Transport.bpm.rampTo(
        bpm,
        0.05
      );

      return;
    }

    // BPM UP
    if (keyCode === UP_ARROW) {

      bpm++;

      if (bpm > 240) {
        bpm = 240;
      }

      Tone.Transport.bpm.rampTo(
        bpm,
        0.05
      );

      return;
    }

    // KICK
    if (key === 'a') {

      if (currentStep >= 0) {

        kickPattern[currentStep] = true;
      }

      playKick(Tone.now());

      return;
    }

    // SNARE
    if (key === 's') {

      if (currentStep >= 0) {

        snarePattern[currentStep] = true;
      }

      playSnare(Tone.now());

      return;
    }

    // HIHAT
    if (key === 'd') {

      if (currentStep >= 0) {

        hihatPattern[currentStep] = true;
      }

      playHiHat(Tone.now());

      return;
    }

    // CLAP
    if (key === 'f') {

      if (currentStep >= 0) {

        clapPattern[currentStep] = true;
      }

      playClap(Tone.now());

      return;
    }

    // CLEAR
    if (key === 'c') {

      clearPatterns();

      return;
    }
  }
}

function keyReleased() {

  // PIANO
  if (currentPage === "PIANO") {

    pianoKeyReleased(key);
  }

  // SYNTH
  if (currentPage === "SYNTH") {

    let keyIndex =
      synthKeyboardMap[key];

    let note =
      activeSynthNotes[key];

    if (note) {

      releaseSynthNote(note);

      delete activeSynthNotes[key];

      delete synthNoteStartSteps[key];
    }

    if (
      keyIndex !== undefined
    ) {

      delete activeSynthKeys[keyIndex];
    }
  }
}