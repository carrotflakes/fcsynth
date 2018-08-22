import {Node} from './node.js';
import {evalExpr, interpolateExponentialRamp} from './util.js';

export class Envelope extends Node {
  constructor() {
    super();
    this.audioParams = [];
    this._endTime = Infinity;
  }

  stop(time, note) {
    this._endTime = time;
  }

  setValueAtTime(value, time) {
    this.audioParams.forEach(x => x.setValueAtTime(value, time));
  }

  exponentialRampToValueAtTime(value, time) {
    this.audioParams.forEach(x => x.exponentialRampToValueAtTime(value, time));
  }

  cancelScheduledValues(time) {
    this.audioParams.forEach(x => x.cancelScheduledValues(time));
  }

  connect(audioParam) {
    this.audioParams.push(audioParam);
  }

  get endTime() {
    return this._endTime;
  }

  collectNodes() {
    return [this];
  }

  collectCriticalEnvelopes() {
    throw new Error('Here is unreachable');
    return [this];
  }
}

export class FrequencyEnvelope extends Envelope {
  constructor(frequencyExpr) {
    super();
    this.frequencyExpr = frequencyExpr;
  }

  start(time, params) {
    this.setValueAtTime(evalExpr(this.frequencyExpr, params), time);
  }

  updateParam(time, params) {
    this.setValueAtTime(evalExpr(this.frequencyExpr, params), time);
  }

  frequency(start, time, end, endTime, note) {
    this.setValueAtTime(evalExpr(this.frequecyExpr, {
      ...note.param,
      f: start
    }), time);
    let endFrequency = evalExpr(this.frequecyExpr, {
      ...note.param,
      f: end
    });
    if (endFrequency < 0) {
      endFrequency = Math.min(-FREQUENCY_EPS, endFrequency);
    } else {
      endFrequency = Math.max(FREQUENCY_EPS, endFrequency);
    }
    this.exponentialRampToValueAtTime(endFrequency, endTime)
  }
}

export class LevelEnvelope extends Envelope {
  constructor(levelExpr) {
    super();
    this.levelExpr = levelExpr;
  }

  start(time, params) {
    this.setValueAtTime(evalExpr(this.levelExpr, params), time);
  }

  updateParam(time, params) {
    this.setValueAtTime(evalExpr(this.levelExpr, params), time);
  }
}

export class AdsrEnvelope extends Envelope {
  constructor(levelExpr, attackExpr, decayExpr, sustainExpr, releaseExpr) {
    super();
    this.levelExpr = levelExpr;
    this.attackExpr = attackExpr;
    this.decayExpr = decayExpr;
    this.sustainExpr = sustainExpr;
    this.releaseExpr = releaseExpr;
    this.startTime = null;
  }

  start(time, params) {
    this.startTime = time;
    this.level = evalExpr(this.levelExpr, params);
    this.attack = clamp(TIME_EPS, Infinity, evalExpr(this.attackExpr, params) * 0.001);
    this.decay = clamp(TIME_EPS, Infinity, evalExpr(this.decayExpr, params) * 0.001);
    this.sustain = clamp(GAIN_EPS, 1, evalExpr(this.sustainExpr, params));
    this.release = clamp(TIME_EPS, Infinity, evalExpr(this.releaseExpr, params) * 0.001);

    this.setValueAtTime(GAIN_EPS, time);
    this.exponentialRampToValueAtTime(this.level, time + this.attack);
    this.exponentialRampToValueAtTime(this.level * this.sustain, time + this.attack + this.decay);
  }

  stop(time, params) {
    this._endTime = time + this.release;

    this.cancelScheduledValues(time);
    if (time <= this.startTime + this.attack) {
      const v = this.level * interpolateExponentialRamp(GAIN_EPS, 1, (time - this.startTime) / this.attack);
      this.exponentialRampToValueAtTime(v, time);
    } else if (time < this.startTime + this.attack + this.decay) {
      const v = this.level * interpolateExponentialRamp(1, this.sustain, (time - this.startTime - this.attack) / this.decay);
      this.exponentialRampToValueAtTime(v, time);
    } else {
      this.setValueAtTime(this.level * this.sustain, time);
    }
    this.exponentialRampToValueAtTime(0 < this.level ? GAIN_EPS : -GAIN_EPS, this._endTime);
  }

  // setParam(...)
}

export class ParcEnvelope extends Envelope {
  constructor(levelExpr, attackExpr, releaseExpr) {
    super();
    this.levelExpr = levelExpr;
    this.attackExpr = attackExpr;
    this.releaseExpr = releaseExpr;
  }

  start(time, params) {
    this.level = evalExpr(this.levelExpr, params);
    this.attack = clamp(TIME_EPS, Infinity, evalExpr(this.attackExpr, params) * 0.001);
    this.release = clamp(TIME_EPS, Infinity, evalExpr(this.releaseExpr, params) * 0.001);

    this.setValueAtTime(GAIN_EPS, time);
    this.exponentialRampToValueAtTime(this.level, time + this.attack);

    this.exponentialRampToValueAtTime(0 < this.level ? GAIN_EPS : -GAIN_EPS, time + this.attack + this.release);
    this._endTime = time + this.attack + this.release;
  }

  stop(time, note) {
  }
}


function clamp(min, max, val) {
  return Math.max(min, Math.min(max, val));
}

const TIME_EPS = 0.0000001;
const GAIN_EPS = 0.0001;
const FREQUENCY_EPS = 0.0000001;
