const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider(); // replaces the HDWalletProvider with a local copy

/*
To make note for future misunderstandings, Ganache is a local HDWalletProvider
When using HDWalletProvider we have limitations in this version that ganache
doesn't have, such as pulling multiple accounts in the 'accounts' array

This is why I have to list the accounts in deploy.js, because otherwise they're
deployed as 0x000000000000...000
 */

/*
Current Status:
- all tests passing and valid for MVP one

Next Steps
- add test for resetBallot()
*/
const web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');


let ballot;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts(); // get the web3 shell accounts to test
  ballot = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: '0x' + bytecode, // deploy smart contract bytecode
      arguments: ['test', [ accounts[1], accounts[2] ] ] // with our parameters
    })
    .send({ from: accounts[0], gas: '1000000'}); // from account one
});

describe('Single Issue Ballot Contract', () => {
  it('successfully deploys', () => {
    assert.ok(ballot.options.address); // address exists
  });

  it('successfully initalized state variables', async () => {
    const initalizedBool = await ballot.methods.ballotInitialized().call({
      from: accounts[0]
    });

    assert(initalizedBool);

    const closedBool = await ballot.methods.ballotClosed().call({
      from: accounts[0]
    });

    assert(!closedBool);
  });

  it('successfully adds the invitees', async () => {
    const voters = await ballot.methods.getVotersArray().call({
      from: accounts[0]
    });

    assert.equal(voters[0], accounts[1]);
    assert.equal(voters[1], accounts[2]);
  });

  it('allows an invited voter to cast a vote', async () => {

    const vote = 1; // a yes vote

    // check voteBalance before casting the vote, store it
    const proposalBeforeVote = await ballot.methods.proposal().call({
          from: accounts[0]
        });

    voteBalanceBefore = Number(proposalBeforeVote.voteBalance); // string -> int

    // send new vote
    await ballot.methods.vote(vote).send({
      from: accounts[1],
    });

    // check voteBalance after casting the vote, assert equality
    const proposalAfterVote = await ballot.methods.proposal().call({
      from: accounts[0]
    });

    voteBalanceAfter = Number(proposalAfterVote.voteBalance); // string -> int

    assert.equal(voteBalanceAfter, (voteBalanceBefore+vote));

  });

  it('stops an invalid vote', async () => {
    const vote = 69;

    const proposalBeforeVote = await ballot.methods.proposal().call({
          from: accounts[0]
        });

    voteBalanceBefore = proposalBeforeVote.voteBalance;

    try { // try to send a vote that is out of range
      await ballot.methods.vote(vote).send({
        from: accounts[1],
      });
    } catch (err) {
      assert(err) // this should be the revert rejection from my require statement
    }

    const proposalAfterVote = await ballot.methods.proposal().call({
      from: accounts[0]
    });

    voteBalanceAfter = proposalAfterVote.voteBalance;

    assert.equal(voteBalanceAfter, voteBalanceBefore);
  });

  it('stops an invalid voter from voting', async () => {
    try {
      await ballot.methods.vote(1).send({
        from: accounts[3], // not in the invited parameters
      });
    } catch (err) {
      assert(err)
    }
  });

  it('confirms your voting status', async () => {
    const votedBoolBefore = await ballot.methods.haveIVoted().call({
      from: accounts[1]
    });

    assert(!votedBoolBefore);

    await ballot.methods.vote(1).send({
      from: accounts[1],
    });

    const votedBoolAfter = await ballot.methods.haveIVoted().call({
      from: accounts[1]
    });

    assert(votedBoolAfter);
  });

  it('correctly assigns chairperson', async () => {
    const chairpersonAddress = await ballot.methods.chairperson().call({
      from: accounts[2] // why not
    });

    assert.equal(accounts[0], chairpersonAddress)
  });

  it('successfully closes the ballot', async () => {
    await ballot.methods.closeBallot().call({
      from: accounts[0] // from chairperson
    });

    const closedBool = ballot.methods.ballotClosed().call({
      from: accounts[0]
    });

    assert(closedBool);
  });

  it('only allows chairperson to close the ballot', async () => {
    try {
      await ballot.methods.closeBallot().call({
        from: accounts[3] // from not chairperson
      });
    } catch (err) {
      assert(err);
    }
  });

  it('does not allow votes after ballot closure', async () => {
    await ballot.methods.closeBallot().call({
      from: accounts[0] // from chairperson
    });

    const closedBool = ballot.methods.ballotClosed().call({
      from: accounts[0]
    });

    assert(closedBool);

    try {
      await ballot.methods.vote(1).send({
        from: accounts[1],
      });
    } catch (err) {
      console.log(err);
      assert(err);
    }
  });

});
