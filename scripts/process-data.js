#!/usr/bin/env node
var fs = require('fs')

var inputFile = 'data/land-use.json'
var outputFile = 'static/build/lots.json'

console.log('reading %s...', inputFile)
var input = JSON.parse(fs.readFileSync(inputFile, 'utf8'))

console.log('transforming...')
var output = input
  .filter(function (row) {
    return ['RESIDENT', 'MIXRES', 'MIXED'].includes(row.landuse) && row.resunits > 0
  })
  .map(function (row) {
    return {
      position: computeCenter(row.the_geom),
      units: +row.resunits
    }
  })

console.log('writing %s...', outputFile)
fs.writeFileSync(outputFile, JSON.stringify(output))

console.log('done')

function computeCenter (shape) {
  if (shape.type !== 'MultiPolygon') throw new Error('unsupported GeoJSON type ' + shape.type)
  var slat = 0
  var slon = 0
  var n = 0
  shape.coordinates.forEach(function (poly) {
    poly[0].forEach(function (point) {
      n++
      slat += point[0]
      slon += point[1]
    })
  })
  return [slat / n, slon / n]
}
