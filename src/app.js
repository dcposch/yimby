import 'babel-polyfill'

import React, {Component} from 'react'
import {render} from 'react-dom'
import DeckGL from 'deck.gl/react'
import {ScatterplotLayer, ScreenDoorLayer} from 'deck.gl'
import MapGL from 'react-map-gl'
import config from './config'

class Root extends Component {
  constructor () {
    super()
    this.state = {
      hover: -1,
      select: -1,
      data: null,
      type: 'scatter',
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
    const {viewport, width, height, data, type, hover} = this.state
    console.log('Rendering ' + JSON.stringify({hover}))

    const layers = []
    if (data !== null) {
      var layer
      if (type === 'scatter') {
        layer = new ScatterplotLayer({
          data,
          opacity: 1,
          getRadius: (row, i) => Math.sqrt(row.units / 100) + (i === hover ? 1 : 0),
          getColor: (row) => row.units > 1 ? [0, 255, 255, 128] : [255, 128, 0, 255]
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

const root = render(<Root />, document.querySelector('#map'))

const xhr = new window.XMLHttpRequest()
xhr.onload = function () {
  root.setState({data: xhr.response})
}
xhr.responseType = 'json'
xhr.open('GET', 'build/lots.json')
xhr.send()
