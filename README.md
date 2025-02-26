# How to start local
```Start dojo
cd my_checkers
sozo build -P release
sozo migrate -P release
torii --world 0x0190386ce184452b6fed8ff0b17b4d42ea47cdf8a2d1f0a98be083f53b41662f --rpc https://api.cartridge.gg/x/mammo-checkers/katana --http.cors_origins "*"
```

Start Client
```
cd client
npm run dev
```
Also need for first start client
```
npm i
mkcert localhost
```
