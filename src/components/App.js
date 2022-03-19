import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import homie from '../abis/homie.json'
import Navbar from './Navbar'
import Main from './Main'


const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)

    }
    else {
      window.alert('Non-Ethereum browser detected. Install / Enable Metamask.')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = homie.networks[networkId]
    if (networkData) {
      const Homie = await web3.eth.Contract(homie.abi, networkData.address);
      this.setState({ homie: Homie })
      const videoCount = await Homie.methods.videoCount().call();
      this.setState({ videoCount })

      for(var i = 1; i <= videoCount; i++){
        const video = await Homie.methods.Videos(i).call()
        this.setState({
          videos : [...this.state.videos, video]
        })
      }

      this.setState({videos : this.state.videos.sort((a,b) => b.tipAmount - a.tipAmount)})

      this.setState({ loading: false })
    }
    else {
      window.alert('Contract not found on the network. Change network from Metamask')
    }
  }

  captureFile = event => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({buffer: Buffer(reader.result)})
      console.log('buffer', this.state.buffer)
    }
  }

  uploadVideo = description => {
    console.log("Uploading to IPFS");

    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS Result', result)
      if(error){
        console.log(error);
        window.alert("Error Uploading to IPFS.");
        return;
      }

      this.setState({loading: true})
      this.state.homie.methods.uploadVideo(result[0].hash, description).send({from: this.state.account}).on('transactionHash', (hash)=>{
        this.setState({loading: false})
      })

    })
  }

  tipVideoOwner = (id, tipAmount) => {
    this.setState({loading: true})
    this.state.homie.methods.tipVideoOwner(id).send({from: this.state.account, value: tipAmount}).on('transactionHash', (hash) => {
      this.setState({loading: false})
    })
  }



  constructor(props) {
    super(props)
    this.state = {
      account: '',
      homie: null,
      videos: [],
      loading: true
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
          captureFile = {this.captureFile}
          uploadVideo = {this.uploadVideo}
          videos = {this.state.videos}
          tipVideoOwner = {this.tipVideoOwner}
          />  
        }

      </div>
    );
  }
}

export default App;