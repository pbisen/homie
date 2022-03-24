
import React, { Component } from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import homie from '../abis/homie.json'
import Navbar from './Navbar'
import Main from './Main'
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'


import { Biconomy } from "@biconomy/mexa";

const biconomy = new Biconomy(window.ethereum, { apiKey: "qGBQ-YcM0.bdce0ef1-31fc-40de-acfa-f8101478578d", debug: true });
const web3 = new Web3(biconomy);




function getAccessToken() {
  // If you're just testing, you can paste in a token
  // and uncomment the following line:
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDZGNTMzNkExNjE5QzdFQzJhOWY2MEQxOUE4NGZCZDJkRjBDNTI1NTUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDc3NjY4NDQzNTQsIm5hbWUiOiJob21pZS1pcGZzIn0.5qpLFVg5SDWmKa2pgx-zHXIAVQb7jsD0utzY3y5g4Bg";

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
    }).onEvent(biconomy.ERROR, (error, message) => {
      // Handle error while initializing mexa
    });

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
    const web32 = window.web3;
    const accounts = await web3.eth.getAccounts()


    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()
    const networkData = homie.networks[networkId]
    if (networkData) {
      const Homie = await web3.eth.Contract(homie.abi, networkData.address);
      const Homie_regular = await web32.eth.Contract(homie.abi, networkData.address);
      console.log("bicon", Homie);
      console.log("regular", Homie_regular);
      this.setState({ homie: Homie, homie_regular: Homie_regular })
      const videoCount = await Homie.methods.videoCount().call();
      this.setState({ videoCount })

      const followerCount = await Homie.methods.followerCount(accounts[0]).call()

      for (var i = 0; i < followerCount; i++) {
        const follower = await Homie.methods.following(accounts[0], i).call();
        console.log("In Follower: ", follower);
        this.setState({
          followers: [...this.state.followers, follower]
        })
      }




      console.log("Video Count Outside", videoCount)
      for (var j = 1; j <= videoCount; j++) {
        console.log("Hehe, Called you!")
        const video = await Homie.methods.Videos(j).call()
        console.log(video);
        if (video.followerExclusive) {
          console.log("Follower Only Video", video.id)
          if ((this.state.followers).includes(video.author)) {
            console.log("Follower Detected")
            this.setState({
              videos: [...this.state.videos, video]
            })
          }
        }
        else {
          console.log("Non Follower Only video added", video.id);
          this.setState({
            videos: [...this.state.videos, video]
          })
        }

      }






      this.setState({ videos: this.state.videos.sort((a, b) => b.tipAmount - a.tipAmount) })

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
    const newFile = new File([file], `${Number(videoCount) + 1}.mp4`, { type: 'video/mp4' })

    var dt = new DataTransfer();
    dt.items.add(newFile);
    var file_list = dt.files;

    console.log("New", file_list);
    this.setState({ buffer: file_list, name: newFile.name })
  }

  uploadVideo = async (description, follower) => {
    console.log("Uploading to IPFS");
    const videoCount = await this.state.homie.methods.videoCount().call();
    console.log("video count recieved", videoCount)

    const client = makeStorageClient();
    console.log("Done dis.", this.state.name)
    console.log("Follower Only", follower)
    const cid = await client.put(this.state.buffer, { name: this.state.name })
    console.log('stored files with cid:', cid)

    this.setState({ loading: true })

    if (follower === 'yes') {
      console.log("yes Detected")
      this.state.homie.methods.uploadVideo(cid, description, true).send({ from: this.state.account, gasPrice: "150000000000", gas: 2000000 }).on('transactionHash', (hash) => {
        this.setState({ uploading: false });
        this.setState({ loading: false })
      }).once("confimation", function (confirmationNumber, receipt) {
        console.log(receipt);
        console.log(receipt.transactionHash);
      });
    }
    else {
      console.log("no Detected")
      this.state.homie.methods.uploadVideo(cid, description, false).send({ from: this.state.account, gasPrice: "150000000000", gas: 2000000 }).on('transactionHash', (hash) => {
        this.setState({ uploading: false });
        this.setState({ loading: false })
      }).once("confimation", function (confirmationNumber, receipt) {
        console.log(receipt);
        console.log(receipt.transactionHash);
      });
    }


  }

  followVideo = async (video_author) => {
    console.log("Following Initiated");
    this.state.homie.methods.followAccount(video_author).send({ from: this.state.account, gasPrice: "150000000000", gas: 2000000 }).on("transactionHash", function (hash) {
      console.log(`Transaction hash is ${hash}`);
    }).once("confirmation", function (confirmationNumber, receipt) {
      console.log(receipt);
      console.log(receipt.transactionHash);
      //do something with transaction hash
    });
  }

  tipVideoOwner = async (id, tipAmount) => {
    this.setState({ loading: true })
    this.state.homie_regular.methods.tipVideoOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }


  uploadStart = () => {
    this.setState({ uploading: true });
  }


  constructor(props) {
    super(props)
    this.state = {
      account: '',
      homie: null,
      videos: [],
      loading: true,
      buffer: null,
      name: null,
      uploading: false,
      homie_regular: null,
      followers: [],
    }
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} uploader={this.uploadStart} />
        {this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : this.state.uploading
            ? <Up uploadFinish={this.uploadFinish}
              uploadVideo={this.uploadVideo}
              getFiles={this.getFiles}

            />
            : <Main
              captureFile={this.captureFile}
              uploadVideo={this.uploadVideo}
              videos={this.state.videos}
              tipVideoOwner={this.tipVideoOwner}
              getFiles={this.getFiles}
              followAcc={this.followVideo}
            />
        }

      </div>
    );
  }
}
class Up extends Component {



  render() {
    return (<form onSubmit={(event) => {
      event.preventDefault()
      const description = this.videoDescription.value
      const follow = this.followerOnly.value
      console.log("Here!")
      this.props.uploadVideo(description, follow)
    }}

      className="form">
      <div class="title">Welcome</div>
      <div class="subtitle">Let's upload your clips to homie </div>
      <div class="input-container ic1">
        <input type='file' accept='.mp4' onChange={this.props.getFiles}></input>
      </div>
      <div class="input-container ic2">
        <input id="videoDescription" class="input" type="text" ref={(input) => { this.videoDescription = input }} placeholder=" " required />
        <div class="cut"></div>
        <label for="lastname" class="placeholder">Video Title</label>
      </div>
      <br></br>
      <div class="input-container ic2">
        <input id="followerOnly" class="input" type="text" ref={(input) => { this.followerOnly = input }} placeholder="type 'yes' for yes and 'no' for no" required />
        <div class="cut"></div>
        <label for="lastname" class="placeholder">Follower Only?</label>
      </div>
      <button className='submit' type="submit" >Upload</button>
    </form>);
  }
}
export default App;