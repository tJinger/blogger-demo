let http = require('http')
let request = require('request')
let fs = require('fs')
let argv = require('yargs')
    .default('host', '127.0.0.1:8000')
    .default('port', '8000')
    .default('url', '127.0.0.1:8000')
    .default('log', '/Users/tjing/work/git/ProxyServerProject/logs' )
    .help('help').alias('help', 'h')
    .argv
let scheme = 'http://'
let port = argv.port || argv.host === '127.0.0.1' ? 8000 : 80
let destinationUrl = argv.url || scheme + argv.host + ':' + port
let outputStream = argv.log ? fs.createWriteStream(argv.log) : process.stdout

http.createServer((req, res) => {
    console.log(`Request received at: ${req.url}`)
    outputStream.write('\n\n\n' + JSON.stringify(req.headers))

    for (let header in req.headers) {
       res.setHeader(header, req.headers[header])
    }
    req.pipe(res)
}).listen(8000)

http.createServer((req, res) => {

  if (req.headers['x-destination-url']) {
  	destinationUrl = req.headers['x-destination-url'];
  }

  console.log(`DestinationUrl : ${destinationUrl}`)

  let options = {
    headers: req.headers,
    url: `http://${destinationUrl}${req.url}`
  }
  console.log(`Proxying request to: ${destinationUrl + req.url}`)

  options.method=req.method
  let downstreamResponse = req.pipe(request(options))
  outputStream.write(JSON.stringify(downstreamResponse.headers))
  downstreamResponse.pipe(res)
}).listen(8001)
