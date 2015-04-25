The project has implemented these submissions:

1. Echo Server: listen on port 8000 and echo requests successfully
2. Proxy server: listen on port 8001 and proxy requests successfully
3. CLI: --host: host name, default: 127.0.0.1
                --port: port name, default: 8000
                --url: destination url, default: 127.0.0.1: 8000
                --log: log file path
4. logging: add --log argument, save logs to a specified file


Examples:

Start the server:

1. start with default value: $bode index.js

2. start with arguments: $bode index.js --url www.google.com 
                         $bodde index.js --log /home/logs/proxyServer.log

Verify te echo server:

$curl -v http://127.0.0.1:8000/ -d 'Hello World'

Verify the proxy server:
$curl -v http://127.0.0.1:8001/ -d 'Hello Proxy'

Verify the proxy server with x-destination-url header: 
curl -v http://127.0.0.1:8001 -H "x-destination-url:127.0.0.1:8000"
curl -v http://127.0.0.1:8001 -H "x-destination-url:www.google.com"

