import React from 'react'
import { ScatterplotLayer, GeoJsonLayer } from 'deck.gl'

import config from '../config'
import fetch from '../fetch'
import Map from '../map'
import geo from '../geo'
import ContactDetails from './contact-details'
import Controls from './controls'

const API_ROOT = 'https://na35.salesforce.com/services/data/v40.0'

const API_SAMPLE_RESPONSE = {
  totalSize: 3,
  done: true,
  records: [
    {
      attributes: {
        type: 'Contact',
        url: '/services/data/v40.0/sobjects/Contact/0034100000Qqhs7AAB'
      },
      Name: 'Ravi Sankar',
      Phone: '1234567890',
      Email: 'test@example.com',
      MailingAddress: {
        city: 'San Francisco',
        country: 'US',
        countryCode: null,
        geocodeAccuracy: null,
        latitude: 37.7595554,
        longitude: -122.4291003,
        postalCode: '94114',
        state: 'CA',
        stateCode: null,
        street: '3835 19th St'
      },
      Administrative_Area__c: '8',
      State_Upper_District__c: '11',
      State_Lower_District__c: '17',
      npo02__TotalOppAmount__c: 12345
    },
    {
      attributes: {
        type: 'Contact',
        url: '/services/data/v40.0/sobjects/Contact/0034100000NrSgvAAF'
      },
      Name: 'DC Posch',
      Phone: '8012345678',
      Email: 'dc1@example.com',
      MailingAddress: {
        city: 'San Francisco',
        country: 'US',
        countryCode: null,
        geocodeAccuracy: null,
        latitude: 37.7779536,
        longitude: -122.4067138,
        postalCode: '94103',
        state: 'CA',
        stateCode: null,
        street: '1040 Folsom St'
      },
      Administrative_Area__c: '6',
      State_Upper_District__c: '11',
      State_Lower_District__c: '17',
      npo02__TotalOppAmount__c: 12345
    },
    {
      attributes: {
        type: 'Contact',
        url: '/services/data/v40.0/sobjects/Contact/0034100000NrSgvAAF'
      },
      Name: 'Dan Posch',
      Phone: '8012345678',
      Email: 'dc2@example.com',
      MailingAddress: {
        city: 'San Francisco',
        country: 'US',
        countryCode: null,
        geocodeAccuracy: null,
        latitude: 37.7779536,
        longitude: -122.4067138,
        postalCode: '94103',
        state: 'CA',
        stateCode: null,
        street: '1040 Folsom St'
      },
      Administrative_Area__c: '6',
      State_Upper_District__c: '11',
      State_Lower_District__c: '17',
      npo02__TotalOppAmount__c: 12345
    },
    {
      attributes: {
        type: 'Contact',
        url: '/services/data/v40.0/sobjects/Contact/0034100000NrSgvAAF'
      },
      Name: 'Clemens Posch',
      Phone: '8012345678',
      Email: 'dc3@example.com',
      MailingAddress: {
        city: 'San Francisco',
        country: 'US',
        countryCode: null,
        geocodeAccuracy: null,
        latitude: 37.7779536,
        longitude: -122.4067138,
        postalCode: '94103',
        state: 'CA',
        stateCode: null,
        street: '1040 Folsom St'
      },
      Administrative_Area__c: '6',
      State_Upper_District__c: '11',
      State_Lower_District__c: '17',
      npo02__TotalOppAmount__c: 12345
    }
  ]
}

export default class Contacts extends React.Component {
  constructor (props) {
    super()

    this.state = {
      token: null,
      contacts: [],
      filteredContacts: [],

      select: null,
      hover: null,
      viewport: null,

      hoverGeo: null,
      filter: {
        geo: null,
        radius: 100,
        radiusAddress: null
      },

      geoCities: null,
      geoSDs: null,
      geoADs: null,
      geoCounties: null
    }
  }

  componentWillMount () {
    this._readOauthAccessToken()
    const token = this._setTokenFromLocalStorage()
    if (token) {
      this._fetchContacts(token)
    } else if (window.location.href.includes(':8080')) {
      // local testing
      this._handleSalesforceContacts(API_SAMPLE_RESPONSE)
    }

    fetch('../data/BayAreaPlaces.json', (err, data) => {
      if (err) return console.error(err)
      this.setState({ geoCities: data })
    })

    // fetch('../data/ca-counties-tiger2016-simple.json', (err, data) => {
    //   if (err) return console.error(err)
    //   this.setState({ geoCounties: data })
    // })

    fetch('../data/cb_2017_06_sldl_500k.geojson', (err, data) => {
      if (err) return console.error(err)
      this.setState({ geoADs: data })
    })

    fetch('../data/cb_2017_06_sldu_500k.geojson', (err, data) => {
      if (err) return console.error(err)
      this.setState({ geoSDs: data })
    })
  }

