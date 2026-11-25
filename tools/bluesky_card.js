// Renders a Bluesky post as a dark card PNG for "In Their Words".
// Usage: curl -s -G https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread --data-urlencode "uri=at://<handle>/app.bsky.feed.post/<rkey>" --data-urlencode depth=0 > post.json
//        node tools/bluesky_card.js post.json posts/assets/<slug>/bsky-<handle>.png
const fs=require('fs');const {chromium}=require('playwright');
const [,,src,out]=process.argv;
const p=JSON.parse(fs.readFileSync(src)).thread.post;const a=p.author;
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const text=esc(p.record.text).replace(/(#\w+)/g,'<span class=tag>$1</span>').replace(/\n/g,'<br>');
const d=new Date(p.record.createdAt);
const ts=d.toLocaleTimeString('en-GB',{timeZone:'Europe/London',hour:'2-digit',minute:'2-digit'})+' · '+d.toLocaleDateString('en-GB',{timeZone:'Europe/London',day:'numeric',month:'short',year:'numeric'});
const name=esc(a.displayName||a.handle);
const html=`<html><head><style>
body{margin:0;background:#161e27;font-family:Inter,-apple-system,"Segoe UI",Roboto,sans-serif;color:#f1f3f5}
.c{width:560px;padding:24px 24px 20px}
.h{display:flex;align-items:center;gap:14px}
.av{width:58px;height:58px;border-radius:50%;object-fit:cover}
.n{font-weight:700;font-size:19px}.u{color:#aebbc9;font-size:17px;margin-top:2px}
.b{margin-left:auto;width:34px}
.t{font-size:19px;line-height:1.45;margin-top:16px}
.tag{color:#208bfe}.ts{color:#aebbc9;font-size:15px;margin-top:16px}
</style></head><body><div class=c id=c><div class=h><img class=av src="${a.avatar}"><div><div class=n>${name}</div><div class=u>@${a.handle}</div></div>
<svg class=b viewBox="0 0 600 530"><path fill="#1185fe" d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z"/></svg></div>
<div class=t>${text}</div><div class=ts>${ts}</div></div></body></html>`;
(async()=>{const b=await chromium.launch();const pg=await b.newPage({deviceScaleFactor:2});await pg.setContent(html,{waitUntil:'networkidle'});await (await pg.$('#c')).screenshot({path:out});await b.close();console.log(out)})();
