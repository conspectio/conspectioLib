// require in jquery
const $ = require("jquery");
const send = require('./send.js');

// custom wrapper class over RTCPeerConnection object
class ConspectioViewer {
  constructor(broadcasterId, viewerHandlers) {
    this.broadcasterId = broadcasterId;
    this.viewerHandlers = viewerHandlers;
    this.pc;
  }

  init() {
    this.pc = new RTCPeerConnection({
      'iceServers': [
        {
          'url': 'stun:stun.l.google.com:19302'
        },
        {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        }
      ]
    });
 
    this.pc.broadcasterId = this.broadcasterId; // add custom attribute
    this.pc.viewerHandlers = this.viewerHandlers; // add custom attribute
    this.pc.onicecandidate = this.handleIceCandidate;
    this.pc.onaddstream = this.handleRemoteStreamAdded;
    this.pc.onremovestream = this.handleRemoteStreamRemoved;
    this.pc.oniceconnectionstatechange = this.handleIceConnectionChange;
  }

  handleIceCandidate(event) {
    console.log('handleIceCandidate event: ', event);
    if(event.candidate) {
      send(this.broadcasterId, {
        type: "candidate",
        candidate: event.candidate
      });
    }
  }

  handleRemoteStreamAdded(event) {
    console.log('got a stream from broadcaster');
    // got remote video stream, now let's show it in a video tag
    const video = $('<video class="newVideo"></video>').attr(
      {
        'src': window.URL.createObjectURL(event.stream),
        'autoplay': true,
        'id': this.broadcasterId.slice(2)
      });
    
    // invoke broadcasterAdded callback
    if(this.viewerHandlers && this.viewerHandlers.broadcasterAdded) {
      this.viewerHandlers.broadcasterAdded(video);
    }
  }

  handleRemoteStreamRemoved(event) {
    // don't think this handler is being invoked
    console.log('broadcaster stream removed');
  }

  handleIceConnectionChange() {
    if(this.pc) {
      console.log('inside handleIceCandidateDisconnect', this.pc.iceConnectionState);

      // comment out the following check to allow for iceRestart
      // if(this.pc.iceConnectionState === 'disconnected') {
      //   console.log('inside pc.onIceConnectionState')
      //   this.pc.close();
      //   delete conspectio.connections[this.broadcasterId];
      // }
    }
  }

  receiveOffer(offer) {
    this.pc.setRemoteDescription(new RTCSessionDescription(offer));
  }

  createAnswerWrapper() {
    this.pc.createAnswer( (answer) => {
      this.pc.setLocalDescription(new RTCSessionDescription(answer));

      send(this.broadcasterId, {
        type: "answer",
        answer: answer
      });
    }, (error) => {
      console.log('Error with creating viewer offer', error);
    });
  }

  addCandidate(candidate) {
    this.pc.addIceCandidate(new RTCIceCandidate(candidate));
  }
  
  closeWrapper() {
    this.pc.close();

    // invoke broadcasterRemoved callback passing in video id to indicate dom element removal
    if(this.viewerHandlers && this.viewerHandlers.broadcasterRemoved) {
      this.viewerHandlers.broadcasterRemoved(this.broadcasterId.slice(2));
    }
  }
}

module.exports = ConspectioViewer;