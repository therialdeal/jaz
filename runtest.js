/**
 * Test runner.
 * Run with 'node runtest.js test1.js'
 */
const fs = require('fs')

// import 'jaz' - a small version of jasmine
// these you must implement
// run_suites should run all test suites.
const { describe, it, expect, beforeEach, afterEach, spyOn, run_suites} = require ('./jaz')

fs.readFile(process.argv[2], function (err, filecontent) {
   if (!err) {
     eval(filecontent.toString());
     run_suites ();
   }
});