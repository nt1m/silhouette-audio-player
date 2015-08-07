const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
function AudioVisualizer({audio, analyser, canvas}) {
  this.canvas = canvas;
  this.analyser = analyser;
  this.audioEl = audio;
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  this.refreshVideo = this.refreshVideo.bind(this);
  this.drawVideo = this.drawVideo.bind(this);
  this.requestUserMedia().then(this.drawVideo);
}
AudioVisualizer.prototype = {
  requestUserMedia() {
    let constraints = {
      audio: false,
      video: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
      }
    };
    return navigator.mediaDevices.getUserMedia(constraints);
  },
  drawVideo(stream) {
    let video = document.createElement("video");
    video.hidden = true;
    document.body.appendChild(video);
    video.src = URL.createObjectURL(stream);
    video.play();
    this.video = video;
    this.refreshVideo();

  },
  refreshVideo() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    let canvas = this.canvas;
    let ctx = canvas.getContext("2d");

    ctx.drawImage(this.video, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    let oldCanvasData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    this.updateVisualizer();
    this.clipCanvas(oldCanvasData);
  },
    
  clipCanvas(oldCanvasData, averageLighting = 128.5) {
    let canvas = this.canvas;
    let ctx = canvas.getContext("2d");
    let data = oldCanvasData;
    let x = 0;
    let y = 0;
    for (let i = 0; i < data.length; i++) {
      if (i % 4 !== 0) continue;

      // Gather rgba for the current pixel
      let rgba = [data[i], data[i+1], data[i+2], data[i+3]];
      let avg = (rgba[0] + rgba[1] + rgba[2]) / 3;
      if (avg < averageLighting) {
        ctx.clearRect(x,y,1,1);
      }

      x++;
      if (x == canvas.width) {
        x = 0;
        y++;
      }
    }
    this.animationFrame = requestAnimationFrame(this.refreshVideo);
  },
  updateVisualizer() {
    let canvas = this.canvas,
        ctx = canvas.getContext("2d"),
        barWidth = SCREEN_WIDTH / 80,
        spacing = 2,
        analyser = this.analyser,
        data = new Uint8Array(analyser.frequencyBinCount);
        x = 0;
    if (this.audioEl.paused ||
        this.audioEl.ended ||
        this.audioEl.muted) {
      return;
    }
  
    analyser.getByteFrequencyData(data);

    ctx.fillStyle = "#0095dd";

    for (let frequency of data) {
      let scaledFrequency = (frequency * canvas.height) / 200;
      ctx.fillRect(x, canvas.height - scaledFrequency, barWidth, scaledFrequency);
      ctx.clearRect(x, 0, barWidth, canvas.height - scaledFrequency);
//      ctx.clearRect(x + barWidth, 0, spacing, canvas.height);
      x += barWidth + spacing;
      if (x > canvas.width) break;
    }
  },
  takeShot() {
    let uri = canvas.toDataURL("image/png");
    window.open(uri, "_blank");
  }
};