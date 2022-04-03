
import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import homie from '../abis/homie.json'
import Navbar from './Navbar'
import Main from './Main'
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'


import { Biconomy } from "@biconomy/mexa";

let biconomy;
let web3;

if(window.ethereum){
   biconomy = new Biconomy(window.ethereum, { apiKey: process.env.BICONOMY_KEY, debug: true });
   web3 = new Web3(biconomy);
}
else{
  window.alert("Please ensure metamask is connected to this website.");
  throw new Error("Metamask Missing :(");
}






function getAccessToken() {
  // If you're just testing, you can paste in a token
  // and uncomment the following line:
  return process.env.WEB3_STORAGE_KEY;

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
    

    await this.loadWeb3()
    await this.loadBlockchainData()

    biconomy.onEvent(biconomy.READY, async () => {
      console.log("Biconomy Ready!")
    }).onEvent(biconomy.ERROR, (error, message) => {
      // Handle error while initializing mexa
    });
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
      // console.log("bicon", Homie);
      // console.log("regular", Homie_regular);
      this.setState({ homie: Homie, homie_regular: Homie_regular })
      const videoCount = await Homie.methods.videoCount().call();
      this.setState({ videoCount })

      const followerCount = await Homie.methods.followerCount(accounts[0]).call()

      for (var i = 0; i < followerCount; i++) {
        const follower = await Homie.methods.following(accounts[0], i).call();
        // console.log("In Follower: ", follower);
        this.setState({
          followers: [...this.state.followers, follower]
        })
      }

      this.setState({
        followers: [...this.state.followers, this.state.account]
      })





      // console.log("Video Count Outside", videoCount)
      for (var j = 1; j <= videoCount; j++) {
        // console.log("Hehe, Called you!")
        const video = await Homie.methods.Videos(j).call()
        // console.log(video);
        if (video.followerExclusive) {
          console.log("Follower Only Video", video.id)
          if ((this.state.followers).includes(video.author)) {
            // console.log("Follower Detected")
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
    let fileInput = document.querySelector('input[type="file"][id="video"]')
    
    const videoCount = await this.state.homie.methods.videoCount().call();
    // console.log("video count recieved", videoCount)
    var file = fileInput.files[0];
    // console.log("Old", fileInput.files);
    const newFile = new File([file], `${Number(videoCount) + 1}.mp4`, { type: 'video/mp4' })
    var dt = new DataTransfer();
    dt.items.add(newFile);
    var file_list = dt.files;

    this.setState({ buffer: file_list, name: newFile.name })

    fileInput = document.querySelector('input[type="file"][id="image"]')

    var file2 = fileInput.files[0]
    const newFile2 = new File([file2], `${Number(videoCount) + 1}.jpg`, { type: 'image/jpg' })
    // const reader = new window.FileReader()
    // reader.readAsArrayBuffer(newFile2)
    var dt1 = new DataTransfer();
    dt1.items.add(newFile2);
    var file_list1 = dt1.files;

      this.setState({ buffer1: file_list1, imageName: newFile2.name })

      console.log("Files: ", this.state.buffer, this.state.buffer1);

    


    // console.log("New", file_list);
  }

  uploadVideo = async (description, follower) => {
    console.log("Uploading to IPFS");
    // const videoCount = await this.state.homie.methods.videoCount().call();
    // console.log("video count recieved", videoCount)

    const client = makeStorageClient();
    // console.log("Done dis.", this.state.name)
    // console.log("Follower Only", follower)
    const cid = await client.put(this.state.buffer, { name: this.state.name })
    console.log('stored files with cid:', cid)

    const cid2 = await client.put(this.state.buffer1, { name: this.state.imageName })
    console.log('stored files with cid:', cid2)

    this.setState({ loading: true })

    if (follower === 'yes') {
      // console.log("yes Detected")
      this.state.homie.methods.uploadVideo(cid, description, true, cid2).send({ from: this.state.account, gasPrice: "150000000000", gas: 2000000 }).on('transactionHash', (hash) => {
        this.setState({ uploading: false });
        this.setState({ loading: false })
      }).once("confimation", function (confirmationNumber, receipt) {
         console.log(receipt);
         console.log(receipt.transactionHash);
      });
    }
    else {
      // console.log("no Detected")
      this.state.homie.methods.uploadVideo(cid, description, false, cid2).send({ from: this.state.account, gasPrice: "150000000000", gas: 2000000 }).on('transactionHash', (hash) => {
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
      buffer1: null,
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
              followers={this.state.followers}
              account={this.state.account}
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

      console.log("Upload Procedure Started")
      

      this.props.uploadVideo(description, follow)

      
    }}

      className="form">
      <div className="title">Welcome</div>
      <div className="subtitle">Let's upload your clips to homie </div>
      <div className="input-container ic2">
        <p>Video: </p>
        <input type='file' id="video"  accept='.mp4' required></input>
        <hr></hr>
        <p>Thumbnail</p>
        <input type='file' id = "image" accept='.jpg' onChange={this.props.getFiles} required></input>
        
      </div>
      <div className="input-container ic2">
      <label>Video Title</label>
        <input id="videoDescription" className="input" type="text" ref={(input) => { this.videoDescription = input }} placeholder=" " required />
        
      </div>
      <div className="input-container ic2">
        <label>Follower Exclusive?</label>
        <input id="followerOnly" className="input" type="text" ref={(input) => { this.followerOnly = input }} placeholder="type 'yes' for yes and 'no' for no" required />
  
        
      </div>
      <br></br>
      <button className='submit' type="submit" >Upload</button>
    </form>);
  }
}
export default App;
