const sdl = require('@kmamal/sdl');
const { Lame, } = require('node-lame');
const OpenAI = require("openai");  

const openai = new OpenAI();

module.exports.tts = async function tts(input) {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input,
    });
    const mp3buffer = Buffer.from(await mp3.arrayBuffer());
    const decoder = new Lame({ output: 'buffer', bitwidth: 32, 'to-mono': true, 'little-endian': true}).setBuffer(mp3buffer)
    await decoder.decode();
    const buffer = decoder.getBuffer();
    const playbackInstance = sdl.audio.openDevice({ type: 'playback' }, { channels: 1, format: 's32lsb', frequency: 12000, });
    playbackInstance.enqueue(buffer);
    playbackInstance.play();
    await new Promise((r) => i = setInterval(() => {
        if (playbackInstance.queued === 0) {
            playbackInstance.close();
            clearInterval(i);
            r();
        }
    }, 200));
};