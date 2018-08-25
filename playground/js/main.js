const ac = new AudioContext();
const masterGain = ac.createGain();
masterGain.gain.value = 0.5;
masterGain.connect(ac.destination);

function buildSynth(model, params) {
  const sb = new fcsynth.SynthBuilder(ac);
  params = params || {
    c1: 0,
    c2: 0,
    mod: 0,
    pitch: 0,
    spb: 60 / 120,
  };
  return sb.build(model, masterGain, params);
}

let synth = buildSynth(fcsynth.defaultModel);

{
  const note = synth.note({
    frequency: 440,
    velocity: 0.75
  });

  note.on(ac.currentTime);
  note.off(ac.currentTime + 1);
}

setInterval(() => {
  synth.update(ac.currentTime);
}, 1000);


const app = new Vue({
  el: '#app',
  data: {
    message: 'hoge',
    midiAccess: null,
    midiDevices: [],
    selectedMidiDevice: null,
    notes: {},
    model: `
f=frequency+pitch*100,
m1=gain(lv(c1 * 5000))<-sin(fr(f*(2*c2))),
m2=gain(lv(mod*20))<-sin(fr(5)),
gain(adsr(velocity,10,100,0.5,100))<-sin(fr(f)<-(m1+m2))
`.trim(),
    analyserMode: 0,
  },
  methods: {
    connect() {
      console.log('connect', this.selectedMidiDevice.name);
      this.selectedMidiDevice.addEventListener('midimessage', this.eventHandler, false);
    },
    eventHandler(event) {
      const [type, d1, d2] = event.data;
      let note;
      switch (type) {
        case 0x90:
          if (d2 === 0) {
            // noteoff
            note = this.notes[d1];
            if (note) {
              note.off(ac.currentTime);
              delete this.notes[d1];
            }
            break;
          }
          note = synth.note({
            frequency: 6.875 * Math.pow(2, (d1 + 3) / 12),
            velocity: d2 / 127
          });
          note.on(ac.currentTime);
          this.notes[d1] = note;
          break;
        case 0x80:
          note = this.notes[d1];
          if (note) {
            note.off(ac.currentTime);
            delete this.notes[d1];
          }
          break;
        case 0xb0:
          switch (d1) {
            case 74:
              synth.setTrackParam(ac.currentTime, {c1: d2 / 127});
              break;
            case 71:
              synth.setTrackParam(ac.currentTime, {c2: d2 / 127});
              break;
            case 1:
              synth.setTrackParam(ac.currentTime, {mod: d2 / 127});
              break;
            default:
              console.log(event.data);
          }
          break;
        case 0xe0: // pitchbend
          synth.setTrackParam(ac.currentTime, {pitch: ((d2 << 7) + d1 - 8192)/ 8192});
          break;
        default:
          console.log(event.data);
      }
    },
    applyModel() {
      synth = buildSynth(fcsynth.source2model(this.model), synth.trackParams);
    },
    toggleMode() {
      this.analyserMode = (this.analyserMode + 1) % 3;
    },
  },
  async mounted() {
    this.midiAccess = await navigator.requestMIDIAccess();
    this.midiDevices = [...this.midiAccess.inputs];
    if (this.midiDevices.length > 0) {
      this.selectedMidiDevice = this.midiDevices[0][1];
    }

    {
      const analyser = ac.createAnalyser();
      masterGain.connect(analyser);
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.3;
      const data = new Uint8Array(256);
      const canvasEl = document.getElementById('canvas');
      const ctx = canvasEl.getContext('2d');

      const drawCanvas = () => {
        switch (this.analyserMode) {
          case 0:
          case 2:
            analyser.getByteFrequencyData(data);
            break;
          case 1:
            analyser.getByteTimeDomainData(data);
            break;
        }
        switch (this.analyserMode) {
          case 0:
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.fillRect(0, 0, 256, 128);
            ctx.fillStyle = 'rgb(0,0,255)';
            for (let i = 0; i < 256; ++i) {
              ctx.fillRect(i, 128 - data[i] / 2, 1, 128);
            }
            break;
          case 1:
            ctx.fillStyle = 'rgb(255,255,255)';
            ctx.fillRect(0, 0, 256, 128);
            ctx.strokeStyle = 'rgb(0,0,255)';
            ctx.beginPath();
            ctx.moveTo(0, data[0] / 2);
            for (let i = 1; i < 256; ++i) {
              ctx.lineTo(i, data[i] / 2);
            }
            ctx.stroke();
            break;
          case 2:
            ctx.drawImage(canvasEl, -1, 0);
            for (let i = 0; i < 128; ++i) {
              ctx.fillStyle = `rgb(${255-data[255-i*2]},${255-data[255-i*2]},255)`;
              ctx.fillRect(255, i, 1, 1);
            }
        }
      }

      setInterval(drawCanvas, 1000 / 30);
    }
  }
});
