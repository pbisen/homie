import React, { Component, useRef, useState } from 'react';
import Identicon from 'identicon.js';
import { getFilesFromPath } from 'web3.storage/dist/bundle.esm.min';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.min.css'
import 'swiper/swiper.min.css'
import "./styles.css";
import SwiperCore, { Pagination, Keyboard, Navigation } from "swiper";
SwiperCore.use([Keyboard]);
class Main extends Component {
  

  render() {
    return (
      <div className="body pb-2">
        <div className="row mx-0 pl-1">
          <div className='col-lg-2 p-1'>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <form onSubmit={(event) => {
              event.preventDefault()
              const description = this.videoDescription.value
              this.props.uploadVideo(description)
            }} 
              
              className="p-3 upload">
              <input type='file' accept='.mp4' onChange={this.props.getFiles}></input>

              <div className='form-group mr-sm-2'>
                <br></br>
                <input id="videoDescription" type="text" ref={(input) => { this.videoDescription = input }}
                  className="form-control" placeholder='Video Description here'
                  required
                />
              </div>
              <button type='submit' className='btn btn-primary btn-block btn-lg'>Upload!</button>
            </form>
          </div>
            <div className="col-lg-10 mr-0">
              <div className=''>
              <Swiper
              slidesPerView={1}
              spaceBetween={30}
              keyboard={{
                enabled: true,
              }}
              
              modules={[Keyboard]}
              
              >
              {this.props.videos.map((video, key) => {
                return (
                  <SwiperSlide>
                    <div className="card col-lg-8" key={key} >
                    
                    <ul id="videoList" className="list-group list-group-flush">
                        <p className="videoPlayer"><video src={`https://${video.hashValue}.ipfs.dweb.link/${video.id}.mp4`} type="video/mp4" controls width='1000' /></p>
                        <p className='text-white text-left pl-2'>{video.description}</p>
                      <li key={key} className="list-group-item py-2 card-footer">
                        <small className="float-left text-white pt-1">
                          TIPS: {window.web3.utils.fromWei(video.tipAmount.toString(), 'Ether')} ETH
                        </small>
                        <button
                          className="btn btn-link btn-sm float-right tip-button"
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
                  <div className='col-lg-4'>
                      <div className='card otherInfo'>
                          <h1>hehe</h1>
                      </div>
                  </div>
                  </SwiperSlide>
                  
                )
              })}
              
  
            
              </Swiper>

              </div>

              
              


            </div>

        
        </div>
      </div>
    );
  }
}

export default Main;



