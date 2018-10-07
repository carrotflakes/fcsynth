import {build as buildNodes} from './buildNodes.js';
import {FrequencyEnvelope} from './nodes/envelope.js';
import {frequency, tempo} from './symbols.js';
import {source2model} from './source2model.js';

export {makeDefaultModel}from './defaultModel.js';
export * from './symbols.js';

export class SynthBuilder {
  constructor(ac, nameMap={frequency: frequency, tempo: tempo}) {
    this.ac = ac;
    this.nameMap = nameMap;
  }

  build(model, destination, params) {
    destination = destination || this.ac.destination;
    return new Synth(this.nameMap, this.ac, destination, model, params);
  }

  source2model(source) {
    return source2model(source, this.nameMap);
  }
}

class Synth {
  constructor(nameMap, ac, destination, model, params) {
    this.nameMap = nameMap;
    this.ac = ac;
    this.destination = destination;
    this.model = model;
    this.trackParams = mapParams(params, nameMap);
    this.allParamNames = [...Object.keys(params), frequency];
    this.notes = [];
  }

  note(noteParams) {
    const {allNodes, criticalEnvelopes, rootNode} =
      buildNodes(this.model, this.allParamNames);
    allNodes.reverse().forEach(n => n.activate(this.ac)); // reverse?
    rootNode.connect(this.destination);
    noteParams = mapParams(noteParams, this.nameMap);
    const note = new Note(this, allNodes, criticalEnvelopes, noteParams);
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
      ...mapParams(params, this.nameMap)
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

  frequency(time, start, endTime, end) {
    const params = {
      ...this.synth.trackParams,
      ...this.noteParams,
    };
    this.allNodes.forEach(node => {
      if (node instanceof FrequencyEnvelope) {
        node.frequency(start, time, end, endTime, params);
      }
    });
  }
}

function mapParams(params, map) {
  const newParams = {...params};
  for (const key in params) {
    if (key in map) {
      newParams[map[key]] = params[key];
      delete newParams[key];
    }
  }
  return newParams;
}
