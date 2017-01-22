import 'babel-polyfill'

import React from 'react'
import {render} from 'react-dom'
import Map from './map'

const SCALES = {
  GREEN: [
    [247, 252, 245],
    [229, 245, 224],
    [199, 233, 192],
    [161, 217, 155],
    [116, 196, 118],
    [65, 171, 93],
    [35, 139, 69],
    [0, 109, 44],
    [0, 68, 27]
  ],
  RED: [
    [255, 245, 240],
    [254, 224, 210],
    [252, 187, 161],
    [252, 146, 114],
    [251, 106, 74],
    [239, 59, 44],
    [203, 24, 29],
    [165, 15, 21],
    [103, 0, 13]
  ],
  ORANGE: [
    [255, 245, 235],
    [254, 230, 206],
    [253, 208, 162],
    [253, 174, 107],
    [253, 141, 60],
    [241, 105, 19],
    [217, 72, 1],
    [166, 54, 3],
    [127, 39, 4]
  ],
  BLUE: [
    [247, 251, 255],
    [222, 235, 247],
    [198, 219, 239],
    [158, 202, 225],
    [107, 174, 214],
    [66, 146, 198],
    [33, 113, 181],
    [8, 81, 156],
    [8, 48, 107]
  ],
  PURPLE: [
    [252, 251, 253],
    [239, 237, 245],
    [218, 218, 235],
    [188, 189, 220],
    [158, 154, 200],
    [128, 125, 186],
    [106, 81, 163],
    [84, 39, 143],
    [63, 0, 12]
  ]
}

var ZONE_COLORS = {
  'C-2': SCALES.BLUE[4],
  'C-3-G': SCALES.BLUE[5],
  'C-3-O': SCALES.BLUE[5],
  'C-3-O(SD)': SCALES.BLUE[6],
  'C-3-R': SCALES.BLUE[5],
  'C-3-S': SCALES.BLUE[5],
  'CCB': SCALES.BLUE[3],
  'CRNC': SCALES.BLUE[3],
  'CVR': SCALES.BLUE[3],
  'HP-RA': SCALES.BLUE[3],
  'M-1': SCALES.ORANGE[4],
  'M-2': SCALES.ORANGE[5],
  'MB-O': SCALES.PURPLE[4],
  'MB-OS': SCALES.BLUE[3],
  'MB-RA': SCALES.BLUE[3],
  'MUG': SCALES.GREEN[3],
  'MUO': SCALES.BLUE[3],
  'MUR': SCALES.GREEN[3],
  'NC-1': SCALES.GREEN[3],
  'NC-2': SCALES.GREEN[4],
  'NC-3': SCALES.GREEN[5],
  'NC-S': SCALES.GREEN[6],
  'NCD': SCALES.GREEN[6],
  'NCT': SCALES.GREEN[6],
  'NCT-1': SCALES.GREEN[5],
  'NCT-2': SCALES.GREEN[4],
  'NCT-3': SCALES.GREEN[3],
  'P': SCALES.PURPLE[4],
  'PDR-1-B': SCALES.ORANGE[3],
  'PDR-1-D': SCALES.ORANGE[3],
  'PDR-1-G': SCALES.ORANGE[3],
  'PDR-2': SCALES.ORANGE[4],
  'PM-CF': SCALES.GREEN[3],
  'PM-MU1': SCALES.GREEN[3],
  'PM-MU2': SCALES.GREEN[3],
  'PM-OS': SCALES.GREEN[3],
  'PM-R': SCALES.GREEN[3],
  'PM-S': SCALES.GREEN[3],
  'RC-3': SCALES.GREEN[4],
  'RC-4': SCALES.GREEN[5],
  'RCD': SCALES.PURPLE[2],
  'RED': SCALES.PURPLE[2],
  'RED-MX': SCALES.PURPLE[2],
  'RH DTR': SCALES.PURPLE[2],
  'RH-1': SCALES.RED[6],
  'RH-1(D)': SCALES.RED[7],
  'RH-1(S)': SCALES.RED[5],
  'RH-2': SCALES.RED[4],
  'RH-3': SCALES.RED[3],
  'RM-1': SCALES.GREEN[2],
  'RM-2': SCALES.GREEN[3],
  'RM-3': SCALES.GREEN[4],
  'RM-4': SCALES.GREEN[5],
  'RTO': SCALES.GREEN[5],
  'RTO-M': SCALES.GREEN[5],
  'SALI': SCALES.PURPLE[2],
  'SB-DTR': SCALES.GREEN[6],
  'SLI': SCALES.PURPLE[2],
  'SPD': SCALES.PURPLE[2],
  'SSO': SCALES.PURPLE[2],
  'TB DTR': SCALES.GREEN[6],
  'UMU': SCALES.PURPLE[2],
  'WMUG': SCALES.PURPLE[2],
  'WMUO': SCALES.PURPLE[2]
}

var LAND_USE_COLORS = {
  MIXRES: [31, 120, 180],
  RESIDENT: [166, 206, 227],
  PDR: [251, 154, 153], // production, distribution, repair
  CIE: [251, 154, 153], // industrial
  MIXED: [178, 223, 138], // mixed, nonresidential
  MIPS: [178, 223, 138], // office space
  MED: [178, 223, 138], // medical
  VISITOR: [178, 223, 138], // hotels
  'RETAIL/ENT': [51, 160, 44],
  VACANT: [227, 26, 28],
  'MISSING DATA': [253, 191, 111],
  'OpenSpace': [0, 0, 0, 0]
}

main()

function main () {
  let path = document.location.pathname
  // Hack to make these pages work when served from dcpos.ch/yimby/
  if (path.startsWith('/yimby')) {
    path = path.substring('/yimby'.length)
  }
  console.log('Loading ' + path)
  switch (path) {
    case '/':
      return loadIndex()
    case '/zoning/':
      return loadZoning()
    default:
      console.error('Unknown path')
  }
}

function loadIndex () {
  const mapDensity = render(
    <Map type='scatter' getColor={getLotDensityColor} />,
    document.querySelector('#map-density')
  )
  const mapLots = render(
    <Map type='choropleth' getColor={getLotUseColor} />,
    document.querySelector('#map-lots')
  )
  const mapZoning = render(
    <Map type='choropleth' getColor={getZoneColor} />,
    document.querySelector('#map-zoning')
  )

  fetch('build/lots.json', function (data) {
    mapDensity.setState({data})
    fetch('build/zoning-geojson.json', function (data) {
      mapZoning.setState({data})
    })
    fetch('build/lot-geojson.json', function (data) {
      mapLots.setState({data})
    })
  })
}

function loadZoning () {
  const mapZoning = render(
    <Map type='choropleth' getColor={getZoneColor} />,
    document.querySelector('#map-zoning')
  )
  fetch('../build/zoning-geojson.json', function (data) {
    mapZoning.setState({data})
  })
}

function getLotDensityColor (row) {
  return row.units > 1 ? [0, 220, 220, 220] : [255, 128, 0]
}

function getLotUseColor (props) {
  return LAND_USE_COLORS[props.landuse]
}

function getZoneColor (props) {
  var color = ZONE_COLORS[props.idSimple]
  if (!color) {
    console.error('Missing color for ' + props.idSimple)
    return SCALES.PURPLE[0]
  }
  return color
}

function fetch (url, cb) {
  const xhr = new window.XMLHttpRequest()
  xhr.onload = () => cb(xhr.response)
  xhr.responseType = 'json'
  xhr.open('GET', url)
  xhr.send()
}
