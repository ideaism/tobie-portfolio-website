import {recipeResult, initialCraft, craftTransition, initialJourney, journeyTransition, initialFridge, fridgeTransition, filterPositions} from './interaction-model.mjs';
const zh=document.documentElement.lang.startsWith('zh');
const t=(cn,en)=>zh?cn:en;
const $=(root,selector)=>root.querySelector(selector);
const all=(root,selector)=>[...root.querySelectorAll(selector)];
function showActions(root,visible) {
 all(root,'[data-action]').forEach(button=>button.hidden=!visible.includes(button.dataset.action));
}
function focusStatus(root,event,selector) {
 if(event?.target.closest('button')?.hidden) $(root,selector)?.focus({preventScroll:true});
}
function track(root,stage) {
 all(root,'[data-stage]').forEach(el=>{
  const current=el.dataset.stage===stage;
  el.classList.toggle('active',current);
  if(current) el.setAttribute('aria-current','step'); else el.removeAttribute('aria-current');
 });
}

for(const root of all(document,'[data-demo="studio"]')) {
 function render(){
  const state=Object.fromEntries(all(root,'input').map(input=>[input.name,input.checked]));
  const result=recipeResult(state);
  $(root,'[data-result="value"]').textContent=result??'—';
  $(root,'[data-result="formula"]').textContent=result===null?t('等待必选输入','Required inputs missing'):state.charger?'20 + 30 × 2 = 80':'20 + 30 = 50';
  $(root,'[data-result="explanation"]').textContent=result===null?t('Gamepad 和 Normal Battery 都必须连接，规则才能产生输出。','Connect both Gamepad and Normal Battery before the rule can produce an output.'):state.charger?t('Super Charger 已连接：只将电池贡献翻倍，基础值保持 20。','Super Charger connected: only the battery contribution doubles. The base value stays at 20.'):t('普通电池贡献 30。加入 Super Charger，看看同一条规则如何变化。','Normal Battery contributes 30. Add Super Charger to see the same rule change.');
  root.classList.toggle('has-charger',state.charger);
  root.classList.toggle('is-incomplete',result===null);
 }
 root.addEventListener('change',render);
 $(root,'[data-action="reset"]').addEventListener('click',()=>{all(root,'input').forEach(input=>input.checked=input.name!=='charger');render();});
 render();
}

for(const root of all(document,'[data-demo="craft"]')) {
 let state=initialCraft();
 function render(event){
  for(const [key,value] of Object.entries(state.inventory)) $(root,`[data-count="${key}"]`).textContent=value;
  const copy={
   missing:[t('还缺一块电池','One battery is missing'),t('配方需要 1 个 Gamepad 与 1 个 Normal Battery。先补齐示例材料。','The recipe needs 1 Gamepad and 1 Normal Battery. Add the missing sample material first.')],
   ready:[t('材料已齐，下一步检查消耗','Materials ready. Review the cost.'),t('背包现在满足要求。打开确认步骤之前，不会消耗任何材料。','The inventory meets the requirements. Nothing is consumed when you open the review.')],
   confirm:[t('确认这次消耗吗？','Confirm this consumption?'),t('确认将消耗两件材料并获得一个合成物品。取消会保留所有材料。','Confirm to consume both materials and receive one crafted item. Cancel keeps every material.')],
   complete:[t('合成完成，背包已更新','Craft complete. Inventory updated.'),t('已消耗 1 个 Gamepad 和 1 个 Normal Battery，获得 1 个合成物品。此结果只会结算一次。','Spent 1 Gamepad and 1 Normal Battery; received 1 crafted item. This result can be applied only once.')]
  }[state.stage];
  $(root,'[data-status-title]').textContent=copy[0];$(root,'[data-status-copy]').textContent=copy[1];
  $(root,'[data-confirmation]').hidden=state.stage!=='confirm';
  showActions(root,[...({missing:['collect'],ready:['open'],confirm:['confirm','cancel'],complete:[]}[state.stage]),'reset']);
  track(root,state.stage); root.dataset.state=state.stage;
  focusStatus(root,event,'.craft-status');
 }
 root.addEventListener('click',event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(action){state=craftTransition(state,action);render(event);}});
 render();
}