  render () {
    const {
      token,
      contacts,
      filteredContacts,
      select,
      viewport,
      filter,
      hoverGeo
    } = this.state

    const layers = []
    const geoLayer = this._renderGeoLayer()
    if (geoLayer) layers.push(geoLayer)
    layers.push(this._renderScatterplotLayer())

    return (
      <div>
        <Map
          layers={layers}
          viewport={viewport}
          onViewportChange={v => this.setState({ viewport: v })}
        />
        {select ? <ContactDetails person={select} /> : null}
        <Controls
          isLoggedIn={!!token}
          onLogOut={() => this._logOut()}
          contacts={contacts}
          filteredContacts={filteredContacts}
          hoverGeo={hoverGeo}
          geo={filter.geo}
          radius={filter.radius}
          radiusAddress={filter.radiusAddress}
          onChangeGeo={(geo, hover) => this._handleChangeGeo(geo, hover)}
          onChangeRadius={radius => this._handleChangeRadius(radius)}
          onChangeRadiusAddress={addr => this._handleChangeRadiusAddress(addr)}
        />
      </div>
    )
  }

  _renderGeoLayer () {
    const { filter, hoverGeo } = this.state
    const { geo } = filter

    const g = geo || hoverGeo
    if (!g) return null

    let data
    const gType = g.split('-')[0] // eg 'district' or 'ad'
    if (gType === 'ad') {
      data = this.state.geoADs
    } else if (gType === 'sd') {
      data = this.state.geoSDs
    } else if (gType === 'city') {
      data = this.state.geoCities
    }
    if (!data) return null

    return new GeoJsonLayer({
      data,

      pickable: true,
      stroked: true,
      filled: true,
      extruded: false,

      getFillColor: feat => this._getGeoColor(feat, false),
      getLineColor: feat => this._getGeoColor(feat, true),

      lineWidthScale: 25,
      lineWidthMinPixels: 0.5,
      lineWidthMaxPixels: 2,

      updateTriggers: {
        getFillColor: { geo, hoverGeo },
        getLineColor: { geo, hoverGeo }
      }
    })
  }

  _getGeoColor (feature, isStroke) {
    const p = feature.properties
    let pGeo
    if (p.CITY) pGeo = 'city-' + p.CITY
    else if (p.SLDLST) pGeo = 'ad-' + p.Name
    else if (p.SLDUST) pGeo = 'sd-' + p.Name
    else throw new Error('Unexpected feature ' + JSON.stringify(p))

    const { filter, hoverGeo } = this.state
    const { geo } = filter

    let alpha
    if (pGeo === geo) {
      alpha = 200
    } else if (pGeo === hoverGeo) {
      alpha = 150
    } else {
      alpha = 100
    }

    return [30, 50, 240, alpha + (isStroke ? 55 : 0)]
  }

  _renderScatterplotLayer () {
    const { contacts, hover, select, viewport } = this.state
    const zoom = viewport ? viewport.zoom : 12

    return new ScatterplotLayer({
      data: contacts,
      opacity: 1,
      radiusScale: 1,
      pickable: true,
      getPosition: contact => {
        return [contact.location.longitude, contact.location.latitude]
      },
      getRadius: row => {
        const dotM = 40000 * Math.pow(0.6, zoom)
        return dotM * (row === select ? 2.3 : 2)
      },
      getColor: row => {
        const opacity = row === select || row === hover ? 1 : 0.8
        const rgb = row.isFiltered ? [100, 100, 100] : [0, 150, 0]
        return [rgb[0], rgb[1], rgb[2], Math.floor(255 * opacity)]
      },
      onHover: info => {
        if (info.object === this.state.select) return
        this.setState({ hover: info.object })
      },
      onClick: info => {
        this.setState({ select: info.object, hover: null })
      },
      updateTriggers: {
        all: Object.assign({}, this.state.filter, { hover, select, zoom })
      }
    })
  }

  _setTokenFromLocalStorage () {
    const token = window.localStorage.oauth_access_token
    this.setState({ token })
    return token
  }

  _fetchContacts (token) {
    const url =
      API_ROOT +
      '/query?q=SELECT Name, Phone, Email, MailingAddress, ' +
      'Administrative_Area__c, State_Upper_District__c, State_Lower_District__c, ' +
      'npo02__TotalOppAmount__c FROM Contact WHERE MailingLatitude != NULL'
    const headers = { Authorization: 'OAuth ' + token }
    fetch(url, headers, (err, data) => {
      if (err) {
        console.log('Fetch failed', err)
        return this._logOut()
      }

      this._handleSalesforceContacts(data)
    })

    // For debugging
    window.fetchSalesforce = path =>
      fetch(API_ROOT + path, headers, (err, data) => {
        if (err) return console.error(err)
        console.log(data)
      })
  }

