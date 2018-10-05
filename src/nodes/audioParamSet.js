export class AudioParamSet {
  constructor() {
    this.audioParams = [];
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

  add(audioParam) {
    this.audioParams.push(audioParam);
  }
}
