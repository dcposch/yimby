import React from 'react'
import DeckGL from 'deck.gl'
import { StaticMap } from 'react-map-gl'
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
      mapStyle: PropTypes.string,
      onLayerClick: PropTypes.func,
      onLayerHover: PropTypes.func
    }
  }

  constructor (props) {
    super()
    this.props = props
  }

  render () {
    const viewport = this.props.viewport || {
      latitude: 37.78,
      longitude: -122.44,
      zoom: 12,
      bearing: 0,
      pitch: 0
    }

    // Alternate mapStyles:
    // - Light: mapbox://styles/mapbox/light-v9
    // - Dark: mapbox://styles/mapbox/dark-v9
    // - Dark without labels: mapbox://styles/dcposch/cixuozuq600312roeoc5r4ptq
    const mapStyle = this.props.mapStyle || 'mapbox://styles/mapbox/light-v9'

    return (
      <DeckGL
        initialViewState={viewport}
        layers={this.props.layers}
        onLayerClick={this.props.onLayerClick}
        onLayerHover={this.props.onLayerHover}
        controller
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing
          mapboxApiAccessToken={config.MAPBOX_TOKEN}
        />
      </DeckGL>
    )
  }
}
