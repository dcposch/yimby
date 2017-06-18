import React from 'react'

import districts from './districts'

export default function Controls (props) {
  const {
    isLoggedIn,
    onLogOut,
    contacts,
    radius,
    radiusAddress,
    district,
    onChangeDistrict,
    onChangeRadius,
    onChangeRadiusAddress
  } = props

  const elemLogin = isLoggedIn
    ? <button onClick={onLogOut}>log out</button>
    : <a href='https://login.salesforce.com/services/oauth2/authorize?response_type=token&client_id=3MVG9szVa2RxsqBYHAPh..zyh4EVbe.lQAkzoWqg8MoVL4ttsXhCu0YlLbISt_OAPP16XvT3v0e0tm.JMATvx
&redirect_uri=https://dcpos.ch/yimby/contacts/'>log in</a>

  const elemsDistrictFilter = [1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0, 9, 0, 10, 0, 11]
    .map((i, j) => {
      if (i === 0) return ' '
      var c = district === i ? 'selected' : ''
      return <span key={j} className={c} onClick={() => onChangeDistrict(i)}>{'D' + i}</span>
    })

  let elemRadiusFilter = null
  if (radiusAddress) {
    const r = radius
    elemRadiusFilter = (
      <div>
        <p>
          { radiusAddress.success
              ? <span>{radiusAddress.name}</span>
              : 'couldn\'t geocode address' }
        </p>
        <p className='legend'>
          <span className={r === 100 ? 'selected' : ''} onClick={() => onChangeRadius(100)}>100m</span>{' '}
          <span className={r === 200 ? 'selected' : ''} onClick={() => onChangeRadius(200)}>200m</span>{' '}
          <span className={r === 500 ? 'selected' : ''} onClick={() => onChangeRadius(500)}>500m</span>{' '}
          <span className={r === 1000 ? 'selected' : ''} onClick={() => onChangeRadius(1000)}>1km</span>
        </p>
        <p>
          click above to filter.
        </p>
      </div>
    )
  }

  return (
    <div className='summary'>
      <h1>yimby contacts</h1>
      <p>
        here's where our contacts live. click on any of the dots for details.
        missing addresses are to the left, by ocean beach.
      </p>

      <h2>salesforce api</h2>
      <p>
        certified yimby party members only. if you have access to the
        yimby salesforce, you can authorize this page to map contacts.
      </p>
      <p>
        {elemLogin}
      </p>
      <p>
        loaded <strong>{contacts.length}</strong> contacts with valid addresses<br />
      </p>

      <h2>district</h2>
      <p className='legend'>
        {elemsDistrictFilter}
      </p>
      <p>
        click on a district above to filter. click again to un-filter.
      </p>

      <h2>radius</h2>
      <p>
        enter an address: <input
          className='radius-address'
          onChange={(e) => onChangeRadiusAddress(e.target.value)}
        />
      </p>
      { elemRadiusFilter }

      <footer>
        yimby digital liberation army.
        code on <a href='//github.com/dcposch/yimby'>github</a>.
        twitter: <a href='//twitter.com/dcposch'>@dcposch</a>
      </footer>
    </div>
  )
}
