import {
  Node,
  SimpleOscillator,
  Gain,
  NodeSet,
  Envelope,
  FrequencyEnvelope,
  LevelEnvelope,
  AdsrEnvelope,
  ParcEnvelope,
  Filter,
} from './nodes';

export function build(model, paramIdentifiers) {
  const node = buildNodes(model, paramIdentifiers);
  return {
    allNodes: unique(node.collectNodes()),
    criticalEnvelopes: unique(node.collectCriticalEnvelopes()),
    rootNode: node
  };
}

function buildNodes(model, paramIdentifiers) {
  const scope = [];
  for (const paramIdentifier of paramIdentifiers) {
    scope[paramIdentifier] = {
      type: 'parameter',
      name: paramIdentifier
    };
  }
  for (const declaration of model) {
    const {name, child} = declaration;
    if (name in scope) {
      throw new Error(`${name} is declared already`);
    }
    scope[name] = buildNode(child, scope);
  }
  return scope['@note'];
}

function buildNode(model, scope) {
  if (Array.isArray(model)) {
    return new NodeSet(model.map(m => buildNode(m, scope)));
  }
  function buildAudioParam(model) {
    return {
      envelope: buildNode(model.envelope, scope),
      modulator: buildNode(model.modulator, scope)
    };
  }
  switch (model.type) {
    case 'oscillator':
      return new SimpleOscillator(
        model.waveType,
        buildAudioParam(model.frequency),
        model.delay ? buildNode(model.delay, scope) : null);
    case 'gain':
      return new Gain(
        buildAudioParam(model.gain),
        buildNode(model.child, scope));
    case 'frequency':
      return new FrequencyEnvelope(
        buildNode(model.frequency, scope));
    case 'level':
      return new LevelEnvelope(
        buildNode(model.level, scope));
    case 'adsrEnvelope':
      return new AdsrEnvelope(
        buildNode(model.level, scope),
        buildNode(model.attack, scope),
        buildNode(model.decay, scope),
        buildNode(model.sustain, scope),
        buildNode(model.release, scope));
    case 'parcEnvelope':
      return new ParcEnvelope(
        buildNode(model.level, scope),
        buildNode(model.attack, scope),
        buildNode(model.release, scope));
    case 'filter':
      return new Filter(
        model.filterType,
        model.frequency ? buildAudioParam(model.frequency) : null,
        model.gain ? buildAudioParam(model.gain) : null,
        model.Q ? buildAudioParam(model.Q) : null,
        buildNode(model.child, scope));
    case 'operator':
      const args = model.args.map(arg => buildNode(arg, scope));
      if (model.operator === '+' && args.every(n => n instanceof Node)) {
        const nodeSet = args.find(n => n instanceof NodeSet);
        if (nodeSet) {
          nodeSet.nodes.push(...args.filter(n => !(n instanceof NodeSet)));
          return nodeSet;
        } else {
          return new NodeSet(args);
        }
      }
      return {
        type: 'operator',
        operator: model.operator,
        args
      }
      break;
    case 'value':
      return model;
    case 'identifier':
      return scope[model.identifier];
  }
}

function unique(arr) {
  return arr.filter((x, i, self) => self.indexOf(x) === i);
}
