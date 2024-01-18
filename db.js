/**
 * Initializes the Vectra vector database and provides an easy query function
 */
const path = require('path');
const { LocalIndex } = require('vectra');
const qavector = require('./qavector.json');
const OpenAI = require("openai");

// global instance of the openai object 
const openai = new OpenAI();
// creating a Vectra vector database
const index = new LocalIndex(path.join(__dirname, 'index'));
// This function returns three questions and their answers like the question provided
module.exports.query = async function query(question) {
    // If the vector database is not indexed, create one
    if (!await index.isIndexCreated()) {
        await index.createIndex();
        // Populate the new index
        for (const qa of qavector) {
            await index.insertItem({
                vector: qa.qe,
                metadata: { q: qa.q, a: qa.a }
            });
            await index.insertItem({
                vector: qa.ae,
                metadata: { q: qa.q, a: qa.a }
            });
        }
    }
    // Get a vector embedding for the question provided
    const qe = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: question,
        encoding_format: "float",
    });
    // Queries the vector database for three records most like the question, then returns only the question and answer objects
    return (await index.queryItems(qe.data[0].embedding, 3)).map(i => i.item.metadata);
};