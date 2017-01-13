#!/usr/bin/env node
var fs = require('fs')

var inputFile = 'data/land-use.json'
var outputFileLots = 'static/build/lots.json'
var outputFileLotGeo = 'static/build/lot-geojson.json'

console.log('reading %s...', inputFile)
var input = JSON.parse(fs.readFileSync(inputFile, 'utf8'))

console.log('transforming...')
var residentialLots = computeResLots(input)
var lotGeo = computeLotGeo(input)

console.log('writing %s...', outputFileLots)
fs.writeFileSync(outputFileLots, JSON.stringify(residentialLots))
console.log('writing %s...', outputFileLotGeo)
fs.writeFileSync(outputFileLotGeo, JSON.stringify(lotGeo))

console.log('done')

// Returns a an array of every residental lot in San Francisco.
// Returns [{position, units}] where position is the approximate centroid of the lot.
function computeResLots (input) {
  return input
    .filter(function (row) {
      return ['RESIDENT', 'MIXRES', 'MIXED'].includes(row.landuse) && row.resunits > 0
    })
    .map(function (row) {
      return {
        position: computeCenter(row.the_geom),
        units: +row.resunits
      }
    })
}

// Returns a GeoJSON FeatureCollection object containing every lot in SF.
// Feature properties include {units, area}
function computeLotGeo (input) {
  var lotGeoFeatures = input
    .map(function (row) {
      // TODO: add zoning and height properties
      return {
        type: 'Feature',
        geometry: row.the_geom,
        properties: {
          landuse: row.landuse,
          units: +row.resunits,
          area: +row.shape_area
        }
      }
    })
  return {
    type: 'FeatureCollection',
    features: lotGeoFeatures.slice(0, 10000)
  }
}

// Computes the approximate centroid of a GeoJSON MultiPolygon
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
