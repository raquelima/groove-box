// -----------------------------
// AUDIO EXPORT
// -----------------------------

let finalSongRecorder;

let isRecordingExport = false;

// -----------------------------
// SETUP RECORDER
// -----------------------------

function setupExportRecorder() {

  finalSongRecorder =
    new Tone.Recorder();

  Tone.Destination.connect(
    finalSongRecorder
  );
}

// -----------------------------
// START RECORDING
// -----------------------------

async function startFinalSongRecording() {

  if (isRecordingExport) {
    return;
  }

  await Tone.start();

  finalSongRecorder.start();

  isRecordingExport = true;

  console.log(
    "FINAL SONG RECORDING STARTED"
  );
}

// -----------------------------
// WAV TO MP3
// -----------------------------

async function convertBlobToMp3(blob) {

  // AUDIO CONTEXT
  const audioContext =
    new AudioContext();

  // ARRAY BUFFER
  const arrayBuffer =
    await blob.arrayBuffer();

  // DECODE AUDIO
  const audioBuffer =
    await audioContext.decodeAudioData(
      arrayBuffer
    );

  // CHANNEL DATA
  const samples =
    audioBuffer.getChannelData(0);

  // CONVERT FLOAT -> INT16
  const sampleBuffer =
    new Int16Array(samples.length);

  for (
    let i = 0;
    i < samples.length;
    i++
  ) {

    let s = Math.max(
      -1,
      Math.min(1, samples[i])
    );

    sampleBuffer[i] =
      s < 0
        ? s * 0x8000
        : s * 0x7FFF;
  }

  // MP3 ENCODER
  const mp3Encoder =
    new lamejs.Mp3Encoder(
      1,
      audioBuffer.sampleRate,
      128
    );

  let mp3Data = [];

  const blockSize = 1152;

  for (
    let i = 0;
    i < sampleBuffer.length;
    i += blockSize
  ) {

    const chunk =
      sampleBuffer.subarray(
        i,
        i + blockSize
      );

    const mp3buf =
      mp3Encoder.encodeBuffer(
        chunk
      );

    if (mp3buf.length > 0) {

      mp3Data.push(
        new Int8Array(mp3buf)
      );
    }
  }

  // FINALIZE
  const endBuf =
    mp3Encoder.flush();

  if (endBuf.length > 0) {

    mp3Data.push(
      new Int8Array(endBuf)
    );
  }

  // MP3 BLOB
  return new Blob(
    mp3Data,
    { type: 'audio/mp3' }
  );
}

// -----------------------------
// STOP + DOWNLOAD
// -----------------------------

async function stopFinalSongRecording() {

  if (!isRecordingExport) {
    return;
  }

  // STOP RECORDER
  const wavRecording =
    await finalSongRecorder.stop();

  isRecordingExport = false;

  console.log(
    "CONVERTING TO MP3..."
  );

  // -----------------------------
  // CONVERT TO MP3
  // -----------------------------

  const mp3Blob =
    await convertBlobToMp3(
      wavRecording
    );

  // -----------------------------
  // DOWNLOAD
  // -----------------------------

  const url =
    URL.createObjectURL(mp3Blob);

  const anchor =
    document.createElement("a");

  anchor.download =
    "groovebox_song.mp3";

  anchor.href = url;

  anchor.type = "audio/mp3";

  anchor.click();

  console.log(
    "FINAL SONG MP3 DOWNLOADED"
  );
}

// -----------------------------
// EXPORT FINAL SONG
// -----------------------------

async function exportFinalSong() {

  // PREVENT DOUBLE EXPORT
  if (isRecordingExport) {
    return;
  }

  // -----------------------------
  // RESET PLAYBACK
  // -----------------------------

  stopFinalSongPlayback();

  await Tone.start();

  // -----------------------------
  // START RECORDING
  // -----------------------------

  await startFinalSongRecording();

  // -----------------------------
  // START SONG
  // -----------------------------

  startFinalSongPlayback();

  // -----------------------------
  // SONG LENGTH
  // -----------------------------

  let songDuration =

    (
      Tone.Time("16n")
      .toSeconds()

      * totalSteps
    )

    * 1000;

  console.log(
    "EXPORT LENGTH:",
    songDuration
  );

  // -----------------------------
  // STOP + DOWNLOAD
  // -----------------------------

  setTimeout(async () => {

    stopFinalSongPlayback();

    await stopFinalSongRecording();

  }, songDuration + 500);
}