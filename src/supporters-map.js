import React from 'react'
import {ScatterplotLayer} from 'deck.gl'
import Map from './map'

module.exports = class SupportersMap extends React.Component {
  constructor () {
    super()
    this.state = {
      data: null,
      select: -1,
      hover: -1
    }
  }

  render () {
    return <Map layers={[this.renderScatterplotLayer()]} />
  }

  renderScatterplotLayer () {
    const {data} = this.state

    return new ScatterplotLayer({
      data,
      opacity: 1,
      pickable: true,
      getPosition: (row) => {
        if (!row.geo) {
          return [37.761955 + Math.random() * 0.01, -122.336317 + Math.random() * 0.01]
        }
        return row.geo.center
      },
      getRadius: (row, i) => {
        return 2
      },
      getColor: (row, i) => {
        return [0, 255, 255, 255]
      },
      onClick: function (info) {
        console.log('DBG click supporter', info)
      }
    })
  }
}
