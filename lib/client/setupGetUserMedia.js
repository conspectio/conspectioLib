// require in jquery
const $ = require("jquery");

const setupGetUserMedia = (domId, callback) => {

  // retrieve getUserMedia
  navigator.getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia);
    
  if (navigator.getUserMedia) {       
    navigator.getUserMedia({video: true, audio: true}, handleVideo, videoError);
  }

  function handleVideo(stream) {
    // grab the broadcasterStream dom element and set the src
    const broadcasterStreamId = '#' + domId;
    const broadcasterStream = $(broadcasterStreamId)[0];
    broadcasterStream.src = window.URL.createObjectURL(stream);

    // invoke callback - which will call broadcasterRTCEndpoint(stream)
    callback(stream);
  }

  function videoError(e) {
      // log video error
      console.log('Unable to get stream from getUserMedia', e);
  }

};

module.exports = setupGetUserMedia;