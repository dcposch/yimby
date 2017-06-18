import React from 'react'
import {ScatterplotLayer} from 'deck.gl'

import config from '../config'
import fetch from '../fetch'
import Map from '../map'
import geo from '../geo'
import ContactDetails from './contact-details'
import Controls from './controls'

const API_ROOT = 'https://na35.salesforce.com/services/data/v40.0'

export default class Contacts extends React.Component {
  constructor (props) {
    super()

    this.state = {
      token: null,
      contacts: [],
      filteredContacts: [],
      filterExport: '',
      select: null,
      hover: null,
      viewport: null,
      filter: {
        district: null,
        radius: 100,
        radiusAddress: null
      }
    }
  }

  componentWillMount () {
    this._readOauthAccessToken()
    const token = this._setTokenFromLocalStorage()
    if (token) {
      this._fetchContacts(token)
    }
  }

  render () {
    const {token, contacts, filteredContacts, filterExport, select, viewport, filter} = this.state

    return (
      <div>
        <Map
          layers={[this._renderScatterplotLayer()]}
          viewport={viewport}
          onChangeViewport={(v) => this.setState({viewport: v})}
        />
        {select ? <ContactDetails person={select} /> : null}
        <Controls
          isLoggedIn={!!token}
          onLogOut={() => this._handleLogOut()}
          contacts={contacts}
          filteredContacts={filteredContacts}
          filterExport={filterExport}
          district={filter.district}
          radius={filter.radius}
          radiusAddress={filter.radiusAddress}
          onChangeDistrict={(district) => this._handleChangeDistrict(district)}
          onChangeRadius={(radius) => this._handleChangeRadius(radius)}
          onChangeRadiusAddress={(addr) => this._handleChangeRadiusAddress(addr)}
        />
      </div>
    )
  }

  _renderScatterplotLayer () {
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
        const rgb = row.isFiltered ? [100, 100, 100] : [0, 150, 0]
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
        all: Object.assign({}, this.state.filter, {hover, select, zoom})
      }
    })
  }

  _setTokenFromLocalStorage () {
    const token = window.localStorage.oauth_access_token
    this.setState({token})
    return token
  }

  _fetchContacts (token) {
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
      }))

      console.log('salesforce raw query response', data)
      console.log('salesforce contacts', contacts)

      this._filterContacts(this.state.filter, contacts)
    })

    // For debugging
    window.fetchSalesforce = (path) => fetch(API_ROOT + path, headers, (err, data) => {
      if (err) return console.error(err)
      console.log(data)
    })
  }

  _handleLogOut () {
    window.localStorage.setItem('oauth_access_token', null)
    this._setTokenFromLocalStorage()
  }

  _handleChangeDistrict (district) {
    if (this.state.filter.district === district) {
      district = null
    }
    this._setFilter({district})
  }

  _handleChangeRadius (radius) {
    this._setFilter({radius})
  }

  _handleChangeRadiusAddress (address) {
    if (address === '') {
      return this._setFilter({radiusAddress: null})
    }

    // Geocode via Mapbox
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
      window.encodeURIComponent(address) + '.json?access_token=' + config.MAPBOX_TOKEN
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
      this._setFilter({radiusAddress})
    })
  }

  _readOauthAccessToken () {
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
  }

  _setFilter (filterDiff) {
    var oldFilter = this.state.filter
    var filter = Object.assign(oldFilter, filterDiff)
    this._filterContacts(filter, this.state.contacts)
  }

  _filterContacts (filter, contacts) {
    var filteredContacts = contacts.filter((contact) => {
      let ret = true
      if (filter.radiusAddress && filter.radiusAddress.success) {
        var dist = geo.computeDistance(contact.address, filter.radiusAddress.coordinates)
        if (dist > filter.radius) ret = false
      }
      if (filter.district !== null) {
        if (contact.districts.city !== ('' + filter.district)) ret = false
      }
      contact.isFiltered = !ret
      return ret
    })

    const filterExport = filteredContacts.length === contacts.length
      ? ''
      : filteredContacts
          .filter((c) => !!c.email)
          .map((c) => c.name + '<' + c.email + '>').join(', ')

    this.setState({filter, contacts, filteredContacts, filterExport})
  }
}
