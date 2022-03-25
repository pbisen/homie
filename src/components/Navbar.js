import React, { Component } from 'react';
import Identicon from 'identicon.js';
import './navbar.css'



class Navbar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toDisplay : true
    }
  }
  render() {    
    return (
      <div className='navigation-bar row'>
          <div className='col-4'>
          {this.state.toDisplay
          ?<button className='button-upload rounded text-white'type="button" onClick={()=>{this.props.uploader();this.setState({toDisplay:false});}}>Upload</button>
          :<span></span>}
            </div> 
          <p className='homie-heading col-4'>HOMIE</p>
          <div className='account-info col-4'>
              { this.props.account
              ? <img
                className='ml-2'
                width='30'
                height='30'
                alt='identicon'
                src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
              />
              : <span></span>
  }
              <p>{this.props.account}</p>
              
              
          </div>
          {/* <small className="text">
              <small id="account">{this.props.account}</small>
            </small>
            { this.props.account
              ? <img
                className='ml-2'
                width='30'
                height='30'
                src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
              />
              : <span></span>
            } */}

      </div>
      
      
    );
  }
}

export default Navbar;


