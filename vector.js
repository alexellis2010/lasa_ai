/**
 * This file attaches vector embeddings for the q's and a's to each qa object.
 * It is used to construct the qavector.json file. This program creates the vectors
 * for the vector database.
 * 
 * Usage: node vector.js > qavector.json
 */
const qas = require('./qa.json');
const OpenAI = require("openai");

const openai = new OpenAI();

async function main() {
    let out = [];
    for (const qa of qas) {
        let obj = {};
        const qe = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: qa.q,
            encoding_format: "float",
        });
        const ae = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: qa.a,
            encoding_format: "float",
        });
        // The lowest rate for the embeddings API is [3 calls a second](https://platform.openai.com/docs/guides/rate-limits/usage-tiers?context=tier-free),
        // so we limit ourselves to approximately 2 calls a second just to play it safe
        await new Promise((r) => setTimeout(r, 1000));
        // Attach all of the relevant properties to the output object and add it to the output array
        obj.q = qa.q;
        obj.a = qa.a;
        obj.qe = qe.data[0].embedding;
        obj.ae = ae.data[0].embedding;
        out.push(obj);
    }
    // Print the output array as a JSON string
    console.log(JSON.stringify(out));
}

main();
