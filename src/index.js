class SynthBuilder {

  constructor(ac) {
    this.ac = ac;
  }

  build(model, destination) {
    destination = destination || this.ac.destination;
    return new Synth(this.ac, destination, model);
  }

}

class Synth {

  constructor(ac, destination, model) {
    this.ac = ac;
    this.destination = destination;
    this.model = model;
  }

  note(opt) {
    // build nodes
    const osc = this.ac.createOscillator();
    const gain = this.ac.createGain();
    osc.connect(gain);
    gain.connect(this.destination);
    return new Note(osc);
  }

}

class Note {

  constructor(osc) {
    this.osc = osc;
  }

  on(time) {
    this.osc.start(time);
  }

  off(time) {
    this.osc.stop(time);
  }

}

const defaultModel = {
  type: 'gain',
  envelope: {
    type: 'level',
    expression: {
      type: 'identifier',
      name: '@velocity'
    }
  },
  modulators: [],
  children: [{
    type: 'oscillator',
    waveType: 'square',
    envelope: {
      type: 'frequency',
      expression: {
        type: 'identifier',
        name: '@frequency'
      }
    },
    modulators: []
  }],
};

module.exports = {
  SynthBuilder,
  defaultModel
};
