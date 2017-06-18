import React from 'react'

export default function ContactDetails (props) {
  const {name, address, email, phone, districts, totalDonationsUSD} = props.person

  return (
    <div className='details'>
      <h2>{name || '<name unknown>'}</h2>
      { address ? <p><strong>{address}</strong></p> : null }
      { email ? <p><strong>{email}</strong></p> : null }
      { phone ? <p><strong>{phone}</strong></p> : null }
      { districts ? <p><strong>{JSON.stringify(districts)}</strong></p> : null }
      { totalDonationsUSD ? <p>Total donation: <strong>${totalDonationsUSD.toFixed(2)}</strong></p> : null }
    </div>
  )
}
