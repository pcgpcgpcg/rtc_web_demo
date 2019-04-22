import React, {Component} from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import IconButton from "@material-ui/core/IconButton";
import {AudioIcon, AudioOffIcon, VideoIcon, VideoOffIcon} from "../img/svgIcons";
import NativeSelect from "@material-ui/core/NativeSelect";
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import AddIcon from '@material-ui/icons/Add';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import VideoCamIcon from '@material-ui/icons/Videocam'
import VideoCamOffIcon from '@material-ui/icons/VideocamOff'

import Icon from '@material-ui/core/Icon';
import DeleteIcon from '@material-ui/icons/Delete';
import NavigationIcon from '@material-ui/icons/Navigation';

import TransactionManager from "../lib/TransactionManager";   //'transaction-manager'
import MediaServerClient3 from "../lib/MediaServerClient3";
import Background from '../img/bkgrd.jpg';
//import TransactionManager from '../lib/transaction-manager'
let participants;
let pc;
let joined=false;
let poster_addr='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1554783370112&di=b8e3916534a569ab6c13fcc8b01e9e32&imgtype=0&src=http%3A%2F%2Fimg.17xsj.com%2Fuploads%2Fallimg%2Fc121126%2F1353910E4M0-52Kb.jpg';

class MedoozeVideoRoom3 extends Component {

    constructor(props){
        super(props);
        this.state={
            localVideoSrc:null,
            videoEnable:true,
            audioEnable:true,
            bitrateValue:100,
            bStartEchoTestButton:false,
            fullVideoIndex:-1,
        }

        // create a ref to store the video DOM element
        this.localVideo = React.createRef();
        this.remoteStreams=new Map();
        this.remoteVideos=new Array();
        this.audioSender=null;
        this.videoSender=null;
        for(var i=0;i<5;i++){
            this.remoteVideos[i]=React.createRef();
        }


        //Get our url
        this.roomId = "1234";
        var myDate = new Date();
        myDate.toLocaleString();
        this.name = myDate.toLocaleString();
        this.nopublish = false;
        //this.pc=null;
        this.url="ws://192.168.43.231:8000";
        this.localStreamID="";
        this.remoteIndex=-1;
        this.displayId="";

        this.handleStart=this.handleStart.bind(this);
        this.handleVideoOn=this.handleVideoOn.bind(this);
        this.handleAudioOn=this.handleAudioOn.bind(this);

        this.connect=this.connect.bind(this);
        this.addRemoteTrack=this.addRemoteTrack.bind(this);
        this.removeRemoteTrack=this.removeRemoteTrack.bind(this);
    }

    componentDidMount() {

    }

    componentWillUnmount(){

    }

    async handleVideoOn(){
        //this.setState({fullVideoIndex:0});
        this.videoSender.track.enabled = !this.videoSender.track.enabled;
        /*let currentReport=await this.videoSender.getStats();
        for (let now of currentReport.values()){
            if (now.type != 'outbound-rtp') continue;
                // get the corresponding stats from the baseline report
                const remoteNow = currentReport.get(now.remoteIndex);

                const packetsSent = now.packetsSent;
            //const packetsReceived = remoteNow.packetsReceived;
                //const packetsReceived = remoteNow.packetsReceived;

                console.log("packetsSent:"+packetsSent);*/
            //console.log("packetsReceived:"+packetsReceived);


        //}
    }

    handleAudioOn(){

    }

    handleSelectChange = name => event => {

    };

    handleStart(){
        this.connect(this.url, this.roomId, this.name)
    }

    addRemoteTrack(event){
        console.log("addRemoteTrack:"+event);
        const track	= event.track;
        const stream = event.streams[0];
        if (!stream)
            return console.log("addRemoteTrack() no stream")
        //avoid two track with the same stream id
        if(this.remoteStreams.has(stream.id)){
            return;
        }
        //constrain room participant max 6
        if(this.remoteStreams.size>6){
            return;
        }
        //listen the inactive event
        stream.oninactive = (event)=>console.log(event);
        //add stream to remoteStreams
        this.remoteStreams.set(stream.id,stream);
        console.log("add stream id:"+stream.id);
        //foreach remoteStreams render to video tags
        let index=0;
        for(let [key,value] of this.remoteStreams){
            this.remoteVideos[index].current.srcObject=value;
            this.remoteVideos[index].current.id=key;
            index++;
        }
    }

