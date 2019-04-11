pc.ontrack = (event) => {
    console.log("pc.ontrack！");
};

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
const answer = await tm.cmd("offer",{sdp: offer.sdp});
pc.setRemoteDescription({type:"answer",sdp:answer.sdp});
const pending = [];
let executing = false;

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
        const answer = await tm.cmd("offer",{sdp: offer.sdp});
        return pc.setRemoteDescription({type:"answer",sdp:answer.sdp});
    });
};
