import React from 'react'

export default function ZoneDetails (props) {
  const { id, idSimple, name, legalURL } = props.zone
  const simple = id === idSimple ? null : (
    <p>
      simplified ID: <strong>{idSimple}</strong>
    </p>
  )
  return (
    <div className='zone-details'>
      <h2>{id}</h2>
      <p>
        <strong>{name}</strong>
      </p>
      {simple}
      <p>
        legal definition: <a href={legalURL}>{id} code</a>
      </p>
    </div>
  )
}
