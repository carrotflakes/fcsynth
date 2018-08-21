const ac = new AudioContext();
const sb = new fcsynth.SynthBuilder(ac);
let synth = sb.build(fcsynth.defaultModel);

{
  const note = synth.note({
    frequency: 440,
    velocity: 0.75
  });

  note.on(ac.currentTime);
  note.off(ac.currentTime + 1);
}


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
      }
    },
    applyModel() {
      synth = sb.build(JSON.parse(this.model));
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
