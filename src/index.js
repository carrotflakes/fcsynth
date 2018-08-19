class SynthBuilder {

  constructor(ac) {
    this.ac = ac;
  }

  build(model) {
    return new Synth(this.ac, model);
  }

}

class Synth {

  constructor(ac, model) {
    this.ac = ac;
    this.model = model;
  }

  note(opt) {
    // build nodes
    const osc = this.ac.createOscillator();
    osc.connect(this.ac.destination);
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
      type: 'variable',
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
        type: 'variable',
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
