import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import homie from '../abis/homie.json'
import Navbar from './Navbar'
import Main from './Main'
import {Web3Storage} from 'web3.storage/dist/bundle.esm.min.js'

import {Biconomy} from "@biconomy/mexa";

const biconomy = new Biconomy(window.ethereum,{apiKey: String("tWsX5VfKB.8102472b-2814-4621-b3e1-2f4a6d9d2fd8"), debug: true});
const web3 = new Web3(biconomy);




function getAccessToken() {
  // If you're just testing, you can paste in a token
  // and uncomment the following line:
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZGNTMzNkExNjE5QzdFQzJhOWY2MEQxOUE4NGZCZDJkRjBDNTI1NTUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDc3NjY4NDQzNTQsIm5hbWUiOiJob21pZS1pcGZzIn0.5qpLFVg5SDWmKa2pgx-zHXIAVQb7jsD0utzY3y5g4Bg"

  // In a real app, it's better to read an access token from an 
  // environement variable or other configuration that's kept outside of 
  // your code base. For this to work, you need to set the
  // WEB3STORAGE_TOKEN environment variable before you run your code.
  // return process.env.WEB3STORAGE_TOKEN
}

function makeStorageClient() {
  return new Web3Storage({ token: getAccessToken() })
}


// const ipfsClient = require('ipfs-http-client')
// const ipfs = ipfsClient({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})



class App extends Component {

  async componentWillMount() {
    biconomy.onEvent(biconomy.READY, async () => {
      console.log("Done Biconomy!")
      await this.loadBlockchainData();
    }).onEvent(biconomy.ERROR, (error, message) => {
      // Handle error while initializing mexa
    });
  }


  async loadBlockchainData() {

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

  // captureFile = event => {
  //   event.preventDefault()
  //   const file = event.target.files[0]
  //   // const reader = new window.FileReader()
  //   // reader.readAsArrayBuffer(file)

  //   this.setState({buffer: new File([file], 'placeholder')})

  //   // reader.onloadend = () => {
  //   //   this.setState({buffer: Buffer(reader.result)})
  //   //   console.log('buffer', this.state.buffer)
  //   // }
  // }

  getFiles = async () => {
    const fileInput = document.querySelector('input[type="file"]')
    const videoCount = await this.state.homie.methods.videoCount().call();
    console.log("video count recieved", videoCount)
    var file = fileInput.files[0];
    console.log("Old", fileInput.files);
    const newFile = new File([file], `${Number(videoCount)+1}.mp4`, {type: 'video/mp4'})

    var dt = new DataTransfer();
    dt.items.add(newFile);
    var file_list = dt.files;

    console.log("New", file_list);
    this.setState({buffer: file_list, name: newFile.name})
  }

  uploadVideo = async (description) => {
    console.log("Uploading to IPFS");
    const videoCount = await this.state.homie.methods.videoCount().call();
    console.log("video count recieved", videoCount)

    const client = makeStorageClient();
    console.log("Done dis.", this.state.name)
    const cid = await client.put(this.state.buffer, {name: this.state.name})
    console.log('stored files with cid:', cid)

      this.setState({loading: true})
      this.state.homie.methods.uploadVideo(cid, description).send({from: this.state.account}).on('transactionHash', (hash)=>{
        this.setState({loading: false})
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
      loading: true,
      buffer: null,
      name: null
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
          getFiles = {this.getFiles}
          />  
        }

      </div>
    );
  }
}

export default App;