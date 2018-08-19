const ac = new AudioContext();
const sb = new fcsynth.SynthBuilder(ac);
const synth = sb.build(fcsynth.defaultModel);
const note = synth.note({
  frequency: 440,
});

note.on(ac.currentTime);
note.off(ac.currentTime + 1);
