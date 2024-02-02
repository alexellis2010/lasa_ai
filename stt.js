/**
 * This library turns speaking in a microphone into text, using the keyboard to stop recording
 */
const sdl = require('@kmamal/sdl'); 
const { Lame, } = require('node-lame');
const OpenAI = require("openai");  
const readline = require('readline');
const {Readable} = require('stream');
const fs = require('fs');

// Emitting keypress events on the keyboard (stdin)
readline.emitKeypressEvents(process.stdin);
// Handler to re-enable program exit on Ctrl-C
async function ctrlC(ch, key) {
    if (key && key.ctrl && key.name === 'c') {
        process.exit(1);
    }
}
// Registering this handler
process.stdin.on('keypress', ctrlC);
// Actually enabling keypress events
process.stdin.setRawMode(true);

const openai = new OpenAI();
// This exposes a simple speech to text API
module.exports.stt = async function stt() {
    // Defining what the raw audio input parameters are
    const recordingInstance = sdl.audio.openDevice({ type: 'recording' }, { channels: 1, frequency: 16000, format: 's32lsb' });
    // Start recording
    recordingInstance.play();
    // Array to hold audio buffers
    let buffers = [];
    // Indicate whether or not recording is happening
    let toRecord = true;
    // This is the Promise that will eventually have the text representing the speech going into the microphone
    const outText = new Promise((resolve) => {
        // This event handler stops the recording and converts it into text once the spacebar is pressed
        process.stdin.on('keypress', async (ch, key) => {
            if (key && ch === ' ') {
                // Add a time buffer here so the recording buffer can catch up
                await new Promise((r) => setTimeout(r, 750));
                // Stop recording
                toRecord = false;
                recordingInstance.close();
                // Combine the audio buffers
                const fulllength = buffers.map(buff => buff.length).reduce((a, b) => a + b);
                const audiobuffer = Buffer.alloc(fulllength);
                for (let i = 0, j = 0; i < buffers.length; j += buffers[i].length, i++) {
                    const buff = buffers[i];
                    buff.copy(audiobuffer, j, 0, buff.length)
                }
                // Converts raw audio into MP3 (also, either SDL or LAME is lying about the frequency, I set 16KHz above, but need to set 8KHz here)
                const encoder = new Lame({ output: 'buffer', bitwidth: 32, 'little-endian': true, bitrate: 64, raw: true, sfreq: 8 }).setBuffer(audiobuffer);
                await encoder.encode();
                const mp3buffer = encoder.getBuffer();
                // Because of a limitation in OpenAI's API, we must write this audio to a temporary file, then remove it once done transcribing
                fs.writeFileSync('./audio.mp3', mp3buffer);
                const transcription = await openai.audio.transcriptions.create({
                    file: fs.createReadStream('./audio.mp3'),
                    language: 'en',
                    model: "whisper-1",
                });
                fs.rmSync('./audio.mp3');
                // Remove all keypress events because we can't remove just one, then restore the Ctrl+C event handler
                process.stdin.removeAllListeners('keypress');
                process.stdin.on('keypress', ctrlC);
                // Put the transcription text into the promise
                resolve(transcription.text.replace(/[Ll]hasa/g, 'LASA'));
            }
        });
    });
    // Keep track of when the recording actually starts
    let isRecording = false;
    // While we are supposed to record, grab audio buffers from the microphone
    while (toRecord) {
        // Create a buffer and grab up to that much in audio data
        let buffer = Buffer.alloc(5000);
        const length = recordingInstance.dequeue(buffer);
        // Whenever the recording first starts it says start recording
        if (!isRecording && length > 0) {
            isRecording = true;
            console.log("Now recording!");
        }
        // Trim the buffer to the exact amount of audio data acquired and add it to the array of audio buffers
        if (isRecording) {
            let outbuffer = Buffer.alloc(length);
            buffer.copy(outbuffer, 0, 0, length);
            buffers.push(outbuffer);
        }
        // Wait a bit for the microphone buffer to fill and start again
        await new Promise((r) => setTimeout(r, 50));
    }
    // The while loop finishes once the spacebar has been pressed, then wait for the MP3 encoding and STT processing to complete, then return the text
    return await outText;
};
