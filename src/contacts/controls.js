import React from 'react'

// import districts from './districts.js'

export default class Controls extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      exportFormat: 'csv' // other options: 'tsv', 'email'
    }
  }

  render () {
    const { exportFormat } = this.state
    const {
      isLoggedIn,
      onLogOut,
      contacts,
      filteredContacts,
      radius,
      radiusAddress,
      district,
      onChangeDistrict,
      onChangeRadius,
      onChangeRadiusAddress
    } = this.props

    const elemLogin = isLoggedIn ? (
      <button onClick={onLogOut}>log out</button>
    ) : (
      <a href='https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=3MVG9szVa2RxsqBYHAPh..zyh4EVbe.lQAkzoWqg8MoVL4ttsXhCu0YlLbISt_OAPP16XvT3v0e0tm.JMATvx
&redirect_uri=https://dcpos.ch/yimby/contacts/'>
        log in
      </a>
    )

    const elemsDistrictFilter = [
      1,
      0,
      2,
      0,
      3,
      0,
      4,
      0,
      5,
      0,
      6,
      0,
      7,
      0,
      8,
      0,
      9,
      0,
      10,
      0,
      11
    ].map((i, j) => {
      if (i === 0) return ' '
      var c = district === i ? 'selected' : ''
      return (
        <span key={j} className={c} onClick={() => onChangeDistrict(i)}>
          {'D' + i}
        </span>
      )
    })

    let elemRadiusFilter = null
    if (radiusAddress) {
      const r = radius
      elemRadiusFilter = (
        <div>
          <p>
            {radiusAddress.success ? (
              <span>{radiusAddress.name}</span>
            ) : (
              "couldn't geocode address"
            )}
          </p>
          <p className='legend'>
            <span
              className={r === 100 ? 'selected' : ''}
              onClick={() => onChangeRadius(100)}
            >
              100m
            </span>{' '}
            <span
              className={r === 200 ? 'selected' : ''}
              onClick={() => onChangeRadius(200)}
            >
              200m
            </span>{' '}
            <span
              className={r === 500 ? 'selected' : ''}
              onClick={() => onChangeRadius(500)}
            >
              500m
            </span>{' '}
            <span
              className={r === 1000 ? 'selected' : ''}
              onClick={() => onChangeRadius(1000)}
            >
              1km
            </span>
          </p>
          <p>click above to filter.</p>
        </div>
      )
    }

    // export contact emails
    let elemExportFormat = (
      <div>
        <p className='legend'>
          <span
            className={exportFormat === 'csv' ? 'selected' : ''}
            onClick={() => this.setState({ exportFormat: 'csv' })}
          >
            csv
          </span>{' '}
          <span
            className={exportFormat === 'tsv' ? 'selected' : ''}
            onClick={() => this.setState({ exportFormat: 'tsv' })}
          >
            tsv
          </span>{' '}
          <span
            className={exportFormat === 'email' ? 'selected' : ''}
            onClick={() => this.setState({ exportFormat: 'email' })}
          >
            email
          </span>
        </p>
      </div>
    )
    let filterExport = formatContacts(filteredContacts, exportFormat)
    /* if (filteredContacts.length === contacts.length) {
      elemExportFormat = (
        <span>filter contacts to export</span>
      )
      filterExport = null
    } else {
      filterExport =
    } */

    return (
      <div className='summary'>
        <h1>yimby contacts</h1>
        <p>
          here's where our contacts live. click on any of the dots for details.
          missing addresses are to the left, by ocean beach.
        </p>

        <h2>salesforce api</h2>
        <p>
          certified yimby party members only. if you have access to the yimby
          salesforce, you can authorize this page to map contacts.
        </p>
        <p>{elemLogin}</p>
        <p>
          loaded <strong>{contacts.length}</strong> contacts with valid
          addresses
        </p>
        <p>
          {filteredContacts.length === contacts.length ? (
            'showing all contacts'
          ) : (
            'filtered down to ' + filteredContacts.length + ' contacts'
          )}
        </p>

        <h2>district</h2>
        <p className='legend'>{elemsDistrictFilter}</p>
        <p>click on a district above to filter. click again to un-filter.</p>

        <h2>radius</h2>
        <p>
          enter an address:{' '}
          <input
            className='radius-address'
            onChange={e => onChangeRadiusAddress(e.target.value)}
          />
        </p>
        {elemRadiusFilter}

        <h2>export</h2>
        {elemExportFormat}
        <pre>{filterExport}</pre>

        <footer>
          code on <a href='//github.com/dcposch/yimby'>github</a>. twitter:{' '}
          <a href='//twitter.com/dcposch'>@dcposch</a>
        </footer>
      </div>
    )
  }
}

function formatContacts (contacts, format) {
  if (format === 'email') {
    return contacts
      .filter(c => !!c.email)
      .map(c => (c.name == null ? '' : c.name + ' ') + '<' + c.email + '>')
      .join(', ')
  }

  const delimiter = format === 'csv' ? ',' : '\t'
  return contacts
    .map(c =>
      [c.name, c.email, c.phone]
        .map(
          val =>
            val == null
              ? ''
              : val
                .replace('\n', '')
                .replace(delimiter, '')
                .trim()
        )
        .join(delimiter)
    )
    .join('\n')
}