  _handleSalesforceContacts (data) {
    const eps = 0.0003
    const locs = {}
    const cartSpiral = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1],
      [1, -1],
      [2, -1],
      [2, 0],
      [2, 1],
      [2, 2],
      [1, 2],
      [0, 2],
      [-1, 2],
      [-2, 2],
      [-2, 1],
      [-2, 0]
    ]
    const nextLoc = function (addr) {
      if (addr == null || addr.longitude == null) {
        return null
      }
      const ixLon = Math.round(addr.longitude / eps)
      const ixLat = Math.round(addr.latitude / eps)
      for (var i = 0; i < cartSpiral.length; i++) {
        const offsets = cartSpiral[i]
        const locKey = ixLon + offsets[0] + ',' + (ixLat + offsets[1])
        if (locs[locKey] == null) {
          locs[locKey] = true
          return {
            longitude: (ixLon + offsets[0]) * eps,
            latitude: (ixLat + offsets[1]) * eps
          }
        }
      }
      console.warn('WARNING: failed to find free grid location', addr)
      return addr.location
    }

    const contacts = data.records.map((r, i) => ({
      index: i,
      name: r.Name,
      email: r.Email,
      phone: r.Phone,
      address: r.MailingAddress,
      location: nextLoc(r.MailingAddress),
      districts: {
        city: r.Administrative_Area__c,
        sd: r.State_Upper_District__c,
        ad: r.State_Lower_District__c
      },
      totalDonationsUSD: r.npo02__TotalOppAmount__c
    }))

    console.log('salesforce raw query response', data)
    console.log('salesforce contacts', contacts)

    this._filterContacts(this.state.filter, contacts)
  }

  _logOut () {
    console.log('Logging out')
    window.localStorage.oauth_access_token = ''
    this._setTokenFromLocalStorage()
  }

  _handleChangeGeo (geo, hover) {
    if (hover) {
      return this.setState({ hoverGeo: geo })
    }
    if (this.state.filter.geo === geo) {
      geo = null
    }
    this._setFilter({ geo })
  }

  _handleChangeRadius (radius) {
    this._setFilter({ radius })
  }

  _handleChangeRadiusAddress (address) {
    if (address === '') {
      return this._setFilter({ radiusAddress: null })
    }

    // Geocode via Mapbox
    const url =
      'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
      window.encodeURIComponent(address) +
      '.json?proximity=-122.4194,37.7749&access_token=' +
      config.MAPBOX_TOKEN
    fetch(url, (err, data) => {
      if (err) console.error(err)
      console.log(data)
      let radiusAddress
      if (data && data.features && data.features[0]) {
        const feature = data.features[0]
        radiusAddress = {
          success: true,
          name: feature.place_name,
          coordinates: {
            longitude: feature.center[0],
            latitude: feature.center[1]
          }
        }
      } else {
        radiusAddress = {
          success: false
        }
      }
      this._setFilter({ radiusAddress })
    })
  }

  _readOauthAccessToken () {
    const oauthParams = ['access_token']
    const hash = document.location.hash.substring(1)
    hash.split('&').forEach(part => {
      const kv = part.split('=')
      const k = kv[0]
      const v = window.decodeURIComponent(kv[1])
      if (oauthParams.includes(k)) {
        window.localStorage.setItem('oauth_' + k, v)
      }
    })
    document.location.hash = ''
  }

  _setFilter (filterDiff) {
    var oldFilter = this.state.filter
    var filter = Object.assign(oldFilter, filterDiff)
    this._filterContacts(filter, this.state.contacts)
  }

  _filterContacts (filter, contacts) {
    var filteredContacts = contacts.filter(contact => {
      let ret = true
      if (filter.radiusAddress && filter.radiusAddress.success) {
        var dist = geo.computeDistance(
          contact.address,
          filter.radiusAddress.coordinates
        )
        if (dist > filter.radius) ret = false
      }
      if (filter.geo != null) {
        const parts = filter.geo.split('-')
        const gt = parts[0] // eg 'district' or 'sd'
        const gi = parts[1]
        if (gt === 'district' && contact.districts.city !== gi) ret = false
        if (gt === 'sd' && contact.districts.sd !== gi) ret = false
        if (gt === 'ad' && contact.districts.ad !== gi) ret = false
        if (gt === 'city' && contact.address.city !== gi) ret = false
        // TODO: city
        // TODO: if (gt === 'county' && contact.county !== gi) ret = false
      }
      contact.isFiltered = !ret
      return ret
    })

    this.setState({ filter, contacts, filteredContacts })
  }
}