    removeRemoteTrack(event){
        for(let [key,value] of this.remoteStreams){
           console.log("remote streams key:"+key);
        }
        console.log("remove stream id:"+event.remoteStreamId);
        console.log("this.remoteStreams.has id?"+this.remoteStreams.has(event.remoteStreamId));
        if(!this.remoteStreams.has(event.remoteStreamId)){
            return;
        }
        let indexBeforeDel=0;
        for(let [key,value] of this.remoteStreams){
            this.remoteVideos[indexBeforeDel].current.srcObject=null;
            indexBeforeDel++;
        }
        console.log("delete stream id:"+event.remoteStreamId);
        this.remoteStreams.delete(event.remoteStreamId);
        let index=0;
        for(let [key,value] of this.remoteStreams){
            this.remoteVideos[index].current.srcObject=value;
            this.remoteVideos[index].current.id=key;
            index++;
        }
    }

    connect(url,roomId,name)
    {
        var that=this;
        //Connect with websocket
        //Create room url
        //const roomUrl = url +"?id="+roomId;
        this.displayId =Date.parse(new Date());
        const roomUrl = url +"/channel/"+roomId+"/"+this.displayId;
        const ws = new WebSocket(roomUrl);
        //Crete transaction manager
        const tm = new TransactionManager(ws);
        //create managed peer connection
        const client=new MediaServerClient3(tm);  
        //myPeerConnection.onicecandidate = handleICECandidateEvent;
        //myPeerConnection.onremovetrack = handleRemoveTrackEvent;
        //myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        //myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
        //myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
        ws.onopen = async function()
        {
            console.log("ws:opened");
            //create new managed pc
            pc=await client.createManagedPeerConnection();

            //on new remote tracks
            pc.ontrack=that.addRemoteTrack;
            pc.ontrackended=that.removeRemoteTrack;
            //add local camera and mic media          
            try
            {
                    const constraints={
                        audio: true,
                        video: true
                    };
                     //let stream = null;
                     try {
                         const stream = await navigator.mediaDevices.getUserMedia(constraints);
                        //stream.getTracks().forEach((track) => pc.addTrack(track, stream));
                         [that.audioSender,that.videoSender] = await Promise.all([pc.addTrack(stream.getTracks()[0],stream),pc.addTrack(stream.getTracks()[1],stream)]);

                         //Play it
                         that.localStreamID=stream.id;
                         that.localVideo.current.srcObject=stream;
                         that.localVideo.current.id=stream.id;
                     } catch(err) {
                         console.log(err.toString());
                    }
            } catch (error) {
                console.error("Error",error);
                ws.close();
            }


            /*这里暂时没用*/
            tm.on("event",async function(event) {
                return;
                console.warn("ts::event",event);

                switch (event.name)
                {

                }
            });

        };


    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
            <Grid container className={classes.container} spacing={1}>
                <Grid item xs={6}>
                    <header >
                        <h1 className="App-title">Medooze Video Room</h1>
                    </header>
                </Grid>
                <Grid item xs={6}>
                    <Button color="primary" variant="contained" onClick={this.handleStart}>
                        {this.state.bStartEchoTestButton?'stop':'start'}
                    </Button>
                </Grid>

                <Grid item xs={4}>
                    <video className={classes.videoLarge}
                           ref={this.localVideo}
                           id="localVideo"
                           poster={poster_addr}
                           autoPlay="true"/>
                </Grid>
                    {[0, 1, 2, 3, 4].map(value => (
                        <Grid key={value}
                              style={{display: "block"}}
                              item xs={(value==this.state.fullVideoIndex)?12:(this.state.fullVideoIndex<0?4:0)}
                              zeroMinWidth>
                            <video className={classes.videoSmall}
                                   ref={this.remoteVideos[value]}
                                   id={value}
                                   poster={poster_addr}
                                   autoPlay="true"/>
                        </Grid>
                    ))}
                 <Grid container justify="center">
                    <Grid item xs={12} justify="center">
                        <Button variant="fab"
                                color="primary"
                                aria-label="Add"
                                className={classes.button}
                                onClick={this.handleAudioOn}>
                            <MicIcon/>
                        </Button>
                        <Button variant="fab"
                                color="secondary"
                                aria-label="Edit"
                                className={classes.button}
                                onClick={this.handleVideoOn}>
                            <VideoCamIcon/>
                        </Button>
                    </Grid>
                    </Grid>
            </Grid>
            </div>
        );
    }
}

const styles = theme => ({
    root: {
        flexGrow: 1,
        padding: 20,
        //backgroundImage: `url(${Background})`,
        height: '100%',
    },
    container: {
        direction: 'row',
        justify: "center",
        alignItems: 'center',
    },
    gridLayout:{
        justify: "center",
        alignItems: "center",
    },
    videoLarge: {
        paddingTop: 1, // 16:9
        width:'98%',
        height:'95%',
    },
    videoSmall: {
        paddingTop: 1, // 16:9
        width:'98%',
        height:'95%',
        alignItems:"flex-start",
    },
    button: {
        margin: theme.spacing.unit,
    },
});

MedoozeVideoRoom3.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedoozeVideoRoom3);




