import parse from './parser.sg';

export function source2model(source) {
  return transformSynth(parse(source));
}

function transformSynth(ast) {
  return [
    ...ast.assignments.map((assignment) => ({
      name: assignment.identifier,
      child: transform(assignment.expression)
    })),
    {
      name: '@note',
      child: transform(ast.body)
    }
  ];
}

function transform(ast) {
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
            frequency: transform(ast.arguments[0]),
            delay: transform(ast.arguments[1])
          };
          break;
        case 'gain':
          return {
            type: 'gain',
            gain: transform(ast.arguments[0]),
            child: []
          };
        case 'lv':
          return {
            envelope: {
              type: 'level',
              level: transform(ast.arguments[0])
            },
            modulator: []
          };
        case 'fr':
          return {
            envelope: {
              type: 'frequency',
              frequency: transform(ast.arguments[0])
            },
            modulator: []
          };
        case 'adsr':
          return {
            envelope: {
              type: 'adsrEnvelope',
              level: transform(ast.arguments[0]),
              attack: transform(ast.arguments[1]),
              decay: transform(ast.arguments[2]),
              sustain: transform(ast.arguments[3]),
              release: transform(ast.arguments[4])
            },
            modulator: []
          };
          // TODO: adsr... lpf...
        case '+':
        case '-':
        case '*':
        case '/':
          return {
            type: 'operator',
            operator: ast.func,
            args: ast.arguments.map(a => transform(a))
          };
        case '<-':
          const left = transform(ast.arguments[0]);
          const right = transform(ast.arguments[1]);
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
      return ast;
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
