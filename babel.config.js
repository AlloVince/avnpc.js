module.exports = {
  presets:
    [
      [
        '@babel/env',
        {
          targets: {
            node: '10'
          },
          useBuiltIns: false,
          debug: false
        }
      ]
    ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ]
};
