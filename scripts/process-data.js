#!/usr/bin/env node
var fs = require('fs')
var zlib = require('zlib')

var inputFileUse = 'data/land-use.json'
var inputFileZoning = 'data/zoning.json'
var outputFileLots = 'static/build/lots.json'
var outputFileLotGeo = 'static/build/lot-geojson.json'
var outputFileZoningGeo = 'static/build/zoning-geojson.json'

console.log('reading input...', inputFileUse)
var inputUse = JSON.parse(fs.readFileSync(inputFileUse, 'utf8'))
console.log('reading input...', inputFileZoning)
var inputZoning = JSON.parse(fs.readFileSync(inputFileZoning, 'utf8'))

console.log('transforming...')
var residentialLots = computeResLots(inputUse)
var lotGeo = computeLotGeo(inputUse)
var zoningGeo = computeZoningGeo(inputZoning)

write(outputFileLots, residentialLots)
write(outputFileLotGeo, lotGeo)
write(outputFileZoningGeo, zoningGeo)

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
  var n = 0
  var sum = 0
  var sumSquares = 0
  var lotGeoFeatures = input
    .map(function (row) {
      // TODO: add zoning and height properties
      var geom = {
        type: 'MultiPolygon',
        coordinates: row.the_geom.coordinates.map(function (poly) {
          if (poly.length > 1) console.log('poly has holes')
          var hull = simplifyPoly(poly[0], 10)
          n++
          sum += hull.length
          sumSquares += hull.length * hull.length
          return [hull]
        })
      }
      return {
        type: 'Feature',
        geometry: geom,
        properties: {
          landuse: row.landuse,
          units: +row.resunits,
          area: +row.shape_area
        }
      }
    })
  console.log('lots %d polys %d verts %d avg %s rms %s', lotGeoFeatures.length,
    n, sum, (sum / n).toFixed(1), Math.sqrt(sumSquares / n).toFixed(1))
  return {
    type: 'FeatureCollection',
    features: lotGeoFeatures.slice(0, 10000)
  }
}

function computeZoningGeo (input) {
  var zones = {}
  var features = input.map(function (row) {
    var zone = zones[row.zoning]
    var zoneInfo = {
      id: row.zoning,
      idSimple: row.zoning_sim,
      name: row.districtna
    }
    if (!zone) {
      zones[row.zoning] = zoneInfo
    } else if (JSON.stringify(zone) !== JSON.stringify(zoneInfo)) {
      console.log('inconsistent info for the same zone ID', zone, zoneInfo)
    }

    return {
      type: 'Feature',
      geometry: row.geometry,
      properties: zoneInfo
    }
  })
  return {
    type: 'FeatureCollection',
    features: features,
    properties: {
      zones: zones
    }
  }
}

// Simplifies a simple polygon (no holes)
// Always chooses point 0, then greedily picks the point furthest from all
// already-chosen points until we have maxVerts points
function simplifyPoly (poly, maxVerts) {
  if (poly.length <= maxVerts) return poly
  var indices = [0]
  for (var i = 1; i < maxVerts; i++) {
    var maxMinDist = 0
    var maxIndex = 0
    for (var j = 0; j < poly.length; j++) {
      var minDist = Infinity
      for (var k = 0; k < indices.length; k++) {
        var pj = poly[j]
        var pk = poly[indices[k]]
        var dist2 = (pj[0] - pk[0]) * (pj[0] - pk[0]) + (pj[1] - pk[1]) * (pj[1] - pk[1])
        if (dist2 < minDist) minDist = dist2
      }
      if (minDist > maxMinDist) {
        maxMinDist = minDist
        maxIndex = j
      }
    }
    indices.push(maxIndex)
  }
  indices.sort()
  if (Math.random() < 0.001) console.log(JSON.stringify(indices))
  return indices.map((index) => poly[index])
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

// Writes a .json and a .json.gz
function write (filename, obj) {
  var json = JSON.stringify(obj)
  console.log('writing %s...', filename)
  fs.writeFileSync(filename, json)
  console.log('writing %s...', filename + '.gz')
  fs.writeFileSync(filename + '.gz', zlib.gzipSync(json))
}