for(const root of all(document,'[data-demo="journey"]')) {
 let state=initialJourney();
 const routeName=()=>state.route==='city'?t('街角与朋友','Neighbourhood with friends'):t('绿道小风景','Greenway discoveries');
 const stopName=()=>state.route==='city'?t('街角咖啡店','Neighbourhood café'):t('河边停留','Riverside stop');
 function render(event){
  const copy={
   before:[t('从兴趣开始','START WITH AN INTEREST'),t('今天，想看点什么？','What would you like to explore?'),state.route?t('已选：','Selected: ')+routeName():t('先选择一条示例路线，再体验沿途记录和骑行回顾。','Choose a sample route, then explore a stop and the post-ride memory.')],
   during:[t('在途中留一点空间','LEAVE ROOM ALONG THE WAY'),stopName(),state.saved?t('已把这次停留记入示例旅程。你可以撤销记录，再进入回顾。','This stop is saved to the sample journey. You can undo the memory before the recap.'):t('在停下来时记录一个值得回顾的地方，让成长和沿途的实际行为联系起来。','Save a place during a pause, connecting growth to something meaningful along the route.')],
   after:[t('让经历值得回顾','MAKE THE RIDE MEMORABLE'),t('一次骑行，留下什么？','What remains after a ride?'),t('示例回顾把路线、停留记录与成长反馈放在一起。奖励应跟随体验，而不是另开一套任务。','The sample recap brings the route, saved stops and growth feedback together. Rewards follow the experience.')]
  }[state.stage];
  $(root,'[data-journey-label]').textContent=copy[0];$(root,'[data-journey-title]').textContent=copy[1];$(root,'[data-journey-copy]').textContent=copy[2];
  $(root,'.route-options').hidden=state.stage!=='before';
  all(root,'input[name="route"]').forEach(input=>input.checked=input.value===state.route);
  $(root,'[data-memory]').hidden=state.stage!=='after';
  $(root,'[data-memory-title]').textContent=routeName();
  $(root,'[data-memory-copy]').textContent=state.saved?t('1 次停留 · ','1 saved stop · ')+stopName()+t(' · 一枚示例探索标记',' · One illustrative discovery marker'):t('没有保存停留 · 示例回顾仍保留路线，不凭空生成回忆。','No saved stops · The sample recap keeps the route without inventing a memory.');
  $(root,'[data-action="start"]').disabled=!state.route;
  const save=$(root,'[data-action="save"]');save.textContent=state.saved?t('撤销这条记录','Undo saved stop'):t('记下这次停留','Save this stop');save.setAttribute('aria-pressed',String(state.saved));
  showActions(root,[...({before:['start'],during:['save','finish'],after:[]}[state.stage]),'reset']);
  track(root,state.stage);root.dataset.state=state.stage;root.dataset.route=state.route||'';
  focusStatus(root,event,'.journey-status');
 }
 root.addEventListener('change',event=>{if(event.target.name==='route'){state=journeyTransition(state,'choose',event.target.value);render();}});
 root.addEventListener('click',event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(action){state=journeyTransition(state,action);render(event);}});
 render();
}

for(const root of all(document,'[data-demo="table"]')) {
 const rows=[{code:'DEMO-A',name:t('示例甲','Sample Alpha'),quantity:'1,200',value:'12,600.00'},{code:'DEMO-B',name:t('示例乙','Sample Beta'),quantity:'800',value:'8,400.00'},{code:'DEMO-C',name:t('示例丙','Sample Gamma'),quantity:'500',value:'5,250.00'}];
 let mode='default';let selected=new Set();let query='';
 const input=$(root,'input[name="query"]');
 function render(){
  const visible=mode==='empty'?[]:filterPositions(rows,query);
  selected=new Set([...selected].filter(code=>visible.some(row=>row.code===code)));
  const body=$(root,'[data-table-rows]');body.replaceChildren();
  if(!visible.length){
   const row=document.createElement('tr');const cell=document.createElement('td');cell.colSpan=4;cell.className='no-data';
   const title=document.createElement('b');title.textContent=t('暂无匹配数据','No matching data');
   const help=document.createElement('span');help.textContent=t('尝试另一个名称或清除查询。','Try another name or clear the query.');cell.append(title,help);row.append(cell);body.append(row);
  }
  visible.forEach((item,index)=>{
   const row=document.createElement('tr');row.classList.toggle('is-selected',selected.has(item.code));row.classList.toggle('is-hover-preview',mode==='hover'&&index===0);
   const selectCell=document.createElement('td');const check=document.createElement('input');check.type='checkbox';check.checked=selected.has(item.code);check.dataset.code=item.code;check.setAttribute('aria-label',t('选择 ','Select ')+item.name);selectCell.append(check);
   const nameCell=document.createElement('th');nameCell.scope='row';const name=document.createElement('span');name.textContent=item.name;const code=document.createElement('small');code.textContent=item.code;nameCell.append(name,code);
   const quantity=document.createElement('td');quantity.textContent=item.quantity;const value=document.createElement('td');value.textContent=item.value;row.append(selectCell,nameCell,quantity,value);body.append(row);
  });
  all(root,'[data-table-state]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tableState===mode)));
  $(root,'[data-table-status]').textContent=t(`显示 ${visible.length} 条 · 已选 ${selected.size} 条`,`Showing ${visible.length} · Selected ${selected.size}`)+(mode==='hover'?t(' · 首行演示悬停反馈',' · First row previews hover feedback'):'');
 }
 $(root,'.table-query').addEventListener('submit',event=>{event.preventDefault();query=input.value;mode='default';selected.clear();render();});
 input.addEventListener('input',()=>{query=input.value;mode='default';selected.clear();render();});
 root.addEventListener('change',event=>{
  const code=event.target.dataset.code;if(!code)return;
  if(event.target.checked)selected.add(code);else selected.delete(code);
  mode=selected.size?'selected':'default';render();$(root,`input[data-code="${code}"]`)?.focus({preventScroll:true});
 });
 root.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.tableState){mode=button.dataset.tableState;query='';input.value='';selected=new Set(mode==='selected'?[rows[0].code]:[]);render();}
  if(button.dataset.action==='theme'){
   const workspace=$(root,'.table-workspace');const night=workspace.dataset.theme!=='night';workspace.dataset.theme=night?'night':'day';button.setAttribute('aria-pressed',String(night));
  }
  if(button.dataset.action==='clear'){mode='default';query='';input.value='';selected.clear();render();}
 });
 render();
}

