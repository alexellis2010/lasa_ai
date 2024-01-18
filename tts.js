/**
 * This library turns the text input into speech done by the language model tts-1, using the Onyx voice
 */
const sdl = require('@kmamal/sdl');
const { Lame, } = require('node-lame');
const OpenAI = require("openai");  

const openai = new OpenAI();
// Convert text to speech and then plays it through the speaker
module.exports.tts = async function tts(input) {
    // Says which tts model and which voice, in this case, Onyx
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input,
    });
    // Wait for the mp3 data and decode it into raw audio
    const mp3buffer = Buffer.from(await mp3.arrayBuffer());
    const decoder = new Lame({ output: 'buffer', bitwidth: 32, 'to-mono': true, 'little-endian': true}).setBuffer(mp3buffer)
    await decoder.decode();
    // Connect to the speakers and enqueue the raw audio to play
    const buffer = decoder.getBuffer();
    const playbackInstance = sdl.audio.openDevice({ type: 'playback' }, { channels: 1, format: 's32lsb', frequency: 12000, });
    playbackInstance.enqueue(buffer);
    playbackInstance.play();
    // This promise puts the function on hold while the audio is playing
    await new Promise((r) => i = setInterval(() => {
        if (playbackInstance.queued === 0) {
            playbackInstance.close();
            clearInterval(i);
            r();
        }
    }, 200));
};