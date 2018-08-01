import React, { Component } from 'react';
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
import {VideoIcon,VideoOffIcon,AudioIcon,AudioOffIcon} from '../img/svgIcons'
import NativeSelect from '@material-ui/core/NativeSelect';

class EchoTest extends Component {

    constructor(props){
        super(props);
        this.state={
            localVideoSrc:null,
            videoEnable:true,
            audioEnable:true,
            bitrateValue:100,
            startEchoTest:false,
        }

        // create a ref to store the video DOM element
        this.localVideo = React.createRef();
        this.remoteVideo=React.createRef();
        this.localVideo=React.createRef();
        this.setLocalVideoRef = element => {
            this.localVideo = element;
        };

        this.server = "https://39.106.100.180:8089/janus";
        this.opaqueId = "echotest-"+Janus.randomString(12);
        this.echotest = null;
        this.janus=null;
        this.bitrateTimer=null;
        this.bitrateNow=null;
        this.WidthAndHeight="";

        this.handleStart=this.handleStart.bind(this);
        this.handleVideoOn=this.handleVideoOn.bind(this);
        this.handleAudioOn=this.handleAudioOn.bind(this);
        this.handleSelectChange=this.handleSelectChange.bind(this);
    }

    componentDidMount() {
        Janus.init({debug: "all", callback: function() {

            }});
    }

    componentWillUnmount(){
        if(this.bitrateTimer&&this.janus){
            clearInterval(this.bitrateTimer);
            this.janus.destroy();
        }
    }

    handleVideoOn(){
        this.echotest.send({"message": { "video": !this.state.videoEnable }});
        this.setState({videoEnable: !this.state.videoEnable});
    }

    handleAudioOn(){
        this.echotest.send({"message": { "audio": !this.state.audioEnable }});
        this.setState({audioEnable: !this.state.audioEnable});
    }

    handleSelectChange = name => event => {
        this.setState({ [name]: event.target.value });
        this.echotest.send({"message": { "bitrate": event.target.value }});
    };



