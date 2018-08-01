import React, { Component } from 'react';
import {Janus} from 'janusjs-sdk'

class PTTAudio extends Component{
    constructor(props){
        super(props);
        this.state={

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
        this.audioEnabled = true;
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
                                        //加入房间
                                        var register = { "request": "join", "room": that.myroom, "display": 'pcg' };
                                        that.mixertest.send({"message": register});
                                    },
                                    error: function(error) {
                                        Janus.error("  -- Error attaching plugin...", error);
                                    },
                                    onmessage: function(msg, jsep) {
                                        Janus.debug(" ::: Got a message :::");
                                        Janus.debug(msg);
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
                                                                Janus.debug("Got SDP!");
                                                                Janus.debug(jsep);
                                                                var publish = { "request": "configure", "muted": false };
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
                                                        Janus.debug("  >> [" + id + "] " + display + " (setup=" + setup + ", muted=" + muted + ")");
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
                                        // Mute button
                                        that.audioenabled = true;
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

    setAudioEnable(bEnable){
        this.audioEnabled = bEnable;
        this.mixertest.send({message: { "request": "configure", "muted": !bEnable }});
    }

    componentWillUnmount(){
        if(this.janus){
            this.janus.destroy();
        }
    }

    render(){
        return (
           <audio ref={this.remoteAudio} id="remoteAudio"></audio>
        );
    }
}

export default PTTAudio;