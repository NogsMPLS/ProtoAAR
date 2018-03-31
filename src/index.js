import React, { Component } from "react";
import { render } from "react-dom";
import { AFrameRenderer, Marker } from "react-web-ar";
import { Box } from "react-aframe-ar";
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

        this.scriptProcessor = this.audioCtx.createScriptProcessor(2048);
        //analyser node
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.6;
        this.analyser.fftSize = 512;

        //stream source
        this.source = this.audioCtx.createMediaStreamSource(stream);

        //connect source to analyser node
        this.source.connect(this.analyser);
        //connect analyser to script process
        this.analyser.connect(this.scriptProcessor);
        //connect source to destination
        this.source.connect(this.audioCtx.destination);

        this.scriptProcessor.onaudioprocess = AudioProcessingEvent => {
          this.audioDataArray = new Uint8Array(this.analyser.frequencyBinCount);
          this.analyser.getByteFrequencyData(array);
          var boost = 0;
          this.audioDataArray.forEach(data => {
            boost += data;
          });

          boost = boost / this.audioDataArray.length;

          this.setState({ audioData: this.audioDataArray, boost: boost });
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
    const oldSize = this.state.oldSize;
    const newSize = this.state.newSize;
    const newBox1 = (this.state.boost + 1) / 3;
    const newBox2 = (this.state.boost + 2) / 3;
    const newBox3 = (this.state.boost + 3) / 3;

    // const newColor = this.state.newColor;
    // const oldColor = this.state.oldColor
    return (
      <AFrameRenderer stats>
        <Marker>
          <Box color="yellow" material="opacity: 1;" position="0 0.003 0">
            <a-animation
              attribute="scale"
              to={`${newBox1} ${newBox1} ${newBox1}`}
              easing="linear"
              dur="100000000"
            />
            {/* <a-animation 
              attribute="color" 
              from={`${oldColor}`}
              to={`${newColor}`}
              easing="linear"
              dur='100000000'  /> */}
            {/* <a-animation attribute="rotation" to="360 0 0" dur="5000" easing="linear" repeat="indefinite" /> */}
          </Box>
          <Box color="blue" material="opacity: 1;" position="0 0.003 0">
            <a-animation
              attribute="scale"
              to={`${newBox2} ${newBox2} ${newBox2}`}
              easing="linear"
              dur="100000000"
            />
          </Box>
          <Box color="green" material="opacity: 1;" position="0 0.003 0">
            <a-animation
              attribute="scale"
              to={`${newBox3} ${newBox3} ${newBox3}`}
              easing="linear"
              dur="100000000"
            />
          </Box>
        </Marker>
      </AFrameRenderer>
    );
  }
}

render(<AppScene />, document.querySelector("#sceneContainer"));
