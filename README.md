# fcsynth
Web Audio API based synthesis module.

## Usage
``` javascript
// initialize
const ac = new AudioContext();
const sb = new fcsynth.SynthBuilder(ac);
const synth = sb.build(
  fcsynth.makeDefaultModel('f', 'y'),
  ac.destination,
  {f: fcsynth.frequency, y: 0.75});

// synth needs to be update regularly while playing notes.
setInterval(() => {
  synth.update(ac.currentTime);
}, 1000);

// play notes
const note = synth.note({
  f: 440, // frequency
  y: 0.75 // velocity
});
note.on(ac.currentTime);
note.off(ac.currentTime + 1);
```
