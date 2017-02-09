import 'babel-polyfill'

import React from 'react'
import {render} from 'react-dom'
import Map from './map'

const SCALES = {
  GREEN: [
    [199, 233, 192],
    [161, 217, 155],
    [116, 196, 118],
    [65, 171, 93],
    [35, 139, 69],
    [0, 109, 44],
    [0, 68, 27]
  ],
  RED: [
    [252, 187, 161],
    [252, 146, 114],
    [251, 106, 74],
    [239, 59, 44],
    [203, 24, 29],
    [165, 15, 21],
    [103, 0, 13]
  ],
  ORANGE: [
    [253, 208, 162],
    [253, 174, 107],
    [253, 141, 60],
    [241, 105, 19],
    [217, 72, 1],
    [166, 54, 3],
    [127, 39, 4]
  ],
  BLUE: [
    [198, 219, 239],
    [158, 202, 225],
    [107, 174, 214],
    [66, 146, 198],
    [33, 113, 181],
    [8, 81, 156],
    [8, 48, 107]
  ],
  PURPLE: [
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
  // Residential
  'RH-1(D)': SCALES.RED[6],
  'RH-1': SCALES.RED[5],
  'RH-1(S)': SCALES.RED[4],
  'RH-2': SCALES.RED[3],
  'RH-3': SCALES.RED[3],

  // ...Residential mixed
  'RM-1': SCALES.GREEN[2],
  'RM-2': SCALES.GREEN[3],
  'RM-3': SCALES.GREEN[4],
  'RM-4': SCALES.GREEN[5],

  // ...Residential commercial combined
  'RC-3': SCALES.GREEN[4],
  'RC-4': SCALES.GREEN[5],
  'RCD': SCALES.GREEN[5],

  // ...Residential transit oriented
  'RTO': SCALES.GREEN[6],
  'RTO-M': SCALES.GREEN[6],

  // ... Rincon Hill, South Beach and Transbay Downtown Residential
  'RH DTR': SCALES.GREEN[5],
  'SB-DTR': SCALES.GREEN[5],
  'TB DTR': SCALES.GREEN[5],

  // ... SoMa stuff, Urban Mixed Use and Residential Enclave
  'WMUO': SCALES.GREEN[2],
  'WMUG': SCALES.GREEN[3],
  'UMU': SCALES.GREEN[4],
  'RED': SCALES.GREEN[5],
  'RED-MX': SCALES.GREEN[5],
  'MUO': SCALES.GREEN[2],
  'MUG': SCALES.GREEN[3],
  'MUR': SCALES.GREEN[4],
  'SSO': SCALES.GREEN[2],

  // Neighborhood Commercial
  'NC-1': SCALES.GREEN[3],
  'NC-2': SCALES.GREEN[4],
  'NC-3': SCALES.GREEN[5],
  'NC-S': SCALES.GREEN[6],
  'NCD': SCALES.GREEN[6],
  'NCT': SCALES.GREEN[6],
  'NCT-1': SCALES.GREEN[3],
  'NCT-2': SCALES.GREEN[4],
  'NCT-3': SCALES.GREEN[5],

  // Commercial
  'C-2': SCALES.BLUE[2],
  'C-3-G': SCALES.BLUE[4],
  'C-3-O': SCALES.BLUE[5],
  'C-3-O(SD)': SCALES.BLUE[6],
  'C-3-R': SCALES.BLUE[3],
  'C-3-S': SCALES.BLUE[3],

  // Industrial
  'M-1': SCALES.ORANGE[5],
  'M-2': SCALES.ORANGE[6],

  'PDR-1-B': SCALES.ORANGE[3],
  'PDR-1-D': SCALES.ORANGE[3],
  'PDR-1-G': SCALES.ORANGE[3],
  'PDR-2': SCALES.ORANGE[4],

  'SALI': SCALES.ORANGE[4],
  'SLI': SCALES.ORANGE[4],

  // Special
  // ... Chinatown
  'CCB': SCALES.PURPLE[3],
  'CRNC': SCALES.PURPLE[4],
  'CVR': SCALES.PURPLE[5],

  // ... Hunter's Point
  'HP-RA': SCALES.PURPLE[4],

  // ... Mission Bay
  'MB-O': SCALES.PURPLE[4],
  'MB-OS': SCALES.PURPLE[3],
  'MB-RA': SCALES.PURPLE[4],

  // ... Park Merced
  'PM-OS': SCALES.PURPLE[3],
  'PM-S': SCALES.PURPLE[3],
  'PM-CF': SCALES.PURPLE[3],
  'PM-MU1': SCALES.PURPLE[4],
  'PM-MU2': SCALES.PURPLE[5],
  'PM-R': SCALES.PURPLE[5],

  // ... South Park
  'SPD': SCALES.PURPLE[4]

  // Public (not shown)
  // 'P': null
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

const state = {
  selectedSupporterIndex: -1,
  filteredZoneSimpleID: null,
  selectedZoneIndex: -1,
  data: {}
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
    case '/supporters/':
      return loadSupporters()
    default:
      console.error('Unknown path')
  }
}

function loadIndex () {
  const mapStyle = 'mapbox://styles/dcposch/cixvuegri000j2srje8xbxu0v'
  const mapDensity = render(
    <Map type='scatter' getColor={getLotDensityColor} mapStyle={mapStyle} />,
    document.querySelector('#map-density')
  )
  const mapLots = render(
    <Map type='choropleth' getColor={getLotUseColor} mapStyle={mapStyle} />,
    document.querySelector('#map-lots')
  )
  const mapZoning = render(
    <Map type='choropleth' getColor={getZoneColor} mapStyle={mapStyle} />,
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
    <Map type='choropleth' getColor={getZoneColor} onSelect={onSelectZone} />,
    document.querySelector('#map-zoning')
  )

  fetch('../build/zoning-geojson.json', function (data) {
    // Don't show public land like parks and highways.
    // Filter it out here, not during data preprocessing, so that we can
    // simplify / re-use / browser-cache the data sets we're loading.
    // I might want to show public lots in a different visualization.
    data.features = data.features.filter(function (feature) {
      return feature.properties.idSimple !== 'P'
    })
    state.data.zoneGeo = data
    mapZoning.setState({data})
  })

  handleZoningEvents(mapZoning)
}

function loadSupporters () {
  const mapSupporters = render(
    <Map type='scatter' getColor={getSupporterColor} onSelect={onSelectSupporter} />,
    document.querySelector('#map-supporters')
  )

  fetch('../build/supporters.json', function (data) {
    state.data.supporters = data
    mapSupporters.setState({data})
  })
}

function getSupporterColor () {
  return [0, 255, 255, 255]
}

function onSelectSupporter (index, data) {
  state.selectedSupporterIndex = index
  updateSupporterDetails(this)
}

function updateSupporterDetails () {
  console.log('DBG TODO: SUPPORTER ' + state.selectedSupporterIndex)
}

// Update the detail panes via direct DOM manipulation.
// Conscious choice not to use React here, since I might remove React and deck.gl entirely
// and just use Mapbox layers for the visualization.
function handleZoningEvents (mapZoning) {
  const elem = document.querySelector('.zones')
  elem.addEventListener('mouseover', () => mapZoning.setState({hover: -1}))

  // Legend
  const hasLegend = {}
  elem.querySelectorAll('.legend span').forEach(function (legendElem) {
    const id = legendElem.innerText
    const color = ZONE_COLORS[id]
    if (!color) throw new Error('missing zone ' + id)
    hasLegend[id] = true
    legendElem.style.borderTopColor = toHtmlColor(color)
    legendElem.title = id
    legendElem.addEventListener('click', () => filterToZone(id, legendElem, mapZoning))
  })
  const numZones = Object.keys(ZONE_COLORS).length
  const numZonesInLegend = Object.keys(hasLegend).length
  if (numZones !== numZonesInLegend) {
    throw new Error(numZones + ' zones, only ' + numZonesInLegend + ' in legend')
  }
}

function filterToZone (id, legendElem, mapZoning) {
  var selectedElem = document.querySelector('.legend span.selected')
  if (selectedElem) selectedElem.classList.remove('selected')
  if (id === state.filteredZoneSimpleID) {
    if (legendElem) legendElem.classList.remove('selected')
    state.filteredZoneSimpleID = null
  } else {
    if (legendElem) legendElem.classList.add('selected')
    state.filteredZoneSimpleID = id
  }

  const updateTriggers = {color: state.filteredZoneSimpleID}
  mapZoning.setState({updateTriggers})

  updateZoneDetails(mapZoning)
}

function toHtmlColor (color) {
  return '#' + color.map((c) => (c + 256).toString(16).substring(1)).join('')
}

function onSelectZone (index, data) {
  state.selectedZoneIndex = index
  if (index < 0) filterToZone(null, null, this)
  else updateZoneDetails(this)
}

function updateZoneDetails (mapZoning) {
  const elem = document.querySelector('.zone-details')
  const index = state.selectedZoneIndex
  const data = state.data.zoneGeo

  if (index < 0) {
    elem.style.display = 'none'
    return
  }

  const feature = data.features[index]
  const {id, idSimple} = feature.properties
  if (state.filteredZoneSimpleID && state.filteredZoneSimpleID !== idSimple) {
    elem.style.display = 'none'
    state.selectedZoneIndex = -1
    mapZoning.setState({select: -1})
    return
  }

  const zones = data.properties.zones
  let zone = zones[id]
  if (!zone) {
    console.log('Missing zone ' + id)
    zone = {name: 'UNKNOWN', legalURL: ''}
  }
  const {name, legalURL} = zone

  elem.style.display = 'block'
  elem.querySelector('.id').innerText = id
  elem.querySelector('.simple-id').innerText = idSimple
  elem.querySelector('.simple-id-wrap').style.display = idSimple === id ? 'none' : ''
  elem.querySelector('.name').innerText = name
  elem.querySelector('.legal-link').href = legalURL
  elem.querySelector('.legal-link').innerText = id + ' code'
}

function getLotDensityColor (row) {
  return row.units > 1 ? [0, 220, 220, 220] : [255, 128, 0, 220]
}

function getLotUseColor (props) {
  return LAND_USE_COLORS[props.landuse]
}

function getZoneColor (props, isHover, isSelect) {
  let alpha = 0.6
  if (isHover) alpha = 0.7
  else if (isSelect) alpha = 1.0
  if (state.filteredZoneSimpleID && state.filteredZoneSimpleID !== props.idSimple) alpha = 0

  var color = ZONE_COLORS[props.idSimple]
  if (!color) throw new Error('Missing color for ' + props.idSimple)

  const rgba = [].concat(color, [Math.round(alpha * 255)])
  return rgba
}

function fetch (url, cb) {
  const xhr = new window.XMLHttpRequest()
  xhr.onload = () => cb(xhr.response)
  xhr.responseType = 'json'
  xhr.open('GET', url)
  xhr.send()
}
