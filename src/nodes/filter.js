import {Node} from './node.js';

export class Filter extends Node {
  constructor(filterType, freqCtrl, gainCtrl, QCtrl, child) {
    super();
    this.filterType = filterType;
    this.freqCtrl = freqCtrl;
    this.gainCtrl = gainCtrl;
    this.QCtrl = QCtrl;
    this.child = child;
  }

  activate(ac) {
    this.filter = ac.createBiquadFilter();
    this.filter.type = this.filterType;
    if (this.freqCtrl) {
      this.freqCtrl.envelope.connect(this.filter.frequency);
      this.freqCtrl.modulator.connect(this.filter.frequency);
    }
    if (this.QCtrl) {
      this.QCtrl.envelope.connect(this.filter.Q);
      this.QCtrl.modulator.connect(this.filter.Q);
    }
    if (this.gainCtrl) {
      this.gainCtrl.envelope.connect(this.filter.gain);
      this.gainCtrl.modulator.connect(this.filter.gain);
    }
    this.rawNodes.forEach(rn => this.child.connect(rn));
  }

  get rawNodes() {
    return [this.filter];
  }

  collectNodes() {
    const nodes = [
      this,
      ...this.child.collectNodes()
    ];
    if (this.freqCtrl) {
      nodes.push(
        ...this.freqCtrl.envelope.collectNodes(),
        ...this.freqCtrl.modulator.collectNodes());
    }
    if (this.QCtrl) {
      nodes.push(
        ...this.QCtrl.envelope.collectNodes(),
        ...this.QCtrl.modulator.collectNodes());
    }
    if (this.gainCtrl) {
      nodes.push(
        ...this.gainCtrl.envelope.collectNodes(),
        ...this.gainCtrl.modulator.collectNodes());
    }
    return nodes;
  }

  collectCriticalEnvelopes() {
    return this.child.collectCriticalEnvelopes();
  }
}
