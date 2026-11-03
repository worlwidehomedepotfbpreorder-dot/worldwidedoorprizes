
(()=>{'use strict';const KEY='worldwide-door-prizes-empty-start-v2';const $=id=>document.getElementById(id);const colors={blue:'GRAND PRIZE',gold:'MAJOR PRIZE',red:'REGULAR PRIZE'};let state,spinning=false,interval=null,drawTimer=null;const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random();const emptyState=()=>({prizes:[],history:[],nextNumber:1});try{state=JSON.parse(localStorage.getItem(KEY));if(!state||!Array.isArray(state.prizes)||!Array.isArray(state.history))throw Error()}catch(e){state=emptyState()}// Migrate older saved prize lists to permanent sequential numbers. Preserve old IDs and draws.
if(!Number.isInteger(state.nextNumber)||state.nextNumber<1){state.prizes.forEach((p,i)=>p.number=i+1);state.nextNumber=state.prizes.length+1}else{const used=new Set();for(const p of state.prizes){if(!Number.isInteger(p.number)||p.number<1||used.has(p.number))p.number=state.nextNumber++;used.add(p.number)}state.nextNumber=Math.max(state.nextNumber,...state.prizes.map(p=>p.number+1),1)}
for(const h of state.history){if(!Number.isInteger(h.number)){const orig=state.prizes.find(p=>p.id===h.id);if(orig)h.number=orig.number}}
const normalizeEmptyNumbering=()=>{if(state.prizes.length===0){state.nextNumber=1;state.history=[];}};const save=()=>{normalizeEmptyNumbering();try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){toast('Storage full. Export a backup and reduce prize entries.')}};const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const remaining=(color='all')=>state.prizes.filter(p=>!p.drawn&&(color==='all'||p.color===color));const count=c=>remaining(c).length;const toast=s=>{const el=$('toast');el.textContent=s;el.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>el.style.display='none',3200)};function render(){const all=state.prizes,drawn=all.filter(p=>p.drawn).length;$('prizeList').innerHTML=all.length?all.map((p,i)=>`<div data-number="${p.number}" class="prize ${p.color} ${p.drawn?'drawn':''}" title="${esc(p.name||'Prize #'+p.number)} — ${p.color}${p.drawn?' — DRAWN':''}"><span class="dot"></span><span class="name">${p.number}.)${p.name?.trim()?' '+esc(p.name.trim()):''}</span></div>`).join(''):'<div class="empty-prizes">No door prizes yet. Click <b>MANAGE PRIZES</b> to add your Blue, Gold, and Red prize entries.</div>';$('listCounter').textContent=`(${drawn}/${all.length} drawn)`;$('grandLeft').textContent=count('blue');$('drawCount').textContent=state.history.length;const last=state.history.at(-1);$('previous').textContent=state.history.length>1?formatPrize(state.history.at(-2)):'—';if(last&&!spinning){$('winner').textContent=formatPrize(last);$('winnerCategory').textContent=colors[last.color];}document.querySelectorAll('.reel').forEach(el=>{const c=el.dataset.color;el.querySelector('.count').textContent=count(c)+' remaining';el.classList.toggle('active',!spinning&&last?.color===c)});$('spin').disabled=spinning||!remaining($('category').value).length;$('undo').disabled=spinning||!state.history.length;$('managerSummary').textContent=`${all.length} total entries • ${remaining().length} remaining • ${drawn} drawn`;updateRemoveColorCount();renderManageList();}
const formatPrize=p=>p.name?.trim()?`${p.number??'?'}.) ${p.name.trim()}`:`${p.number??'?'}.)`;
function add(name,color,n,number=null){
 if(!colors[color]||!Number.isInteger(n)||n<1||n>10000)throw Error('Check color and quantity (1–10,000).');
 if(state.prizes.length+n>20000)throw Error('Maximum 20,000 prize entries.');
 const used=new Set(state.prizes.map(p=>p.number));
 if(number!==null&&(!Number.isSafeInteger(number)||number<1))throw Error('Prize number must be a positive whole number.');
 let candidate=number===null?state.nextNumber:number;
 for(let i=0;i<n;i++){
  while(used.has(candidate)){
   if(number!==null)throw Error('Prize #'+candidate+' already exists. Choose an unused number.');
   candidate++;
  }
  if(!Number.isSafeInteger(candidate))throw Error('Prize number is too large.');
  used.add(candidate);
  state.prizes.push({id:uid(),number:candidate,name,color,drawn:false});candidate++;
 }
 state.nextNumber=Math.max(state.nextNumber,candidate);
}const reelColors=['blue','gold','red'];
function showReels(color){document.querySelectorAll('.reel').forEach((el,i)=>{el.classList.remove('blue','gold','red');el.classList.add(color);el.dataset.color=color;el.querySelector('.color-label').textContent=color.toUpperCase();el.querySelector('.count').textContent=count(color)+' remaining';});}
function spin(){if(spinning)return;const pool=remaining($('category').value);if(!pool.length){toast('No prizes left in this category.');return}spinning=true;$('spin').disabled=true;$('undo').disabled=true;$('reels').classList.add('spinning');$('winnerCategory').textContent='SPINNING…';const chosen=pool[Math.floor(Math.random()*pool.length)];let ticks=0;const reels=[...document.querySelectorAll('.reel')];interval=setInterval(()=>{ticks++;reels.forEach((r,i)=>{const c=reelColors[(ticks+i)%3];r.classList.remove('blue','gold','red','active');r.classList.add(c);r.dataset.color=c;r.querySelector('.color-label').textContent=c.toUpperCase();r.querySelector('.count').textContent=count(c)+' remaining';});const p=pool[Math.floor(Math.random()*pool.length)];$('winner').textContent=formatPrize(p);},90);drawTimer=setTimeout(()=>{clearInterval(interval);interval=null;const actual=state.prizes.find(p=>p.id===chosen.id);actual.drawn=true;state.history.push({id:actual.id,number:actual.number,name:actual.name,color:actual.color,time:new Date().toISOString()});spinning=false;$('reels').classList.remove('spinning');showReels(actual.color);save();render();showReels(actual.color);reels.forEach(r=>r.classList.add('active'));$('winner').textContent=formatPrize(actual);$('winnerCategory').textContent=colors[actual.color]+' — '+actual.color.toUpperCase();const row=document.querySelector(`[data-number="${actual.number}"]`);row?.scrollIntoView({block:'nearest',behavior:'smooth'});$('winner').animate([{transform:'scale(.8)',opacity:.5},{transform:'scale(1.12)',opacity:1},{transform:'scale(1)',opacity:1}],{duration:750});},2900)}
$('spin').onclick=spin;$('category').onchange=render;$('undo').onclick=()=>{if(spinning||!state.history.length)return;if(!confirm('Undo the most recent draw?'))return;const h=state.history.pop();const p=state.prizes.find(p=>p.id===h.id);if(p)p.drawn=false;save();render();toast('Last draw undone')};const open=id=>$(id).classList.add('open'),close=id=>$(id).classList.remove('open');$('manage').onclick=()=>{render();open('managerOverlay')};$('closeManager').onclick=()=>close('managerOverlay');$('historyBtn').onclick=()=>{const h=state.history;$('historyList').innerHTML=h.length?h.map((v,i)=>`<div class="history-item"><span>Draw #${i+1} · <b class="${v.color}-t">${esc(formatPrize(v))}</b> (${colors[v.color]})</span><span class="muted">${new Date(v.time).toLocaleString()}</span></div>`).reverse().join(''):'No draws yet.';open('historyOverlay')};$('closeHistory').onclick=()=>close('historyOverlay');let editingPrizeId=null,removingPrizeId=null;
function renderManageList(){
 const target=$('managePrizeList');if(!target)return;
 const q=($('prizeSearch')?.value||'').toLowerCase().trim(),filter=$('manageFilter')?.value||'all';
 const list=state.prizes.filter(p=>(filter==='all'||p.color===filter)&&(!q||String(p.number).includes(q)||(p.name||'').toLowerCase().includes(q)));
 target.innerHTML=list.length?list.map(p=>{
 const id=esc(String(p.id)),label=esc(p.name?.trim()||'(number only)'),isEditing=editingPrizeId===String(p.id),isRemoving=removingPrizeId===String(p.id);
 return `<div class="manage-row${isEditing?' row-editing':''}" data-prize-id="${id}">
 <span class="manage-number">#${p.number}</span><span class="manage-entry ${p.color}-t">${label} <small>· ${p.color.toUpperCase()} ${p.drawn?'· DRAWN':''}</small></span>
 <button type="button" class="secondary small-btn" data-action="edit" data-id="${id}" >EDIT</button>
 <button type="button" class="danger small-btn" data-action="remove" data-id="${id}" >REMOVE</button>
 </div>${isEditing?`<div class="manage-inline-form" data-prize-id="${id}"><label>Editing prize #${p.number} — leave blank for number only<input class="edit-name" type="text" maxlength="160" value="${esc(p.name||'')}" placeholder="Optional — number only" aria-label="Prize name (optional)"></label><label>Category<select class="edit-color" aria-label="Prize category"><option value="blue" ${p.color==='blue'?'selected':''}>🔵 Blue / Grand</option><option value="gold" ${p.color==='gold'?'selected':''}>🟡 Gold / Major</option><option value="red" ${p.color==='red'?'selected':''}>🔴 Red / Regular</option></select></label><button type="button" data-action="save" data-id="${id}">SAVE CHANGES</button><button type="button" class="secondary" data-action="cancel" data-id="${id}">CANCEL</button></div>`:''}
 ${isRemoving?`<div class="manage-remove-confirm" data-prize-id="${id}"><span>Remove <b>#${p.number}.) ${label}</b> permanently?</span><button type="button" class="danger" data-action="confirm-remove" data-id="${id}">YES, REMOVE</button><button type="button" class="secondary" data-action="cancel" data-id="${id}">CANCEL</button></div>`:''}`;
 }).join(''):'<p style="padding:12px">No matching prizes.</p>';
}
let pendingRemoveColor=null;
function updateRemoveColorCount(){
 const selected=$('removeColorSelect').value;
 const entries=state.prizes.filter(p=>p.color===selected);
 const drawn=entries.filter(p=>p.drawn).length;
 $('removeColorCount').textContent=`${entries.length} ${selected.toUpperCase()} prizes (${drawn} already drawn) will be removed. Other colors will remain untouched.`;
 $('removeColorPrizes').disabled=spinning||entries.length===0;
 if(pendingRemoveColor && pendingRemoveColor!==selected){pendingRemoveColor=null;$('colorRemoveConfirm').hidden=true;}
 if(!entries.length){pendingRemoveColor=null;$('colorRemoveConfirm').hidden=true;}
}
$('removeColorSelect').addEventListener('change',()=>{pendingRemoveColor=null;$('colorRemoveConfirm').hidden=true;updateRemoveColorCount();});
$('removeColorPrizes').addEventListener('click',()=>{
 if(spinning){toast('Finish the spin before removing prizes.');return;}
 const color=$('removeColorSelect').value;
 const entries=state.prizes.filter(p=>p.color===color);
 if(!entries.length){toast('No prizes left in this color.');return;}
 pendingRemoveColor=color;
 const drawn=entries.filter(p=>p.drawn).length;
 $('colorRemoveWarning').textContent=`Delete all ${entries.length} ${color.toUpperCase()} prizes${drawn?' (including '+drawn+' drawn prizes and their history)':''}? Other colors will remain. This cannot be undone without a backup.`;
 $('colorRemoveConfirm').hidden=false;
 $('confirmColorRemoval').focus();
});
$('cancelColorRemoval').addEventListener('click',()=>{pendingRemoveColor=null;$('colorRemoveConfirm').hidden=true;});
$('confirmColorRemoval').addEventListener('click',()=>{
 if(spinning||!pendingRemoveColor)return;
 const color=pendingRemoveColor;
 const entries=state.prizes.filter(p=>p.color===color);
 if(!entries.length){pendingRemoveColor=null;$('colorRemoveConfirm').hidden=true;updateRemoveColorCount();return;}
 const ids=new Set(entries.map(p=>String(p.id)));
 state.prizes=state.prizes.filter(p=>p.color!==color);
 state.history=state.history.filter(h=>!ids.has(String(h.id)));
 pendingRemoveColor=null;
 $('colorRemoveConfirm').hidden=true;
 editingPrizeId=null;removingPrizeId=null;
 save();render();
 const last=state.history.at(-1);
 if(last){showReels(last.color);$('winner').textContent=formatPrize(last);$('winnerCategory').textContent=colors[last.color];}
 else{$('winner').textContent='READY TO DRAW!';$('winnerCategory').textContent='Select category and spin';showReels('blue');}
 toast(`Removed ${entries.length} ${color.toUpperCase()} prizes successfully`);
});
$('prizeSearch').oninput=renderManageList;$('manageFilter').onchange=renderManageList;
$('managePrizeList').addEventListener('click',e=>{
 const b=e.target.closest('button[data-action]');if(!b||spinning||b.disabled)return;
 const id=b.dataset.id,action=b.dataset.action,p=state.prizes.find(p=>String(p.id)===id);
 if(action==='cancel'){editingPrizeId=null;removingPrizeId=null;renderManageList();return;}
 if(!p){toast('Prize not found. Please refresh the list.');return;}
 
 if(action==='edit'){
  editingPrizeId=id;removingPrizeId=null;renderManageList();
  const form=[...$('managePrizeList').querySelectorAll('.manage-inline-form')].find(f=>f.dataset.prizeId===id);
  form?.querySelector('.edit-name')?.focus();form?.scrollIntoView({block:'nearest',behavior:'smooth'});return;
 }
 if(action==='remove'){removingPrizeId=id;editingPrizeId=null;renderManageList();const row=[...$('managePrizeList').querySelectorAll('.manage-remove-confirm')].find(f=>f.dataset.prizeId===id);row?.scrollIntoView({block:'nearest',behavior:'smooth'});return;}
 if(action==='save'){
  const form=[...$('managePrizeList').querySelectorAll('.manage-inline-form')].find(f=>f.dataset.prizeId===id);
  if(!form)return;
  const name=form.querySelector('.edit-name').value.trim(),color=form.querySelector('.edit-color').value;
  
  if(!colors[color]){toast('Choose a valid category.');return;}
  p.name=name; p.color=color;if(p.drawn){state.history.forEach(h=>{if(h.id===p.id){h.name=name;h.color=color;}})}editingPrizeId=null;save();render();toast(name?`Prize #${p.number} updated successfully`:`Prize #${p.number} saved as number only`);return;
 }
 if(action==='confirm-remove'){
  state.prizes=state.prizes.filter(item=>String(item.id)!==id);
  state.history=state.history.filter(h=>String(h.id)!==id);
  removingPrizeId=null;save();render();if(!state.history.length){$('winner').textContent='READY TO DRAW!';$('winnerCategory').textContent='Select category and spin'}toast(`Prize #${p.number} removed successfully`);
 }
});
$('addPrize').onclick=()=>{try{const raw=$('prizeNumber').value.trim(),number=raw===''?null:Number(raw);add($('prizeName').value.trim(),$('prizeColor').value,Number($('quantity').value),number);save();render();$('prizeName').value='';$('prizeNumber').value='';toast('Prize entries added')}catch(e){toast(e.message)}};$('import').onclick=()=>{const lines=$('bulk').value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);if(!lines.length){toast('Enter prizes to import');return}const entries=[];try{for(const [i,line] of lines.entries()){const parts=line.split(',').map(s=>s.trim());if(parts.length<2||parts.length>3)throw Error('Line '+(i+1)+': use Prize Name, Color, Quantity');const [name,colorRaw,nRaw]=parts;const color=colorRaw.toLowerCase();const n=nRaw?Number(nRaw):1;if(!colors[color]||!Number.isInteger(n)||n<1||n>10000)throw Error('Invalid data on line '+(i+1));entries.push({name,color,n})}if(state.prizes.length+entries.reduce((s,e)=>s+e.n,0)>20000)throw Error('Maximum 20,000 prize entries');entries.forEach(e=>add(e.name,e.color,e.n));save();render();$('bulk').value='';toast('Imported '+lines.length+' prize types')}catch(e){toast(e.message)}};function download(name,data,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}$('export').onclick=()=>download('door-prizes-backup.json',JSON.stringify(state,null,2),'application/json');$('restore').onclick=()=>$('backupFile').click();$('backupFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const v=JSON.parse(await file.text());if(!Array.isArray(v.prizes)||!Array.isArray(v.history)||v.prizes.length>20000||!v.prizes.every(p=>typeof p.id==='string'&&typeof p.name==='string'&&colors[p.color]&&typeof p.drawn==='boolean'))throw Error('Invalid backup');if(!confirm('Replace current prize list and draw history with this backup?'))return;state=v;if(!Number.isInteger(state.nextNumber))state.nextNumber=Math.max(0,...state.prizes.map(p=>Number(p.number)||0))+1;const existing=new Set();state.prizes.forEach(p=>{if(!Number.isInteger(p.number)||p.number<1||existing.has(p.number))p.number=state.nextNumber++;existing.add(p.number)});state.nextNumber=Math.max(state.nextNumber,...state.prizes.map(p=>p.number+1),1);save();render();toast('Backup restored')}catch(err){toast(err.message)}e.target.value=''};function removeEverything(){
 if(spinning){toast('Finish the spin before removing prizes.');return;}
 state={prizes:[],history:[],nextNumber:1};
 editingPrizeId=null;removingPrizeId=null;pendingRemoveColor=null;
 $('colorRemoveConfirm').hidden=true;
 $('removeAllConfirm').hidden=true;
 $('prizeSearch').value='';$('manageFilter').value='all';
 save();render();showReels('blue');
 $('winner').textContent='READY TO DRAW!';$('winnerCategory').textContent='Add prizes to begin';
 toast('All prizes removed. New numbering starts at #1.');
}
$('removeAllPrizes').onclick=()=>{
 if(spinning){toast('Finish the spin before removing prizes.');return;}
 $('removeAllWarning').textContent=`Remove ALL ${state.prizes.length} prizes and ${state.history.length} draw records? The next added prize will start at #1. This cannot be undone without a backup.`;
 $('removeAllConfirm').hidden=false;
 $('confirmRemoveAll').focus();
};
$('confirmRemoveAll').onclick=removeEverything;
$('cancelRemoveAll').onclick=()=>{$('removeAllConfirm').hidden=true;};
$('clear').onclick=()=>{
 if(spinning){toast('Finish the spin before resetting.');return;}
 $('removeAllWarning').textContent='RESET ALL DATA? Delete ALL prizes and draw history. New numbering starts at #1. Export your backup first if needed.';
 $('removeAllConfirm').hidden=false;
 $('confirmRemoveAll').focus();
};
$('downloadHistory').onclick=()=>{const rows=[['Draw #','Prize Number','Prize','Category','Date/Time'],...state.history.map((h,i)=>[i+1,h.number||'',h.name,h.color,h.time])];download('door-prize-draw-history.csv',rows.map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\r\n'),'text/csv')};$('full').onclick=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};document.addEventListener('keydown',e=>{if(e.key==='Escape'){close('managerOverlay');close('historyOverlay')}if(e.code==='Space'&&!e.repeat&&!document.querySelector('.overlay.open')&&!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(document.activeElement.tagName)){e.preventDefault();spin()}});save();render();showReels('blue');if(!state.prizes.length){$('winner').textContent='NO PRIZES YET';$('winnerCategory').textContent='Open Manage Prizes to add your first prize';}})();
