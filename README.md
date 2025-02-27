# How to start local
```Start dojo
cd my_checkers
sozo build -P release
sozo migrate -P release
torii --world 0x065ee8188c171a836294feaa931f1c78b5f18957791c039e84ee40b4b3e85d3e --rpc https://api.cartridge.gg/x/mammo-checkers/katana --http.cors_origins "*"
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
