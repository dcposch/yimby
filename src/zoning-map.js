import React from 'react'
import Map from './map'
import {ChoroplethLayer} from 'deck.gl'

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

module.exports = class ZoningMap extends React.Component {
  constructor () {
    super()
    this.state = {
      data: null,
      select: -1,
      hover: -1
    }
  }

  render () {
    const {data} = this.state
    const layers = []
    if (data) {
      data.features.forEach((x, i) => { x.properties.index = i })
      layers.push(this.renderZoningLayer())
    }

    return <Map layers={layers} />
  }

  renderZoningLayer () {
    const {data, hover, select} = this.state

    return new ChoroplethLayer({
      data,
      pickable: true,

      getColor: (f) => {
        const props = f.properties
        return this.getZoneColor(props)
      },

      onHover: (info) => {
        if (info.index > 0 && info.index === select) return // already selected
        if (info.index === hover) return // already hovered
        this.setState({hover: info.index})
      },

      onClick: (info) => {
        if (info.index === select) return // already selected
        this.setState({hover: -1, select: info.index})
      },

      updateTriggers: {
        colors: {hover, select}
      }
    })
  }

  getZoneColor (zoneProps, isHover, isSelect) {
    const zid = zoneProps.idSimple
    const zidFilter = this.props.filteredZoneSimpleID

    let alpha = 0.6
    if (isHover) alpha = 0.7
    else if (isSelect) alpha = 1.0
    if (zidFilter && zid !== zidFilter) alpha = 0

    var color = ZONE_COLORS[zid]
    if (!color) throw new Error('Missing color for ' + zid)

    const rgba = [].concat(color, [Math.round(alpha * 255)])
    return rgba
  }
}

/* TODO

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
*/
