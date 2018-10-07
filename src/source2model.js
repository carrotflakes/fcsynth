import parse from './parser.sg';

export function source2model(source, nameMap) {
  return transformSynth(parse(source), nameMap);
}

function transformSynth(ast, nameMap) {
  return [
    ...ast.assignments.map((assignment) => ({
      name: assignment.identifier,
      child: transform(assignment.expression, nameMap)
    })),
    {
      name: '@note',
      child: collectComposedNodes(transform(ast.body, nameMap))
    }
  ];
}

function transform(ast, nameMap) {
  if (ast === undefined) {
    return null;
  }
  switch (ast.type) {
    case 'call':
      switch (ast.func) {
        case 'sin':
        case 'sqr':
        case 'saw':
        case 'tri':
          return {
            type: 'oscillator',
            waveType: {
              sin: 'sine',
              sqr: 'square',
              saw: 'sawtooth',
              tri: 'triangle'
            }[ast.func],
            frequency: transform(ast.arguments[0], nameMap),
            delay: transform(ast.arguments[1], nameMap)
          };
          break;
        case 'gain':
          return {
            type: 'gain',
            gain: transform(ast.arguments[0], nameMap),
            child: []
          };
        case 'lv':
          return {
            envelope: {
              type: 'level',
              level: transform(ast.arguments[0], nameMap)
            },
            modulator: []
          };
        case 'fr':
          return {
            envelope: {
              type: 'frequency',
              frequency: transform(ast.arguments[0], nameMap)
            },
            modulator: []
          };
        case 'adsr':
          return {
            envelope: {
              type: 'adsrEnvelope',
              level: transform(ast.arguments[0], nameMap),
              attack: transform(ast.arguments[1], nameMap),
              decay: transform(ast.arguments[2], nameMap),
              sustain: transform(ast.arguments[3], nameMap),
              release: transform(ast.arguments[4], nameMap)
            },
            modulator: []
          };
        case 'parc':
          return {
            envelope: {
              type: 'parcEnvelope',
              level: transform(ast.arguments[0], nameMap),
              attack: transform(ast.arguments[1], nameMap),
              release: transform(ast.arguments[2], nameMap)
            },
            modulator: []
          };
        case 'lpf':
        case 'hpf':
        case 'bpf':
        case 'ncf':
        case 'apf':
          return {
            type: 'filter',
            filterType: {lpf: "lowpass", hpf: "highpass", bpf: "bandpass", ncf: "notch", apf: "allpass"}[ast.func],
            frequency: transform(ast.arguments[0]), nameMap,
            Q: transform(ast.arguments[1], nameMap),
            child: []
          };
        case 'lsf':
        case 'hsf':
          return {
            type: 'filter',
            filterType: {lsf: "lowshelf", hsf: "highshelf"}[ast.func],
            frequency: transform(ast.arguments[0], nameMap),
            gain: transform(ast.arguments[1], nameMap),
            child: []
          };
        case 'pkf':
          return {
            type: 'filter',
            filterType: 'peaking',
            frequency: transform(ast.arguments[0], nameMap),
            Q: transform(ast.arguments[1], nameMap),
            gain: transform(ast.arguments[2], nameMap),
            child: []
          };
        case '+':
        case '-':
        case '*':
        case '/':
          return {
            type: 'operator',
            operator: ast.func,
            args: ast.arguments.map(a => transform(a, nameMap))
          };
        case '<-':
          const left = transform(ast.arguments[0], nameMap);
          const right = transform(ast.arguments[1], nameMap);
          if (left.child) {
            left.child.push(...collectComposedNodes(right));
            return left;
          } else if (left.modulator) {
            left.modulator.push(...collectComposedNodes(right));
            return left;
          } else {
            throw new Error('invalid AST');
          }
      }
      return;
    case 'identifier':
      return {
        ...ast,
        identifier: ast.identifier in nameMap ? nameMap[ast.identifier] : ast.identifier
      };
    case 'value':
      return ast;
  }
  throw new Error('Invalid AST');
}

function collectComposedNodes(expr) {
  if (expr.type === 'operator' && expr.operator === '+') {
    return [...collectComposedNodes(expr.args[0]), ...collectComposedNodes(expr.args[1])];
  }
  return [expr];
}
