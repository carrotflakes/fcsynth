const ac = new AudioContext();
function buildSynth(model) {
  const sb = new fcsynth.SynthBuilder(ac);
  return sb.build(model, ac.destination, ['c1', 'c2', 'mod', 'pitch']);// TODO {c1: 0 c2: 1}
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
gain(lv(velocity))<-sin(fr(f)<-(m1+m2))
`.trim(),
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
      synth = buildSynth(fcsynth.source2model(this.model));
    },
  },
  async mounted() {
    this.midiAccess = await navigator.requestMIDIAccess();
    this.midiDevices = [...this.midiAccess.inputs];
    if (this.midiDevices.length > 0) {
      this.selectedMidiDevice = this.midiDevices[0][1];
    }
  }
});
