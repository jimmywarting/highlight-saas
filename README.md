# Highlight.js as a service

Code highlight will take raw source code and convert into nicely formatted HTML with syntax and keyword highlighting.
So your site don't ahve to include the hole bundle of all languages and code styles

Currently supports 176 different languages and 79 styles

No css or javascript are neccessary since every style will be inlined.

To use the service without a api visit the saas (software as service) site: https://highlight-saas.herokuapp.com

# API

- It supports GET request (`?content=<code>&style=<optional>&language=<optional>`)
- It supports POST request with most popular kind of content-type

  - application/x-www-form-urlencoded
  - multipart/form-data
  - text/plain
  - application/json

Any url param will overide the POST data

```js
// using text/plain and changing the style
fetch('https://highlight-saas.herokuapp.com/?style=atom-one-light', {
  method: 'POST',
  body: `p {color: red;}`
})

// using a iframe
iframe.src = 'https://highlight-saas.herokuapp.com/?' + new URLSearchParams({
  content: `p {color: red;}`
})

// using FormData
const fd = new FormData()
fd.append('content', code)
fd.append('language', 'html')
fd.append('style', style)
fetch('https://highlight-saas.herokuapp.com/', {method: 'POST', body: fd})
```
