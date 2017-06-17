import React from 'react'
import {ScatterplotLayer} from 'deck.gl'
import Map from '../map'
import ContactDetails from './contact-details'
import Summary from './summary'

module.exports = class Contacts extends React.Component {
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
        {person ? <ContactDetails person={person} /> : null}
        <Summary counts={{numContacts: data ? data.length : 0, numSucceeded, numFailed}} />
      </div>
    )
  }

  renderScatterplotLayer () {
    const {data, hover, select, numSucceeded, numFailed, viewport} = this.state
    const zoom = viewport ? viewport.zoom : 12

    return new ScatterplotLayer({
      data,
      opacity: 1,
      radius: 1,
      pickable: true,
      getPosition: (row) => {
        return row.geo.center
      },
      getRadius: (row) => {
        const dotM = 2200 * Math.pow(0.7, zoom)

        const i = row.index
        return dotM * ((i === select) ? 2.3 : 2)
      },
      getColor: (row) => {
        const i = row.index
        const opacity = (i === select || i === hover) ? 1 : 0.8
        const rgb = (row.status === 'succeeded') ? [0, 150, 0]
          : (row.status === 'failed') ? [180, 0, 0]
          : [0, 255, 255]
        return [rgb[0], rgb[1], rgb[2], Math.floor(255 * opacity)]
      },
      onHover: (info) => {
        if (info.index === this.state.select) return
        this.setState({hover: info.index})
      },
      onClick: (info) => {
        this.setState({select: info.index, hover: -1})
      },
      updateTriggers: {
        all: {numSucceeded, numFailed, hover, select, zoom}
      }
    })
  }
}
