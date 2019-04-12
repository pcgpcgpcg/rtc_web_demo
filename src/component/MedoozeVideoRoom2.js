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
let joined=false;
let poster_addr='https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1554783370112&di=b8e3916534a569ab6c13fcc8b01e9e32&imgtype=0&src=http%3A%2F%2Fimg.17xsj.com%2Fuploads%2Fallimg%2Fc121126%2F1353910E4M0-52Kb.jpg';

class MedoozeVideoRoom2 extends Component {

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
        this.url="wss://47.94.235.90:8083";
        this.localStreamID="";
        this.remoteIndex=-1;

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
        //Connect with websocket
        //Create room url
        const roomUrl = url +"?id="+roomId;
        const ws = new WebSocket(roomUrl,"unified-plan");
        //Crete transaction manager
        const tm = new TransactionManager(ws);
        /*var pc = new RTCPeerConnection({
            bundlePolicy: "max-bundle",
            rtcpMuxPolicy : "require"
        });*/


 /*       pc.onaddstream = function(event) {
            console.warn("pc::onAddStream",event);
            //local stream already rendered
            console.warn("that.reamoteIndex:"+that.remoteIndex);
            if(that.remoteIndex<0){
                console.warn("already rendered local stream id:"+that.localStreamID);
                that.remoteIndex++;
                return;
            }
            that.remoteVideos[that.remoteIndex].current.srcObject=event.stream;
            that.remoteIndex++;

            //that.addVideoForStream(event.stream);
        };

        pc.onremovestream = function(event) {
            console.warn("pc::onRemoveStream",event);
            //Play it
            //that.removeVideoForStream(event.stream);
        };

        pc.onnegotiationneeded = async () => {
            console.log("pc.onnegotiationneeded！");
            try {
                await pc.setLocalDescription(await pc.createOffer( ));
                console.log(pc.localDescription.type);
                console.log(pc.localDescription.sdp);
                // send the offer to the other peer
                //Join room
                /!*const joined = await tm.cmd("join",{
                    name	: that.name,
                    sdp	: pc.localDescription.sdp
                });
                console.log("pc.localDescription:"+pc.localDescription);*!/
                //signaling.send({desc: pc.localDescription});
            } catch (err){
                console.error(err);
            }
        };

// once media for a remote track arrives, show it in the remote video element
        pc.ontrack = (event) => {
            console.log("pc.ontrack！");
            // don't set srcObject again if it is already set.
            //if (remoteView.srcObject) return;
            //remoteView.srcObject = event.streams[0];
        };*/

        //myPeerConnection.onicecandidate = handleICECandidateEvent;
        //myPeerConnection.onremovetrack = handleRemoveTrackEvent;
        //myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
        //myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
        //myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;

        ws.onopen = async function()
        {
            console.log("ws:opened");
            var pc=new RTCPeerConnection({sdpSemantics:'unified-plan'});
            //Need to init like this
            /*pc.addTransceiver("audio",{direction:"inactive"});
            pc.addTransceiver("video",{direction:"inactive"});


            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            //const answer = await tm.cmd("offer",{sdp: offer.sdp});
            const answer = await tm.cmd("join",{
                name	: name,
                sdp	: offer.sdp
            });
            pc.setRemoteDescription({type:"answer",sdp:answer.sdp});*/
            const pending = [];
            let executing = false;
            // once media for a remote track arrives, show it in the remote video element
            pc.ontrack = (event) => {
                console.log("pc.ontrack！");
            };

            const execute = async (renegotiation)=>{
                //Add to pending
                pending.push(renegotiation);
                //If executing already
                if (executing)
                //Do not run agin loop
                    return;
                //Executing
                executing = true;
                //Execute all pending renegotiations
                while (pending.length)
                    //Execute first
                    await pending.shift()();
                //End execution
                executing = false;
            };

            pc.onnegotiationneeded = async ()=>{
                execute(async()=>{
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    //如果还没有加入房间进行sdp交换
                    console.log(pc.signalingState);
                    if (!joined){
                        const answer = await tm.cmd("join",{
                            name	: name,
                            sdp	: offer.sdp
                        });
                        await pc.setRemoteDescription({type:"answer",sdp:answer.sdp});
                        joined=true;
                    }else{

                    }
                    //const answer = await tm.cmd("offer",{sdp: offer.sdp});
                    //return pc.setRemoteDescription({type:"answer",sdp:answer.sdp});
                });
            };


            try
            {
                    const constraints={
                        audio: true,
                        video: true
                    };
                     //let stream = null;
                     try {
                         const stream = await navigator.mediaDevices.getUserMedia(constraints);
                        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

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

            tm.on("cmd",async (cmd)=>{
                switch(cmd.name)
                {
                    case "offer":
                        execute(async ()=>{
                            await pc.setRemoteDescription({type:"offer",sdp:cmd.data.sdp});
                            const answer = await pc.createAnswer();
                            cmd.accept({sdp:answer.sdp});
                            return pc.setLocalDescription(answer);
                        });
                        break;
                    default:
                        cmd.reject();
                }
            });

            tm.on("event",async function(event) {
                return;
                console.warn("ts::event",event);

                switch (event.name)
                {
                    case "update" :
                        try
                        {
                            console.warn("update"+event.data.sdp);

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
                            //此处根据participants数量来添加对应数量的transceiver
                            for(let i=0;i<that.remoteVideos;i++){
                                pc.addTransceiver("audio",{direction: "recvonly"});
                                pc.addTransceiver("video",{direction: "recvonly"});
                            }

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
                        console.warn("participants"+event.participants);
                        participants = event.participants;
                        break;
                }
            });

        };


    }

    render() {
        const { classes } = this.props;
        return (
            <div style={{ padding: 20 }}>
            <Grid container className={classes.container} spacing={8}>
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
                <Grid container justify="center" spacing={8}>
                <Grid item xs={12}>
                    <video className={classes.videoLarge}
                           ref={this.localVideo}
                           id="localVideo"
                           poster={poster_addr}
                           autoPlay="true"/>
                </Grid>
                </Grid>
                <Grid item xs={12}>
                    <Grid container justify="flex-start" spacing={24}>
                        {[0, 1, 2].map(value => (
                            <Grid key={value} item xs={3} zeroMinWidth>
                                <video className={classes.videoSmall}
                                       ref={this.remoteVideos[value]}
                                       id={value}
                                       poster={poster_addr}
                                       autoPlay="true"/>
                            </Grid>
                        ))}
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
        width:'70%',
        height:'90%',
    },
    videoSmall: {
        paddingTop: 1, // 16:9
        width:'100%',
        height:'100%',
        alignItems:"flex-start",
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        height: '1800',
        color: theme.palette.text.secondary,
    },
});

MedoozeVideoRoom2.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MedoozeVideoRoom2);




