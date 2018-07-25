pragma solidity ^0.4.22;

contract SingleIssueBallot{
    /*
    A single issue ballot

    Proposal name and tally are public to everyone

    Vote guide:
        1: vote for proposal to pass
        0: abstain (not voting counts as abstaination)
        -1: vote for proposal to fail

    */

    // the creator of the vote, does not vote by default
    // to vote, the chairperson must invite themselves
    address public chairperson;

    struct Voter {
        bool voted;
        int256 vote;
        uint iter;
    }

    // so anyone can find out who participated
    address[] public votersArray;

    // but we keep their individual votes private
    mapping (address => Voter) private votersDict;

    struct Proposal {
        string name;
        int256 voteBalance;
    }

    // declare proposal, current status and issue open to everyone
    Proposal public proposal;

    // state variables
    bool public ballotInitialized;
    bool public ballotClosed;

    constructor(string proposalName, address[] invites) public {

        // contract creator is chairperson
        chairperson = msg.sender;

        // add voters from invites list
        votersArray = invites;

        for (uint i = 0; i < invites.length; i++) {
            Voter storage temp = votersDict[invites[i]];
            temp.voted = false;
            temp.vote = 0;
            temp.iter = i;
        }

        // create proposal
        proposal = Proposal({
            name:proposalName,
            voteBalance:0
        });

        // set state variables
        ballotInitialized = true;
        ballotClosed = false;
    }



    function vote(int256 newVote) public {
        // voter was invited
        require(validVoter(msg.sender), "you are not a valid voter");

        // vote follows [-1, 0, 1] options
        require(validVote(newVote), "this vote exceed acceptable inputs");

        require(!ballotClosed, "this ballot is closed to new votes");
        
        proposal.voteBalance += newVote;
        votersDict[msg.sender].voted = true;
    }

    function closeBallot() public {
        require(msg.sender == chairperson); // only chairperson can end the vote
        ballotClosed = true;
    }

    function haveIVoted() public view returns (bool) {
        return votersDict[msg.sender].voted;
    }

    function getVotersArray() public view returns (address[]) {
      return votersArray;
    }



    // ########################################################################
    // all require functions below
    // ########################################################################

    function validVoter(address foo) private view returns (bool) {
        // temporarily grab voter from votersDict
        Voter memory tempVoter = votersDict[foo];

        // require that this voter was invited AND that they've not voted
        if((foo == votersArray[tempVoter.iter]) && (!tempVoter.voted)) {
            return true;
        }
        else {
            return false;
        }
    }

    function validVote(int256 bar) private pure returns (bool) {
        if ((bar < -1) || (bar > 1)) {
            return false;
        }
        else {
            return true;
        }
    }
}
