// -----------------------------
// SERIAL CONNECTION
// -----------------------------

let serialPort;
let serialReader;

let serialBuffer = "";

let isArduinoConnected = false;
let isArduinoError = false;

// -----------------------------
// ARDUINO STATE
// -----------------------------

let arduinoButtons = {
  1: false,
  2: false,
  3: false,
  4: false,
  5: false,
  6: false
};

let dimmer1Value = 0;
let dimmer2Value = 0;

let masterVolume = 100;

let pressureValue = 0;
let pressurePressed = false;

// -----------------------------
// REAL HARDWARE CALIBRATION
// -----------------------------

const BPM_DIMMER_MIN = 91;
const BPM_DIMMER_MAX = 1018;

const VOL_DIMMER_MIN = 93;
const VOL_DIMMER_MAX = 1023;

// -----------------------------
// PICKUP MODE
// -----------------------------

let bpmPickupReady = false;
let volumePickupReady = false;

const PICKUP_THRESHOLD = 8;

// -----------------------------
// PRESSURE SWITCH
// -----------------------------

let pressureSwitchActive = false;

const PRESSURE_THRESHOLD = 8;

// -----------------------------
// MENU BUTTON LOCK
// -----------------------------

let menuButtonsEnabled = true;

// -----------------------------
// CONNECT SERIAL
// -----------------------------

async function connectArduino() {

  try {

    isArduinoError = false;

    serialPort =
      await navigator.serial.requestPort();

    await serialPort.open({
      baudRate: 9600
    });

    serialReader =
      serialPort.readable.getReader();

    isArduinoConnected = true;

    isArduinoError = false;

    bpmPickupReady = false;
    volumePickupReady = false;

    console.log(
      "Arduino Connected"
    );

    readArduinoLoop();

  } catch (error) {

    console.error(error);

    isArduinoConnected = false;

    isArduinoError = true;
  }
}

// -----------------------------
// SERIAL READ LOOP
// -----------------------------

async function readArduinoLoop() {

  while (true) {

    const {
      value,
      done
    } = await serialReader.read();

    if (done) {

      isArduinoConnected = false;

      break;
    }

    let chunk =
      new TextDecoder().decode(value);

    serialBuffer += chunk;

    let lines =
      serialBuffer.split('\n');

    serialBuffer = lines.pop();

    for (let line of lines) {

      line = line.trim();

      if (line.length > 0) {

        handleArduinoMessage(line);
      }
    }
  }
}

// -----------------------------
// MESSAGE PARSER
// -----------------------------

function handleArduinoMessage(message) {

  console.log(message);

  // BUTTONS
  if (
    message.startsWith("BTN:")
  ) {

    let parts =
      message.split(":");

    let buttonId =
      int(parts[1]);

    let buttonState =
      int(parts[2]);

    handleArduinoButton(
      buttonId,
      buttonState
    );

    return;
  }

  // DIMMERS
  if (
    message.startsWith("DIM:")
  ) {

    let parts =
      message.split(":");

    let dimmerId =
      int(parts[1]);

    let value =
      int(parts[2]);

    handleArduinoDimmer(
      dimmerId,
      value
    );

    return;
  }

  // PRESSURE
  if (
    message.startsWith("PRESS:")
  ) {

    let value =
      int(
        message.split(":")[1]
      );

    handleArduinoPressure(value);

    return;
  }
}

// -----------------------------
// BUTTON HANDLER
// -----------------------------

function handleArduinoButton(
  id,
  state
) {

  // -----------------------------
  // IMPORTANT:
  // 0 = PRESSED
  // 1 = RELEASED
  // -----------------------------

  let isPressed =
    state === 0;

  // -----------------------------
  // MENU DIRECT NAVIGATION
  // -----------------------------

  if (
    currentPage === "menu" &&
    menuButtonsEnabled
  ) {

    if (isPressed) {

      if (id === 1) {

        currentPage = "DRUMS";
      }

      if (id === 2) {

        currentPage = "SYNTH";
      }

      if (id === 3) {

        currentPage = "PIANO";
      }

      // PREVENT SAME PRESS
      // FROM TRIGGERING NOTES
      menuButtonsEnabled = false;
    }

  } else {

    // NORMAL BUTTONS
    arduinoButtons[id] =
      isPressed;
  }

  // RESET LOCK
  if (!isPressed) {

    menuButtonsEnabled = true;

    arduinoButtons[id] = false;
  }

  console.log(
    "BUTTON",
    id,
    state,
    isPressed
  );
}

// -----------------------------
// DIMMER HANDLER
// -----------------------------

function handleArduinoDimmer(
  id,
  value
) {

  // BPM
  if (id === 1) {

    dimmer1Value = value;

    if (value < BPM_DIMMER_MIN) {
      value = BPM_DIMMER_MIN;
    }

    if (value > BPM_DIMMER_MAX) {
      value = BPM_DIMMER_MAX;
    }

    let incomingBpm = floor(
      map(
        value,
        BPM_DIMMER_MIN,
        BPM_DIMMER_MAX + 1,
        60,
        241
      )
    );

    incomingBpm = constrain(
      incomingBpm,
      60,
      240
    );

    if (!bpmPickupReady) {

      if (
        value === BPM_DIMMER_MIN ||
        value === BPM_DIMMER_MAX
      ) {

        bpmPickupReady = true;

      } else if (

        abs(incomingBpm - bpm) <
        PICKUP_THRESHOLD

      ) {

        bpmPickupReady = true;
      }

      if (!bpmPickupReady) {
        return;
      }
    }

    bpm = incomingBpm;

    Tone.Transport.bpm.rampTo(
      bpm,
      0.05
    );
  }

  // VOLUME
  if (id === 2) {

    dimmer2Value = value;

    if (value < VOL_DIMMER_MIN) {
      value = VOL_DIMMER_MIN;
    }

    if (value > VOL_DIMMER_MAX) {
      value = VOL_DIMMER_MAX;
    }

    let incomingVolume = floor(
      map(
        value,
        VOL_DIMMER_MIN,
        VOL_DIMMER_MAX + 1,
        0,
        101
      )
    );

    incomingVolume = constrain(
      incomingVolume,
      0,
      100
    );

    if (!volumePickupReady) {

      if (
        value === VOL_DIMMER_MIN ||
        value === VOL_DIMMER_MAX
      ) {

        volumePickupReady = true;

      } else if (

        abs(
          incomingVolume -
          masterVolume
        ) < PICKUP_THRESHOLD

      ) {

        volumePickupReady = true;
      }

      if (!volumePickupReady) {
        return;
      }
    }

    masterVolume =
      incomingVolume;

    let volumeDb;

    if (masterVolume === 0) {

      volumeDb = -Infinity;

    } else {

      volumeDb = map(
        masterVolume,
        1,
        100,
        -40,
        0
      );
    }

    Tone.Destination.volume.rampTo(
      volumeDb,
      0.05
    );
  }
}

// -----------------------------
// PRESSURE HANDLER
// -----------------------------

function handleArduinoPressure(value) {

  pressureValue = value;

  // DEBUG
  console.log(
    "PRESSURE:",
    value
  );

  if (
    value >= PRESSURE_THRESHOLD
  ) {

    pressurePressed = true;

    pressureSwitchActive = true;

  } else {

    pressurePressed = false;

    pressureSwitchActive = false;
  }
}