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
  requestUserMedia: function() {
    var constraints = {
      audio: false,
      video: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT
      }
    };
    return navigator.mediaDevices.getUserMedia(constraints);
  },
  drawVideo: function(stream) {
    var video = document.createElement("video");
    video.hidden = true;
    document.body.appendChild(video);
    video.src = URL.createObjectURL(stream);
    video.play();
    this.video = video;
    this.refreshVideo();

  },
  refreshVideo: function() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    var canvas = this.canvas;
    var ctx = canvas.getContext("2d");

    ctx.drawImage(this.video, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    var oldCanvasData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    this.updateVisualizer();
    this.clipCanvas(oldCanvasData);
  },
    
  clipCanvas: function(oldCanvasData, averageLighting = 128.5) {
    var canvas = this.canvas;
    var ctx = canvas.getContext("2d");
    var data = oldCanvasData;
    var x = 0;
    var y = 0;
    for (var i = 0; i < data.length; i++) {
      if (i % 4 !== 0) continue;

      // Gather rgba for the current pixel
      var rgba = [data[i], data[i+1], data[i+2], data[i+3]];
      var avg = (rgba[0] + rgba[1] + rgba[2]) / 3;
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
  updateVisualizer: function() {
    var canvas = this.canvas,
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

    for (var i = 0; i < data.length; i++) {
      var frequency = data[i];
      var scaledFrequency = (frequency * canvas.height) / 200;
      ctx.fillRect(x, canvas.height - scaledFrequency, barWidth, scaledFrequency);
      ctx.clearRect(x, 0, barWidth, canvas.height - scaledFrequency);
//      ctx.clearRect(x + barWidth, 0, spacing, canvas.height);
      x += barWidth + spacing;
      if (x > canvas.width) break;
    }
  },
  takeShot: function() {
    var uri = canvas.toDataURL("image/png");
    window.open(uri, "_blank");
  }
};