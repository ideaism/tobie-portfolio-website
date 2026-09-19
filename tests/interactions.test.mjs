import test from 'node:test';
import assert from 'node:assert/strict';
import {recipeResult, initialCraft, craftTransition, initialJourney, journeyTransition, initialFridge, fridgeTransition, filterPositions} from '../dist/interaction-model.mjs';

test('recipe requires both inputs and doubles only battery contribution', () => {
 assert.equal(recipeResult({gamepad:false,battery:true,charger:true}), null);
 assert.equal(recipeResult({gamepad:true,battery:false,charger:false}), null);
 assert.equal(recipeResult({gamepad:true,battery:true,charger:false}), 50);
 assert.equal(recipeResult({gamepad:true,battery:true,charger:true}), 80);
});
test('crafting cannot skip materials or confirmation', () => {
 const missing=initialCraft();
 assert.equal(missing.stage,'missing');
 assert.deepEqual(craftTransition(missing,'confirm'),missing);
 assert.deepEqual(craftTransition(missing,'open'),missing);
 const ready=craftTransition(missing,'collect');
 assert.equal(ready.stage,'ready');
 assert.deepEqual(craftTransition(ready,'confirm'),ready);
});
test('cancel preserves inventory and repeated confirm spends only once', () => {
 const ready=craftTransition(initialCraft(),'collect');
 const confirming=craftTransition(ready,'open');
 assert.equal(confirming.stage,'confirm');
 assert.deepEqual(craftTransition(confirming,'cancel'),ready);
 const done=craftTransition(confirming,'confirm');
 assert.equal(done.stage,'complete');
 assert.deepEqual(done.inventory,{gamepad:0,battery:0,crafted:1});
 assert.deepEqual(craftTransition(done,'confirm'),done);
 assert.deepEqual(craftTransition(done,'collect'),done);
 assert.deepEqual(craftTransition(done,'reset'),initialCraft());
});
test('journey does not bypass route choice or ride, and reset removes memories', () => {
 const initial=initialJourney();
 assert.deepEqual(journeyTransition(initial,'start'),initial);
 assert.deepEqual(journeyTransition(initial,'finish'),initial);
 const selected=journeyTransition(initial,'choose','greenway');
 const during=journeyTransition(selected,'start');
 assert.equal(during.stage,'during');
 const saved=journeyTransition(during,'save');
 assert.equal(saved.saved,true);
 const after=journeyTransition(saved,'finish');
 assert.equal(after.stage,'after');
 assert.equal(after.route,'greenway');
 assert.deepEqual(journeyTransition(after,'reset'),initial);
});
test('unknown ownership is not automatic permission; declaration has confirmation', () => {
 const initial=initialFridge();
 const unknown=fridgeTransition(initial,'select','unknown');
 assert.equal(unknown.permission,'none');
 assert.deepEqual(fridgeTransition(unknown,'plan'),unknown);
 const claiming=fridgeTransition(unknown,'claim');
 assert.equal(claiming.stage,'claim');
 assert.equal(claiming.owner,'unknown');
 assert.deepEqual(fridgeTransition(claiming,'cancel'),unknown);
 const mine=fridgeTransition(claiming,'confirmClaim');
 assert.equal(mine.owner,'self');
 assert.equal(mine.permission,'self');
 assert.equal(fridgeTransition(mine,'plan').stage,'plan');
});
test('asking the owner never grants permission or changes ownership', () => {
 const other=fridgeTransition(initialFridge(),'select','other');
 assert.deepEqual(fridgeTransition(other,'claim'),other);
 const asked=fridgeTransition(other,'ask');
 assert.equal(asked.stage,'asked');
 assert.equal(asked.owner,'other');
 assert.equal(asked.permission,'none');
 assert.deepEqual(fridgeTransition(asked,'plan'),asked);
 assert.deepEqual(fridgeTransition(asked,'reset'),initialFridge());
});
test('changing fridge selection discards pending confirmation', () => {
 const claiming=fridgeTransition(fridgeTransition(initialFridge(),'select','unknown'),'claim');
 const other=fridgeTransition(claiming,'select','other');
 assert.deepEqual(fridgeTransition(other,'confirmClaim'),other);
});
test('position search is trimmed, case insensitive and supports no data', () => {
 const rows=[{code:'DEMO-A',name:'Sample Alpha'},{code:'DEMO-B',name:'Sample Beta'}];
 assert.equal(filterPositions(rows,' alpha ').length,1);
 assert.equal(filterPositions(rows,'demo').length,2);
 assert.equal(filterPositions(rows,'NO MATCH').length,0);
 assert.equal(filterPositions(rows,'').length,2);
});
