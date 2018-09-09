const path = require('path')
const { listLanguages } = require('highlight.js')
const fs = require('fs')
const inlineCss = require('inline-css')
const { minify } = require('html-minifier')
const b64img = require('css-b64-images')
const highlightModule = require.resolve('highlight.js/package.json')
const stylePath = path.join(path.dirname(highlightModule), 'styles')
const languageOpts = ['auto', ...listLanguages().sort((a,b) => a.localeCompare(b))].map(lang => {
  return '<option>'+lang
}).join('')

const styles = {}
const p = []
fs.readdirSync(stylePath).filter(file => !file.includes('darkula') && file.endsWith('.css')).forEach(file => {
  const fullPath = path.join(stylePath, file)
  p.push(new Promise(rs => {
    b64img.fromFile(fullPath, stylePath, {maxSize: Infinity}, function(err, css) {
      rs()
      if (err) return styles[path.parse(file).name] = fs.readFileSync(fullPath, { encoding: 'utf8' }).toString('ascii')
      styles[path.parse(file).name] = css
    })
  }))
})


const extraCss = `
body, pre, code {
  height: 100%
}
body {
  margin : 0
}
.hljs {
  box-sizing: border-box
}
`


const inlineOpts = {
  removeLinkTags: false,
  preserveMediaQueries: true,
  removeHtmlSelectors: true,
  applyWidthAttributes: false,
  applyTableAttributes: false,
  codeBlocks: {
    EJS: { start: '<%', end: '%>' },
    HBS: { start: '{{', end: '}}' }
  },
  xmlMode: false,
  decodeEntities: false,
  lowerCaseTags: true,
  lowerCaseAttributeNames: false,
  recognizeCDATA: false,
  recognizeSelfClosing: false
}
Promise.all(p).then(async () => {
  const styleOpts = Object.keys(styles).sort((a,b) => a.localeCompare(b)).map(name => {
    return `<option${name === 'atom-one-dark' ? ' selected' : ''}>` + name
  }).join('')

  let index = fs.readFileSync('./index.html', { encoding: 'utf8' }).toString('ascii')
  index = new Function('languageOpts', 'styleOpts', 'return `'+index+'`')(languageOpts, styleOpts)

  const html = await inlineCss(index, Object.assign(
    { url: 'meh' },
    inlineOpts
  ))

  index = minify(html, {
    removeComments:            true,
    collapseWhitespace:        true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes:     true,
    removeEmptyAttributes:     true,
    minifyJS:                  true
  })

  const config = JSON.stringify({
    languages: listLanguages(),
    styles,
    index,
    extraCss,
    inlineOpts
  })

  fs.writeFileSync('./config.json', config)
})
