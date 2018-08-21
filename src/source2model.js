import parse from './parser.sg';

export function source2model(source) {
  return ;
  return transformSynth(parse(source));
}
/*
function transformSynth(ast) {
  const assignments = ast.assignments.map((assignment) => ({
    name: assignment.identifier,
    child: transform(assignment.expression)
  }));
  assignments.push({
    name: '@note',
    child: transform(ast.body)
  });
  return assignments;
}

function transform
  switch (ast.type) {
    case 'synth':
    case 'call':
      switch (ast.func) {
          
      }
      return;
    case 'identifier':
      return ast;
    case 'value':
      return ast;
  }
}
*/