for(const root of all(document,'[data-demo="fridge"]')) {
 let state=initialFridge();
 function render(event){
  $(root,'[data-fridge-location]').textContent={unknown:t('上层','Top shelf'),own:t('中层','Middle shelf'),other:t('冰箱门','Door')}[state.item];
  $(root,'[data-fridge-owner]').textContent={unknown:t('归属未知','Unknown'),self:t('我自己','Me'),other:t('室友','Housemate')}[state.owner];
  $(root,'[data-fridge-permission]').textContent=state.permission==='self'?t('管理自己的计划','Manage my own plan'):t('未获得','Not granted');
  const copy=state.stage==='claim'?[t('请确认这是你的物品','Confirm that this item belongs to you'),t('这是主动的归属声明。“未认领”本身不构成权限；如果不能确认，取消并保留未知状态。','This is an explicit ownership declaration. “Unclaimed” alone grants no permission. If you cannot confirm ownership, cancel and keep it unknown.')]:
   state.stage==='asked'?[t('询问内容预览，权限仍未改变','Request preview. Permission is unchanged.'),t('“这是你的物品吗？你希望怎么安排？”这里只预览询问内容，没有发送消息，也没有获得代为处理的许可。','“Is this yours? What would you like to do with it?” This only previews a request. No message was sent and no permission was granted.')]:
   state.stage==='plan'?[t('为自己的物品记录一个计划','Record a plan for your own item'),t('示例计划：稍后由我自己查看。这个计划不判断是否能吃，也不授权别人处理。','Sample plan: I’ll check it myself later. This says nothing about whether it is safe to eat and does not authorise anyone else to act.')]:
   state.stage==='saved'?[t('示例计划已记录','Sample plan recorded'),t('“稍后自行查看”只留在本页。位置、归属与他人的权限仍分别保留。','“I’ll check it later” stays on this page. Location, ownership and other people’s permission remain separate.')]:
   state.owner==='self'?[t('这是我的物品','This item is mine'),t('可以为自己的物品记录下一步计划。其他人看得到，也不等于获得处理权限。','You can record the next step for your own item. Visibility still does not grant permission to anyone else.')]:
   state.owner==='other'?[t('先和主人确认','Check with the owner first'),t('知道主人是谁，并不等于获得权限。先预览一个中性的询问，而不是直接处理。','Knowing who owns it does not grant permission. Preview a neutral question before any action.')]:
   [t('还不知道它属于谁','Ownership is still unknown'),t('位置只告诉我们它在哪里。如果确实是你的，可以声明归属；否则保留未知状态。','Location only tells us where it is. Declare ownership only if it is yours; otherwise keep ownership unknown.')];
  $(root,'[data-fridge-title]').textContent=copy[0];$(root,'[data-fridge-copy]').textContent=copy[1];
  const actions=state.stage==='claim'?['confirmClaim','cancel']:state.stage==='plan'?['savePlan','cancel']:state.stage==='view'?(state.owner==='self'?['plan']:state.owner==='other'?['ask']:['claim']):[];
  showActions(root,[...actions,'reset']);root.dataset.state=state.stage;
  all(root,'input[name="fridge-item"]').forEach(input=>input.checked=input.value===state.item);
  focusStatus(root,event,'.fridge-status');
 }
 root.addEventListener('change',event=>{if(event.target.name==='fridge-item'){state=fridgeTransition(state,'select',event.target.value);render();}});
 root.addEventListener('click',event=>{const action=event.target.closest('[data-action]')?.dataset.action;if(action){state=fridgeTransition(state,action);render(event);}});
 render();
}

for(const root of all(document,'[data-motion]')) {
 root.addEventListener('click',event=>{
  const key=event.target.closest('[data-clip]')?.dataset.clip;if(!key)return;
  all(root,'[data-clip]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.clip===key)));
  all(root,'[data-clip-panel]').forEach(panel=>{const active=panel.dataset.clipPanel===key;panel.hidden=!active;if(!active)panel.querySelector('video').pause();});
 });
}

const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
let progressPending=false;
function updateProgress(){const scrollable=document.documentElement.scrollHeight-window.innerHeight;progress.style.transform=`scaleX(${scrollable>0?Math.min(1,Math.max(0,window.scrollY/scrollable)):0})`;progressPending=false;}
window.addEventListener('scroll',()=>{if(!progressPending){progressPending=true;requestAnimationFrame(updateProgress);}},{passive:true});window.addEventListener('resize',updateProgress);updateProgress();
if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('just-revealed');observer.unobserve(entry.target);}},{threshold:.08});
 all(document,'.native-demo,.native-preview,.original-motion').forEach(node=>observer.observe(node));
}
