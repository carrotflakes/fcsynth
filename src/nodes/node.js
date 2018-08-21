import {evalExpr, volumeToGainValue} from './util.js';

export class Node {
  activate(ac) {
  }

  start(time, params) {
  }

  stop(time, params) {
  }

  forceStop(time) {
  }

  updateParam(time, params) {
  }

  connect(rawNode) {
    this.rawNodes.forEach(cf => cf.connect(rawNode));
  }

  get rawNodes() {
    return [];
  }

  collectNodes() {
    throw new Error('Not implemented');
  }

  collectCriticalEnvelopes() {
    throw new Error('Not implemented');
  }
}

export class SimpleOscillator extends Node {
  constructor(type, frequencyCtrl, delayExpr) {
    super();
    this.type = type;
    this.frequencyCtrl = frequencyCtrl;
    this.delayExpr = delayExpr;
  }

  activate(ac) {
    this.osc = ac.createOscillator();
    this.osc.type = this.type;
    this.frequencyCtrl.envelope.connect(this.osc.frequency);
    this.frequencyCtrl.modulator.connect(this.osc.frequency);
  }

  start(time, params) {
    const delay = this.delayExpr ? evalExpr(this.delayExpr, params) : 0;
    this.osc.start(time + delay);
  }

  forceStop(time) {
    this.osc.stop(time);
  }

  get rawNodes() {
    return [this.osc];
  }

  collectNodes() {
    return [
      this,
      ...this.frequencyCtrl.envelope.collectNodes(),
      ...this.frequencyCtrl.modulator.collectNodes()
    ];
  }

  collectCriticalEnvelopes() {
    throw new Error('Not implemented');
  }
}

export class Gain extends Node {
  constructor(gainCtrl, child) {
    super();
    this.gainCtrl = gainCtrl;
    this.child = child;
  }

  activate(ac) {
    this.gain = ac.createGain();
    this.gainCtrl.envelope.connect(this.gain.gain);
    this.gainCtrl.modulator.connect(this.gain.gain);
    this.rawNodes.forEach(rn => this.child.connect(rn));
  }

  get rawNodes() {
    return [this.gain];
  }

  collectNodes() {
    return [
      this,
      ...this.child.collectNodes(),
      ...this.gainCtrl.envelope.collectNodes(),
      ...this.gainCtrl.modulator.collectNodes()
    ];
  }

  collectCriticalEnvelopes() {
    return [this.gainCtrl.envelope];
  }
}

export class NodeSet extends Node {
  constructor(nodes) {
    super();
    this.nodes = nodes;
  }

  activate(ac) {
  }

  get rawNodes() {
    return [].concat(...this.nodes.map(n => n.rawNodes));
  }

  collectNodes() {
    return [].concat(...this.nodes.map(n => n.collectNodes()));
  }

  collectCriticalEnvelopes() {
    return [].concat(...this.nodes.map(n => n.collectCriticalEnvelopes()));
  }
}

/*
export class Mixer {
  constructor(ac) {
    this.gain = ac.createGain();
    this.panner = ac.createStereoPanner();
    this.gain.connect(this.panner);
  }

  setParam(param, time, note) {
    for (const [key, value] of Object.entries(param)) {
      switch (key) {
        case 'volume':
          this.gain.gain.setValueAtTime(volumeToGainValue(value), time);
          break;
        case 'pan':
          this.panner.pan.setValueAtTime(value * 2 - 1, time);
          break;
      }
    }
  }

  getInput() {
    return this.gain;
  }

  connect(audioNode) {
    this.panner.connect(audioNode);
  }
}*/
