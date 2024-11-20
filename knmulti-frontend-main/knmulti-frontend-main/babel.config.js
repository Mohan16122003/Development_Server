// module.exports = {
//     presets:[
//         "@babel/preset-env",
//         "@babel/preset-react"
//     ]
// }
module.exports = {
    presets: [
      ['@babel/preset-env', {
        useBuiltIns: 'usage',
        corejs: 3
      }]
    ]
  }
  