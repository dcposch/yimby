import React from 'react'
import {ScatterplotLayer} from 'deck.gl'

import fetch from '../fetch'
import Map from '../map'
import ContactDetails from './contact-details'
import Controls from './controls'

const API_ROOT = 'https://na35.salesforce.com/services/data/v40.0'

export default class Contacts extends React.Component {
  constructor (props) {
    super()

    this.state = {
      token: null,
      contacts: [],
      select: null,
      hover: null,
      viewport: null
    }
  }

  componentWillMount () {
    const token = readOauthAccessToken()
    this.setState({token})
    if (!token) return

    const url = API_ROOT + '/query?q=SELECT Name, Phone, Email, MailingAddress, ' +
      'Administrative_Area__c, State_Upper_District__c, State_Lower_District__c, ' +
      'npo02__TotalOppAmount__c FROM Contact WHERE MailingLatitude != NULL'
    const headers = {'Authorization': 'OAuth ' + token}
    fetch(url, headers, (err, data) => {
      // TODO: error handling
      if (err) return console.error(err)

      const contacts = data.records.map((r, i) => ({
        index: i,
        name: r.Name,
        email: r.Email,
        phone: r.Phone,
        address: r.MailingAddress,
        districts: {
          city: r.Administrative_Area__c,
          stateLower: r.State_Upper_District__c,
          stateUpper: r.State_Upper_District__c
        },
        totalDonationsUSD: r.npo02__TotalOppAmount__c
      })).filter(r => r.address.state === 'CA')

      console.log('salesforce raw query response', data)
      console.log('salesforce contacts', contacts)
      this.setState({contacts})
    })

    // For debugging
    window.fetchSalesforce = (path) => fetch(API_ROOT + path, headers, (err, data) => {
      if (err) return console.error(err)
      console.log(data)
    })
  }

  render () {
    const {token, contacts, select, viewport} = this.state

    return (
      <div>
        <Map
          layers={[this.renderScatterplotLayer()]}
          viewport={viewport}
          onChangeViewport={(v) => this.setState({viewport: v})}
        />
        {select ? <ContactDetails person={select} /> : null}
        <Controls isLoggedIn={!!token} contacts={contacts} />
      </div>
    )
  }

  renderScatterplotLayer () {
    const {contacts, hover, select, viewport} = this.state
    const zoom = viewport ? viewport.zoom : 12

    return new ScatterplotLayer({
      data: contacts,
      opacity: 1,
      radiusScale: 1,
      pickable: true,
      getPosition: (contact) => {
        return [contact.address.longitude, contact.address.latitude]
      },
      getRadius: (row) => {
        const dotM = 2200 * Math.pow(0.7, zoom)
        return dotM * ((row === select) ? 2.3 : 2)
      },
      getColor: (row) => {
        const opacity = (row === select || row === hover) ? 1 : 0.8
        const rgb = [0, 150, 0]
        return [rgb[0], rgb[1], rgb[2], Math.floor(255 * opacity)]
      },
      onHover: (info) => {
        if (info.object === this.state.select) return
        this.setState({hover: info.object})
      },
      onClick: (info) => {
        this.setState({select: info.object, hover: null})
      },
      updateTriggers: {
        all: {hover, select, zoom}
      }
    })
  }
}

function readOauthAccessToken () {
  const oauthParams = ['access_token']
  const hash = document.location.hash.substring(1)
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
