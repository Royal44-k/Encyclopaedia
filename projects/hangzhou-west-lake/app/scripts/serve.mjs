import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.wav':'audio/wav','.ogg':'audio/ogg','.json':'application/json; charset=utf-8'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');let p=decodeURIComponent(url.pathname);if(p==='/')p='/index.html';if(!/^\/(index\.html|styles(?:-v4)?\.css|src\/[\w./-]+|assets\/[\w./-]+)$/.test(p))throw Error();const full=path.resolve(root,'.'+p);if(!full.startsWith(root))throw Error();const body=await readFile(full);res.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);}catch{res.writeHead(404);res.end('Not found');}}).listen(4173,'127.0.0.1',()=>console.log('杭州西子湖 http://127.0.0.1:4173'));
