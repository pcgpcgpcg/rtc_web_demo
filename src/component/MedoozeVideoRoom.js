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

import TransactionManager from "../lib/TransactionManager";   //'transaction-manager'
//import TransactionManager from '../lib/transaction-manager'

let participants;

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
        this.remoteVideos=new Array();
        for(let i=0;i<5;i++){
            this.remoteVideos[i]=React.createRef();
        }


        //Get our url
        this.roomId = "1234";
        this.name = "pcg";
        this.nopublish = false;
        //this.pc=null;
        this.url="wss://47.94.235.90:8083";

        this.handleStart=this.handleStart.bind(this);
        this.handleVideoOn=this.handleVideoOn.bind(this);
        this.handleAudioOn=this.handleAudioOn.bind(this);

        this.connect=this.connect.bind(this);
        this.addVideoForStream=this.addVideoForStream.bind(this);
        this.removeVideoForStream=this.removeVideoForStream.bind(this);
    }

    componentDidMount() {

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
        this.connect(this.url, this.roomId, this.name)
    }

    addVideoForStream(stream,muted)
    {
        console.log("addVideoForStream");
        this.localVideo.current.srcObject=stream;
        //this.localVideo.current.muted=muted;
        this.localVideo.current.id=stream.id;
    }

    removeVideoForStream(stream)
    {
        console.log("removeVideoForStream");
        //Get video
        var that=this;
        this.localVideo.current.addEventListener('webkitTransitionEnd',function(){
            //Delete it
            that.localVideo.current.parentElement.removeChild(that.localVideo.current);
        });
        //Disable it first
        this.localVideo.current.className = "disabled";
    }

    connect(url,roomId,name)
    {
        var that=this;
        var pc = new RTCPeerConnection({
            bundlePolicy: "max-bundle",
            rtcpMuxPolicy : "require"
        });

        //Create room url
        const roomUrl = url +"?id="+roomId;

        var ws = new WebSocket(roomUrl);
        var tm = new TransactionManager(ws);

        pc.onaddstream = function(event) {
            console.debug("pc::onAddStream",event);
            //Play it
            //let pNum=participants.length();
            //that.remoteVideos[pNum-2].current.srcObject=event.stream;
            //that.addVideoForStream(event.stream);
        };

        pc.onaddtrack=function(){

        }

        pc.onremovestream = function(event) {
            console.debug("pc::onRemoveStream",event);
            //Play it
            that.removeVideoForStream(event.stream);
        };

        ws.onopen = async function()
        {
            console.log("ws:opened");

            try
            {
                if (!that.nopublish)
                {
                    const constraints={
                        audio: true,
                        video: true
                    };
                     let stream = null;
                     try {
                        stream = await navigator.mediaDevices.getUserMedia(constraints);
                         /!* use the stream *!/
                         //Play it
                         that.addVideoForStream(stream,true);
                     } catch(err) {
                         /!* handle the error *!/
                         console.log(err.toString());
                    }

                    console.debug("md::getUserMedia sucess",stream);

                    //Add stream to peer connection
                    pc.addStream(stream);
                }

                //Create new offer
                const offer = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true
                });

                console.debug("pc::createOffer sucess",offer);

                //Set it
                pc.setLocalDescription(offer);
                console.log("pc::setLocalDescription succes",offer.sdp);

                //Join room
                const joined = await tm.cmd("join",{
                    name	: that.name,
                    sdp	: offer.sdp
                });

                console.log("cmd::join success",joined);

                //Create answer
                const answer = new RTCSessionDescription({
                    type	:'answer',
                    sdp	: joined.sdp
                });

                //Set it
                await pc.setRemoteDescription(answer);

                console.log("pc::setRemoteDescription succes",answer.sdp);

                /*console.log("JOINED");*/
            } catch (error) {
                console.error("Error",error);
                ws.close();
            }
        };

        tm.on("event",async function(event) {
            console.log("ts::event",event);

            switch (event.name)
            {
                case "update" :
                    try
                    {
                        console.log("update"+event.data.sdp);

                        //Create new offer
                        const offer = new RTCSessionDescription({
                            type : 'offer',
                            sdp  : event.data.sdp
                        });

                        //update participant list
                        participants = event.participants;

                        //Set offer
                        await pc.setRemoteDescription(offer);

                        console.log("pc::setRemoteDescription succes",offer.sdp);

                        //Create answer
                        const answer = await pc.createAnswer();

                        console.log("pc::createAnswer succes",answer.sdp);

                        //Only set it locally
                        await pc.setLocalDescription(answer);

                        console.log("pc::setLocalDescription succes",answer.sdp);

                    } catch (error) {
                        console.error("Error",error);
                        ws.close();
                    }
                    break;
                case "participants" :
                    //update participant list
                    console.log("participants"+event.participants);
                    participants = event.participants;
                    break;
            }
        });
    }

    render() {
        const { classes } = this.props;
        return (
                <div className={classes.root}>
                    <Grid container className={classes.container} spacing={24}>
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
                        <Grid item xs={12}>
                            <video style={styles.videoLarge} ref={this.localVideo} id="localVideo" autoPlay="true"/>
                        </Grid>
                        <Grid item xs={3}>
                            <video style={styles.videoSmall} ref={this.remoteVideos[0]} id="remoteVideo1" autoPlay="true"/>
                        </Grid>
                        <Grid item xs={3}>
                            <video style={styles.videoSmall} ref={this.remoteVideos[1]} id="remoteVideo2" autoPlay="true"/>
                        </Grid>
                        <Grid item xs={3}>
                            <video style={styles.videoSmall} ref={this.remoteVideos[2]} id="remoteVideo3" autoPlay="true"/>
                        </Grid>
                        <Grid item xs={3}>
                            <video style={styles.videoSmall} ref={this.remoteVideos[3]} id="remoteVideo4" autoPlay="true"/>
                        </Grid>
                    </Grid>
                </div>
        );
    }
}

const styles = theme => ({
    root: {
        flexGrow: 1,
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
        paddingTop: 5, // 16:9
        width:640,
        height:480,
    },
    videoSmall: {
        paddingTop: 5, // 16:9
        width:176,
        height:144,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        height: '100%',
        color: theme.palette.text.secondary,
    },
});

MedoozeVideoRoom.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedoozeVideoRoom);




