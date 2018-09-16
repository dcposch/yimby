import React from 'react'

export default function ContactDetails (props) {
  const { name, address, email, phone, districts, totalDonationsUSD } = props.person

  const addressStr = [address.street, address.city, address.stateCode, address.postalCode].join(' ')
  let districtStr = null
  if (address.stateCode === 'CA' && districts) {
    districtStr = 'California SD ' + districts.stateUpper + ', AD ' + districts.stateLower
    if (address.city === 'San Francisco') {
      districtStr += ', SF D' + districts.city
    }
  }
  let phoneStr = phone
  if (phone && phone.length === 9) {
    phoneStr = phone.substring(0, 3) + '-' + phone.substring(3, 6) + '-' + phone.substring(6)
  }

  return (
    <div className='details'>
      <h2>{name || '<name unknown>'}</h2>
      { address ? <p><strong>{addressStr}</strong></p> : null }
      { districtStr ? <p><strong>{districtStr}</strong></p> : null }
      { email ? <p>Email: <strong><a href={'mailto:' + email}>{email}</a></strong></p> : null }
      { phone ? <p>Phone: <strong><a href={'tel:' + phoneStr}>{phoneStr}</a></strong></p> : null }
      { totalDonationsUSD ? <p>Total donation: <strong>${totalDonationsUSD.toFixed(2)}</strong></p> : null }
    </div>
  )
}
