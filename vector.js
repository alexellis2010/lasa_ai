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
        await new Promise((r) => setTimeout(r, 1000));
        obj.q = qa.q;
        obj.a = qa.a;
        obj.qe = qe.data[0].embedding;
        obj.ae = ae.data[0].embedding;
        out.push(obj);
    }
    console.log(JSON.stringify(out));
}

main();
