import React, {Component} from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import {AudioIcon, AudioOffIcon, VideoIcon, VideoOffIcon} from "../img/svgIcons";
import NativeSelect from "@material-ui/core/NativeSelect";

import TransactionManager from 'transaction-manager'
import MediaServerClient from '../lib/MediaServerClient'
import PeerConnectionClient from  "../lib/PeerConnectionClient";

// Put variables in global scope to make them available to the browser console.
const constraints = window.constraints = {
    audio: false,
    video: true
};

var pc=null;
class MedoozeVideoRoom extends Component {

    constructor(props){
        super(props);
        this.state={
            localVideoSrc:null,
            videoEnable:true,
            audioEnable:true,
            bitrateValue:100,
            bStartEchoTestButton:false,
        }

        // create a ref to store the video DOM element
        this.localVideo = React.createRef();
        this.remoteVideo=React.createRef();
        this.setLocalVideoRef = element => {
            this.localVideo = element;
        };

        this.server = "https://39.106.100.180:8089/janus";
        //this.pc=null;
        this.url="wss://47.94.235.90:8084";

        this.handleStart=this.handleStart.bind(this);
        this.handleVideoOn=this.handleVideoOn.bind(this);
        this.handleAudioOn=this.handleAudioOn.bind(this);

        this.addLocalStream=this.addLocalStream.bind(this);
        this.handleSelectChange=this.handleSelectChange.bind(this);
        this.sendTrack=this.sendTrack.bind(this);
        this.addRemoteTrack=this.addRemoteTrack.bind(this);
        this.removeRemoteTrack=this.removeRemoteTrack.bind(this);
    }

    componentDidMount() {
//Connect with websocket
        const ws = new WebSocket(this.url);

        //Crete transaction manager
        const tm = new TransactionManager(ws);

        //Create managed peer connection
        const client = new MediaServerClient(tm);

        //Start on open
        var that=this;
        ws.onopen = async ()=>{

            //Create new managed pc
            pc = await client.createManagedPeerConnection();
            //On new remote tracks
            pc.ontrack	= this.addRemoteTrack;
            pc.ontrackended = this.removeRemoteTrack;

            //Add listeneres
            /*addTrack.onclick		= ()=> sendTrack();
            addSimulcastTrack.onclick	= ()=> sendTrack(true);
            addTrackVP8.onclick		= ()=> sendTrack(false	, "vp8");
            addSimulcastTrackVP8.onclick	= ()=> sendTrack(true	,"vp8");
            addTrackH264.onclick		= ()=> sendTrack(false	,"h264");
            addSimulcastTrackH264.onclick	= ()=> sendTrack(true	,"h264");*/
        };
    }

    componentWillUnmount(){

    }

    handleVideoOn(){

    }

    handleAudioOn(){

    }

    handleSelectChange = name => event => {

    };



    handleStart(){
        this.sendTrack();
    }

    addRemoteTrack(event)
    {
        console.log(event);

        /*const track	= event.track;
        const stream	= event.streams[0];

        if (!stream)
            return console.log("addRemoteTrack() no stream")
        stream.oninactive = (event)=>console.log(event);

        //Check if video is already present
        let video = remoteVideos.querySelector("div[id='"+stream.id+"']>video");

        //Check if already present
        if (video)
        //Ignore
            return console.log("addRemoteTrack() video already present for "+stream.id);

        //Create html stuff
        const div	= document.createElement("div");
        video		= document.createElement("video");

        //Set id
        div.id = stream.id;

        //Set video source
        video.srcObject = stream;

        //Play it
        video.autoplay = true;
        video.playsInline = true;
        video.play();

        //Add them
        div.appendChild(video);
        remoteVideos.append(div);

        return div;*/
    }

    removeRemoteTrack(event)
    {
        console.log(event);

        /*const track	= event.track;
        const stream	= event.streams[0];

        //Check if video is already present
        let div = remoteVideos.querySelector("div[id='"+stream.id+"']");

        //Check if already present
        if (!div)
        //Ignore
            return console.log("removeRemoteTrack() video not present for "+stream.id);

        remoteVideos.removeChild(div);

        return div;*/
    }

    addLocalStream(track,stream)
    {
        this.localVideo.current=stream;
    }

