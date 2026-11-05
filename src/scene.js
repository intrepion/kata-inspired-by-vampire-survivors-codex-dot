import * as THREE from 'three';

// All visual assets are generated here. Gameplay stays in the independent simulation.
const scratch = new THREE.Object3D();
const color = new THREE.Color();
const hash = (x, y, salt = 0) => { const n = Math.sin(x * 127.1 + y * 311.7 + salt * 74.7) * 43758.5453; return n - Math.floor(n); };

export function createScene(container) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }); }
  catch { throw new Error('Nightfall needs WebGL. Please enable hardware acceleration or try a recent browser.'); }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;
  renderer.setClearColor(0x091416);
  renderer.domElement.className = 'game-canvas';
  renderer.domElement.setAttribute('aria-label', 'Nightfall Reliquary: three-dimensional moonlit cemetery battlefield');
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x091b1c, 0.014);
  const camera = new THREE.OrthographicCamera(-20, 20, 13, -13, 0.1, 140);
  const ambient = new THREE.HemisphereLight(0xb4e4dd, 0x172824, 2.2);
  scene.add(ambient);
  const moon = new THREE.DirectionalLight(0xb8d5f1, 3.0);
  moon.position.set(-15, 28, -12); scene.add(moon);
  const warm = new THREE.DirectionalLight(0xeebd76, 0.8); warm.position.set(10, 8, 14); scene.add(warm);
  const geometries = [], materials = [], textures = [];
  const geo = g => { geometries.push(g); return g; };
  const mat = (c, options = {}) => { const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.94, ...options }); materials.push(m); return m; };
  const basic = (c, options = {}) => { const m = new THREE.MeshBasicMaterial({ color: c, ...options }); materials.push(m); return m; };
  const box = geo(new THREE.BoxGeometry(1, 1, 1));
  const sphere = geo(new THREE.IcosahedronGeometry(1, 0));
  const diamond = geo(new THREE.OctahedronGeometry(1, 0));
  const cylinder = geo(new THREE.CylinderGeometry(1, 1, 1, 8));
  const cone = geo(new THREE.ConeGeometry(1, 1, 7));
  const plane = geo(new THREE.PlaneGeometry(1, 1));
  const ringGeo = geo(new THREE.TorusGeometry(1, 0.025, 4, 64));
  const stone = mat(0x53635d), darkStone = mat(0x263e36), gold = mat(0xd5ac60, { metalness: 0.55, roughness: 0.35 });
  const skin = mat(0xcfbd9b), bone = mat(0xb4baa3), coat = mat(0x293b45), black = mat(0x142629);
  const red = mat(0x94414d), moss = mat(0x445a3c), ghoul = mat(0x6d8372), bat = mat(0x454354);
  const cyan = mat(0x78dce4, { emissive: 0x29a9c6, emissiveIntensity: 0.85, metalness: 0.3, roughness: 0.25 });
  const flame = basic(0xffd394), white = basic(0xd7faf4);
  function mesh(g, m, parent = scene, position = [0, 0, 0], scale = [1, 1, 1]) {
    const o = new THREE.Mesh(g, m); o.position.set(...position); o.scale.set(...scale); parent.add(o); return o;
  }
  function pool(g, m, capacity = 1800) {
    const defaultTint = m.color.getHex(), instanceMaterial = m.clone();
    instanceMaterial.color.set(0xffffff); materials.push(instanceMaterial);
    const o = new THREE.InstancedMesh(g, instanceMaterial, capacity); o.count = 0; o.frustumCulled = false;
    o.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(o);
    return { o, n: 0, capacity,
      put(x, h, z, sx = 1, sy = sx, sz = sx, angle = 0, tint) {
        if (this.n >= capacity) return;
        scratch.position.set(x, h, z); scratch.scale.set(sx, sy, sz); scratch.rotation.set(0, angle, 0); scratch.updateMatrix();
        o.setMatrixAt(this.n, scratch.matrix); o.setColorAt(this.n, color.set(tint ?? defaultTint)); this.n++;
      },
      done() { o.count = this.n; o.instanceMatrix.needsUpdate = true; if (o.instanceColor) o.instanceColor.needsUpdate = true; this.n = 0; },
    };
  }
  const glowCanvas = document.createElement('canvas'); glowCanvas.width = glowCanvas.height = 64;
  const ctx = glowCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(32, 32, 1, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255,255,255,.8)'); gradient.addColorStop(0.25, 'rgba(255,255,255,.3)'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64);
  const glowTex = new THREE.CanvasTexture(glowCanvas); textures.push(glowTex);
  const glowMaterial = basic(0xffffff, { map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  const floorPlane = geo(new THREE.PlaneGeometry(1, 1)); floorPlane.rotateX(-Math.PI / 2);
  const glowPool = pool(floorPlane, glowMaterial, 1200);
  const shadowPool = pool(geo(new THREE.CircleGeometry(1, 16).rotateX(-Math.PI / 2)), basic(0x051411, { transparent: true, opacity: 0.4, depthWrite: false }), 2000);
  const ground = mesh(floorPlane, mat(0x213d32), scene, [0, -0.08, 0], [240, 240, 240]);
  const tilePool = pool(box, darkStone, 2500), grassPool = pool(cone, moss, 5000);
  const gravePool = pool(box, stone, 500), graveTopPool = pool(box, stone, 500), graveBasePool = pool(box, darkStone, 500);
  const candlePool = pool(cylinder, mat(0xa99a74), 400), flamePool = pool(diamond, flame, 400);
  let terrainKey = '';
  const permanentFlames = [];
  function terrain(px, py) {
    const cx = Math.floor(px / 8), cy = Math.floor(py / 8), key = `${cx},${cy}`;
    if (key === terrainKey) return; terrainKey = key; permanentFlames.length = 0;
    ground.position.set(px, -0.08, py);
    for (let ix = cx - 5; ix <= cx + 5; ix++) for (let iz = cy - 5; iz <= cy + 5; iz++) {
      const x = ix * 8, z = iz * 8, n = hash(ix, iz);
      // Broken stone paths cross a forest-green churchyard, without imposing collision.
      for (let t = 0; t < 10; t++) {
        const tx = x + hash(ix, iz, t + 1) * 8 - 4, tz = z + hash(iz, ix, t + 25) * 8 - 4;
        const path = Math.abs(tx % 18) < 2.1 || Math.abs(tz % 22) < 2.0;
        if (path || t < 2) tilePool.put(tx, -0.04, tz, 0.8 + hash(ix, iz, t + 50), 0.08, 0.75 + hash(ix, iz, t + 80), hash(ix, iz, t + 90) * 0.25, path ? 0x344b40 : 0x2a4437);
      }
      for (let t = 0; t < 24; t++) {
        const gx = x + hash(ix, iz, t + 120) * 8 - 4, gz = z + hash(iz, ix, t + 170) * 8 - 4;
        if (Math.abs(gx % 18) < 1.7 || Math.abs(gz % 22) < 1.7) continue;
        const h = 0.12 + hash(ix, iz, t + 200) * 0.35;
        grassPool.put(gx, h * .35, gz, .11, h, .09, t, t % 3 ? 0x3a5136 : 0x536747);
      }
      if (n > 0.2 && Math.hypot(x, z) > 5) {
        const gx = x + (n - .5) * 4, gz = z + (hash(iz, ix) - .5) * 4, angle = (hash(ix, iz, 9) - .5) * .35;
        gravePool.put(gx, .53, gz, .75, 1.04, .25, angle);
        graveTopPool.put(gx, 1.09, gz, .88, .16, .32, angle);
        graveBasePool.put(gx, .08, gz + .48, 1.14, .18, 1.7, angle);
        // A simple inset cross on each weathered headstone.
        graveBasePool.put(gx, .65, gz + .14, .08, .5, .025, angle);
        graveBasePool.put(gx, .75, gz + .14, .32, .08, .025, angle);
        if (n > .64) {
          candlePool.put(gx + .62, .22, gz + .18, .08, .4, .08);
          permanentFlames.push({x: gx + .62, y: gz + .18, h: .5});
        }
      }
    }
    tilePool.done(); grassPool.done(); gravePool.done(); graveTopPool.done(); graveBasePool.done(); candlePool.done();
  }
  const ritual = new THREE.Group(); scene.add(ritual);
  const ritualMat = basic(0x71876b, { transparent: true, opacity: .36 });
  [2.3, 2.45, 3.15].forEach(r => { const o = mesh(ringGeo, ritualMat, ritual, [0, .015, 0], [r, r, r]); o.rotation.x = -Math.PI / 2; });
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; const o = mesh(box, ritualMat, ritual, [Math.sin(a) * 2.8, .02, Math.cos(a) * 2.8], [.035, .015, .22]); o.rotation.y = a; }
  const hero = new THREE.Group(); scene.add(hero);
  mesh(cone, coat, hero, [0, .61, 0], [.43, .91, .33]);
  mesh(box, black, hero, [-.15, .17, .02], [.17, .35, .24]); mesh(box, black, hero, [.15, .17, .02], [.17, .35, .24]);
  mesh(sphere, skin, hero, [0, 1.23, 0], [.23, .26, .23]);
  mesh(cylinder, black, hero, [0, 1.44, 0], [.41, .08, .34]); mesh(cone, black, hero, [0, 1.61, 0], [.26, .36, .24]);
  mesh(box, red, hero, [0, 1.02, .22], [.38, .14, .09]); mesh(box, gold, hero, [0, .67, .29], [.13, .13, .04]);
  mesh(box, coat, hero, [-.37, .8, 0], [.16, .55, .18]); mesh(box, coat, hero, [.37, .8, 0], [.16, .55, .18]);
  mesh(cylinder, gold, hero, [.5, .51, .05], [.045, 1.05, .045]);
  mesh(diamond, flame, hero, [.5, 1.1, .05], [.13, .19, .13]);
  const heroLight = new THREE.PointLight(0xffce87, 4.5, 6, 2); heroLight.position.set(0, 1.7, 0); hero.add(heroLight);
  const heroRing = mesh(ringGeo, basic(0xebd7a3, { transparent: true, opacity: .75 }), scene, [0, .035, 0], [.62, .62, .62]); heroRing.rotation.x = -Math.PI / 2;
  const bodies = pool(cone, ghoul), heads = pool(sphere, bone), limbs = pool(box, bone, 5000), eyes = pool(sphere, basic(0xf48a70), 3600);
  const wings = pool(box, bat, 3000), batBodies = pool(sphere, bat), bossBodies = pool(cone, red, 100);
  const gems = pool(diamond, cyan, 3000), lootBoxes = pool(box, gold, 150), lootLids = pool(box, black, 150);
  const bolts = pool(sphere, white, 1200), axes = pool(box, gold, 600), books = pool(box, red, 400);
  const effectRings = pool(geo(new THREE.TorusGeometry(1, .035, 4, 48).rotateX(-Math.PI / 2)), basic(0xbce6cc, { transparent: true, opacity: .65, depthWrite: false }), 200);
  const whipGeo = geo(new THREE.TorusGeometry(1, .022, 4, 36, Math.PI * 1.35)); whipGeo.rotateX(-Math.PI / 2);
  const whips = pool(whipGeo, basic(0xffdf9c, { transparent: true, opacity: .9, depthWrite: false }), 200);
  let elapsed = 0, lastPx = 0, lastPy = 0, cameraX = 0, cameraY = 0;
  const motes = pool(sphere, basic(0xe5d5a3, { transparent: true, opacity: .45 }), 80);
  function resize() {
    const width = Math.max(1, container.clientWidth), height = Math.max(1, container.clientHeight), aspect = width / height;
    const span = aspect < 1 ? 25 : 24;
    camera.left = -span * aspect / 2; camera.right = span * aspect / 2; camera.top = span / 2; camera.bottom = -span / 2;
    camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
  }
  function render(state = {}, dt = 0.016) {
    elapsed += Math.min(dt || .016, .1);
    const p = state.player || { x: 0, y: 0 }, px = p.x || 0, py = p.y || 0;
    terrain(px, py);
    const follow = 1 - Math.exp(-Math.max(dt, .016) * 9);
    cameraX += (px - cameraX) * follow; cameraY += (py - cameraY) * follow;
    camera.position.set(cameraX, 31, cameraY + 22); camera.lookAt(cameraX, 0, cameraY);
    const moving = Math.hypot(px - lastPx, py - lastPy) > .001; lastPx = px; lastPy = py;
    hero.position.set(px, moving ? Math.abs(Math.sin(elapsed * 14)) * .055 : 0, py);
    if ((p.facingX || p.facingY) && moving) hero.rotation.y = Math.atan2(p.facingX, p.facingY);
    hero.visible = state.phase !== 'dead' || Math.sin(elapsed * 7) > -.3;
    heroRing.position.set(px, .035, py);
    glowPool.put(px, .02, py, 3.3, 1, 3.3, 0, 0x796540);
    shadowPool.put(px, .012, py, .55, 1, .4);
    for (const f of permanentFlames) {
      const flicker = 1 + Math.sin(elapsed * 8 + f.x) * .12;
      flamePool.put(f.x, f.h, f.y, .065, .16 * flicker, .065);
      glowPool.put(f.x, .03, f.y, 2.5, 1, 2.5, 0, 0xb07932);
    }
    flamePool.done();
    for (const e of state.enemies || []) {
      const x = e.x, z = e.y, kind = String(e.kind || e.type || ''), r = e.radius || .38;
      if (Math.abs(x-px) > 38 || Math.abs(z-py) > 33) continue;
      const a = Math.atan2(px-x, py-z), phase = elapsed * 8 + (Number(e.id) || x), bob = Math.sin(phase) * .035;
      const isBat = /bat|swarm/.test(kind), boss = /boss|elite|reaper|death/.test(kind) || e.elite || e.boss;
      const hit = e.hitFlash > 0 || e.flash > 0;
      shadowPool.put(x, .016, z, r * 1.2, 1, r * .75);
      if (isBat) {
        batBodies.put(x, .75 + bob * 3, z, r*.55, r*.6, r*.8, a, hit ? 0xffffff : 0x555264);
        for (const side of [-1, 1]) wings.put(x + Math.cos(a) * side * r * .9, .79 + Math.sin(phase * 1.5) * .17, z - Math.sin(a) * side * r * .9, r * 1.6, .055, r * .72, a + side * .3);
        eyes.put(x + Math.sin(a) * r*.4, .84, z + Math.cos(a)*r*.4, .055, .05, .055);
      } else {
        const size = boss ? r / .38 : Math.max(.8, r / .38), skeletal = /skeleton|bone/.test(kind);
        (boss ? bossBodies : bodies).put(x, .42 * size + bob, z, .34 * size, .76 * size, .29 * size, a, hit ? 0xeeeecc : boss ? 0x723d4d : skeletal ? 0x788579 : 0x526950);
        heads.put(x, .91 * size + bob, z, .21 * size, .25 * size, .2 * size, a, hit ? 0xffffff : skeletal ? 0xc3c3a5 : boss ? 0xba9f8d : 0x85987a);
        for (const side of [-1, 1]) {
          const dx = Math.cos(a) * side, dz = -Math.sin(a) * side;
          limbs.put(x + dx * .32 * size, .54 * size + bob, z + dz * .32 * size, .10*size, .43*size, .11*size, a);
          eyes.put(x + Math.sin(a)*.18*size + dx*.075*size, .94*size+bob, z+Math.cos(a)*.18*size+dz*.075*size, .035*size, .035*size, .035*size);
        }
        if (boss) glowPool.put(x, .028, z, size*1.8, 1, size*1.8, 0, 0x8e283e);
      }
    }
    bodies.done(); heads.done(); limbs.done(); eyes.done(); wings.done(); batBodies.done(); bossBodies.done();
    for (const g of state.gems || []) {
      if (Math.abs(g.x-px)>35 || Math.abs(g.y-py)>30) continue;
      const value = g.value || g.xp || 1, tint = value >= 20 ? 0xf08886 : value >= 5 ? 0x74cda1 : 0x75cde1, s = value >= 20 ? .19 : .13;
      gems.put(g.x, .2 + Math.sin(elapsed*2+g.x)*.035, g.y, s, s*1.4, s, elapsed*.7, tint);
      glowPool.put(g.x, .024, g.y, .85, 1, .85, 0, tint);
    }
    gems.done();
    for (const l of state.loot || []) {
      const kind = String(l.kind || l.type || 'chest');
      if (/chest/.test(kind)) {
        lootBoxes.put(l.x,.28,l.y,.65,.42,.45,0,0xd5ac60); lootLids.put(l.x,.42,l.y,.5,.14,.47); glowPool.put(l.x,.03,l.y,2.5,1,2.5,0,0xc99a4f);
      } else {
        lootBoxes.put(l.x,.2,l.y,.26,.28,.26,elapsed, /food|chicken|heal/.test(kind) ? 0xf0ac79 : 0xe3cd74);
        glowPool.put(l.x,.03,l.y,1.6,1,1.6,0,0xc6a95c);
      }
    }
    lootBoxes.done(); lootLids.done();
    for (const q of state.projectiles || []) {
      const kind = String(q.kind || q.type || q.weapon || ''), a = q.angle ?? Math.atan2(q.vx || 0, q.vy || 1), r = q.radius || .15;
      if (/axe|scythe/.test(kind)) {
        axes.put(q.x,.65,q.y,.13,.08,.75,elapsed*14); bolts.put(q.x,.66,q.y,.22,.08,.32,elapsed*14,0xe6d4a1);
      } else if (/bible|book/.test(kind)) {
        books.put(q.x,.7,q.y,.28,.12,.36,a); bolts.put(q.x,.77,q.y,.2,.025,.27,a,0xe2c69a);
      } else if (/knife/.test(kind)) {
        axes.put(q.x,.6,q.y,.055,.055,.55,a); glowPool.put(q.x,.04,q.y,.65,1,.65,0,0xaab8d5);
      } else {
        bolts.put(q.x,.55,q.y,r*.8,.09,r*2.2,a,/fire/.test(kind)?0xffba73:0xc3d9ff);
        glowPool.put(q.x,.04,q.y,1.1,1,1.1,0,/fire/.test(kind)?0xda7c36:0x849de1);
      }
    }
    const auraRadius = Number(p.auraRadius || 0);
    if (auraRadius > 0) {
      const r = auraRadius;
      const evolved = state.evolved?.garlic;
      glowPool.put(px,.035,py,r*2.45,1,r*2.45,0,evolved ? 0x85c6ad : 0x77905b);
      effectRings.put(px,.055,py,r,1,r,elapsed*.1,evolved ? 0xc2efdc : 0xa4bc81);
      for (let i=0;i<8;i++) { const a=elapsed*.4+i*Math.PI/4; bolts.put(px+Math.cos(a)*r,.15+Math.sin(elapsed*2+i)*.07,py+Math.sin(a)*r,.035,.035,.035,0,0xbdd6a2); }
    }
    for (const q of state.zones || []) {
      if (q.delay > 0) continue;
      const kind = String(q.kind || q.type || q.weapon || ''), r = q.radius || q.r || 1, x = q.x ?? px, y = q.y ?? py;
      if (/bible|book/.test(kind)) {
        books.put(x,.65,y,.28,.12,.36,q.angle || elapsed, state.evolved?.bible ? 0x7976b5 : 0x94414d);
        bolts.put(x,.72,y,.2,.025,.27,q.angle || elapsed,0xe2c69a);
        glowPool.put(x,.03,y,1,1,1,0,0x9e8a53);
      } else if (/whip|slash/.test(kind)) {
        const facing = Math.sign(x - px) || p.horizontalFacing || 1;
        const progress = 1 - Math.max(0, q.life / (q.maxLife || .2));
        whips.put(x,.4 + Math.sin(progress * Math.PI) * .1,y,r,1,.55 * (q.area || 1),q.angle ?? (facing < 0 ? Math.PI : 0),state.evolved?.whip ? 0xf38c98 : 0xffd29c);
      } else {
        glowPool.put(x,.025,y,r*2.3,1,r*2.3,0,0x6f79b4);
        effectRings.put(x,.07,y,r,1,r,elapsed*.1,0xb6b4f0);
      }
    }
    for (const q of state.effects || []) {
      const kind = String(q.kind || q.type || q.weapon || ''), r = q.radius || q.r || q.range || 1.5;
      if (/whip|slash/.test(kind)) whips.put(q.x ?? px,.48,q.y ?? py,r,1,r,q.angle ?? (p.horizontalFacing < 0 ? Math.PI : 0),0xffd29c);
      else if (/explosion|nova|ring|hit|level/.test(kind)) effectRings.put(q.x ?? px,.12,q.y ?? py,r,1,r,0,/hit/.test(kind)?0xb15c5c:0xefd5a3);
    }
    bolts.done(); axes.done(); books.done(); effectRings.done(); whips.done();
    for (let i=0;i<50;i++) {
      const x = cameraX + Math.sin(i*12.98)*26 + Math.sin(elapsed*.12+i)*.8;
      const z = cameraY + Math.cos(i*7.73)*22 + Math.cos(elapsed*.15+i)*.8;
      motes.put(x,.4+hash(i,3)*2+Math.sin(elapsed+i)*.2,z,.018,.018,.018);
    }
    motes.done(); glowPool.done(); shadowPool.done();
    renderer.render(scene, camera);
  }
  const observer = new ResizeObserver(resize); observer.observe(container); resize();
  function dispose() {
    observer.disconnect(); geometries.forEach(g=>g.dispose()); materials.forEach(m=>m.dispose()); textures.forEach(t=>t.dispose());
    scene.traverse(o=>{ if (o.isInstancedMesh) o.dispose(); }); renderer.dispose(); renderer.domElement.remove();
  }
  return { render, resize, dispose, canvas: renderer.domElement, renderer, scene, camera };
}
