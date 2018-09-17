#!/usr/bin/env node
const fs = require('fs')
const zlib = require('zlib')

const inputFileUse = 'download/land-use.json'
const inputFileZoning = 'download/zoning.json'
const outputFileLots = 'static/data/lots.json'
const outputFileLotGeo = 'static/data/lot-geojson.json'
const outputFileZoningGeo = 'static/data/zoning-geojson.json'

console.log('reading input...', inputFileUse)
const inputUse = JSON.parse(fs.readFileSync(inputFileUse, 'utf8'))
console.log('reading input...', inputFileZoning)
const inputZoning = JSON.parse(fs.readFileSync(inputFileZoning, 'utf8'))

console.log('transforming...')
const residentialLots = computeResLots(inputUse)
const lotGeo = computeLotGeo(inputUse)
const zoningGeo = computeZoningGeo(inputZoning)

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
  let n = 0
  let sum = 0
  let sumSquares = 0
  const lotGeoFeatures = input
    .map(function (row) {
      // TODO: add zoning and height properties
      const geom = {
        type: 'MultiPolygon',
        coordinates: row.the_geom.coordinates.map(function (poly) {
          if (poly.length > 1) console.log('poly has holes')
          const hull = simplifyPoly(poly[0], 10)
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
  const zones = {}
  const features = input.features.map(function (f) {
    const row = f.properties
    const zoneInfo = {
      id: row.zoning,
      idSimple: row.zoning_sim,
      name: row.districtname,
      legalURL: row.url
    }
    const zone = zones[row.zoning]
    if (!zone) {
      zones[row.zoning] = zoneInfo
    } else if (JSON.stringify(zone) !== JSON.stringify(zoneInfo)) {
      console.log('inconsistent info for the same zone ID', zone, zoneInfo)
    }

    return {
      type: 'Feature',
      geometry: f.geometry,
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
  const indices = [0]
  for (let i = 1; i < maxVerts; i++) {
    let maxMinDist = 0
    let maxIndex = 0
    for (let j = 0; j < poly.length; j++) {
      let minDist = Infinity
      for (let k = 0; k < indices.length; k++) {
        const pj = poly[j]
        const pk = poly[indices[k]]
        const dist2 = (pj[0] - pk[0]) * (pj[0] - pk[0]) + (pj[1] - pk[1]) * (pj[1] - pk[1])
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
  let slat = 0
  let slon = 0
  let n = 0
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
  const json = JSON.stringify(obj)
  console.log('writing %s...', filename)
  fs.writeFileSync(filename, json)
  console.log('writing %s...', filename + '.gz')
  fs.writeFileSync(filename + '.gz', zlib.gzipSync(json))
}
