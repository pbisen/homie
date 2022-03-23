import React, { Component, useRef, useState } from 'react';
import Identicon from 'identicon.js';
import { getFilesFromPath } from 'web3.storage/dist/bundle.esm.min';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.min.css'
import 'swiper/swiper.min.css'
import "./styles.css";
import SwiperCore, { Pagination, Keyboard, Navigation } from "swiper";
import Web3 from 'web3'
SwiperCore.use([Keyboard]);
class Main extends Component {
  

  render() {
    return (
      <div className="body">
        <div className="row mx-0">
          <div className='col-lg-1 align-self-left emptySpace'>
          </div>
        <div className="col-lg-9 columnView">
              <Swiper
              slidesPerView={1}

              keyboard={{
                enabled: true,
              }}
              
              modules={[Keyboard]}
              
              >
              {this.props.videos.map((video, key) => {
                return (
                  <SwiperSlide>
                    <div className="card col-lg-12" key={key} >
                      <div className='card-header'>
                        <p className='author'>{video.author}</p>
                        <div className='card-header-buttons ml-auto'>
                        <button className='rounded'>Follow</button>
                        <button className='rounded' name={video.id}
                          onClick={(event) => {
                            this.props.tipVideoOwner(event.target.name, 10**18)
                          }}>Tip 1 MATIC</button>

                        </div>
                        
                      </div>
                    
                    <ul id="videoList" className="list-group list-group-flush">
                        <p className="videoPlayer"><video src={`https://${video.hashValue}.ipfs.dweb.link/${video.id}.mp4`} type="video/mp4" height="600px" controls/></p>
                     
                    </ul>
                    <li key={key} className="list-group-item card-footer">
                        <p className='footer-text'>{video.description}</p>
                        <small className="ml-auto text-white pt-1 ">
                          TIPS: {(video.tipAmount)/10**18} MATIC
                        </small>
                      </li>
                  </div>
                 
                  </SwiperSlide>
                  
                )
              })}
              
  
            
              </Swiper>

              

              
              


        
        </div>
          

          </div>
            
      </div>
    );
  }
}

export default Main;





