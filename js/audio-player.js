
function AudioPlayer({src, controls}) {
  let audio = document.createElement("audio");
  audio.src = src;
  document.body.appendChild(audio);
  this.audioEl = audio;
  
  let ctx = new AudioContext();

  let analyser = this.analyser = ctx.createAnalyser();
  analyser.connect(ctx.destination);

  let mediaElSource = ctx.createMediaElementSource(this.audioEl);
  mediaElSource.connect(analyser);
  
  let visualizer = this.visualizer = new AudioVisualizer({
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
  play() {
    this.audioEl.play();
    this.playPauseButton.classList.remove("paused");
  },
  pause() {
    this.audioEl.pause();
    this.playPauseButton.classList.add("paused");
  },
  replay() {
    this.pause();
    this.audioEl.currentTime = 0;
    this.play();
  }
}

function setAudio(file) {
  let url = URL.createObjectURL(file);
  let AP = new AudioPlayer({
    src: url,
    controls: document.getElementById("controls")
  });
  document.body.classList.add("playing");
}