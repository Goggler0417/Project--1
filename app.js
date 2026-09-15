const DB="tagmark-db",STORE="bookmarks";let idb,user=null,items=[],selected=new Set(),editId=null;
const $=x=>document.getElementById(x), cfg=window.TAGMARK_CONFIG||{};
function openDB(){return new Promise((res,rej)=>{let r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});r.onsuccess=()=>{idb=r.result;res()};r.onerror=()=>rej(r.error)})}
function tx(mode){return idb.transaction(STORE,mode).objectStore(STORE)}
function getAll(){return new Promise((r,j)=>{let q=tx("readonly").getAll();q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)})}
function put(x){return new Promise((r,j)=>{let q=tx("readwrite").put(x);q.onsuccess=()=>r(q.result);q.onerror=()=>j(q.error)})}
function remove(id){return new Promise((r,j)=>{let q=tx("readwrite").delete(id);q.onsuccess=()=>r();q.onerror=()=>j(q.error)})}
function esc(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function tags(s){return [...new Set(s.split(",").map(x=>x.trim().toLowerCase()).filter(Boolean))].slice(0,100)}
function host(u){try{return new URL(u).hostname.replace(/^www\./,"")}catch{return u}}
function matches(b){let q=$("search").value.toLowerCase().trim(),hay=[b.url,b.title,b.notes,...b.tags].join(" ").toLowerCase();if(q&&!hay.includes(q))return false;if(!selected.size)return true;let a=[...selected];return $("logic").value==="AND"?a.every(t=>b.tags.includes(t)):a.some(t=>b.tags.includes(t))}
function render(){let arr=items.filter(matches).sort((a,b)=>b.updatedAt-a.updatedAt);$("count").textContent=`${arr.length} / ${items.length}`;$("selected").textContent=[...selected].join(", ")||"없음";$("empty").hidden=arr.length>0;
$("list").innerHTML=arr.map(b=>`<article class="card"><div><h3><a target="_blank" rel="noopener" href="${esc(b.url)}">${esc(b.title||host(b.url))}</a></h3><div class="url">${esc(b.url)}</div>${b.notes?`<div class="notes">${esc(b.notes)}</div>`:""}<div class="mini">${b.tags.map(t=>`<button data-tag="${esc(t)}">${esc(t)}</button>`).join("")}</div></div><div class="cardActions"><button data-edit="${b.id}">수정</button><button data-del="${b.id}">삭제</button></div></article>`).join("");
let c={};items.forEach(b=>b.tags.forEach(t=>c[t]=(c[t]||0)+1));$("tags").innerHTML=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,100).map(([t,n])=>`<button class="tag ${selected.has(t)?"active":""}" data-filter="${esc(t)}">${esc(t)} ${n}</button>`).join("")}
async function reload(){items=await getAll();render()}
function editor(b){editId=b?.id||null;$("formTitle").textContent=b?"북마크 수정":"북마크 추가";$("url").value=b?.url||"";$("title").value=b?.title||"";$("tagInput").value=b?.tags?.join(", ")||"";$("notes").value=b?.notes||"";$("editor").showModal();$("url").focus()}
$("addBtn").onclick=()=>editor();$("search").oninput=render;$("logic").onchange=render;$("clear").onclick=()=>{selected.clear();$("search").value="";render()};
$("tags").onclick=e=>{let x=e.target.closest("[data-filter]");if(x){let t=x.dataset.filter;selected.has(t)?selected.delete(t):selected.add(t);render()}};
$("list").onclick=async e=>{let t=e.target.closest("[data-tag]");if(t){let x=t.dataset.tag;selected.has(x)?selected.delete(x):selected.add(x);render()}let ed=e.target.closest("[data-edit]");if(ed)editor(items.find(x=>x.id==ed.dataset.edit));let de=e.target.closest("[data-del]");if(de&&confirm("삭제할까요?")){await remove(Number(de.dataset.del));await reload()}};
$("cancel").onclick=()=>$("editor").close();$("form").onsubmit=async e=>{e.preventDefault();let old=items.find(x=>x.id===editId),url=$("url").value.trim();if(!url)return;
let duplicate=items.find(x=>x.url.replace(/\/+$/,"").toLowerCase()===url.replace(/\/+$/,"").toLowerCase()&&x.id!==editId);
if(duplicate){if(!confirm("같은 URL이 이미 있습니다. 기존 북마크를 열까요?"))return;editId=duplicate.id;old=duplicate}
let b={...(old||{}),url,title:$("title").value.trim(),tags:tags($("tagInput").value),notes:$("notes").value.trim(),updatedAt:Date.now(),createdAt:old?.createdAt||Date.now()};await put(b);$("editor").close();await reload()};

$("loginBtn").onclick=()=>{$("login").showModal();$("email").focus()};$("loginCancel").onclick=()=>$("login").close();
$("loginForm").onsubmit=async e=>{e.preventDefault();if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY){$("loginMsg").textContent="config.js에 Supabase 설정을 먼저 넣어주세요.";return}await loginSupabase($("email").value,$("password").value)};
async function loginSupabase(email,password){$("loginMsg").textContent="연결 중…";try{
let r=await fetch(cfg.SUPABASE_URL+"/auth/v1/token?grant_type=password",{method:"POST",headers:{"apikey":cfg.SUPABASE_ANON_KEY,"Content-Type":"application/json"},body:JSON.stringify({email,password})});
let d=await r.json();if(!r.ok)throw Error(d.error_description||d.msg||"로그인 실패");user=d;$("syncState").textContent="☁ 동기화 연결됨";$("login").close();await cloudPull();await cloudPush();alert("로그인되었습니다.")}catch(e){$("loginMsg").textContent=e.message}}
function authHeaders(){return{"apikey":cfg.SUPABASE_ANON_KEY,"Authorization":"Bearer "+user.access_token,"Content-Type":"application/json"}}
async function cloudPull(){let r=await fetch(cfg.SUPABASE_URL+"/rest/v1/bookmarks?select=*&order=updated_at.desc",{headers:authHeaders()});if(!r.ok)return;let rows=await r.json();for(let x of rows)await put({id:"cloud-"+x.id,url:x.url,title:x.title||"",tags:x.tags||[],notes:x.notes||"",updatedAt:new Date(x.updated_at).getTime(),createdAt:new Date(x.created_at).getTime()});await reload()}
async function cloudPush(){let local=items.filter(x=>typeof x.id==="number");for(let x of local){await fetch(cfg.SUPABASE_URL+"/rest/v1/bookmarks",{method:"POST",headers:{...authHeaders(),"Prefer":"resolution=merge-duplicates"},body:JSON.stringify({id:String(x.id),user_id:user.user.id,url:x.url,title:x.title,tags:x.tags,notes:x.notes,updated_at:new Date(x.updatedAt).toISOString(),created_at:new Date(x.createdAt).toISOString()})})}}
openDB().then(reload);