    handleStart(){
        if(this.state.startEchoTest){
            clearInterval(this.bitrateTimer);
            this.janus.destroy();
            this.bitrateTimer=null;
            this.janus=null;
            this.setState({startEchoTest:!this.state.startEchoTest});
            return;
        }

        this.setState({startEchoTest:!this.state.startEchoTest});

        if(!Janus.isWebrtcSupported()) {
            alert("No WebRTC support... ");
            return;
        }
        var that=this;
        // Create session
        this.janus = new Janus(
            {
                server: this.server,
                // No "iceServers" is provided, meaning janus.js will use a default STUN server
                // Here are some examples of how an iceServers field may look like to support TURN
                // 		iceServers: [{urls: "turn:yourturnserver.com:3478", username: "janususer", credential: "januspwd"}],
                // 		iceServers: [{urls: "turn:yourturnserver.com:443?transport=tcp", username: "janususer", credential: "januspwd"}],
                // 		iceServers: [{urls: "turns:yourturnserver.com:443?transport=tcp", username: "janususer", credential: "januspwd"}],
                // Should the Janus API require authentication, you can specify either the API secret or user token here too
                //		token: "mytoken",
                //	or
                //		apisecret: "serversecret",
                success: function() {
                    // Attach to echo test plugin
                    that.janus.attach(
                        {
                            plugin: "janus.plugin.echotest",
                            opaqueId: this.opaqueId,
                            success: function(pluginHandle) {
                                that.echotest = pluginHandle;
                                Janus.log("Plugin attached! (" + that.echotest.getPlugin() + ", id=" + that.echotest.getId() + ")");
                                // Negotiate WebRTC
                                var body = { "audio": true, "video": true };
                                Janus.debug("Sending message (" + JSON.stringify(body) + ")");
                                that.echotest.send({"message": body});
                                Janus.debug("Trying a createOffer too (audio/video sendrecv)");
                                that.echotest.createOffer(
                                    {
                                        // No media provided: by default, it's sendrecv for audio and video
                                        media: { data: true },	// Let's negotiate data channels as well
                                        // If you want to test simulcasting (Chrome and Firefox only), then
                                        // pass a ?simulcast=true when opening this demo page: it will turn
                                        // the following 'simulcast' property to pass to janus.js to true
                                        simulcast: false,
                                        success: function(jsep) {
                                            Janus.debug("Got SDP!");
                                            Janus.debug(jsep);
                                            that.echotest.send({"message": body, "jsep": jsep});
                                        },
                                        error: function(error) {
                                            Janus.error("WebRTC error:", error);
                                            alert("WebRTC error... " + JSON.stringify(error));
                                        }
                                    });
                            },
                            error: function(error) {
                                console.error("  -- Error attaching plugin...", error);
                                alert("Error attaching plugin... " + error);
                            },
                            iceState: function(state) {
                                Janus.log("ICE state changed to " + state);
                            },
                            mediaState: function(medium, on) {
                                Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                            },
                            webrtcState: function(on) {
                                Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                            },
                            slowLink: function(uplink, nacks) {
                                Janus.warn("Janus reports problems " + (uplink ? "sending" : "receiving") +
                                    " packets on this PeerConnection (" + nacks + " NACKs/s " + (uplink ? "received" : "sent") + ")");
                            },
                            onmessage: function(msg, jsep) {
                                Janus.debug(" ::: Got a message :::");
                                Janus.debug(msg);
                                if(jsep !== undefined && jsep !== null) {
                                    Janus.debug("Handling SDP as well...");
                                    Janus.debug(jsep);
                                    that.echotest.handleRemoteJsep({jsep: jsep});
                                }
                                var result = msg["result"];
                                if(result !== null && result !== undefined) {
                                    if(result === "done") {
                                        // The plugin closed the echo test
                                        alert("The Echo Test is over");
                                        return;
                                    }
                                    // Any loss?
                                    var status = result["status"];
                                    if(status === "slow_link") {
                                        //~ var bitrate = result["bitrate"];
                                        //~ toastr.warning("The bitrate has been cut to " + (bitrate/1000) + "kbps", "Packet loss?", {timeOut: 2000});
                                    }
                                }
                                // Is simulcast in place?
                                var substream = msg["substream"];
                                var temporal = msg["temporal"];
                                if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {

                                }
                            },
                            onlocalstream: function(stream) {
                                Janus.debug(" ::: Got a local stream :::");
                                Janus.debug(stream);

                                Janus.attachMediaStream(that.localVideo.current, stream);

                                if(that.echotest.webrtcStuff.pc.iceConnectionState !== "completed" &&
                                    that.echotest.webrtcStuff.pc.iceConnectionState !== "connected") {
                                    // No remote video yet
                                }
                                var videoTracks = stream.getVideoTracks();
                                if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                                    // No webcam
                                } else {

                                }
                            },
                            onremotestream: function(stream) {
                                Janus.debug(" ::: Got a remote stream :::");
                                Janus.debug(stream);
                                Janus.attachMediaStream(that.remoteVideo.current, stream);
                                var videoTracks = stream.getVideoTracks();
                                if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                                    // No remote video
                                } else {

                                }

                                if(Janus.webRTCAdapter.browserDetails.browser === "chrome" || Janus.webRTCAdapter.browserDetails.browser === "firefox" ||
                                    Janus.webRTCAdapter.browserDetails.browser === "safari") {

                                }
                                that.bitrateTimer = setInterval(function() {
                                    // Display updated bitrate, if supported
                                    var bitrate = that.echotest.getBitrate();
                                    that.setState({bitrateNow:bitrate});
                                    //~ Janus.debug("Current bitrate is " + echotest.getBitrate());
                                    // Check if the resolution changed too
                                    var width = that.remoteVideo.current.videoWidth;
                                    var height = that.remoteVideo.current.videoHeight;
                                    if(width > 0 && height > 0){
                                        that.setState({WidthAndHeight:width+'x'+height});
                                    }
                                }, 1000);
                            },
                            ondataopen: function(data) {
                                Janus.log("The DataChannel is available!");
                            },
                            ondata: function(data) {
                                Janus.debug("We got data from the DataChannel! " + data);
                            },
                            oncleanup: function() {
                                Janus.log(" ::: Got a cleanup notification :::");
                            }
                        });
                },
                error: function(error) {
                    Janus.error(error);
                    alert(error, function() {
                        window.location.reload();
                    });
                },
                destroyed: function() {
                    window.location.reload();
                }
            });
    }

    render() {
        return (
            <div style={{ padding: 20 }}>
                <CssBaseline />
                <Grid container style={styles.root} xs={12} spacing={6} justify="center" zeroMinWidth={0}>
                    <Grid item xs={12}>
                        <header >
                            <h1 className="App-title">Janus Echo Test</h1>
                        </header>
                    </Grid>
                    <Grid item xs={12}>
                        <Button color="primary" variant="contained" onClick={this.handleStart}>
                            {this.state.startEchoTest?'stop':'start'}
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

export default EchoTest;
