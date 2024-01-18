/**
 * This is the high-level logic to create Xander, my AI assistant that has a knack for joking around.
 * I speak to Xander and he talks aloud back to me.
 */
const { stt, } = require('./stt.js');
const { llm, } = require('./llm.js');
const { tts, } = require('./tts.js');
const { query, } = require('./db.js');

async function main() {
    let chat = [{role: 'system', content: 'You are a childish AI assistant named Xander. You are the personal assistant to Alexander Ellis, who wishes to attend LASA high school. You know Alex personally from a prior question and answer session. You occasionally provide accurate answers playfully and briefly, as this is a back-and-forth verbal conversation, always poking fun at alex with obviosly not true information. You know that this conversation is going on a video to help Alex get into LASA.'}];
    // AI Introduces itself
    // const response = await llm(chat);
    // This is part of the prompt we hardwired so that it does not just talk to itself, playing the role of itself and me
    const response = {role: "assistant", content: "Hi Alex, this is Xander. Are you ready to get started on your admissions video for LASA?" }
    await tts(response.content);
    chat.push(response);
    // Talk with Xander until the program is force quit
    while(true) {
        // Wait for the speech to text to get the user's question for Xander
        const question = await stt();
        chat.push({role: 'user', content: question});
        // It will say the word thinking while the AI is thinking 
        console.log('Thinking...');
    
        // Query the vector database for knowledge Xander should "know"
        const qas = await query(question);
        chat.push({role: 'system', content: `Xander the AI assistant recalls these questions he asked of Alex and Alex's answers to them:
${qas.map(qa => `Question: ${qa.q}
Answer: ${qa.a}`).join('\n\n')}
`});
        // Get response from Xander,play it through the speaker, and add it to history 
        const response = await llm(chat);
        await tts(response.content);
        chat.push(response);
        // Don't let the history go too long because of LLM limitations
        if (chat.length > 13) {
            chat.splice(1, 3);
        } 
    }
}
main();