// DRUM SYNTHS
let kickSynth;
let snareSynth;
let hihatSynth;
let clapSynth;

// PIANO
let pianoSynth;

// SYNTH
let synthFilter;
let synthSynth;

function setupAudio() {

  // -----------------------------
  // KICK
  // -----------------------------

  kickSynth = new Tone.MembraneSynth({

    pitchDecay: 0.05,
    octaves: 10,

    oscillator: {
      type: "sine"
    },

    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0,
      release: 0.1
    }

  }).toDestination();

  // -----------------------------
  // SNARE
  // -----------------------------

  snareSynth = new Tone.NoiseSynth({

    noise: {
      type: "white"
    },

    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0
    }

  }).toDestination();

  // -----------------------------
  // HIHAT
  // -----------------------------

  hihatSynth = new Tone.MetalSynth({

    frequency: 250,

    envelope: {
      attack: 0.001,
      decay: 0.08,
      release: 0.01
    },

    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5

  }).toDestination();

  // -----------------------------
  // CLAP
  // -----------------------------

  clapSynth = new Tone.NoiseSynth({

    noise: {
      type: "pink"
    },

    envelope: {
      attack: 0.001,
      decay: 0.3,
      sustain: 0
    }

  }).toDestination();

  // -----------------------------
  // PIANO SYNTH
  // -----------------------------

  pianoSynth = new Tone.PolySynth(
    Tone.FMSynth,
    {

      harmonicity: 2,

      modulationIndex: 12,

      oscillator: {
        type: "triangle"
      },

      envelope: {
        attack: 0.005,
        decay: 0.3,
        sustain: 0.2,
        release: 1.5
      },

      modulation: {
        type: "sine"
      },

      modulationEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0,
        release: 0.2
      }
    }
  ).toDestination();

  // -----------------------------
  // SYNTH FILTER
  // -----------------------------

  synthFilter = new Tone.Filter({

    frequency: 800,
    type: "lowpass",
    rolloff: -24,
    Q: 2

  }).toDestination();

  // -----------------------------
  // SYNTH INSTRUMENT
  // -----------------------------

  synthSynth = new Tone.PolySynth(
    Tone.FMSynth,
    {

      harmonicity: 3,

      modulationIndex: 10,

      oscillator: {
        type: "sawtooth"
      },

      envelope: {
        attack: 0.02,
        decay: 0.2,
        sustain: 0.5,
        release: 1.2
      },

      modulation: {
        type: "square"
      },

      modulationEnvelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.2,
        release: 0.4
      }
    }
  ).connect(synthFilter);
}

// -----------------------------
// DRUM FUNCTIONS
// -----------------------------

function playKick(time = Tone.now()) {

  kickSynth.triggerAttackRelease(
    "C1",
    "8n",
    time
  );
}

function playSnare(time = Tone.now()) {

  snareSynth.triggerAttackRelease(
    "16n",
    time
  );
}

function playHiHat(time = Tone.now()) {

  hihatSynth.triggerAttackRelease(
    "32n",
    time
  );
}

function playClap(time = Tone.now()) {

  clapSynth.triggerAttackRelease(
    "16n",
    time
  );
}

// -----------------------------
// PIANO FUNCTIONS
// -----------------------------

function playPianoNote(note) {

  pianoSynth.triggerAttack(note);
}

function releasePianoNote(note) {

  pianoSynth.triggerRelease(note);
}

function playPianoRecordedNote(
  note,
  duration,
  time
) {

  pianoSynth.triggerAttackRelease(
    note,
    duration,
    time
  );
}

// -----------------------------
// SYNTH FUNCTIONS
// -----------------------------

function playSynthNote(note) {

  synthFilter.frequency.value =
    synthFilterValue;

  synthSynth.set({
    modulationIndex: synthModValue
  });

  synthSynth.triggerAttack(note);
}

function releaseSynthNote(note) {

  synthSynth.triggerRelease(note);
}

function playSynthRecordedNote(
  note,
  duration,
  time
) {

  synthFilter.frequency.value =
    synthFilterValue;

  synthSynth.set({
    modulationIndex: synthModValue
  });

  synthSynth.triggerAttackRelease(
    note,
    duration,
    time
  );
}