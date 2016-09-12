
let suites = [];
let currentSuite;
let specs = {};
let results = {};
let passes = 0;
let failures = 0;
let specFailures = 0;
let currentSpy;

/*
suite class
*/
let Suite = function(desc) {
	this.description = desc;
	this.specs = [];
    this.beforeEach;
    this.afterEach;
};
Suite.prototype.addSpec = function(desc,func) {
	let spec = function(desc,func){
		this.desc = desc;
		this.func= func;
	};
    s = new spec(desc,func);
	currentSuite.specs.push(s);
};
Suite.prototype.addBeforeEach = function(func) {
    currentSuite.beforeEach = func;
};
Suite.prototype.addAfterEach = function(func) {
    currentSuite.afterEach = func;
};

/////end of suite class//////

/*
spy class
*/
let Spy = function(obj,method) {
    let spy = {
        count: 0,
        args: [],
        andFlag : false,
        get and() {
			this.andFlag = true;
			return this;
		},
        callThrough: function () {
            // if (this.andFlag) {
            //     return obj[method].apply(obj,this.args);
            // }
        }
    };

    let original = obj[method];
    obj[method] = function creeping() {
        let args = [].slice.call(arguments);
        spy.count++;
        spy.args.push(args);
        if (spy.andFlag) {
            return original.apply(obj, args);
        }
    };
    return spy;
};
/////// end of spy class //////

let describe = function(desc,func) {
	currentSuite = new Suite(desc);
	suites.push(currentSuite);
	func();
};

let it = function(desc,func) {
	currentSuite.addSpec(desc,func);
};

let run_suites = function() {
	for (let suite of suites) {
        console.log("Running suite:",suite.description);      
        for (let spec of suite.specs) {
            console.log("Testing that:",spec.desc);
            let thisObject = {};
            if (suite.beforeEach) {
                suite.beforeEach.apply(thisObject);
            }
            spec.func.apply(thisObject);
            if (suite.afterEach) {
                suite.afterEach.apply(thisObject);
            }
            if (failures > 0) {
                specFailures++;
            }
            failures = 0;
        }
        console.log("Summary for ",suite.description,": ",
        suite.specs.length, " specs and ",specFailures, " failures");
	}
    
};



let expect = function(actualValue) {
	let expectationObject = {
		notFlag : false,
		get not() {
			this.notFlag = true;
			return this;
		},
		toBe: function (expectedValue) {
            let final;
			if (this.notFlag) {
				final = !(actualValue === expectedValue);
			} else {
			    final = (actualValue === expectedValue);
            }
            testCounter(final);
            return final;
		},
        toEqual: function (expectedValue) {
            let final;
            let expectJSON = JSON.stringify(expectedValue);
            let actualJSON = JSON.stringify(actualValue);
            if (this.notFlag) {
                final = !(expectJSON === actualJSON);
            } else {
                final = (expectJSON === actualJSON);
            }
            testCounter(final);
            return final;
        },
        toMatch: function(expectedValue) {
            let final;
            let expectRegEx = new RegExp(expectedValue);
            if (this.notFlag) {
                final = !(expectRegEx.test(actualValue));
            } else {
                final = expectRegEx.test(actualValue);
            }
            testCounter(final);
            return final;
        },
        toBeDefined: function() {
            let final;
            if (this.notFlag) {
                final = !(typeof actualValue !== 'undefined');
            } else {
                final = (typeof actualValue !== 'undefined');
            }
            testCounter(final);
            return final;
        },
        toBeUndefined: function() {
            let final;
            if (this.notFlag) {
                final = !(typeof actualValue === 'undefined');
            } else {
                final = (typeof actualValue === 'undefined');
            }
            testCounter(final);
            return final;
        },
        toBeNull: function() {
            let final;
            if (this.notFlag) {
                final = !(actualValue === null);
            } else {
                final = (actualValue === null);
            }
            testCounter(final);
            return final;
        },
        toBeTruthy: function() {
            let final;
            if (this.notFlag) {
                final = !(!!actualValue);
            } else {
                final = (!!actualValue);
            }
            testCounter(final);
            return final;
        },
        toBeFalsy: function() {
            let final;
            if (this.notFlag) {
                final = !(!!!actualValue);
            } else {
                final = (!!!actualValue);
            }
            testCounter(final);
            return final;
        },
        toContain: function(toContainValue) {
            let final;
            if (this.notFlag) {
                final = !(actualValue.includes(toContainValue));
            } else {
                final = (actualValue.includes(toContainValue));            
            }
            testCounter(final);
            return final;
        },
        toBeLessThan: function(expectedValue) {
            let final;
            if (this.notFlag) {
                final = !(actualValue < expectedValue);
            } else {
                final = (actualValue < expectedValue);
            }
            testCounter(final);
            return final;
        },
        toBeGreaterThan: function(expectedValue) {
            let final;
            if (this.notFlag) {
                final = !(actualValue > expectedValue);
            } else {
                final = (actualValue > expectedValue);
            }
            testCounter(final);
            return final;
        },
        toBeCloseTo: function(expectedValue,precision) {
            let final;
            if (this.notFlag) {
                final = !(Math.abs(expectedValue-actualValue) < (Math.pow(10,-precision)/2));
            } else {
                final = (Math.abs(expectedValue-actualValue) < (Math.pow(10,-precision)/2));
            }
            testCounter(final);
            return final;
        },
        toThrow: function() {
            let final;
            if (typeof actualValue != 'function') {
                final = true;
                if (this.notFlag) {
                    final = false;
                }
                testCounter(final);
                return final;
            } 
            try {
                actualValue();
            } catch (e) {
                final = true;
                if (this.notFlag) {
                    final = false;
                }
                testCounter(final);
                return final;
            } 
            final = false;
            if (this.notFlag) {
                final = true;
            }
            testCounter(final);
            return final;
        },
        toHaveBeenCalled: function() {
            let final = false;
            if (typeof actualValue !== 'undefined') {
                if (actualValue.name === 'creeping') {
                    final = true;
                }
            }
            testCounter(final);
            return final;
        },
        toHaveBeenCalledWith: function() {
            let final = false;

            var args = Array.prototype.slice.call(arguments, 0);

            
            for (let spya of currentSpy.args) {
                if (JSON.stringify(args) === JSON.stringify(spya)) {
                    final = true;
                    break;
                }
            }
            if (this.notFlag) {
                final = !final;
            }
            testCounter(final);
            return final;
        }
	}
	return expectationObject;
};

let testCounter = function(final) {
    if (final === true) {
        passes++;
    } else {
        failures++;
    }
}

let beforeEach = function(func) {
    currentSuite.addBeforeEach(func);
	
};

let afterEach = function(func) {
    currentSuite.addAfterEach(func);
	
};

let spyOn = function(obj,func) {
    currentSpy = Spy(obj,func);
    return currentSpy;
	
};


module.exports = { describe, run_suites, it, expect, beforeEach, afterEach, spyOn }
