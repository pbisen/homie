import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Main extends Component {

  render() {
    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              <form onSubmit = {(event) => {
                event.preventDefault()
                const description = this.videoDescription.value
                this.props.uploadVideo(description)
              }}>
                <input type='file' accept = '.mp4' onChange={this.props.captureFile}></input>
                <div className='form-group mr-sm-2'>
                  <br></br>
                  <input id="videoDescription" type = "text" ref = {(input) => {this.videoDescription = input}} 
                  className="form-control" placeholder='Video Description here'
                  required
                  />
                </div>
                <button type='submit' className='btn btn-primary btn-block btn-lg'>Upload!</button>
              </form>

              <p>&nbsp;</p>
              { this.props.videos.map((video, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <img
                        className='mr-2'
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(video.author, 30).toString()}`}
                      />
                      <small className="text-muted">{video.author}</small>
                    </div>
                    <ul id="videoList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p className="text-center"><video src={`https://ipfs.infura.io/ipfs/${video.hashValue}`} type="video/mp4" controls/></p>
                        <p>{video.description}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <small className="float-left mt-1 text-muted">
                          TIPS: {window.web3.utils.fromWei(video.tipAmount.toString(), 'Ether')} ETH
                        </small>
                        <button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={video.id}
                          onClick={(event) => {
                            let tipAmount = window.web3.utils.toWei('0.1', 'Ether')
                            console.log(event.target.name, tipAmount)
                            this.props.tipVideoOwner(event.target.name, tipAmount)
                          }}
                        >
                          TIP 0.1 ETH
                        </button>
                      </li>
                    </ul>
                  </div>
                )
              })}


            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Main;



