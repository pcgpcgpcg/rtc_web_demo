import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import {Janus} from 'janusjs-sdk'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import {VideoIcon,VideoOffIcon,AudioIcon,AudioOffIcon} from './img/svgIcons'
import NativeSelect from '@material-ui/core/NativeSelect';
import EchoTest from './component/EchoTest'
import PTTAudio from './component/PTTAudio'
import MedoozeVideoRoom2 from './component/MedoozeVideoRoom2'
import MedoozeVideoRoom3 from './component/MedoozeVideoRoom3'

class App extends Component {

    constructor(props){
        super(props);
        this.state={
            localVideoSrc:null,
            videoEnable:true,
            audioEnable:true,
            bitrateValue:100,
            startEchoTest:false,
        }
    }

    componentDidMount() {

    }

    componentWillUnmount(){

    }

  render() {
    return (
      <div style={{ padding: 20 }}>
          {/*<PTTAudio id="PTTTest1"></PTTAudio>*/}
          <MedoozeVideoRoom2 id="MedoozeVideoRoom2"></MedoozeVideoRoom2>
      </div>
    );
  }
}

export default App;
