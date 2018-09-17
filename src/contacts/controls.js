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
      geo,
      hoverGeo,
      onChangeGeo,
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

    const elemsDistrict = range(1, 11).map(i => (
      <Filt key={i} geo={'district-' + i} selGeo={geo} hovGeo={hoverGeo} label={'D' + i} onChangeGeo={onChangeGeo} />
    ))

    const elemsSD = range(1, 40).map(i => (
      <Filt key={i} geo={'sd-' + i} selGeo={geo} hovGeo={hoverGeo} label={i === 1 ? 'SD1' : '' + i} onChangeGeo={onChangeGeo} />
    ))

    const elemsAD = range(1, 80).map(i => (
      <Filt key={i} geo={'ad-' + i} selGeo={geo} hovGeo={hoverGeo} label={i === 1 ? 'AD1' : '' + i} onChangeGeo={onChangeGeo} />
    ))

    const cities = [
      'Alameda',
      'Albany',
      'Antioch',
      'Atheron',
      'Belmont',
      'Benicia',
      'Berkeley',
      'Brentwood',
      'Brisbane',
      'Burlingame',
      'Calistoga',
      'Campbell',
      'Concord',
      'Cupertino',
      'Daly City',
      'Danville',
      'Dublin',
      'El Cerrito',
      'Emeryville',
      'Fairfax',
      'Fremont',
      'Gilroy',
      'Half Moon Bay',
      'Hayward',
      'Hercules',
      'Lafayette',
      'Larkspur',
      'Livermore',
      'Los Altos',
      'Los Gatos',
      'Martinez',
      'Menlo Park',
      'Mill Valley',
      'Millbrae',
      'Milpitas',
      'Morgan Hill',
      'Mountain View',
      'Oakland',
      'Pacifica',
      'Palo Alto',
      'Petaluma',
      'Pinole',
      'Pittsburg',
      'Pleasant Hill',
      'Pleasanton',
      'Portola Valley',
      'Redwood City',
      'Richmond',
      'Rodeo',
      'San Anselmo',
      'San Bruno',
      'San Carlos',
      'San Francisco',
      'San Jose',
      'San Leandro',
      'San Mateo',
      'San Pablo',
      'San Ramon',
      'Santa Clara',
      'Santa Rosa',
      'Saratoga',
      'Sausalito',
      'Sebastopol',
      'South San Francisco',
      'Stanford',
      'Sunnyvale',
      'Union City',
      'Vacaville',
      'Vallejo',
      'Walnut Creek'
    ]
    const elemsCity = cities.map(city => (
      <Filt key={city} geo={'city-' + city} selGeo={geo} hovGeo={hoverGeo} label={city} onChangeGeo={onChangeGeo} />
    ))

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
            <Rad r={100} selectedR={r} onChangeRadius={onChangeRadius} />
            <Rad r={200} selectedR={r} onChangeRadius={onChangeRadius} />
            <Rad r={500} selectedR={r} onChangeRadius={onChangeRadius} />
            <Rad r={1000} selectedR={r} onChangeRadius={onChangeRadius} />
            <Rad r={2000} selectedR={r} onChangeRadius={onChangeRadius} />
            <Rad r={5000} selectedR={r} onChangeRadius={onChangeRadius} />
            <Rad r={10000} selectedR={r} onChangeRadius={onChangeRadius} />
            <Rad r={20000} selectedR={r} onChangeRadius={onChangeRadius} />
            <Rad r={50000} selectedR={r} onChangeRadius={onChangeRadius} />
            <Rad r={100000} selectedR={r} onChangeRadius={onChangeRadius} />
          </p>
          <p>click above to filter.</p>
        </div>
      )
    }

    // export contact emails
    const setExp = (exportFormat) => this.setState({ exportFormat })
    let elemExportFormat = (
      <div>
        <p className='legend'>
          <Exp exp='csv' selectedExp={exportFormat} onChangeExpFormat={setExp} />
          <Exp exp='tsv' selectedExp={exportFormat} onChangeExpFormat={setExp} />
          <Exp exp='email' selectedExp={exportFormat} onChangeExpFormat={setExp} />
        </p>
      </div>
    )
    let filterExport = formatContacts(filteredContacts, exportFormat)

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

        <h2>sf district</h2>
        <p className='legend'>{elemsDistrict}</p>
        <p>click on a district above to filter. click again to un-filter.</p>

        <h2>california senate district</h2>
        <p className='legend'>{elemsSD}</p>

        <h2>california assembly district</h2>
        <p className='legend'>{elemsAD}</p>

        <h2>bay area cities</h2>
        <p className='legend'>{elemsCity}</p>

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
        <p>
          {'exporting ' + filteredContacts.length + ' / ' + contacts.length + ' contacts'}
        </p>
        <pre>{filterExport}</pre>

        <footer>
          code on <a href='//github.com/dcposch/yimby'>github</a>. twitter:{' '}
          <a href='//twitter.com/dcposch'>@dcposch</a>
        </footer>
      </div>
    )
  }
}

function Filt (props) {
  const isSel = props.geo === props.selGeo
  const isHov = props.geo === props.hovGeo
  let c = 'sp'
  if (isSel) {
    c += ' selected'
  } else if (isHov) {
    c += ' hover'
  }
  return (
    <span
      className={c}
      onClick={() => props.onChangeGeo(props.geo)}
      onMouseOver={() => props.onChangeGeo(props.geo, true)}
      onMouseOut={() => props.onChangeGeo(null, true)}
    >
      <span className='filter-label' title={props.label}>{props.label}</span>
    </span>
  )
}

function Rad (props) {
  const { r } = props
  return (
    <span
      className={r === props.selectedR ? 'selected sp' : 'sp'}
      onClick={() => props.onChangeRadius(r)}
    >
      <span className='filter-label'>
        {r < 1000 ? (r + 'm') : (Math.round(r / 1000) + 'km')}
      </span>
    </span>
  )
}

function Exp (props) {
  return (
    <span
      className={props.exp === props.selectedExp ? 'selected sp' : 'sp'}
      onClick={() => props.onChangeExpFormat(props.exp)}
    >
      <span className='filter-label'>
        {props.exp}
      </span>
    </span>
  )
}

function range (a, b) {
  const ret = []
  for (let i = a; i <= b; i++) {
    ret.push(i)
  }
  return ret
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