    async sendTrack(simulcast,codecs)
    {

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.localVideo.current.srcObject=stream;
        //Get video track
        //const videoTrack = stream.getVideoTracks()[0];
        //Create audio track
        /*var audioContext = new AudioContext();
        var audioTrack = audioContext.createMediaStreamDestination().stream.getAudioTracks()[0];*/
        //Add to stream
        //stream.addTrack(audioTrack);
        //Add local video
        //this.addLocalStream(videoTrack,stream);

        let videoTrack=stream.getVideoTracks()[0];
        let audioTrack=stream.getAudioTracks()[0];

        //The params object
        const params = {};

        //If using simulcast
        if (simulcast)
        //Add simulcast params
            params.encodings = [
                { rid: "a"},
                { rid: "b" , scaleDownResolutionBy: 2.0 },
                { rid: "c" , scaleDownResolutionBy: 4.0 }
            ];

        //If overriding codecs
        if (codecs)
        //Set them to params
            params.codecs = [codecs];

        //Add to pc
        //const [audioSender,videoSender] = await Promise.all([pc.addTrack(audioTrack,stream),pc.addTrack(videoTrack,stream,params)]);
    };

    render() {
        return (
            <div style={{ padding: 20 }}>
                <CssBaseline />
                <Grid container style={styles.root} xs={12} spacing={6} justify="center" zeroMinWidth={0}>
                    <Grid item xs={12}>
                        <header >
                            <h1 className="App-title">Medooze Video Room</h1>
                        </header>
                    </Grid>
                    <Grid item xs={12}>
                        <Button color="primary" variant="contained" onClick={this.handleStart}>
                            {this.state.bStartEchoTestButton?'stop':'start'}
                        </Button>
                    </Grid>
                </Grid>



                <Grid container xs={12} spacing={6} justify="flex-end"  alignItems="flex-end" direction="row">
                    <Grid item xs={6} >
                        <Card key='1' style={styles.card}>
                            <video style={styles.video} ref={this.localVideo} id="localVideo" autoPlay="true"/>
                            <CardActions style={styles.button}>
                                <IconButton onClick={this.handleVideoOn} color="primary" aria-label="Add an alarm">
                                    {this.state.videoEnable?<VideoIcon></VideoIcon>:<VideoOffIcon></VideoOffIcon>}
                                </IconButton>
                                <IconButton onClick={this.handleAudioOn} color="secondary" aria-label="Add an alarm2">
                                    {this.state.audioEnable?<AudioIcon></AudioIcon>:<AudioOffIcon></AudioOffIcon>}
                                </IconButton>
                                <NativeSelect
                                    value={this.state.bitrateValue}
                                    onChange={this.handleSelectChange('bitrateValue')}
                                    name="bitrate"
                                    style={styles.selectEmpty}
                                >
                                    <option value={0}>No limit</option>
                                    <option value={128}>Cap to 128kbit</option>
                                    <option value={256}>Cap to 256kbit</option>
                                    <option value={512}>Cap to 512kbit</option>
                                    <option value={1025}>Cap to 1mbit</option>
                                    <option value={1500}>Cap to 1.5mbit</option>
                                    <option value={2000}>Cap to 2mbit</option>
                                </NativeSelect>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card key='2' style={styles.card}>
                            <video style={styles.video} ref={this.remoteVideo} id="remoteVideo" autoPlay="true"/>
                            <CardActions style={styles.button}>
                                <IconButton onClick={this.handleVideoOn} color="primary" aria-label="Add an alarm">
                                    {this.state.videoEnable?<VideoIcon></VideoIcon>:<VideoOffIcon></VideoOffIcon>}
                                </IconButton>
                                <IconButton onClick={this.handleAudioOn} color="secondary" aria-label="Add an alarm2">
                                    {this.state.audioEnable?<AudioIcon></AudioIcon>:<AudioOffIcon></AudioOffIcon>}
                                </IconButton>
                                <label>{this.state.WidthAndHeight}</label>
                                <label>{this.state.bitrateNow}</label>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>

            </div>
        );
    }
}

const styles = {
    root: {
        flexGrow: 1,
        textAlign: 'center',
    },
    card: {
        maxWidth: 640,
    },
    video: {
        paddingTop: 5, // 16:9
        width:480,
        height:480,
    },

    button: {
        paddingBottom: 5, // 16:9
    },

    selectEmpty: {
        marginTop:  2,
    },
};

export default MedoozeVideoRoom;
