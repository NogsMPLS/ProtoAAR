import React, { Component } from "react";
import { render } from "react-dom";
import { AFrameRenderer, Marker } from "react-web-ar";
import { Box, Sphere, Entity } from "react-aframe-ar";
import Pitchfinder from "pitchfinder";
import MicrophoneStream from "microphone-stream";

const detectPitch = new Pitchfinder.YIN();
const micStream = new MicrophoneStream();

function getNoteColor(pitch) {
  if (pitch < 42) return "#520100";
  if (pitch < 90) return "#B20204";
  if (pitch < 143) return "#FF6000";
  if (pitch < 173) return "#99FE00";
  if (pitch < 237) return "#28FF01";
  if (pitch < 320) return "#007DFE";
  if (pitch <= 350) return "#4400E9";
}

class AppScene extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldSize: 0.5,
      newSize: 0.5,
      color: "yellow",
      audioData: []
    };
  }

  componentDidMount() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        micStream.setStream(stream);
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();

        this.scriptProcessor = this.audioCtx.createScriptProcessor();
        //analyser node
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.fftSize = 2048;

        //stream source
        this.source = this.audioCtx.createMediaStreamSource(stream);

        //connect source to analyser node
        this.source.connect(this.analyser);
        //connect analyser to script process
        this.analyser.connect(this.scriptProcessor);
        //connect source to destination

        this.scriptProcessor.connect(this.audioCtx.destination);

        this.scriptProcessor.onaudioprocess = AudioProcessingEvent => {
          //levels
          this.audioLevels = new Uint8Array(this.analyser.frequencyBinCount);
          this.analyser.getByteFrequencyData(this.audioLevels);
          //waveform
          this.waveform = new Uint8Array(this.analyser.fftSize);
          this.analyser.getByteTimeDomainData(this.waveform);

          //volume boost
          var boost = 0;
          for (var i = 0; i < this.audioLevels.length; i++) {
            boost += this.audioLevels[i];
          }
          this.volume = boost / this.audioLevels.length;
          this.setState({
            audioLevels: this.audioLevels,
            waveform: this.waveform,
            volume: this.volume
          });
        };

        //   this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        //   this.timer = 0;
        //   micStream.on('data', (chunk) => {
        //     var d = new Date();
        //     var currenttime = d.getTime();
        //     var interval = currenttime - this.timer;
        //     if(interval >= 100){
        //       this.timer = currenttime
        //       this.changeColor(chunk);
        //     };
        //     this.changeSize();
        //   });
      })
      .catch(err => console.log("err: ", err));
  }

  // changeColor = (chunk) => {
  //   var raw = MicrophoneStream.toRaw(chunk);
  //   var pitch = detectPitch(raw);
  //   do {
  //     pitch = pitch - 350;
  //   } while (pitch > 350);
  //   var color = getNoteColor(pitch);
  //   this.setState({newColor: color, oldColor: this.state.newColor});
  // }

  changeSize = chunk => {
    this.analyser.getByteFrequencyData(this.dataArray);
    var size = this.dataArray[0] ? this.dataArray[0] / 100 : 0.05;
    this.setState({ oldSize: this.state.newSize, newSize: size });
  };
  render() {
    const newBox1 =
      this.state.audioLevels[15] / 100 > 1
        ? 1
        : this.state.audioLevels[15] / 100;
    const newBox2 =
      this.state.audioLevels[30] / 100 > 1
        ? 1
        : this.state.audioLevels[30] / 100;
    const newBox3 =
      this.state.audioLevels[45] / 100 > 1
        ? 1
        : this.state.audioLevels[45] / 100;
    const oldBoost = this.state.oldBoost;
    // const newColor = this.state.newColor;
    // const oldColor = this.state.oldColor;
    return (
      <AFrameRenderer stats>
        <Marker>
          <Entity
            material="opacity: 1;"
            position="0 0 0"
            geometry="primitive: sphere; segmentsWidth: 1; segmentsHeight: 2, phiStart: 50, phiLength: 360, thetaStart: 0, thetaLength: 360"
          />
        </Marker>
      </AFrameRenderer>
    );
  }
}

render(<AppScene />, document.querySelector("#sceneContainer"));
