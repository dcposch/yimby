// Usage:
// fetch('google.com', (err, data) => {
//   if (err) return console.error(err)
//   console.log(data)
// })
export default function fetch (url, headers, cb) {
  if (typeof headers === 'function') {
    cb = headers
    headers = {}
  }
  const xhr = new window.XMLHttpRequest()
  xhr.onerror = () => cb(new Error(xhr.responseCode))
  xhr.onload = () => cb(xhr.status === 200 ? null : new Error(xhr.status), xhr.response)
  xhr.responseType = 'json'
  xhr.open('GET', url)
  Object.keys(headers).forEach((k) => xhr.setRequestHeader(k, headers[k]))
  xhr.send()
}
