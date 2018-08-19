const {SynthBuilder} = require('../../dist/index.js');

const ac = new AudioContext();
const sb = new SynthBuilder(ac);
const synth = sb.build();
const note = synth.note({
  frequency: 440,
});

note.on(ac.currentTime);
note.off(ac.currentTime + 1);
