const sdl = require('@kmamal/sdl');
const { Lame, } = require('node-lame');
const OpenAI = require("openai");  
const readline = require('readline');
const {Readable} = require('stream');
const fs = require('fs');

readline.emitKeypressEvents(process.stdin);

async function ctrlC(ch, key) {
    if (key && key.ctrl && key.name === 'c') {
        process.exit(1);
    }
}

process.stdin.on('keypress', ctrlC);

process.stdin.setRawMode(true);

const openai = new OpenAI();

module.exports.stt = async function stt() {
    const recordingInstance = sdl.audio.openDevice({ type: 'recording' }, { channels: 1, frequency: 16000, format: 's32lsb' });
    recordingInstance.play();
    let buffers = [];
    let toRecord = true;
    const outText = new Promise((resolve) => {
        process.stdin.on('keypress', async (ch, key) => {
            if (key && ch === ' ') {
                await new Promise((r) => setTimeout(r, 750));
                toRecord = false;
                recordingInstance.close();
                const fulllength = buffers.map(buff => buff.length).reduce((a, b) => a + b);
                const audiobuffer = Buffer.alloc(fulllength);
                for (let i = 0, j = 0; i < buffers.length; j += buffers[i].length, i++) {
                    const buff = buffers[i];
                    buff.copy(audiobuffer, j, 0, buff.length)
                }
                const encoder = new Lame({ output: 'buffer', bitwidth: 32, 'little-endian': true, bitrate: 64, raw: true, sfreq: 8 }).setBuffer(audiobuffer);
                await encoder.encode();
                const mp3buffer = encoder.getBuffer();
                fs.writeFileSync('./audio.mp3', mp3buffer);
                const transcription = await openai.audio.transcriptions.create({
                    file: fs.createReadStream('./audio.mp3'),
                    language: 'en',
                    model: "whisper-1",
                });
                fs.rmSync('./audio.mp3');
                
                process.stdin.removeAllListeners('keypress');
                process.stdin.on('keypress', ctrlC);
                resolve(transcription.text);
            }
        });
    });
    let isRecording = false;
    while (toRecord) {
        let buffer = Buffer.alloc(5000);
        const length = recordingInstance.dequeue(buffer);
        if (!isRecording && length > 0) {
            isRecording = true;
            console.log("Now recording!");
        }
        if (isRecording) {
            let outbuffer = Buffer.alloc(length);
            buffer.copy(outbuffer, 0, 0, length);
            buffers.push(outbuffer);
        }
        await new Promise((r) => setTimeout(r, 100));
    }
    return await outText;
};
