// --- prefix -----
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
const RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection
const RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription

class WS extends WebSocket {
  constructor(URL) {
    super(URL)
    this.peer = null
    this.onopen = this.open
    this.onerror = this.error
  }

  setup(peer) {
    this.peer = peer
    this.onmessage = this.message
  }

  open() {
    alert('Let\'s call')
  }

  error(err) {
    alert('faild! check console log')
    console.error('ws onerror() ERR:', err)
  }

  message(evt) {
    let message = JSON.parse(evt.data)
    if (message.type === 'offer') {
      // -- got offer ---
      console.log('Received offer ...')
      let offer = new RTCSessionDescription(message)
      this.setOffer(offer)
    } else if (message.type === 'answer') {
      // --- got answer ---
      console.log('Received answer ...')
      let answer = new RTCSessionDescription(message)
      this.setAnswer(answer)
    }
  }

  setOffer(sessionDescription) {
    this.peer.setRemoteDescription(sessionDescription)
    .then(() => {
      console.log('setRemoteDescription(offer) succsess in promise')
      this.peer.makeAnswer()
    }).catch(err => {
      console.error('setRemoteDescription(offer) ERROR: ', err)
    })
  }

  setAnswer(sessionDescription) {
    if (!this.peer) {
      console.error('peerConnection NOT exist!')
      return
    }
    this.peer.setRemoteDescription(sessionDescription)
    .catch(err => {
      console.error('setRemoteDescription(answer) ERROR: ', err)
    })
  }
}

class MyStream {
  constructor() {
    this.stream = null
  }

  getDeviceStream(options) {
    if ('getUserMedia' in navigator.mediaDevices) {
      return navigator.mediaDevices.getUserMedia(options)
    } else {
      return new Promise((resolve, reject) => {
        navigator.getUserMedia(options, resolve, reject)
      })
    }
  }

  start(callback) {
    this.getDeviceStream({ video: true, audio: true })
    .then(stream => {
      this.stream = stream
      callback()
    }).catch(error => {
      console.error('getUserMedia error:', error)
      return
    })
  }

  stop() {
    const tracks = this.stream.getTracks()
    if (!tracks) {
      console.warn('NO tracks')
      return
    }

    for (let track of tracks) {
      track.stop()
    }
  }
}

class RemoteVideo {
  constructor(id = 'remote-video') {
    this.elem = document.getElementById(id)
    // this.elem.volume = 0
    this.stream = null
  }

  playVideo() {
    if ('srcObject' in this.elem) {
      this.elem.srcObject = this.stream
    } else {
      this.elem.src = window.URL.createObjectURL(this.stream)
    }
    this.elem.play()
  }

  stop() {
    this.pauseVideo()
    this.stopStream()
  }

  pauseVideo() {
    this.elem.pause()
    if ('srcObject' in this.elem) {
      this.elem.srcObject = null
    } else {
      if (this.elem.src && (this.elem.src !== '')) {
        window.URL.revokeObjectURL(this.elem.src)
      }
      this.elem.src = ''
    }
  }

  stopStream() {
    const tracks = this.stream.getTracks()
    if (!tracks) {
      console.warn('NO tracks')
      return
    }

    for (let track of tracks) {
      track.stop()
    }
  }
}

class Peer extends RTCPeerConnection {
  constructor(ws, option) {
    super(option)
    this.ws = ws
    this.remoteVideo = new RemoteVideo('remote-video')
    this.setup()
  }

  setup() {
    if ('ontrack' in this) {
      this.ontrack = evt => {
        console.log('-- peer.ontrack()')
        this.remoteVideo.stream = evt.streams[0]
        this.remoteVideo.playVideo()
      }
    } else {
      this.onaddstream = function (evt) {
        console.log('-- peer.onaddstream()')
        this.remoteVideo.stream = evt.stream
        this.remoteVideo.playVideo()
      }
    }

    // --- on get local ICE candidate
    this.onicecandidate = evt => {
      if (!evt.candidate) {
        this.sendSdp()
      }
    }

    this.oniceconnectionstatechange = () => {
      console.log('== ice connection status=' + this.iceConnectionState)
      if (this.iceConnectionState === 'disconnected') {
        console.log('-- disconnected --')
        this.hangUp()
      }
    }
    this.onremovestream = evt => {
      console.log('-- peer.onremovestream()')
      this.remoteVideo.stop()
    }
  }

  makeAnswer() {
    console.log('sending Answer. Creating remote session description...')
    if (!this) {
      console.error('peerConnection NOT exist!')
      return
    }

    this.createAnswer()
    .then(sessionDescription =>  {
      console.log('createAnswer() succsess in promise')
      return this.setLocalDescription(sessionDescription)
    }).catch(function (err) {
      console.error(err)
    })
  }

  sendSdp() {
    console.log('sending sdp...')
    let message = JSON.stringify(this.localDescription)
    this.ws.send(message)
  }

  hangUp() {
    console.log('Hang up.')
    this.close()
    this.remoteVideo.stop()
  }
}

window.onload = () => {
  const wsURL = document.querySelector('[name="ws-url"]')
  const serverConnectBtn = document.getElementById('server-connect-btn')

  const callBtn = document.getElementById('call-btn')

  const myStream = new MyStream()
  let ws

  serverConnectBtn.onclick = () => {
    ws = new WS(wsURL.value)
  }

  callBtn.onclick = () => {
    if (!ws) {
      alert('websocket server is not connected\npush server connect button')
      return
    }

    myStream.start(() => {
      const peer = new Peer(ws, { iceServers: [] })
      ws.setup(peer)

      peer.addStream(myStream.stream)
      peer.createOffer()
      .then(sessionDescription => {
        return peer.setLocalDescription(sessionDescription)
      }).catch(function (err) {
        console.error(err)
      })
    })
  }
}