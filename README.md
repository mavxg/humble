# humble
Humble is a simple graph reduction engine. I mean really simple. Basically a list of rules applied to a graph. The rules use the simplest pattern matching algorithm I could think of, naïve translation into `if` statements.

Rules can be applied lazily; top level only and it is upto the rules to reduce their arguments. Or eagarly; apply rules starting at the leaves and working your way up to the root.

## Defining rules

    (Rule (pattern here) result here)
    (Rule (pattern here) result here)
    (Rule (pattern) (guard) result body)

`compile` reduces to a string representing the body of a function. The pattern can be any expression; but some sub expressions have special reserved meanings to facilitate binding.

## Example

M-Expr definition:

    Fred(A_Number, B, C) -> A

S-Expr of the above M-Expr

    (Rule (Call (symbol Fred) (Pattern (Symbol A) (Blank (Symbol Number))) (Symbol B) (Symbol C)) (Symbol A))

Translates into a javascript rule:

    if (expr
     && expr[0] === 'Call'
     && equals(expr[1], ['Symbol','Fred'])
     && isType(expr[2], 'Number')
     && equals(expr[3], ['Symbol','B'])
     && equals(expr[4], ['Symbol','C'])
     && expr.length === 5)
        return expr[2]; //expr[2] -- bound to A because of (Pattern (Symbol A) (Blank (Symbol Number))) form.

With multiple rules the common prefixes are combined so the rules compile into nested ifs:

    Fred(A_Number, B, D) -> A + 1

Becomes:

    if (expr
     && expr[0] === 'Call'
     && equals(expr[1], ['Symbol','Fred'])
     && isType(expr[2], 'Number')
     && equals(expr[3], ['Symbol','B'])) {
        if (equals(expr[4], ['Symbol','C'])
         && expr.length === 5)
            return expr[2];
        if (equals(expr[4], ['Symbol','D'])
         && expr.length === 5)
            return ['Plus',expr[2],1];
     }


## Example with Guard

    Fred(A_Number, B, C) -> A
    Fred(A_Number, B, D) | A > 5 -> A * 2

Becomes:

    if (expr
     && expr[0] === 'Call'
     && equals(expr[1], ['Symbol','Fred'])
     && isType(expr[2], 'Number')
     && equals(expr[3], ['Symbol','B'])) {
        if (equals(expr[4], ['Symbol','C'])
         && expr.length === 5)
            return expr[2];
        if (equals(expr[4], ['Symbol','D'])
         && expr.length === 5
         && expr[2] > 5)
            return ['Plus',expr[2],1];
     }

## How does the compiler know when to use equals?

    expr[n] && expr[n].length === 2 && expr[n][0] === 'Symbol' && expr[n][1] === 'Fred'

It should use equals whenever there are no Patterns in the sub expression (after splitting off common sub expressions).

## Rule sets can be chained

Internally the rule compiler generates a javascript closure that returns a function:

    function my_rule_set(old_rules) {
    	return function(expr, env) {
			if (...) {
    			return [some new expression];
    		}
    		//.... many many more if statements
    		if (old_rules)
    			return old_rules(expr, env);
    		return expr;
    	}
    }

Assuming you have a set of rules `base_rule_set` you can make your reduce function by doing `env.reduce = my_rule_set(base_rule_set());`