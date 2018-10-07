import {frequency} from './symbols.js';

export function makeDefaultModel(velocity) {
  return [
    {
      name: '@note',
      child: [
        {
          type: 'gain',
          gain: {
            envelope: {
              type: 'level',
              level: {
                type: 'identifier',
                identifier: velocity
              }
            },
            modulator: [],
          },
          child: [
            {
              type: 'oscillator',
              waveType: 'square',
              frequency: {
                envelope: {
                  type: 'frequency',
                  frequency: {
                    type: 'identifier',
                    identifier: frequency
                  }
                },
                modulator: []
              },
              delay: {
                type: 'value',
                value: 0
              }
            }
          ],
        }
      ]
    }
  ];
}
