import React from 'react'
import DeckGL from 'deck.gl'
import MapGL from 'react-map-gl'
import PropTypes from 'prop-types'
import config from './config'

// Creates a map centered on San Francisco.
// Lets the user move around, rotate, and zoom.
export default class Map extends React.Component {
  static get propTypes () {
    return {
      layers: PropTypes.array.isRequired,
      width: PropTypes.number,
      height: PropTypes.number,
      mapStyle: PropTypes.string
    }
  }

  constructor (props) {
    super()
    this.props = props
  }

  render () {
    const {layers, onChangeViewport} = this.props

    const viewport = this.props.viewport || {
      latitude: 37.78,
      longitude: -122.44,
      zoom: 12,
      bearing: 0,
      pitch: 0
    }

    // Default to full-screen
    const width = this.props.width || window.innerWidth
    const height = this.props.height || window.innerHeight

    // Alternate mapStyles:
    // - Light: mapbox://styles/mapbox/light-v9
    // - Dark: mapbox://styles/mapbox/dark-v9
    // - Dark without labels: mapbox://styles/dcposch/cixuozuq600312roeoc5r4ptq
    const mapStyle = this.props.mapStyle || 'mapbox://styles/mapbox/light-v9'

    return (
      <MapGL
        {...viewport}
        mapStyle={mapStyle}
        onChangeViewport={(v) => onChangeViewport(v)}
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
