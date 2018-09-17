import React from 'react'
import { GeoJsonLayer } from 'deck.gl'

import fetch from '../fetch'
import Map from '../map'
import ZoningDescription from './zoning-description'
import ZoneDetails from './zone-details'
import zoneColors from './zone-colors'

export default class ZoningMap extends React.Component {
  constructor () {
    super()
    this.state = {
      data: null,
      select: -1,
      hover: -1,
      filteredZoneSimpleID: null
    }

    this._onKeyDownBound = this._onKeyDown.bind(this)
    this._onFilterZoneBound = this._onFilterZone.bind(this)
    this._onLayerClickBound = this._onLayerClick.bind(this)
    this._onLayerHoverBound = this._onLayerHover.bind(this)
  }

  componentDidMount () {
    fetch('../data/zoning-geojson.json', (err, data) => {
      if (err) return console.error(err)
      // Don't show public land like parks and highways.
      // Filter it out here, not during data preprocessing, so that we can
      // simplify / re-use / browser-cache the data sets we're loading.
      // I might want to show public lots in a different visualization.
      data.features = data.features.filter((f) => f.properties.idSimple !== 'P')
      this.setState({ data })
    })

    window.addEventListener('keydown', this._onKeyDownBound)
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this._onKeyDownBound)
  }

  render () {
    const { data, viewport, select, filteredZoneSimpleID } = this.state

    const layers = []
    if (data) {
      data.features.forEach((x, i) => { x.properties.index = i })
      layers.push(this.renderZoningLayer())
    }

    return (
      <div>
        <Map
          layers={layers}
          viewport={viewport}
          onViewportChange={this._onChangeViewportBound}
          onLayerClick={this._onLayerClickBound}
          onLayerHover={this._onLayerHoverBound}
        />
        <ZoningDescription
          selectedZone={filteredZoneSimpleID}
          onSelectZone={this._onFilterZoneBound}
        />
        {select < 0 ? null : <ZoneDetails zone={data.features[select].properties} />}
      </div>
    )
  }

  renderZoningLayer () {
    const { data, hover, select, filteredZoneSimpleID } = this.state

    return new GeoJsonLayer({
      data,

      pickable: true,
      stroked: false,
      filled: true,
      extruded: false,

      getFillColor: (f) => {
        const props = f.properties
        return this._getZoneColor(props, props.index === hover, props.index === select)
        // return [160, 160, 180, 200]
      },

      updateTriggers: {
        getFillColor: { hover, select, filteredZoneSimpleID }
      }
    })
  }

  _getZoneColor (zoneProps, isHover, isSelect) {
    const zid = zoneProps.idSimple
    const zidFilter = this.state.filteredZoneSimpleID

    let alpha = 0.6
    if (isHover) alpha = 0.7
    else if (isSelect) alpha = 1.0
    if (zidFilter && zid !== zidFilter) alpha = 0

    const color = zoneColors.rgb(zid)
    const rgba = [].concat(color, [Math.round(alpha * 255)])
    return rgba
  }

  _onLayerHover (info) {
    if (info == null) return
    const { select, hover } = this.state
    if (info.index > 0 && info.index === select) return // already selected
    if (info.index === hover) return // already hovered
    this.setState({ hover: info.index })
  }

  _onLayerClick (info) {
    const { data, select, filteredZoneSimpleID } = this.state
    if (info == null) {
      // clicked on an empty area of the map. deselect:
      return this.setState({ hover: -1, select: -1, filteredZoneSimpleID: null })
    }
    if (info.index === select) return // already selected
    if (filteredZoneSimpleID !== null) {
      // if we've filtered to some zone id, and we click somewhere else on the map, unfilter
      const feature = data.features[info.index]
      if (!feature || feature.properties.idSimple !== filteredZoneSimpleID) {
        return this.setState({ hover: info.index, select: -1, filteredZoneSimpleID: null })
      }
    }
    this.setState({ hover: -1, select: info.index })
  }

  _onKeyDown (ev) {
    if (ev.key === 'Escape') {
      this.setState({
        select: -1,
        filteredZoneSimpleID: null
      })
    }
  }

  // Let the user filter down to a simplified zone ID, to see everywhere it's used.
  // Toggle. If the user clicks the same filter again, turn off filtering.
  _onFilterZone (id) {
    const { data, select, filteredZoneSimpleID } = this.state

    if (filteredZoneSimpleID === id) id = null
    if (id !== null && select > 0) {
      const zone = data.features[select].properties
      if (zone.idSimple !== id) this.setState({ select: -1 })
    }
    this.setState({ filteredZoneSimpleID: id })
  }
}
