const {
  SimpleOscillator,
  Gain,
  NodeSet,
  Envelope,
  FrequencyEnvelope,
  LevelEnvelope,
  AdsrEnvelope,
} = require('./nodes');

export function build(model) {
  const node = buildNodes(model);
  return {
    allNodes: unique(node.collectNodes()),
    criticalEnvelopes: unique(node.collectCriticalEnvelopes()),
    rootNode: node
  };
}

function buildNodes(model) {
  const scope = [];
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
        buildNode(model.delay, scope));
    case 'gain':
      return new Gain(
        buildAudioParam(model.gain),
        buildNode(model.child, scope));
    case 'frequency':
      return new FrequencyEnvelope(
        buildNode(model.expression, scope));
    case 'level':
      return new LevelEnvelope(
        buildNode(model.expression, scope));
    case 'envelope':
      // TODO
      break;
    case 'operator':
      return {
        type: 'operator',
        operator: model.operator,
        args: model.args.map(arg => buildNode(arg, scope))
      }
      break;
    case 'parameter':
      return model;
    case 'value':
      return model;
    case 'variable':
      return scope[model.name];
  }
}

function unique(arr) {
  return arr.filter((x, i, self) => self.indexOf(x) === i);
}
