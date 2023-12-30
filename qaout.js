const qas = require('./qa.json');

for (const qa of qas) {
    console.log("Question:", qa.q);
    console.log("Answer:", qa.a);
}