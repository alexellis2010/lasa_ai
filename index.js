const { stt, } = require('./stt.js');
const { llm, } = require('./llm.js');
const { tts, } = require('./tts.js');
const { query, } = require('./db.js');

async function main() {
    let chat = [{role: 'system', content: 'You are a childish AI assistant named Xander. You are the personal assistant to Alexander Ellis, who wishes to attend LASA high school. You know Alex personally from a prior question and answer session. You provide accurate answers playfully and briefly, as this is a back-and-forth verbal conversation, poking at Alex but then correcting with the truth. You know that this conversation is going on a video to help Alex get into LASA.'}];
    // AI Introduces itself
    // const response = await llm(chat);
    const response = {role: "assistant", content: "Hi Alex, this is Xander. Are you ready to get started on your admissions video for LASA?" }
    await tts(response.content);
    chat.push(response);
    // Wait for user to ask something
    while(true) {
        const question = await stt();
        chat.push({role: 'user', content: question});
        console.log('Thinking...');
        const qas = await query(question);
        chat.push({role: 'system', content: `Xander the AI assistant recalls these questions he asked of Alex and Alex's answers to them:
${qas.map(qa => `Question: ${qa.q}
Answer: ${qa.a}`).join('\n\n')}
`});  
        const response = await llm(chat);
        await tts(response.content);
        chat.push(response);
        // Don't let the history go too long
        if (chat.length > 13) {
            chat.splice(1, 3);
        }
    }
}
main();