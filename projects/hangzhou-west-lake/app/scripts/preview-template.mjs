import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.wav':'audio/wav','.ogg':'audio/ogg','.json':'application/json; charset=utf-8'};
const server=http.createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(pathname==='/')pathname='/index.html';if(!/^\/(index\.html|styles\.css|src\/[\w./-]+|assets\/[\w./-]+)$/.test(pathname))throw Error('Not found');const target=path.resolve(root,'.'+pathname),relative=path.relative(root,target);if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Not found');const data=await readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}});
server.on('error',e=>{console.error('预览未能启动：'+e.message);console.error('若端口 4174 已被占用，请关闭此前的预览窗口。');process.exitCode=1;});
server.listen(4174,'127.0.0.1',()=>console.log('杭州西子湖 V7\n请在浏览器打开 http://127.0.0.1:4174/\n按 Ctrl+C 结束预览。'));
