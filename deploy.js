// UfLMT8NPfoFPc218iR6E
// https://rinkeby.infura.io/UfLMT8NPfoFPc218iR6E this is the old key

const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'air tool apology ghost arrow gown tunnel velvet trouble spy shell pyramid',
  'https://rinkeby.infura.io/v3/7b0aa545a93f437882b5a5161882c289', // why are we using this?
  address_index=0, //keeps the main address
  num_addresses=3 // makes 3 addresses, but I can't access them in this version
);

const web3 = new Web3(provider);

const allAccounts = [
  "0x7120FF8FE37015CF708672Fef018849D3c0717dB",
  "0xDe65156d767ec5956d1cFE15FEfC25751Be428b7",
  "0x881B2AD0EcE8964428aD084eDe62B9f472866816",
];
/*
Addresses used:
0: 0x7120FF8FE37015CF708672Fef018849D3c0717dB
1: 0xDe65156d767ec5956d1cFE15FEfC25751Be428b7
2: 0x881B2AD0EcE8964428aD084eDe62B9f472866816
 */
const deploy = async () => {
  const accounts = await web3.eth.getAccounts(); //see explanation in test file

  console.log('Attempting to deploy from account', allAccounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: '0x' + bytecode,
      arguments: ['test', [ allAccounts[1], allAccounts[2] ] ]
     })
    .send({ gas: '1000000', from: allAccounts[0] });
  console.log(allAccounts[0]);
  console.log(allAccounts[1]);
  console.log(allAccounts[2]);
  console.log(interface);
  console.log('Contract deployed to', result.options.address);
};

// node deploy.js
deploy();

/* Deployed to

0xc2EBE652DC717Bcea30D90Fb04758C15a3e006bc

 */
