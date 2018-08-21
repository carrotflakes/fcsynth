module.exports = [
  {
    name: '@note',
    child: [
      {
        type: 'gain',
        gain: {
          envelope: {
            type: 'level',
            expression: {
              type: 'parameter',
              name: 'velocity'
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
                expression: {
                  type: 'parameter',
                  name: 'frequency'
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
