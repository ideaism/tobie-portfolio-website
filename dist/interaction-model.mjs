// Local illustrative state only: no accounts, transactions, messages or location access.
export function recipeResult({gamepad,battery,charger}) {
 return gamepad && battery ? 20 + 30 * (charger ? 2 : 1) : null;
}
export function initialCraft() {return {stage:'missing', inventory:{gamepad:1,battery:0,crafted:0}};}
export function craftTransition(state,action) {
 if(action==='reset') return initialCraft();
 if(action==='collect' && state.stage==='missing') return {stage:'ready',inventory:{...state.inventory,battery:1}};
 if(action==='open' && state.stage==='ready') return {...state,stage:'confirm'};
 if(action==='cancel' && state.stage==='confirm') return {...state,stage:'ready'};
 if(action==='confirm' && state.stage==='confirm' && state.inventory.gamepad>0 && state.inventory.battery>0) return {stage:'complete',inventory:{gamepad:state.inventory.gamepad-1,battery:state.inventory.battery-1,crafted:state.inventory.crafted+1}};
 return state;
}
export function initialJourney() {return {stage:'before',route:null,saved:false};}
export function journeyTransition(state,action,value) {
 if(action==='reset') return initialJourney();
 if(action==='choose' && state.stage==='before' && ['greenway','city'].includes(value)) return {...state,route:value};
 if(action==='start' && state.stage==='before' && state.route) return {...state,stage:'during'};
 if(action==='save' && state.stage==='during') return {...state,saved:!state.saved};
 if(action==='finish' && state.stage==='during') return {...state,stage:'after'};
 return state;
}
const fridgeItem=(item)=>({item,owner:item==='own'?'self':item==='other'?'other':'unknown',permission:item==='own'?'self':'none',stage:'view'});
export function initialFridge() {return fridgeItem('unknown');}
export function fridgeTransition(state,action,value) {
 if(action==='reset') return initialFridge();
 if(action==='select' && ['own','unknown','other'].includes(value)) return fridgeItem(value);
 if(action==='cancel' && ['claim','plan'].includes(state.stage)) return {...state,stage:'view'};
 if(action==='claim' && state.owner==='unknown' && state.stage==='view') return {...state,stage:'claim'};
 if(action==='confirmClaim' && state.stage==='claim' && state.owner==='unknown') return {...state,owner:'self',permission:'self',stage:'view'};
 if(action==='ask' && state.owner==='other' && state.stage==='view') return {...state,stage:'asked'};
 if(action==='plan' && state.permission==='self' && state.stage==='view') return {...state,stage:'plan'};
 if(action==='savePlan' && state.permission==='self' && state.stage==='plan') return {...state,stage:'saved'};
 return state;
}
export function filterPositions(rows,query) {
 const term=query.trim().toLowerCase();
 return rows.filter(row=>(row.code+' '+row.name).toLowerCase().includes(term));
}
