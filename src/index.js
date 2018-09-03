import {build as buildNodes} from './buildNodes.js';

export {makeDefaultModel}from './defaultModel.js';
export {source2model} from './source2model.js';

export const frequency = Symbol('frequency');

export class SynthBuilder {
  constructor(ac) {
    this.ac = ac;
  }

  build(model, destination, params) {
    destination = destination || this.ac.destination;
    return new Synth(this.ac, destination, model, params);
  }
}

class Synth {
  constructor(ac, destination, model, params) {
    this.ac = ac;
    this.destination = destination;
    this.model = model;
    this.trackParams = {...params};
    this.notes = [];
  }

  note(noteParams) {
    const {allNodes, criticalEnvelopes, rootNode} =
      buildNodes(this.model, Object.keys(this.trackParams));
    allNodes.reverse().forEach(n => n.activate(this.ac)); // reverse?
    rootNode.connect(this.destination);
    const note = new Note(synth, allNodes, criticalEnvelopes, noteParams);
    this.notes.push(note);
    return note;
  }

  forceStop(time) {
    this.notes.forEach(note => note.forceStop(time));
    this.notes = [];
  }

  setTrackParam(time, params) {
    this.trackParams = {
      ...this.trackParams,
      ...params
    };
    this.notes.forEach(note => note._updateParam(time));
  }

  update(time) {
    this.notes = this.notes.filter(note => time <= note.endTime);
  }
}

class Note {
  constructor(synth, allNodes, criticalEnvelopes, noteParams) {
    this.synth = synth;
    this.allNodes = allNodes;
    this.criticalEnvelopes = criticalEnvelopes;
    this.noteParams = noteParams;
    this.endTime = Infinity;
  }

  on(time) {
    const params = {
      ...this.synth.trackParams,
      ...this.noteParams
    };
    this.allNodes.forEach(node => node.start(time, params));
  }

  off(time) {
    const params = {
      ...this.synth.trackParams,
      ...this.noteParams
    };
    this.allNodes.forEach(node => node.stop(time, params));

    if (this.criticalEnvelopes.length > 0) {
      this.endTime = Math.min(
        this.endTime,
        Math.max(...this.criticalEnvelopes.map(env => env.endTime)));
    } else {
      this.endTime = Math.min(this.endTime, time);
    }

    this.allNodes.forEach(node => node.forceStop(this.endTime));
  }

  forceStop(time) {
    this.allNodes.forEach(node => node.forceStop(time));
    this.endTime = time;
  }

  _updateParam(time) {
    const params = {
      ...this.synth.trackParams,
      ...this.noteParams,
    };
    this.allNodes.forEach(node => node.updateParam(time, params));
  }
}
