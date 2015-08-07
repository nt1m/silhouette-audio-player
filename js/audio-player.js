
function AudioPlayer(params) {
  var src = params.src;
  var controls = params.controls;
  var audio = document.createElement("audio");
  audio.src = src;
  document.body.appendChild(audio);
  this.audioEl = audio;
  
  var ctx = new AudioContext();

  var analyser = this.analyser = ctx.createAnalyser();
  analyser.connect(ctx.destination);

  var mediaElSource = ctx.createMediaElementSource(this.audioEl);
  mediaElSource.connect(analyser);
  
  var visualizer = this.visualizer = new AudioVisualizer({
    audio: this.audioEl,
    analyser,
    canvas: document.getElementById("canvas")
  });
  [...controls.querySelectorAll("[data-action]")].forEach((button) => {
    if (button.dataset.action == "play-pause") {
      this.playPauseButton = button;
    }
    button.addEventListener("click", () => {
      switch (button.dataset.action) {
        case "play-pause":
          if (this.audioEl.paused) {
            this.play();
          }
          else {
            this.pause();
          }
          break;
        case "take-pic":
          this.visualizer.takeShot();
          break;
        case "replay":
          this.replay();
          break;
      }
    });
  });
  this.play();
}

AudioPlayer.prototype = {
  play: function() {
    this.audioEl.play();
    this.playPauseButton.classList.remove("paused");
  },
  pause: function() {
    this.audioEl.pause();
    this.playPauseButton.classList.add("paused");
  },
  replay: function() {
    this.pause();
    this.audioEl.currentTime = 0;
    this.play();
  }
}

function setAudio(file) {
  var url = URL.createObjectURL(file);
  var AP = new AudioPlayer({
    src: url,
    controls: document.getElementById("controls")
  });
  document.body.classList.add("playing");
}