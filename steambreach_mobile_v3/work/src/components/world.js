/* ============================================================
   HEXOVERRIDE — mock network world for the map prototype.
   Deterministic (seeded) so layout is stable across reloads.
   Coordinate space: 1600 x 1000 logical units.
   ============================================================ */
(function () {
  // --- tiny seeded PRNG (mulberry32) ---
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rand = rng(20260602);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const octet = () => Math.floor(rand() * 254) + 1;

  const NODES = [];
  const id = (s) => s;

  // org name pools (from the game's agents.js)
  const NAMES = {
    startup:     ['NovaTech Solutions', 'BrightPath Digital', 'Apex Micro', 'CloudNine Labs', 'DataPulse Inc'],
    smallbiz:    ['Greenfield Consulting', 'Metro Legal Group', 'Sunrise Healthcare', 'Pinnacle Realty', 'Harbor Financial'],
    personal:    ['home-network', 'macbook-pro-7f', 'public-wifi-04', 'smart-hub-x', 'desktop-pc-22'],
    corporation: ['Meridian Systems', 'Atlas Defense Grp', 'Vanguard Biotech', 'Sentinel Networks', 'Ironclad Ind.'],
    government:  ['Regional Transit Auth', 'State Health Dept', 'Municipal Water Bd', 'County Records', 'Port Authority'],
    military:    ['NORTHCOM Relay', 'Naval Intel Archive', 'CYBERCOM Staging', 'DIA Regional Hub', 'NSA Collection Pt'],
    financial:   ['Goldman-Sterling', 'Blackrock Vault', 'Fed Reserve Node 7', 'SWIFT Relay GW', 'Deutsche Clearing'],
    classified:  ['ECHELON Substation', 'LOOKING GLASS', 'UMBRA Relay', 'STELLAR WIND', 'PRISM Node'],
  };
  const usedNames = {};
  function nameFor(type) {
    usedNames[type] = usedNames[type] || [];
    const pool = NAMES[type].filter(n => !usedNames[type].includes(n));
    const n = (pool.length ? pick(pool) : pick(NAMES[type]));
    usedNames[type].push(n);
    return n;
  }

  // place members around a cluster center
  function scatter(cx, cy, radius) {
    const a = rand() * Math.PI * 2;
    const r = radius * (0.35 + rand() * 0.65);
    return { x: Math.round(cx + Math.cos(a) * r), y: Math.round(cy + Math.sin(a) * r) };
  }

  const GATEWAY = { x: 800, y: 510 };

  // subnet definitions: label, region, cluster center, members [{type,tier,state,...}]
  const SUBNETS = [
    {
      key: 'fed', label: '10.10.x — FEDERAL GRID', region: 'us-gov',
      cx: 360, cy: 250, prefix: () => `10.10.${octet()}`,
      root: { type: 'government', tier: 'high', state: 'idle' },
      members: [
        { type: 'government', tier: 'mid', state: 'idle' },
        { type: 'military',   tier: 'high', state: 'infected', owner: 'player' },
        { type: 'military',   tier: 'high', state: 'detected' },
        { type: 'classified', tier: 'elite', state: 'idle', core: true, contract: true },
        { type: 'government', tier: 'mid', state: 'spreading', owner: 'player' },
      ],
    },
    {
      key: 'corp', label: '192.168.0.x — CORPORATE LAN', region: 'eu-central',
      cx: 1210, cy: 235, prefix: () => `192.168.${octet()}`,
      root: { type: 'corporation', tier: 'mid', state: 'infected', owner: 'player' },
      members: [
        { type: 'startup',     tier: 'low', state: 'looted' },
        { type: 'startup',     tier: 'low', state: 'dead' },
        { type: 'corporation', tier: 'high', state: 'injecting' },
        { type: 'corporation', tier: 'mid', state: 'infected', owner: 'player' },
        { type: 'smallbiz',    tier: 'low', state: 'idle' },
      ],
    },
    {
      key: 'dark', label: '172.16.x — DARKNET MESH', region: 'ru-darknet',
      cx: 300, cy: 770, prefix: () => `172.16.${octet()}`,
      root: { type: 'smallbiz', tier: 'mid', state: 'idle' },
      members: [
        { type: 'personal', tier: 'low', state: 'looted' },
        { type: 'personal', tier: 'low', state: 'idle' },
        { type: 'smallbiz', tier: 'mid', state: 'quarantined' },
        { type: 'startup',  tier: 'low', state: 'infected', owner: 'player' },
      ],
    },
    {
      key: 'fin', label: '203.0.x — FINANCE RING', region: 'cn-financial',
      cx: 1250, cy: 760, prefix: () => `203.0.${octet()}`,
      root: { type: 'financial', tier: 'high', state: 'idle', owner: 'rival' },
      members: [
        { type: 'financial',   tier: 'high', state: 'idle', owner: 'rival', fortified: true },
        { type: 'financial',   tier: 'elite', state: 'idle', contract: true, core: true, owner: 'rival' },
        { type: 'corporation', tier: 'mid', state: 'idle', contract: true },
        { type: 'financial',   tier: 'high', state: 'idle' },
      ],
    },
  ];

  // local first-hop machines near gateway
  const LOCALS = [
    { type: 'personal', tier: 'low', state: 'looted' },
    { type: 'personal', tier: 'low', state: 'idle' },
  ];

  let counter = 0;
  function makeNode(spec, x, y, parentId, subnet) {
    const ip = (subnet && subnet.prefix) ? subnet.prefix() : `${octet()}.${octet()}.${octet()}.${octet()}`;
    const nid = 'n' + (counter++);
    NODES.push({
      id: nid, ip,
      name: spec.type === 'personal' ? nameFor('personal') : nameFor(spec.type),
      type: spec.type, tier: spec.tier, state: spec.state || 'idle',
      owner: spec.owner || null, fortified: !!spec.fortified,
      core: !!spec.core, contract: !!spec.contract,
      discovered: spec.discovered !== false,
      x, y, parentId, subnet: subnet ? subnet.key : 'local',
      region: subnet ? subnet.region : 'local',
    });
    return nid;
  }

  // build subnets
  SUBNETS.forEach(sn => {
    const rootId = makeNode(sn.root, sn.cx, sn.cy, 'gateway', sn);
    sn.members.forEach(m => {
      const p = scatter(sn.cx, sn.cy, 175);
      makeNode(m, p.x, p.y, rootId, sn);
    });
  });
  // locals
  LOCALS.forEach((m, i) => {
    const x = GATEWAY.x + (i === 0 ? -150 : 170);
    const y = GATEWAY.y - 120 - i * 30;
    makeNode(m, x, y, 'gateway', null);
  });

  // proxy chain — relabel a few existing nodes into an active tunnel
  // tunnel: gateway -> corp root -> a fed node (the exit) currently being hacked
  const corpRoot = NODES.find(n => n.subnet === 'corp' && n.parentId === 'gateway');
  const darkRoot = NODES.find(n => n.subnet === 'dark' && n.parentId === 'gateway');
  const proxyOrder = [corpRoot, darkRoot].filter(Boolean);
  proxyOrder.forEach((n, i) => { n.proxyHop = i + 1; });

  // active hacking target (the SOC trace is tracing this one)
  const target = NODES.find(n => n.subnet === 'fed' && n.state === 'detected');
  if (target) target.activeTarget = true;

  // ============================================================
  // RIVALS LAYER — hacker NPCs as fortified C2 cores + outposts
  // ============================================================
  const ARCH = {
    SKIDDIE:      { name: 'Skiddie',      rank: 1, tier: 'low',   outposts: 2 },
    GREY_HAT:     { name: 'Grey Hat',     rank: 2, tier: 'mid',   outposts: 3 },
    BLACK_HAT:    { name: 'Black Hat',    rank: 3, tier: 'high',  outposts: 3 },
    APT_OPERATOR: { name: 'APT Operator', rank: 4, tier: 'high',  outposts: 4 },
    LEGEND:       { name: 'Legend',       rank: 5, tier: 'elite', outposts: 4 },
  };

  // status: hostile | neutral | allied | destroyed
  const RIVAL_DEFS = [
    { handle: 'Gh0stReap3r', arch: 'BLACK_HAT',    status: 'hostile',  rep: 312, btc: 84200,  zd: 5, top: 'EPIC',      vuln: 'msfconsole', rel: -45, cx: 150,  cy: 510, contract: 'TAKEDOWN' },
    { handle: 'Nu11_V01d',   arch: 'GREY_HAT',     status: 'neutral',  rep: 128, btc: 19400,  zd: 3, top: 'RARE',      vuln: 'sqlmap',     rel: 28,  cx: 800,  cy: 215 },
    { handle: 'Daemon404',   arch: 'APT_OPERATOR', status: 'allied',   rep: 540, btc: 271000, zd: 7, top: 'LEGENDARY', vuln: 'hydra',      rel: 72,  cx: 1470, cy: 505 },
    { handle: 'V0idDr4g0n',  arch: 'LEGEND',       status: 'hostile',  rep: 980, btc: 1240000,zd: 11,top: 'MYTHIC',    vuln: 'curl',       rel: -80, cx: 790,  cy: 880, contract: null },
    { handle: 'ByteWraith',  arch: 'SKIDDIE',      status: 'destroyed',rep: 22,  btc: 0,      zd: 0, top: null,        vuln: 'hydra',      rel: 0,   cx: 480,  cy: 850 },
  ];

  const RIVALS = [];
  RIVAL_DEFS.forEach((rv, ri) => {
    const a = ARCH[rv.arch];
    const rid = 'rival_' + ri;
    const rivMeta = {
      id: rid, handle: rv.handle, arch: rv.arch, archName: a.name, rank: a.rank,
      status: rv.status, rep: rv.rep, btc: rv.btc, zd: rv.zd, top: rv.top,
      vuln: rv.vuln, rel: rv.rel, contract: rv.contract || null, cx: rv.cx, cy: rv.cy,
    };
    RIVALS.push(rivMeta);

    const core = {
      id: 'n' + (counter++), ip: `${octet()}.${octet()}.${octet()}.${octet()}`,
      name: `${rv.handle}'s C2`, type: 'criminal', tier: a.tier,
      state: rv.status === 'destroyed' ? 'dead' : 'idle',
      owner: rv.status === 'allied' ? 'player' : (rv.status === 'destroyed' ? null : 'rival'),
      fortified: rv.status !== 'destroyed', core: true,
      contract: !!rv.contract, discovered: true,
      x: rv.cx, y: rv.cy, parentId: 'gateway', subnet: 'rival_' + ri, region: 'rival',
      rivalId: rid, rivalCore: true, rivalStatus: rv.status, threat: rv.status === 'hostile',
    };
    NODES.push(core);

    const n = rv.status === 'destroyed' ? 1 : a.outposts;
    for (let i = 0; i < n; i++) {
      const p = scatter(rv.cx, rv.cy, 120);
      NODES.push({
        id: 'n' + (counter++), ip: `${octet()}.${octet()}.${octet()}.${octet()}`,
        name: `${rv.handle} · Outpost ${i + 1}`, type: 'criminal',
        tier: i === 0 && a.rank >= 3 ? 'mid' : 'low',
        state: rv.status === 'destroyed' ? 'dead' : 'idle',
        owner: rv.status === 'allied' ? 'player' : (rv.status === 'destroyed' ? null : 'rival'),
        fortified: false, core: false, discovered: true,
        x: p.x, y: p.y, parentId: core.id, subnet: 'rival_' + ri, region: 'rival',
        rivalId: rid, rivalCore: false, rivalStatus: rv.status,
      });
    }
  });

  window.GameWorld = {
    nodes: NODES,
    gateway: GATEWAY,
    subnets: SUBNETS.map(s => ({ key: s.key, label: s.label, region: s.region, cx: s.cx, cy: s.cy })),
    rivals: RIVALS,
    proxyChain: proxyOrder.map(n => n.id),
    targetId: target ? target.id : null,
    bounds: { w: 1600, h: 1000 },
    stats: {
      trace: 62,
      heat: 38,
      region: 'us-gov',
      rep: 340,
      botnet: NODES.filter(n => (n.state === 'infected' || n.owner === 'player') && !n.rivalId).length,
      money: 184250,
    },
  };
})();
