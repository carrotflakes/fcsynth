const ac = new AudioContext();
function buildSynth(model) {
  const sb = new fcsynth.SynthBuilder(ac);
  return sb.build(model, ac.destination, ['c1', 'c2']);
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
    model: JSON.stringify(fcsynth.defaultModel, null, '  '),
  },
  methods: {
    connect() {
      console.log('connect', this.selectedMidiDevice.name);
      this.selectedMidiDevice.addEventListener('midimessage', this.eventHandler, false);
    },
    eventHandler(event) {
      const [type, notenum, velocity] = event.data;
      let note;
      switch (type) {
        case 0x90:
          note = synth.note({
            frequency: 6.875 * Math.pow(2, (notenum + 3) / 12),
            velocity: velocity / 127
          });
          note.on(ac.currentTime);
          this.notes[notenum] = note;
          break;
        case 0x80:
          note = this.notes[notenum];
          if (note) {
            note.off(ac.currentTime);
            delete this.notes[notenum];
          }
          break;
        case 0xb0:
          synth.setTrackParam(ac.currentTime, {c1: velocity / 127});
          break;
        case 0xe0:
          synth.setTrackParam(ac.currentTime, {c2: velocity / 127});
          break;
        default:
          console.log(event.data);
      }
    },
    applyModel() {
      synth = buildSynth(JSON.parse(this.model));
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
