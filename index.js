const { highlight, highlightAuto, getLanguage } = require('highlight.js')
const compression = require('compression')
const express = require('express')
const inlineCss = require('inline-css/lib/inline-css')
const cors = require('cors')
const bodyParser = require('express/node_modules/body-parser')
const config = require('./config.json')
const app = express()
const multer = require('multer')
const upload = multer({})


const urlencodedParser = bodyParser.urlencoded({extended: false})
const jsonParser = bodyParser.json()
const textParser = bodyParser.text()

app.disable('x-powered-by')
app.use(compression())
app.use(cors())

const defaultStyle = config.styles['atom-one-dark']

function getDefault(opts) {
  let language = (opts.language || 'auto').toLowerCase()
  let style = (opts.style || '').toLowerCase()
  let content = opts.content || `I'm a teapot`

  if (!getLanguage(language)) language = 'auto'
  if (!style || !Object.keys(config.styles).includes(style)) style = 'atom-one-dark'

  style = config.styles[style]

  content = language === 'auto'
    ? highlightAuto(content).value
    : highlight(language, content).value

  return { content, style }
}

app.get('/favicon.ico', (_, res) => res.sendStatus(404))

app.all('*', jsonParser, urlencodedParser, textParser, upload.single(), async (req, res) => {
  const myOrigin = req.protocol + '://' + req.get('host')
  const url = new URL(myOrigin + req.originalUrl)

  if (url.pathname === '/' && url.search === '' && req.method === 'GET')
    // return res.send(require('fs').readFileSync('./index.html', { encoding: 'utf8' }).toString('ascii'))
    return res.send(config.index)

  const body = typeof req.body === 'string' ? {content: req.body} : req.body || {}

  body.content = body.content || url.searchParams.get('content')
  body.style = body.style || url.searchParams.get('style')
  body.language = body.language || url.searchParams.get('language')

  const def = getDefault(body)
  const origin = req.get('origin') || ''
  const accept = req.get('accept') || ''
  const referrer = req.get('Referrer') || ''

  style = def.style
  content = def.content

  if (referrer && accept.includes('image') && !referrer.includes(myOrigin)) {
    content = `<body><pre class="hljs"><code>${content}</code></pre></body>`
    content += '<script></script>'
    content = inlineCss(content, style + config.extraCss, config.inlineOpts)
  } else {
    content = `<pre class="hljs"><code>${content}</code></pre>`
    content = inlineCss(content, style, config.inlineOpts)
  }

  res.send(content)
})

app.listen(3000)
