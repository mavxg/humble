var parse = require('../lib/parser');

console.log(parse("hello"));
console.log(parse("(hello 1 2 3)"));
console.log(parse('(hello "string" 77)'));
console.log(parse('(hello {"a":1, "b":2})'));