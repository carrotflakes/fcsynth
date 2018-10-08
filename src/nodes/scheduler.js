import {interpolateExponentialRamp} from './util.js';
import {
  SCHEDULER_VALUE_EPS
} from './constant.js';


export default class Scheduler {
  constructor(audioParam, tempo) {
    this.audioParam = audioParam;
    this.points = [];
  }

  insertPoint(point) {
    let i = 0;
    while (i < this.points.length && this.points[i].time < point.time) {
      i++;
    }
    this.points.splice(i, 0, point);
  }

  setValueAtTime(value, time, tempo) {
    this.audioParam.setValueAtTime(value, time);
    this.insertPoint({
      type: 'setValue',
      time,
      value,
      tempo
    });
  }

  linearRampToValueAtTime(value, time, tempo) {
    this.audioParam.linearRampToValueAtTime(value, time);
    this.insertPoint({
      type: 'linearRampToValue',
      time,
      value,
      tempo
    });
  }

  exponentialRampToValueAtTime(value, time, tempo) {
    if (value > 0) {
      value = Math.max(SCHEDULER_VALUE_EPS, value);
    } else {
      value = Math.min(-SCHEDULER_VALUE_EPS, value);
    }
    this.audioParam.exponentialRampToValueAtTime(value, time);
    this.insertPoint({
      type: 'exponentialRampToValue',
      time,
      value,
      tempo
    });
  }

  setTempo(tempo, time) {
    // getCurrentTempo
    let currentTempo = null;
    this.points.forEach(point => {
      if (point.time <= time) {
        currentTempo = point.tempo;
      }
    });

    if (tempo === currentTempo) {
      return;
    }

    if (currentTempo === null) {
      throw new Error('currentTempo is null');
    }

    let i = 0;
    while (i < this.points.length && this.points[i].time < time) {
      i++;
    }

    if (this.points.length === i) {
      return;
    }

    const rate = currentTempo / tempo;

    this.audioParam.cancelScheduledValues(time);

    const midValue = this.valueAt(time);
    if (this.points[i-1].value !== midValue) {
      this.insertPoint({
        type: this.points[i].type,
        time,
        value: midValue,
        tempo
      });
    }

    for (; i < this.points.length; ++i) {
      const point = this.points[i];
      point.time = (point.time - time) * rate + time;
      point.tempo = tempo;
      this.audioParam[point.type + 'AtTime'](point.value, point.time);
    }
  }

  valueAt(time) {
    let i = 0;
    while (i < this.points.length && this.points[i].time < time) {
      i++;
    }

    if (this.points.length === i) {
      return this.points[i - 1].value;
    }

    if (this.points[i].time === time) {
      return this.points[i].value;
    }

    const left = this.points[i-1];
    const right = this.points[i];
    let value;
    switch (right.type) {
      case 'linearRampToValue':
        value = (right.value - left.value) * (time - left.time) / (right.time - left.time) + left.value;
        break;
      case 'exponentialRampToValue':
        value = interpolateExponentialRamp(left.value, right.value, (time - left.time) / (right.time - left.time)); // FIXME: minus to plus is illegal
        if (value >= 0) {
          value = Math.max(SCHEDULER_VALUE_EPS, value);
        } else {
          value = Math.min(-SCHEDULER_VALUE_EPS, value);
        }
        break;
      default:
        value = left.value;
        break;
    }
    return value;
  }
}

