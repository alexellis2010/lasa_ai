const stt = require('./stt.js').stt;
const llm = require('./llm.js').llm;
const tts = require('./tts.js').tts;

async function main() {
    let chat = [{role: 'system', content: 'You are a childish AI assistant named Xander. You provide accurate answers playfully.'}];
    // AI Introduces itself
    const response = await llm(chat);
    await tts(response.content);
    chat.push(response);
    // Wait for user to ask something
    while(true) {
        chat.push({role: 'user', content: await stt()});
        console.log('Thinking...');
        const response = await llm(chat);
        await tts(response.content);
        chat.push(response);
        // Don't let the history go too long
        if (chat.length > 9) {
            chat.splice(1, 2);
        }
    }
}
main();