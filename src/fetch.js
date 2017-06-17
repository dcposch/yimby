// Usage:
// fetch('google.com', (err, data) => {
//   if (err) return console.error(err)
//   console.log(data)
// })
export default function fetch (url, headers, cb) {
  if (typeof headers === 'function') {
    headers = {}
    cb = headers
  }
  const xhr = new window.XMLHttpRequest()
  xhr.onerror = () => cb(new Error(xhr.responseCode))
  xhr.onload = () => cb(null, xhr.response)
  xhr.responseType = 'json'
  xhr.open('GET', url)
  Object.keys(headers).forEach((k) => xhr.setRequestHeader(k, headers[k]))
  xhr.send()
}
