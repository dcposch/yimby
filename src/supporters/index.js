import React from 'react'
import {ScatterplotLayer} from 'deck.gl'
import Map from '../map'
import SupporterDetails from './supporter-details'
import Summary from './summary'

module.exports = class Supporters extends React.Component {
  constructor () {
    super()
    this.state = {
      data: null,
      numSucceeded: 0,
      numFailed: 0,
      select: -1,
      hover: -1,
      viewport: null
    }
  }

  render () {
    const {data, select, viewport, numSucceeded, numFailed} = this.state
    const person = data && data[select]

    return (
      <div>
        <Map
          layers={[this.renderScatterplotLayer()]}
          viewport={viewport}
          onChangeViewport={(v) => this.setState({viewport: v})}
        />
        {person ? <SupporterDetails person={person} /> : null}
        <Summary counts={{numSupporters: data ? data.length : 0, numSucceeded, numFailed}} />
      </div>
    )
  }

  renderScatterplotLayer () {
    const {data, select, numSucceeded, numFailed} = this.state

    return new ScatterplotLayer({
      data,
      opacity: 1,
      pickable: true,
      getPosition: (row) => {
        return row.geo.center
      },
      getRadius: (row, i) => {
        return 2
      },
      getColor: (row, i) => {
        const opacity = (i === select) ? 1 : 0.5
        return [0, 255, 255, Math.floor(255 * opacity)]
      },
      onClick: (info) => {
        this.setState({select: info.index})
      },
      updateTriggers: {
        color: {numSucceeded, numFailed}
      }
    })
  }
}
