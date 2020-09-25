const socket = io('/');
const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '3310'
});

const videoGrid = document.getElementById('video-grid');

const myVideo = document.createElement('video');
myVideo.muted = true;

let myVideoStream;
const peers = {};

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, myVideoStream);

  // answer phone call
  peer.on('call', (call) => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      // Show stream in some video/canvas element.
      addVideoStream(video, userVideoStream);
    });
  });

  // user connected event
  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });
}).catch(error => {
  console.error('getUserMedia error', error);
});

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

// user disconnected event
socket.on('user-disconnected', userId => {
  console.log("User Disconnected");
  if (peers[userId]) peers[userId].close();
})


const connectToNewUser = (userId, stream) => {
  console.log('new user', userId);
  const call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });

  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
};


//*** Chat Section ***//
// input value
let msg = $("input");

// when you press enter - send message
$('html').keydown(function (e) {
  if (e.which == 13 && msg.val().length) {
    socket.emit('message', msg.val());
    msg.val('');
  }
});

socket.on("createdMessage", message => {
  console.log('message***', message);
  $("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`); // Display message
  scrollToBottom()
});

const scrollToBottom = () => {
  let d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
};


//*** Button Controls ***//
const muteUnmute = () => { // Mute Video
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  // console.log('object');
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fa fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fa fa-microphone-slash unmute"></i>
    <span>Unmute</span>
  `;
  document.querySelector('.main__mute_button').innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class="fa fa-stop"></i>
    <span>Stop Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="fa fa-video-camera stop"></i>
    <span>Play Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

const leaveMeeting = () => {
   console.log('leave meeting');
   const video = document.querySelector('video');

   // A video's MediaStream object is available through its srcObject attribute
   const mediaStream = video.srcObject;

   // Through the MediaStream, you can get the MediaStreamTracks with getTracks():
   const tracks = mediaStream.getTracks();

   // Tracks are returned as an array, so if you know you only have one, you can stop it with:
   tracks[0].stop();

   // Or stop all like so:
   tracks.forEach(track => track.stop())
   window.close();
   setStopVideo();
   setMuteButton();
   // document.querySelector('.main__leave_meeting').innerHTML = html;
 };
