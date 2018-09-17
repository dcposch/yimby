#!/usr/bin/env node

const fs = require('fs')

const rows = JSON.parse(fs.readFileSync('download/land-use.json', 'utf8'))
  .filter(function (row) {
    return row.resunits > 0
  })
  .map(function (row) {
    delete row.the_geom
    row.shape_area = row.shape_area ? +row.shape_area : 0
    row.bldgsqft = row.bldgsqft ? +row.bldgsqft : 0
    row.areal_den = (row.bldgsqft && row.shape_area) ? (row.bldgsqft / row.shape_area) : 0
    row.unit_den = (row.resunits && row.shape_area) ? (row.resunits / row.shape_area) : 0
    return row
  })

console.log('# SAN FRANCISCO LAND USE')
console.log('')

console.log('## Top buildings, most residential units')
print(rows.sort((a, b) => b.resunits - a.resunits).slice(0, 5))
console.log('')

// console.log('## Highest areal density')
// print(rows.sort((a, b) => b.areal_den - a.areal_den).slice(0, 5))
// console.log('')

// console.log('## Lowest areal density')
// print(rows.sort((a, b) => a.areal_den - b.areal_den).slice(0, 5))
// console.log('')

console.log('## Hall of fame, highest unit density')
print(rows.sort((a, b) => b.unit_den - a.unit_den).slice(0, 20))
console.log('')

console.log('## Biggest wastes of space, lowest unit density')
print(rows.sort((a, b) => a.unit_den - b.unit_den).slice(0, 5))
console.log('')

function print (rows) {
  console.log(rows.map(toString).join('\n'))
}

function toString (r) {
  // Example: "1040 - 1044 FOLSOM ST."
  const streetNumber = r.to_st ? (r.from_st + ' - ' + r.to_st) : r.from_st
  const address = [streetNumber, r.street, r.st_type].filter(exists).join(' ') || 'ADDRESS MISSING'
  const units = r.resunits + ' units'
  const shapeArea = r.shape_area && (r.shape_area.toFixed(0) + ' lot sqft')
  const bldgArea = r.bldgsqft && (r.bldgsqft.toFixed(0) + ' bldg sqft')
  const arealDensity = r.areal_den && (r.areal_den.toFixed(2) + ' bldg / lot sqft')
  const unitDensity = r.unit_den && ((1 / r.unit_den).toFixed(0) + ' lot sqft / unit')

  const lotLine = r.landuse + ' ' + r.blklot + ' - ' + address
  const statsLine = [units, shapeArea, bldgArea].filter(exists).join(', ')
  const densityLine = [arealDensity, unitDensity].filter(exists).join(', ')
  const lines = [lotLine, statsLine, densityLine]

  return ' - ' + lines.join('\n   ')
}

function exists (x) {
  return !!x
}
