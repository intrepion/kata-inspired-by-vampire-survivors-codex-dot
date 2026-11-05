/** Deterministic, DOM-free survival simulation. Distances are world units. */
export const WEAPONS = {
 whip:{name:'Ember Lash',description:'A broad strike in the direction you face.',maxLevel:8,color:'#ffb36b',evolution:'Crimson Lash',pair:'heart'},
 wand:{name:'Star Wand',description:'Seeks the nearest creature.',maxLevel:8,color:'#81caff',evolution:'Endless Star',pair:'tome'},
 knife:{name:'Glass Knives',description:'Throws in your last movement direction.',maxLevel:8,color:'#a9fff2',evolution:'Crystal Stream',pair:'bracer'},
 axe:{name:'Moon Axe',description:'Heavy axes arc overhead.',maxLevel:8,color:'#e0caff',evolution:'Eclipse Wheel',pair:'candelabrador'},
 garlic:{name:'Hollow Bloom',description:'A damaging aura around you.',maxLevel:8,color:'#b8f596',evolution:'Soul Bloom',pair:'pummarola'},
 bible:{name:'Orbiting Sigils',description:'Circling wards damage nearby creatures.',maxLevel:8,color:'#ffe49a',evolution:'Eternal Sigils',pair:'spellbinder'},
};
export const PASSIVES = {
 heart:{name:'Hollow Heart',description:'Maximum health ×1.2 per level; does not heal.',maxLevel:5},
 tome:{name:'Empty Tome',description:'8% shorter weapon cooldown per level.',maxLevel:5},
 bracer:{name:'Bracer',description:'+10% projectile speed per level.',maxLevel:5},
 candelabrador:{name:'Candelabrador',description:'+10% weapon area per level.',maxLevel:5},
 spellbinder:{name:'Spellbinder',description:'+10% weapon duration per level.',maxLevel:5},
 pummarola:{name:'Pummarola',description:'Recover 0.2 health per second per level.',maxLevel:5},
 spinach:{name:'Spinach',description:'+10% weapon damage per level.',maxLevel:5},
 attractorb:{name:'Attractorb',description:'Collect experience from farther away.',maxLevel:5},
};
export const CHARACTERS = {
 warden:{name:'Ash Warden',weapon:'whip',description:'Sturdy wanderer. +20 maximum health.',color:'#f1aa71'},
 scholar:{name:'Night Scholar',weapon:'wand',description:'Star seeker. 10% shorter cooldowns.',color:'#8ccfff'},
 ranger:{name:'Glass Ranger',weapon:'knife',description:'Fleet hunter. +15% movement speed.',color:'#9de9d2'},
 keeper:{name:'Bloom Keeper',weapon:'garlic',description:'Quiet guardian. Regenerates 0.3 health/second.',color:'#c4e789'},
};
export const POWERUPS = {
 might:{name:'Might',description:'+5% damage per rank.',maxLevel:5,cost:120},
 vitality:{name:'Vitality',description:'+10 maximum health per rank.',maxLevel:5,cost:100},
 magnet:{name:'Magnet',description:'+20% pickup radius per rank.',maxLevel:5,cost:80},
 haste:{name:'Haste',description:'+5% movement speed per rank.',maxLevel:3,cost:150},
};
const TAU=Math.PI*2, CAP=360;
const finite=(n,d=0)=>Number.isFinite(n)?n:d;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function id(s){return ++s.nextId;}
export function createMeta(){return {version:1,gold:0,powerups:{},bestTime:0,totalKills:0,runs:0};}
export function validateMeta(v){const m=createMeta();if(!v||typeof v!=='object')return m; for(const k of ['gold','totalKills','runs'])m[k]=Math.floor(clamp(finite(v[k]),0,1e9));m.bestTime=clamp(finite(v.bestTime),0,1800);for(const [k,p]of Object.entries(POWERUPS))m.powerups[k]=Math.floor(clamp(finite(v.powerups?.[k]),0,p.maxLevel));return m;}
export function powerupCost(meta,key){const p=Object.hasOwn(POWERUPS,key)?POWERUPS[key]:null;return p?Math.round(p.cost*1.7**(meta.powerups?.[key]||0)):Infinity;}
export function buyPowerup(meta,key){const p=Object.hasOwn(POWERUPS,key)?POWERUPS[key]:null,level=meta.powerups?.[key]||0,cost=powerupCost(meta,key);if(!p||level>=p.maxLevel||meta.gold<cost)return false;meta.gold-=cost;meta.powerups??={};meta.powerups[key]=level+1;return true;}
export function createGame({character='warden',mode='quick',powerups={},seed=1}={}){
 if(!Object.hasOwn(CHARACTERS,character))character='warden';const powers=validateMeta({powerups}).powerups;
 const hp=100+(character==='warden'?20:0)+10*powers.vitality;
 return {phase:'playing',character,mode:mode==='classic'?'classic':'quick',seed:(finite(seed,1)>>>0)||1,nextId:0,time:0,realTime:0,kills:0,gold:0,level:1,xp:0,xpNeeded:5,choices:[],lastReward:null,deathReached:false,powerups:powers,
 player:{x:0,y:0,radius:.35,hp,maxHp:hp,baseHp:hp,facingX:1,facingY:0,horizontalFacing:1,invulnerable:0},weapons:{[CHARACTERS[character].weapon]:1},passives:{},evolved:{},enemies:[],gems:[],loot:[],projectiles:[],zones:[],effects:[],timers:{},spawnTimer:0,nextBoss:60,nextProp:15,freezeUntil:0,pendingChest:null,stats:{damageDealt:0},_accumulator:0};
}
function stats(s){return {damage:1+.1*(s.passives.spinach||0)+.05*(s.powerups.might||0),area:1+.1*(s.passives.candelabrador||0),duration:1+.1*(s.passives.spellbinder||0),speed:1+.1*(s.passives.bracer||0),cooldown:(1-.08*(s.passives.tome||0))*(s.character==='scholar'?.9:1),pickup:1.1*[1,1.5,1.995,2.49375,2.9925,3.980025][s.passives.attractorb||0]*(1+.2*(s.powerups.magnet||0))};}
function effect(s,kind,x,y,radius=.5,life=.3){s.effects.push({id:id(s),kind,type:kind,x,y,radius,life,maxLife:life});}
export function spawnEnemy(s,kind='bat',x,y){if(s.enemies.length>=CAP)return null;const a=rng(s)*TAU,r=13+rng(s)*5;const minute=s.time/60,boss=kind==='boss',death=kind==='death';const hp=death?1e9:boss?90+minute*24:8+minute*2.2;const e={id:id(s),kind,type:kind,x:x??s.player.x+Math.cos(a)*r,y:y??s.player.y+Math.sin(a)*r,radius:death?.65:boss?.8:.32+(kind==='golem'?.18:0),hp,maxHp:hp,speed:death?6:boss?.8:kind==='bat'?1.25:kind==='golem'?.65:1,damage:death?9999:boss?18:7+minute*.3,xp:boss?15:kind==='golem'?3:1,hitCooldowns:{},boss,spawnTime:s.time};s.enemies.push(e);return e;}
function gem(s,x,y,value){if(s.gems.length<240)s.gems.push({id:id(s),kind:'xp',type:'xp',x,y,value,radius:.15});else {let nearest=s.gems[0];for(const g of s.gems)if(distance(g,{x,y})<distance(nearest,{x,y}))nearest=g;nearest.value+=value;}}
function knockback(s,e,force,dx=e.x-s.player.x,dy=e.y-s.player.y){
 if(e.kind==='death'||force<=0)return;
 const length=Math.hypot(dx,dy)||1, resistance=e.boss?.2:e.kind==='golem'?.5:1;
 const strength=force*resistance*(1+(e.knockbackBonus||0));
 e.knockVX=(e.knockVX||0)+dx/length*strength;e.knockVY=(e.knockVY||0)+dy/length*strength;
}
function hurt(s,e,damage,heal=false){if(e.hp<=0)return;damage=finite(damage);e.hp-=damage;s.stats.damageDealt+=damage;effect(s,'hit',e.x,e.y,e.radius,.12);if(heal)s.player.hp=Math.min(s.player.maxHp,s.player.hp+.15);if(e.hp<=0){s.kills++;gem(s,e.x,e.y,e.xp);if(e.boss)s.loot.push({id:id(s),kind:'chest',type:'chest',x:e.x,y:e.y,radius:.45,spawnTime:e.spawnTime});else if(rng(s)<.018)s.loot.push({id:id(s),kind:'coin',type:'coin',x:e.x,y:e.y,radius:.22});}}
function choices(s){const pool=[];for(const [kind,defs,owned,cap]of [['weapon',WEAPONS,s.weapons,6],['passive',PASSIVES,s.passives,6]])for(const [key,def]of Object.entries(defs)){const n=owned[key]||0;if(n<def.maxLevel&&(n>0||Object.keys(owned).length<cap))pool.push({id:`${kind}:${key}`,key,kind,name:def.name,description:def.description,level:n+1});}for(let i=pool.length-1;i>0;i--){const j=Math.floor(rng(s)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.length?pool.slice(0,rng(s)<.15?4:3):[{id:'recovery',name:'Floor Chicken',description:'Recover 30 health.',kind:'recovery',level:1},{id:'gold',name:'Gold Purse',description:'Gain 50 gold.',kind:'gold',level:1}];}
function levelCheck(s){if(s.xp>=s.xpNeeded){s.xp-=s.xpNeeded;s.level++;s.xpNeeded=Math.floor(5+s.level*3+s.level*s.level*.22);s.choices=choices(s);s.phase='levelup';}}
function applyUpgrade(s,c){const key=c.id;if(c.kind==='weapon')s.weapons[c.key]=c.level;else if(c.kind==='passive'){s.passives[c.key]=c.level;if(c.key==='heart'){s.player.maxHp=s.player.baseHp*1.2**c.level;}}else if(key==='recovery')s.player.hp=Math.min(s.player.maxHp,s.player.hp+30);else s.gold+=50;s.lastReward=c.name;}
export function chooseUpgrade(s,key){if(s.phase!=='levelup'||!s.choices.some(c=>c.id===key))return false;applyUpgrade(s,s.choices.find(c=>c.id===key));s.choices=[];s.phase='playing';levelCheck(s);return true;}
export function collectChest(s){if(s.phase!=='chest')return false;const eligible=Object.keys(s.weapons).filter(k=>s.weapons[k]>=8&&s.passives[WEAPONS[k].pair]>0&&!s.evolved[k]&&s.pendingChest?.spawnTime>=600);if(eligible.length){const k=eligible[Math.floor(rng(s)*eligible.length)];s.evolved[k]=true;s.lastReward=WEAPONS[k].evolution;}else {const pool=[];for(const [kind,defs,owned]of [['weapon',WEAPONS,s.weapons],['passive',PASSIVES,s.passives]])for(const k of Object.keys(owned))if(owned[k]<defs[k].maxLevel)pool.push({id:`${kind}:${k}`,key:k,kind,name:defs[k].name,level:owned[k]+1});if(pool.length){const c=pool[Math.floor(rng(s)*pool.length)];applyUpgrade(s,c);}else s.lastReward='Gold cache';}s.gold+=25+Math.floor(rng(s)*26);s.pendingChest=null;s.phase='playing';levelCheck(s);return true;}
function projectile(s,kind,x,y,vx,vy,damage,extra={}){s.projectiles.push({id:id(s),kind,type:kind,x,y,vx,vy,damage,radius:.16,life:2.5,pierce:1,hit:[],...extra});}
// Rank deltas transcribed from the individual weapon pages at vampire.survivors.wiki.
// Sizes and velocities use this game's world units, not the original game's pixels.
export const WEAPON_LEVELS = {
 whip:{damage:[10,10,15,20,25,30,35,40],amount:[1,2,2,2,2,2,2,2],area:[1,1,1,1.1,1.1,1.2,1.2,1.2],cooldown:[1.35]},
 wand:{damage:[10,10,10,10,20,20,20,30],amount:[1,2,2,3,3,4,4,4],cooldown:[1.2,1.2,1,1,1,1,1,1],pierce:[1,1,1,1,1,1,2,2]},
 knife:{damage:[6.5,6.5,11.5,11.5,11.5,11.5,16.5,16.5],amount:[1,2,3,4,4,5,6,6],cooldown:[1],pierce:[1,1,1,1,2,2,2,3],interval:[.1,.1,.1,.08,.08,.06,.06,.04]},
 garlic:{damage:[5,7,8,9,11,12,13,15],area:[1,1.4,1.4,1.6,1.6,1.8,1.8,2],cooldown:[1.3,1.3,1.2,1.2,1.1,1.1,1,1]},
 axe:{damage:[20,20,40,40,40,60,60,80],amount:[1,2,2,2,3,3,3,3],cooldown:[4],pierce:[3,3,3,5,5,5,7,7]},
 bible:{damage:[10,10,10,20,20,20,30,30],amount:[1,2,2,2,3,3,3,4],area:[1,1,1.25,1.25,1.25,1.5,1.5,1.5],speed:[1,1,1.3,1.3,1.3,1.6,1.6,1.6],cooldown:[3],duration:[3,3,3,3.5,3.5,3.5,4,4]},
};
export function weaponStats(s,key){
 const table=WEAPON_LEVELS[key];if(!table)return null;
 const rank=clamp((s.weapons[key]||1)-1,0,7),st=stats(s),out={amount:1,area:1,pierce:1,interval:.1,duration:3,speed:1};
 for(const [field,values]of Object.entries(table))out[field]=values[Math.min(rank,values.length-1)];
 out.baseDuration=out.duration;if(key==='axe')out.area*=1.3;out.damage*=st.damage;out.area*=st.area;out.cooldown*=st.cooldown;out.duration*=st.duration;out.speed*=st.speed;
 if(key==='garlic')out.radius=1.5*out.area;
 return out;
}
function attack(s,k,l,st){
 const p=s.player,w=weaponStats(s,k),ev=s.evolved[k];let cooldown=w.cooldown;
 if(k==='whip'){
  for(let i=0;i<w.amount;i++){
   const sign=i%2===0?1:-1,x=p.x+(p.horizontalFacing||1)*1.1*sign,y=p.y-Math.floor((i+1)/2)*.35;
   s.zones.push({id:id(s),kind:k,type:k,x,y,radius:1.6*w.area,area:w.area,life:.2,maxLife:.2,delay:i*.1,damage:w.damage,heal:ev,hit:false});
  }
 }
 if(k==='wand'){
  if(ev)cooldown=.14*st.cooldown;
  let nearest=null,d=Infinity;for(const e of s.enemies){const n=distance(e,p);if(e.hp>0&&n<d){d=n;nearest=e;}}
  if(nearest){const a=Math.atan2(nearest.y-p.y,nearest.x-p.x);for(let i=0;i<w.amount;i++)projectile(s,k,p.x,p.y,Math.cos(a)*8*w.speed,Math.sin(a)*8*w.speed,w.damage,{delay:i*.1,pierce:ev?3:w.pierce,radius:.15*w.area,knockback:3});}
 }
 if(k==='knife'){
  if(ev)cooldown=.13*st.cooldown;
  const a=Math.atan2(p.facingY,p.facingX);
  for(let i=0;i<w.amount;i++)projectile(s,k,p.x,p.y,Math.cos(a)*10*w.speed,Math.sin(a)*10*w.speed,w.damage,{delay:i*w.interval,pierce:w.pierce,knockback:2,radius:.13*w.area});
 }
 if(k==='axe'){
  if(ev){for(let i=0;i<8;i++)projectile(s,k,p.x,p.y,Math.cos(i*TAU/8)*6*w.speed,Math.sin(i*TAU/8)*6*w.speed,w.damage,{pierce:999,radius:.4*w.area,knockback:6});}
  else for(let i=0;i<w.amount;i++)projectile(s,k,p.x,p.y,(i-(w.amount-1)/2)*2.5*w.speed,-6*w.speed,w.damage,{delay:i*.2,gravity:6,pierce:w.pierce,radius:.32*w.area,life:3,knockback:6});
 }
 if(k==='bible'){
  // Base duration is part of the cycle; bonus duration extends uptime, allowing overlap.
  cooldown=w.baseDuration+w.cooldown;
  for(let i=0;i<w.amount;i++)s.zones.push({id:id(s),kind:k,type:k,x:p.x,y:p.y,radius:.33*w.area,orbitRadius:2*w.area,orbitSpeed:2.4*w.speed,angle:i*TAU/w.amount,life:ev?999999:w.duration,damage:w.damage});
  if(ev)cooldown=999999;
 }
 if(k==='garlic'){
  cooldown=1/60;
  for(const e of s.enemies)if(distance(e,p)<w.radius+e.radius&&(e.hitCooldowns.garlic??-1)<=s.realTime){hurt(s,e,w.damage,ev);e.knockbackBonus=.3;e.hitCooldowns.garlic=s.realTime+w.cooldown;}
 }
 s.timers[k]=cooldown;
}

class Grid{constructor(items){this.cells=new Map();for(const e of items){const key=`${Math.floor(e.x/2)},${Math.floor(e.y/2)}`;if(!this.cells.has(key))this.cells.set(key,[]);this.cells.get(key).push(e);}}near(x,y,r){const out=[];for(let a=Math.floor((x-r)/2);a<=Math.floor((x+r)/2);a++)for(let b=Math.floor((y-r)/2);b<=Math.floor((y+r)/2);b++)out.push(...(this.cells.get(`${a},${b}`)||[]));return out;}}
function step(s,input,dt){s.realTime+=dt;s.time=Math.min(1800,s.time+dt*(s.mode==='quick'?5:1));const p=s.player,st=stats(s);p.auraRadius=s.weapons.garlic?weaponStats(s,'garlic').radius:0;const ix=clamp(finite(input.x),-1,1),iy=clamp(finite(input.y),-1,1),mag=Math.hypot(ix,iy);if(mag>0){const norm=Math.max(1,mag);p.x+=ix/norm*4*(s.character==='ranger'?1.15:1)*(1+.05*s.powerups.haste)*dt;p.y+=iy/norm*4*(s.character==='ranger'?1.15:1)*(1+.05*s.powerups.haste)*dt;p.facingX=ix/mag;p.facingY=iy/mag;if(ix!==0)p.horizontalFacing=Math.sign(ix);}p.invulnerable=Math.max(0,p.invulnerable-dt);p.hp=Math.min(p.maxHp,p.hp+dt*((s.passives.pummarola||0)*.2+(s.character==='keeper'?.3:0)));
 if(s.time>=1800&&!s.deathReached){s.deathReached=true;s.enemies=[];spawnEnemy(s,'death',p.x+8,p.y);effect(s,'death',p.x,p.y,12,2);}
 if(!s.deathReached){s.spawnTimer-=dt;if(s.spawnTimer<=0){s.spawnTimer=Math.max(.09,.6-s.time/4000);const count=1+Math.floor(s.time/240);for(let i=0;i<count;i++)spawnEnemy(s,s.time%180>120?'golem':s.time%120>60?'skeleton':'bat');}if(s.time>=s.nextBoss){spawnEnemy(s,'boss');s.nextBoss+=60;}if(s.realTime>=s.nextProp){s.nextProp+=18;const a=rng(s)*TAU,k=['chicken','coin','vacuum','freeze'][Math.floor(rng(s)*4)];s.loot.push({id:id(s),kind:k,type:k,x:p.x+Math.cos(a)*5,y:p.y+Math.sin(a)*5,radius:.3});}}
 for(const e of s.enemies){if(e.hp<=0)continue;
 for(const key of Object.keys(e.hitCooldowns))if(e.hitCooldowns[key]<=s.realTime)delete e.hitCooldowns[key];
 let d=distance(e,p);
 if(d>28&&e.kind!=='death'){const a=rng(s)*TAU;e.x=p.x+Math.cos(a)*17;e.y=p.y+Math.sin(a)*17;d=17;e.knockVX=0;e.knockVY=0;}
 if(s.realTime>=s.freezeUntil){e.x+=(e.knockVX||0)*dt;e.y+=(e.knockVY||0)*dt;e.knockVX=(e.knockVX||0)*Math.exp(-12*dt);e.knockVY=(e.knockVY||0)*Math.exp(-12*dt);}
 if(s.realTime>=s.freezeUntil||e.kind==='death'){if(d>0){e.x+=(p.x-e.x)/d*e.speed*dt;e.y+=(p.y-e.y)/d*e.speed*dt;}}if(d<e.radius+p.radius&&p.invulnerable<=0){p.hp-=e.damage;p.invulnerable=.65;effect(s,'damage',p.x,p.y,.7,.3);}}
 for(const [k,l]of Object.entries(s.weapons)){s.timers[k]=(s.timers[k]||0)-dt;if(s.timers[k]<=0)attack(s,k,l,st);}
 const grid=new Grid(s.enemies.filter(e=>e.hp>0));for(const b of s.projectiles){if(b.delay>0){b.delay-=dt;continue;}b.life-=dt;b.vy+=(b.gravity||0)*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;for(const e of grid.near(b.x,b.y,b.radius+1)){if(e.hp<=0||b.hit.includes(e.id)||distance(b,e)>b.radius+e.radius)continue;hurt(s,e,b.damage);knockback(s,e,b.knockback||0,b.vx,b.vy);b.hit.push(e.id);if(--b.pierce<=0){b.life=0;break;}}}
 for(const z of s.zones){if(z.delay>0){z.delay-=dt;continue;}z.life-=dt;if(z.kind==='whip'&&!z.hit){z.hit=true;for(const e of s.enemies)if(Math.abs(e.x-z.x)<1.7*z.area+e.radius&&Math.abs(e.y-z.y)<.55*z.area+e.radius){hurt(s,e,z.damage,z.heal);knockback(s,e,5);}}if(z.kind==='bible'){z.angle+=(z.orbitSpeed||2.4)*dt;z.x=p.x+Math.cos(z.angle)*z.orbitRadius;z.y=p.y+Math.sin(z.angle)*z.orbitRadius;for(const e of grid.near(z.x,z.y,z.radius+1))if(distance(z,e)<z.radius+e.radius&&(e.hitCooldowns[z.id]??-1)<=s.realTime){hurt(s,e,z.damage);knockback(s,e,5);e.hitCooldowns[z.id]=s.realTime+1.7;}}}
 s.projectiles=s.projectiles.filter(b=>b.life>0).slice(-500);s.zones=s.zones.filter(z=>z.life>0);for(const f of s.effects)f.life-=dt;s.effects=s.effects.filter(f=>f.life>0).slice(-180);s.enemies=s.enemies.filter(e=>e.hp>0);
 for(const g of s.gems){const d=distance(g,p);if(g.magnet||d<st.pickup){g.magnet=true;const speed=12*dt;if(d<speed+.35){s.xp+=g.value;g.collected=true;}else{g.x+=(p.x-g.x)/d*speed;g.y+=(p.y-g.y)/d*speed;}}}s.gems=s.gems.filter(g=>!g.collected);
 for(const l of s.loot){if(distance(l,p)>(l.kind==='chest'?.75:st.pickup))continue;l.collected=true;if(l.kind==='coin')s.gold+=5;else if(l.kind==='chicken')p.hp=Math.min(p.maxHp,p.hp+30);else if(l.kind==='vacuum')s.gems.forEach(g=>g.magnet=true);else if(l.kind==='freeze')s.freezeUntil=s.realTime+10;else if(l.kind==='chest'){s.pendingChest=l;s.phase='chest';break;}}s.loot=s.loot.filter(l=>!l.collected).slice(-100);
 if(p.hp<=0){p.hp=0;s.phase='dead';}else if(s.phase==='playing')levelCheck(s);
}
/** Fixed 60Hz simulation. Long background-frame gaps are capped at 250ms. */
export function tick(s,input={x:0,y:0},dt=1/60){if(s.phase!=='playing')return s;s._accumulator+=clamp(finite(dt),0,.25);let n=0;while(s._accumulator>=1/60-1e-10&&s.phase==='playing'&&n++<16){s._accumulator-=1/60;step(s,input,1/60);}if(s.phase!=='playing')s._accumulator=0;return s;}
