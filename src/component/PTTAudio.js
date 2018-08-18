import React, { Component } from 'react';
import {Janus} from 'janusjs-sdk'
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import {AudioIcon} from "../img/svgIcons";

class PTTAudio extends Component{
    constructor(props){
        super(props);
        this.state={
            audioEnabled:false,
        }
        this.remoteAudio=React.createRef();
        this.bWebrtcSupport=false;
        this.server = "https://39.106.100.180:8089/janus";
        this.janus = null;
        this.mixertest = null;
        this.opaqueId = "audiobridgetest-"+Janus.randomString(12);
        this.myroom = 1234;	// Demo room
        this.myusername = null;
        this.myid = null;
        this.webrtcUp = false;
        //this.audioEnabled = true;
        this.handleButtonPress=this.handleButtonPress.bind(this);
        this.handleButtonRelease=this.handleButtonRelease.bind(this);
    }

    componentDidMount() {
        var that=this;
        //一进入就要连接 但是一开始先不enable audio
        Janus.init({debug: "all", callback: function() {
                if(!Janus.isWebrtcSupported()) {
                    that.bWebrtcSupport=false;
                }
                else{
                    that.bWebrtcSupport=true;
                }

                // Create session
                that.janus = new Janus(
                    {
                        server: that.server,
                        success: function() {
                            // Attach to Audio Bridge test plugin
                            that.janus.attach(
                                {
                                    plugin: "janus.plugin.audiobridge",
                                    opaqueId: that.opaqueId,
                                    success: function(pluginHandle) {
                                        that.mixertest = pluginHandle;
                                        Janus.log("Plugin attached! (" + that.mixertest.getPlugin() + ", id=" + that.mixertest.getId() + ")");
                                        /*在此处创建房间*/
                                        //先判断房间是否存在

                                        //如果存在，则直接加入
                                        //不存在，则创建
                                        that.myroom=1234567;
                                        var create_room={"request":"create","room": that.myroom, "permanent": false,
                                            "description":"groupname1", "is_private": false};
                                        that.mixertest.send({"message": create_room,
                                            success:function(data){
                                                if(data === undefined || data === null){
                                                    console.log("create_room return null");
                                                }
                                                //TODO fix event not equal room_already_exist
                                                else if(data["audiobridge"]==="created"||data["audiobridge"]==="event"){
                                                    //创建房间成功或者房间本来就存在，请加入
                                                    //加入房间
                                                    var register = { "request": "join", "room": that.myroom, "display": 'pcg' };
                                                    that.mixertest.send({"message": register});
                                                }
                                        }});
                                    },
                                    error: function(error) {
                                        Janus.error("  -- Error attaching plugin...", error);
                                    },
                                    onmessage: function(msg, jsep) {
                                        Janus.debug(" ::: Got a message :::");
                                        Janus.log(msg);
                                        console.log(" ::: Got a message :::");
                                        console.log(msg);
                                        var event = msg["audiobridge"];
                                        Janus.debug("Event: " + event);
                                        if(event != undefined && event != null) {
                                            if(event === "joined") {
                                                // Successfully joined, negotiate WebRTC now
                                                that.myid = msg["id"];
                                                Janus.log("Successfully joined room " + msg["room"] + " with ID " + that.myid);
                                                if(!that.webrtcUp) {
                                                    that.webrtcUp = true;
                                                    // Publish our stream
                                                    that.mixertest.createOffer(
                                                        {
                                                            media: { video: false},	// This is an audio only room
                                                            success: function(jsep) {
                                                                Janus.log("Got SDP!");
                                                                Janus.log(jsep);
                                                                var publish = { "request": "configure", "muted": !that.state.audioEnabled };
                                                                that.mixertest.send({"message": publish, "jsep": jsep});
                                                            },
                                                            error: function(error) {
                                                                Janus.error("WebRTC error:", error);
                                                            }
                                                        });
                                                }
                                                // Any room participant?
                                                if(msg["participants"] !== undefined && msg["participants"] !== null) {
                                                    var list = msg["participants"];
                                                    Janus.debug("Got a list of participants:");
                                                    Janus.debug(list);
                                                    for(var f in list) {
                                                        var id = list[f]["id"];
                                                        var display = list[f]["display"];
                                                        var setup = list[f]["setup"];
                                                        var muted = list[f]["muted"];
                                                        Janus.log("  >> [" + id + "] " + display + " (setup=" + setup + ", muted=" + muted + ")");
                                                    }
                                                }
                                            }  else if(event === "destroyed") {
                                                // The room has been destroyed
                                                Janus.warn("The room has been destroyed!");
                                            } else if(event === "event") {
                                                if(msg["participants"] !== undefined && msg["participants"] !== null) {
                                                    var list = msg["participants"];
                                                    Janus.debug("Got a list of participants:");
                                                    Janus.debug(list);
                                                    for(var f in list) {
                                                        var id = list[f]["id"];
                                                        var display = list[f]["display"];
                                                        var setup = list[f]["setup"];
                                                        var muted = list[f]["muted"];
                                                        Janus.debug("  >> [" + id + "] " + display + " (setup=" + setup + ", muted=" + muted + ")");
                                                    }
                                                } else if(msg["error"] !== undefined && msg["error"] !== null) {
                                                    if(msg["error_code"] === 485) {
                                                        // This is a "no such room" error: give a more meaningful description
                                                    } else {
                                                    }
                                                    return;
                                                }
                                                // Any new feed to attach to?
                                                if(msg["leaving"] !== undefined && msg["leaving"] !== null) {
                                                    // One of the participants has gone away?
                                                    var leaving = msg["leaving"];
                                                    Janus.log("Participant left: " + leaving);
                                                }
                                            }
                                        }
                                        if(jsep !== undefined && jsep !== null) {
                                            Janus.debug("Handling SDP as well...");
                                            Janus.debug(jsep);
                                            that.mixertest.handleRemoteJsep({jsep: jsep});
                                        }
                                    },
                                    onlocalstream: function(stream) {
                                        Janus.debug(" ::: Got a local stream :::");
                                        Janus.debug(stream);
                                        // We're not going to attach the local audio stream
                                    },
                                    onremotestream: function(stream) {
                                        Janus.attachMediaStream(that.remoteAudio.current, stream);
                                    },
                                    oncleanup: function() {
                                        that.webrtcUp = false;
                                        Janus.log(" ::: Got a cleanup notification :::");
                                    }
                                });
                        },
                        error: function(error) {
                            Janus.error(error);
                        },
                        destroyed: function() {

                        }
                    });
            }});
    }

    handleButtonPress () {
        this.mixertest.send({message: { "request": "configure", "muted": false }});
        this.setState({audioEnable:true});
    }

    handleButtonRelease () {
        this.mixertest.send({message: { "request": "configure", "muted": true }});
        this.setState({audioEnable:false});
    }

    componentWillUnmount(){
        if(this.janus){
            this.janus.destroy();
        }
    }

    render(){
        const fab= {
            color: 'secondary',
            className: this.props.classes.fab,
            icon: <AudioIcon />,
        };
        return (
            <div>
             <Button variant="fab" className={fab.className} color={fab.color} onTouchStart={this.handleButtonPress}
                        onTouchEnd={this.handleButtonRelease} onMouseDown={this.handleButtonPress} onMouseUp={this.handleButtonRelease}>
                    {fab.icon}
             </Button>
           <audio ref={this.remoteAudio} id="remoteAudio" autoPlay="true"></audio>
            </div>
        );
    }
}

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        width: 500,
        position: 'relative',
        minHeight: 200,
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing.unit * 7,
        right: theme.spacing.unit * 2,
    },
});

PTTAudio.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(PTTAudio);