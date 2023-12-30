const path = require('path');
const { LocalIndex } = require('vectra');
const qavector = require('./qavector.json');

const index = new LocalIndex(path.join(__dirname, 'index'));

async function main() {
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
    console.dir(await index.queryItems(qavector[0].qe, 3), { depth: 4 });
}
main();