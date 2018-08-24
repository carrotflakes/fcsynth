# fcsynth
Web Audio API based synthesis module.

## Usage
``` javascript
// initialize
const ac = new AudioContext();
const sb = new fcsynth.SynthBuilder(ac);
const synth = sb.build(fcsynth.defaultModel, ac.destination, {});

// synth needs to be update regularly while playing notes.
setInterval(() => {
  synth.update(ac.currentTime);
}, 1000);

// play notes
const note = synth.note({
  frequency: 440,
  velocity: 0.75
});
note.on(ac.currentTime);
note.off(ac.currentTime + 1);
```
