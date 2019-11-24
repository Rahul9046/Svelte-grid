// babel.config.js
module.exports = {
  presets: [
    [
      "env",
      ['@babel/preset-env', {targets: {node: 'current'}}],
      '@babel/preset-typescript',
      {
        targets: {
          node: 'current'
        },
      },
    ],
  ],
};