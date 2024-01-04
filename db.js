const path = require('path');
const { LocalIndex } = require('vectra');
const qavector = require('./qavector.json');
const OpenAI = require("openai");

const openai = new OpenAI();

const index = new LocalIndex(path.join(__dirname, 'index'));

module.exports.query = async function query(question) {
    if (!await index.isIndexCreated()) {
        await index.createIndex();
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
    const qe = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: question,
        encoding_format: "float",
    });
    return (await index.queryItems(qe.data[0].embedding, 3)).map(i => i.item.metadata);
};