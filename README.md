# humble
Humble is a simple graph reduction engine. I mean really simple. Basically a list of rules applied to a graph.

Rules can be applied lazily; top level only and it is upto the rules to reduce their arguments. Or eagarly; apply rules starting at the leaves and working your way up to the root.

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