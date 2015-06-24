//TODO: parse should take a symbol table (which it updates - returns updated version of)

function parse(str) {
	var sexpr = [[]];
	var word = '';
	var i = 0;
	var len = str.length;
	var c;

	function isSpace(c) {
		return (c === ' ' || c === '\n' || c === '\t');
	}

	function isJSON(c) {
		return (c === '"' || c === '[' || c === '{');
	}

	function parse_string() {
		i++;
		while (i < len) {
			c = str[i];
			if (c === '\\') {
				i++;
			} else if (c === '"') {
				break;
			}
			i++;
		}
		if (c !== '"') throw "Expected end of string";
	}

	function parse_object() {
		i++;
		while (i < len) {
			c = str[i];
			if (c === '}') break;
			else if (c === '[') parse_array();
			else if (c === '"') parse_string();
			else if (c === '{') parse_object();
			i++;
		}
		if (c !== '}') throw "Expected end of object";

	}

	function parse_array() {
		i++;
		while (i < len) {
			c = str[i];
			if (c === ']') break;
			else if (c === '[') parse_array();
			else if (c === '"') parse_string();
			else if (c === '{') parse_object();
			i++;
		}
		if (c !== ']') throw "Expected end of array";
	}

	function parse_json() {
		s = i;
		if (c === '"') parse_string();
		else if (c === '[') parse_array();
		else if (c === '{') parse_object();
		return JSON.parse(str.slice(s,i+1));
	}

	while (i < len) {
		c = str[i];
		if (c === '(')  {
			sexpr.push([]);
		} else if (c === ')') {
			if (word.length > 0){
				sexpr[sexpr.length-1].push(isNaN(word) ? word : (+word));
				word = '';
			}
			var temp = sexpr.pop();
			sexpr[sexpr.length-1].push(temp);
		} else if (isSpace(c)) {
			if (word.length > 0){
				sexpr[sexpr.length-1].push(isNaN(word) ? word : (+word));
				word = '';
			}
		} else if (isJSON(c)) {
			if (word.length > 0)
				throw "invalid expression: " + word + str.slice(i, i+10);
			var j = parse_json();
			sexpr[sexpr.length-1].push(j);
		} else {
			word += c;
		}
		i++;
	}
	if (word.length > 0)
		sexpr[sexpr.length-1].push(isNaN(word) ? word : (+word));
	return sexpr[0];
}

module.exports = {
	parse: parse,
}

console.log(parse("hello"));
console.log(parse("(hello 1 2 3)"));
console.log(parse('(hello "string" 77)'));
console.log(parse('(hello {"a":1, "b":2})'));