// need to read in the sol file from the harddrive
// cannot require

const path = require('path');
const fs = require('fs');
const solc = require('solc');

const SingleIssueBallotPath = path.resolve(__dirname, 'contracts', 'SingleIssueBallot.sol'); //dirname set it to the directory
const source = fs.readFileSync(SingleIssueBallotPath, 'utf8');

//console.log(solc.compile(source, 1));

/*
go to command line and run 'node compile.js' to get the output compilation object
 */

module.exports = solc.compile(source, 1).contracts[':SingleIssueBallot'];
