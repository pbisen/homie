import React, { Component} from 'react';
import { Swiper, SwiperSlide } from "swiper/react";
import 'swiper/swiper-bundle.min.css'
import 'swiper/swiper.min.css'
import "./styles.css";
import SwiperCore, {Keyboard} from "swiper";

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
                  <SwiperSlide key={key}>
                    <div className="card col-lg-12" key={key} >

                      {video.followerExclusive && 
                      <div className='card-header follower-ex'>
                        <p className='author'>{video.author}</p>
                        
                        <div className='card-header-buttons ml-auto'>
                          
                        {(this.props.followers).includes(video.author) && (<button className='rounded following'
                          >Following</button>)} 
                          
                          {!(this.props.followers).includes(video.author) && (<button className='rounded' onClick={(event) => {
                            this.props.followAcc(video.author)
                          }}
                          >Follow</button>)}
          
                        
                        <button className='rounded' name={video.id}
                          onClick={(event) => {
                            this.props.tipVideoOwner(event.target.name, 10**18)
                          }}>Tip 1 MATIC</button>

                        </div>
                        
                      </div>}

                      {!video.followerExclusive && <div className='card-header'>
                        <p className='author'>{video.author}</p>
                        
                        <div className='card-header-buttons ml-auto'>
                          
                        {(this.props.followers).includes(video.author) && (<button className='rounded following'
                          >Following</button>)} 
                          
                          {!(this.props.followers).includes(video.author) && (<button className='rounded' onClick={(event) => {
                            this.props.followAcc(video.author)
                          }}
                          >Follow</button>)}
          
                        
                        <button className='rounded' name={video.id}
                          onClick={(event) => {
                            this.props.tipVideoOwner(event.target.name, 10**18)
                          }}>Tip 1 MATIC</button>

                        </div>
                        
                      </div>
                      }
                    
                    <ul id="videoList" className="list-group list-group-flush">
                        <p className="videoPlayer"><video src={`https://${video.hashValue}.ipfs.dweb.link/${video.id}.mp4`} poster={`https://${video.image}.ipfs.dweb.link/${video.id}.jpg`}  type="video/mp4" height="600px" controls/></p>
                     
                    </ul>

                    {video.followerExclusive && 
                      <li key={key} className="list-group-item card-footer follower-ex">
                      <p className='footer-text'>{video.description}</p>
                      <small className="ml-auto text-white pt-1 ">
                        TIPS: {(video.tipAmount)/10**18} MATIC
                      </small>
                    </li>}

                      {!video.followerExclusive && <li key={key} className="list-group-item card-footer">
                        <p className='footer-text'>{video.description}</p>
                        <small className="ml-auto text-white pt-1 ">
                          TIPS: {(video.tipAmount)/10**18} MATIC
                        </small>
                      </li>
                      }
                    
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





