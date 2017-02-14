import React from 'react'
import {ChoroplethLayer} from 'deck.gl'

import Map from '../map'
import ZoningDescription from './zoning-description'
import ZoneDetails from './zone-details'
import zoneColors from './zone-colors'

module.exports = class ZoningMap extends React.Component {
  constructor () {
    super()
    this.state = {
      data: null,
      select: -1,
      hover: -1,
      viewport: null,
      filteredZoneSimpleID: null
    }
  }

  render () {
    const {data, viewport, select, filteredZoneSimpleID} = this.state

    const layers = []
    if (data) {
      data.features.forEach((x, i) => { x.properties.index = i })
      layers.push(this.renderZoningLayer())
    }

    const details = select >= 0
      ? <ZoneDetails zone={data.features[select].properties} />
      : null

    return (
      <div>
        <Map
          layers={layers}
          viewport={viewport}
          onChangeViewport={(v) => this.setState({viewport: v})}
        />
        <ZoningDescription
          selectedZone={filteredZoneSimpleID}
          onSelectZone={(id) => this.onFilterZone(id)}
        />
        {details}
      </div>
    )
  }

  renderZoningLayer () {
    const {data, hover, select, filteredZoneSimpleID} = this.state

    return new ChoroplethLayer({
      data,
      pickable: true,

      getColor: (f) => {
        const props = f.properties
        return this.getZoneColor(props, props.index === hover, props.index === select)
      },

      onHover: (info) => {
        if (info.index > 0 && info.index === select) return // already selected
        if (info.index === hover) return // already hovered
        this.setState({hover: info.index})
      },

      onClick: (info) => {
        if (info.index === select) return // already selected
        if (filteredZoneSimpleID !== null) {
          // if we've filtered to some zone id, and we click somewhere else on the map, unfilter
          const feature = data.features[info.index]
          if (!feature || feature.properties.idSimple !== filteredZoneSimpleID) {
            return this.setState({hover: info.index, select: -1, filteredZoneSimpleID: null})
          }
        }
        this.setState({hover: -1, select: info.index})
      },

      updateTriggers: {
        colors: {hover, select, filteredZoneSimpleID}
      }
    })
  }

  getZoneColor (zoneProps, isHover, isSelect) {
    const zid = zoneProps.idSimple
    const zidFilter = this.state.filteredZoneSimpleID

    let alpha = 0.6
    if (isHover) alpha = 0.7
    else if (isSelect) alpha = 1.0
    if (zidFilter && zid !== zidFilter) alpha = 0

    var color = zoneColors.rgb(zid)
    const rgba = [].concat(color, [Math.round(alpha * 255)])
    return rgba
  }

  // Let the user filter down to a simplified zone ID, to see everywhere it's used.
  // Toggle. If the user clicks the same filter again, turn off filtering.
  onFilterZone (id) {
    const {data, select, filteredZoneSimpleID} = this.state

    if (filteredZoneSimpleID === id) id = null
    if (id !== null && select > 0) {
      const zone = data.features[select].properties
      if (zone.idSimple !== id) this.setState({select: -1})
    }
    this.setState({filteredZoneSimpleID: id})
  }
}
