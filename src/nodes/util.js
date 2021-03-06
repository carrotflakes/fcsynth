export function evalExpr(expr, params) {
  switch (expr.type) {
    case 'operator':
      const args = expr.args.map(x => evalExpr(x, params));
      switch (expr.operator) {
        case '+':
          if (args.length === 2) {
            return args[0] + args[1];
          }
        case '-':
          if (args.length === 1) {
            return -args[0];
          } else if (args.length === 2) {
            return args[0] - args[1];
          }
        case '*':
          if (args.length === 2) {
            return args[0] * args[1];
          }
        case '/':
          if (args.length === 2) {
            return args[0] / args[1];
          }
      }
      break;
    case 'parameter':
      return params[expr.name];
    case 'value':
      return expr.value;
  }
}

export function volumeToGainValue(v) {
  if (v <= 0) {
    return 0;
  }
  return dbToGainValue(-(1 - v) * 3 * 16);
}

function dbToGainValue(v) {
  return Math.exp(v * Math.LN10 / 20);
}

export function interpolateExponentialRamp(y1, y2, x) {
  return Math.exp(Math.log(y1) * (1 - x) + Math.log(y2) * x);
}
