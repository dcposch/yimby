import 'babel-polyfill'

import React, {Component} from 'react'
import {render} from 'react-dom'
import DeckGL from 'deck.gl/react'
import {ScatterplotLayer, ChoroplethLayer, ScreenDoorLayer} from 'deck.gl'
import MapGL from 'react-map-gl'
import config from './config'

var LAND_USE_COLORS = {
  MIXRES: [31, 120, 180, 255],
  RESIDENT: [166, 206, 227, 255],
  PDR: [251, 154, 153, 255], // production, distribution, repair
  CIE: [251, 154, 153, 255], // industrial
  MIXED: [178, 223, 138, 255], // mixed, nonresidential
  MIPS: [178, 223, 138, 255], // office space
  MED: [178, 223, 138, 255], // medical
  VISITOR: [178, 223, 138, 255], // hotels
  'RETAIL/ENT': [51, 160, 44, 255],
  VACANT: [227, 26, 28, 255],
  'MISSING DATA': [253, 191, 111, 255],
  'OpenSpace': [0, 0, 0, 0]
}

class Map extends Component {
  constructor (props) {
    super()
    this.props = props
    this.state = {
      hover: -1,
      select: -1,
      data: null,
      viewport: {
        latitude: 37.78,
        longitude: -122.44,
        zoom: 12,
        bearing: 0,
        pitch: 30
      },
      width: 960,
      height: 500
    }
  }

  render () {
    const {viewport, width, height, data, hover} = this.state
    const {type} = this.props

    const layers = []
    if (data !== null) {
      var layer
      if (type === 'scatter') {
        layer = new ScatterplotLayer({
          data,
          opacity: 1,
          getRadius: (row, i) => Math.sqrt(row.units / 100) + (i === hover ? 1 : 0),
          getColor: (row) => row.units > 1 ? [0, 240, 240, 180] : [255, 128, 0, 255]
        })
      } else if (type === 'choropleth') {
        layer = new ChoroplethLayer({
          data,
          opacity: 1,
          getColor: f => {
            var props = f.properties
            return LAND_USE_COLORS[props.landuse]
          }
        })
      } else {
        layer = new ScreenDoorLayer({
          data,
          opacity: 0.5,
          unitWidth: 10,
          unitHeight: 10,
          minColor: [0, 0, 0, 0],
          maxColor: [0, 255, 0, 255],
          getWeight: (row) => row.units
        })
      }
      layers.push(layer)
    }

    // Alternate mapStyles:
    // - Light: mapbox://styles/mapbox/light-v9
    // - Dark: mapbox://styles/mapbox/dark-v9
    // - Dark without labels: mapbox://styles/dcposch/cixuozuq600312roeoc5r4ptq
    // - LightMono: mapbox://styles/dcposch/cixvuegri000j2srje8xbxu0v
    return (
      <MapGL
        {...viewport}
        mapStyle='mapbox://styles/dcposch/cixvuegri000j2srje8xbxu0v'
        onChangeViewport={v => this.setState({viewport: v})}
        preventStyleDiffing={false}
        mapboxApiAccessToken={config.MAPBOX_TOKEN}
        perspectiveEnabled
        width={width}
        height={height}>
        <DeckGL
          {...viewport}
          width={width}
          height={height}
          layers={layers}
          debug />
      </MapGL>
    )
  }
}

const mapDensity = render(<Map type='scatter' />, document.querySelector('#map-density'))
const mapLots = render(<Map type='choropleth' />, document.querySelector('#map-lots'))

fetch('build/lots.json', function (data) {
  mapDensity.setState({data})
  fetch('build/lot-geojson.json', function (data) {
    mapLots.setState({data})
  })
})

function fetch (url, cb) {
  const xhr = new window.XMLHttpRequest()
  xhr.onload = () => cb(xhr.response)
  xhr.responseType = 'json'
  xhr.open('GET', url)
  xhr.send()
}
