import React from 'react'
import {ScatterplotLayer} from 'deck.gl'

import fetch from '../fetch'
import Map from '../map'
import ContactDetails from './contact-details'
import Summary from './summary'

const API_ROOT = 'https://na35.salesforce.com/services/data/v40.0'

export default class Contacts extends React.Component {
  constructor (props) {
    super()

    this.state = {
      token: null,
      data: null,
      numSucceeded: 0,
      numFailed: 0,
      select: -1,
      hover: -1,
      viewport: null
    }
  }

  componentWillMount () {
    const token = readOauthAccessToken()
    this.setState({token})
    if (!token) return
    fetch(API_ROOT + '/sobjects/Contact/', {'Authorization': 'OAuth ' + token}, (err, data) => {
      // TODO: error handling
      if (err) return console.error(err)
      console.log(data)
      // TODO: handle data
    })
  }

  render () {
    const {token, data, select, viewport, numSucceeded, numFailed} = this.state
    const numContacts = data ? data.length : 0
    const person = data && data[select]

    return (
      <div>
        <Map
          layers={[this.renderScatterplotLayer()]}
          viewport={viewport}
          onChangeViewport={(v) => this.setState({viewport: v})}
        />
        {person ? <ContactDetails person={person} /> : null}
        <Summary isLoggedIn={!!token} counts={{numContacts, numSucceeded, numFailed}} />
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

function readOauthAccessToken () {
  const oauthParams = ['access_token']
  var hash = document.location.hash.substring(1)
  hash.split('&').forEach((part) => {
    const kv = part.split('=')
    const k = kv[0]
    const v = window.decodeURIComponent(kv[1])
    if (oauthParams.includes(k)) {
      window.localStorage.setItem('oauth_' + k, v)
    }
  })
  document.location.hash = ''
  return window.localStorage.getItem('oauth_access_token')
}
