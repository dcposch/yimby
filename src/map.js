import React, {Component} from 'react'
import DeckGL from 'deck.gl/src/react/deckgl'
// import DeckGL from 'deck.gl/react'
import {ScatterplotLayer, ChoroplethLayer, ScreenDoorLayer} from 'deck.gl'
import MapGL from 'react-map-gl'
import config from './config'

module.exports = class Map extends Component {
  constructor (props) {
    super()
    this.props = props
    this.layer = null
    this.state = {
      hover: -1,
      select: -1,
      data: null,
      updateTriggers: {},
      viewport: {
        latitude: 37.78,
        longitude: -122.44,
        zoom: 12,
        bearing: 0,
        pitch: 30
      }
    }
  }

  render () {
    const {viewport, data} = this.state

    // Default to full-screen
    const width = this.props.width || window.innerWidth
    const height = this.props.height || window.innerHeight

    // if (data === null) this.layer = null
    // else if (data !== null && this.layer === null) this.layer = this.createLayer()
    // const layers = this.layer ? [this.layer] : []
    const layers = data ? [this.renderLayer()] : []

    // Alternate mapStyles:
    // - Light: mapbox://styles/mapbox/light-v9
    // - Dark: mapbox://styles/mapbox/dark-v9
    // - Dark without labels: mapbox://styles/dcposch/cixuozuq600312roeoc5r4ptq
    // - LightMono: mapbox://styles/dcposch/cixvuegri000j2srje8xbxu0v
    return (
      <MapGL
        {...viewport}
        mapStyle={this.props.mapStyle || 'mapbox://styles/mapbox/light-v9'}
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

  renderLayer () {
    const {type} = this.props
    const {data, hover, select, updateTriggers} = this.state

    if (type === 'scatter') {
      return new ScatterplotLayer({
        data,
        opacity: 1,
        getRadius: (row, i) => {
          return Math.max(Math.sqrt(row.units / 100), 0.2) + (i === hover ? 0.2 : 0)
        },
        getColor: (row, i) => {
          if (i === select) return [255, 255, 255, 255]
          return this.props.getColor(row)
        },
        pickable: false
      })
    } else if (type === 'choropleth') {
      if (data) data.features.forEach((x, i) => { x.properties.index = i })
      return new ChoroplethLayer({
        data,
        opacity: 1,
        getColor: (f) => {
          const props = f.properties
          const index = props.index
          const color = this.props.getColor(props, index === hover, index === select)
          if (!color || color.length !== 4) {
            throw new Error('Invalid color ' + color)
          }
          return color
        },
        pickable: true,
        onHover: (info) => {
          if (info.index > 0 && info.index === this.state.select) return // already selected
          if (this.state.hover === info.index) return // already hovered
          this.setState({hover: info.index})
          if (this.props.onHover) {
            this.props.onHover(info.index, this.state.data)
          }
        },
        onClick: (info) => {
          if (this.state.select === info.index) return // already selected
          this.setState({select: info.index, hover: -1})
          if (this.props.onSelect) {
            this.props.onSelect(info.index, this.state.data)
          }
        },
        updateTriggers: {
          colors: {hover, select, userTrigger: updateTriggers.color}
        }
      })
    } else {
      return new ScreenDoorLayer({
        data,
        opacity: 0.5,
        unitWidth: 10,
        unitHeight: 10,
        minColor: [0, 0, 0, 0],
        maxColor: [0, 255, 0, 255],
        getWeight: (row) => row.units
      })
    }
  }
}

Map.propTypes = {
  type: React.PropTypes.string.isRequired,
  width: React.PropTypes.number,
  height: React.PropTypes.number,
  mapStyle: React.PropTypes.string,
  getColor: React.PropTypes.func,
  onHover: React.PropTypes.func,
  onSelect: React.PropTypes.func
}
