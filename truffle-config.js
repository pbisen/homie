require('babel-register');
require('babel-polyfill');
require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    kovan:{
      provider: function(){
        return new HDWalletProvider(
          process.env.MNEMONIC,
          `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`
        )
      },
      network_id: 42,
    },
    matic: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://rpc-mumbai.maticvigil.com`),
      network_id: 80001,
    },
    alchemy: {
      provider: function(){
        return new HDWalletProvider(
          process.env.MNEMONIC,
          process.env.ALCHEMY_API
        )
      },
      network_id: 80001,
    },
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      version: "^0.8.0",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
