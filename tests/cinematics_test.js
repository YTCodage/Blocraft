// node tests/cinematics_test.js
const fs = require('fs'), vm = require('vm'), assert = require('assert');
const html = fs.readFileSync(require('path').join(__dirname, '..', 'blocraft.html'), 'utf8');
const start = html.indexOf('const Cinematics = {'), end = html.indexOf('\nconst Dragon = {', start);
let frame, keyHandler, skipHandler, removed = 0, resumed = 0;
const nodes = {};
const document = {
  hidden: false, exitPointerLock(){}, body:{appendChild(){}},
  addEventListener(type, fn){keyHandler=fn;}, removeEventListener(){keyHandler=null;},
  createElement(){ return {setAttribute(){},style:{},remove(){removed++;},querySelector(selector){
    return nodes[selector] = selector==='canvas' ? {getContext(){return null;}} : {style:{},focus(){},addEventListener(type,fn){skipHandler=fn;}};
  }}; },
};
const ctx = vm.createContext({document,performance:{now:()=>0},Game:{state:'menu'},
  requestAnimationFrame(fn){frame=fn;return 1;},cancelAnimationFrame(){frame=null;},
  startPlaying(){resumed++;ctx.Game.state='playing';},console,
});
vm.runInContext(html.slice(start,end)+'\nthis.Cinematics=Cinematics;',ctx);
(async()=>{
  const intro=ctx.Cinematics.play('intro');
  assert.equal(ctx.Game.state,'cinematic');assert(ctx.Cinematics.active);
  frame(0);assert.equal(nodes.h1.textContent,'De l’autre côté du portail');
  frame(4000);assert.equal(nodes.h1.textContent,'Un voyage sans retour');
  document.hidden=true;frame(14000);assert.equal(nodes['[data-time]'].textContent,'4 / 20 s');
  document.hidden=false;frame(30000);await intro;
  assert.equal(ctx.Game.state,'menu');assert(!ctx.Cinematics.active);assert.equal(keyHandler,null);
  ctx.Game.state='playing';const ending=ctx.Cinematics.play('ending');frame(0);assert.equal(nodes.h1.textContent,'Le dernier battement d’ailes');
  skipHandler();await ending;assert.equal(resumed,1);assert.equal(removed,2);
  const skipped=ctx.Cinematics.play('intro');keyHandler({code:'Escape',preventDefault(){},stopImmediatePropagation(){}});await skipped;
  assert(!ctx.Cinematics.active);
  assert(html.includes("await Cinematics.play('intro')"));assert(html.includes("Cinematics.play('ending')"));
  console.log('OK : introduction 20 s, scènes, onglet masqué, fin, bouton Passer, Échap, nettoyage et reprise.');
})().catch(e=>{console.error(e);process.exitCode=1;});
