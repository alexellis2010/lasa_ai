console.log("goodbye world")

console.log([1, 2, 3]);

for (const element of [1, 2, 3]) {
    console.log(element * element);
}

const obj = {"q": "How do you even?", "a": "I odd", "z": [1, 2, 3]};

console.log(obj);

for (const key of Object.keys(obj)) {
    console.log(key);
    console.log(obj[key]);
    for (const char of obj[key]) {
        console.log(char);
        if (char instanceof String) console.log(char.charCodeAt());
    }
}

console.log([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]);