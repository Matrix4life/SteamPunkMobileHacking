// ═══════════════════════════════════════════════════════════════
// HEXOVERRIDE — RIG PARTS, SOFTWARE, COMMODITIES & BTC MARKET
// Unified economy: everything priced in satoshis (sats)
// 100,000,000 sats = 1 BTC
// ═══════════════════════════════════════════════════════════════

export function formatBTC(amount) {
  if (amount === 0) return '₿0';
  const abs = Math.abs(amount), sign = amount < 0 ? '-' : '';
  if (abs >= 1000000) return `${sign}₿${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${sign}₿${Math.floor(abs).toLocaleString()}`;
  return `${sign}₿${abs.toLocaleString()}`;
}

export function generateBTCPrice(prev) {
  const p = prev || 1.0;
  return Math.round(Math.max(0.4, Math.min(2.2, p + (1.0 - p) * 0.08 + (Math.random() - 0.5) * 0.25)) * 100) / 100;
}

export function btcTrend(idx) {
  if (idx >= 1.8) return { text: 'PRICES SURGING — seller market',   color: '#ffd866', icon: '▲▲' };
  if (idx >= 1.4) return { text: 'PRICES UP — high demand',          color: '#a9dc76', icon: '▲▲' };
  if (idx >= 1.1) return { text: 'Market trending up',               color: '#a9dc76', icon: '▲' };
  if (idx >= 0.9) return { text: 'Market stable',                    color: '#727072', icon: '─' };
  if (idx >= 0.7) return { text: 'PRICES DROPPING — buyer market',   color: '#fc9867', icon: '▼' };
  if (idx >= 0.5) return { text: 'FIRE SALE — prices crashing',      color: '#ff6188', icon: '▼▼' };
  return              { text: 'MARKET COLLAPSED — everything cheap',  color: '#ff6188', icon: '☠' };
}

// ─── GENERATIONS ──────────────────────────────────────────────
export const GENS = {
  GEN2: { id:'GEN2', label:'GEN-2', color:'#727072', tier:2 },
  GEN3: { id:'GEN3', label:'GEN-3', color:'#78dce8', tier:3 },
  GEN4: { id:'GEN4', label:'GEN-4', color:'#a9dc76', tier:4 },
  GEN5: { id:'GEN5', label:'GEN-5', color:'#ffd866', tier:5 },
  XGEN: { id:'XGEN', label:'X-GEN', color:'#ab9df2', tier:0 },
};

// ─── REAL-WORLD MANUFACTURERS ─────────────────────────────────
// Brands that span multiple slots get same-maker synergy bonus
// AMD: CPU+GPU | INTEL: CPU+NET | CORSAIR: RAM+PSU+COOL+CASE
// NVIDIA: GPU | SAMSUNG: SSD+RAM | NZXT: CASE+COOL | SEASONIC: PSU
export const MAKERS = {
  AMD:     { id:'AMD',     name:'AMD',              color:'#ff6188' },
  INTEL:   { id:'INTEL',   name:'Intel',             color:'#78dce8' },
  NVIDIA:  { id:'NVIDIA',  name:'NVIDIA',            color:'#a9dc76' },
  CORSAIR: { id:'CORSAIR', name:'Corsair',           color:'#ffd866' },
  SAMSUNG: { id:'SAMSUNG', name:'Samsung',           color:'#3b82f6' },
  NZXT:    { id:'NZXT',    name:'NZXT',              color:'#ab9df2' },
  SEASONIC:{ id:'SEASONIC',name:'Seasonic',          color:'#727072' },
  NOCTUA:  { id:'NOCTUA',  name:'Noctua',            color:'#b08050' },
  WD:      { id:'WD',      name:'Western Digital',   color:'#4a90d9' },
  LIANLI:  { id:'LIANLI',  name:'Lian Li',           color:'#c0c0c0' },
  GSKILL:  { id:'GSKILL',  name:'G.Skill',           color:'#fc9867' },
  EKWB:    { id:'EKWB',    name:'EK Water Blocks',   color:'#5e9ed6' },
  MELLANOX:{ id:'MELLANOX',name:'Mellanox',           color:'#00a99d' },
};

export const HW_SLOTS = ['cpu','gpu','ram','ssd','psu','cool','net','case'];
export const SLOTS = HW_SLOTS;
export const ALL_TABS = ['cpu','gpu','ram','ssd','psu','cool','net','case','software','commodities'];
export const TAB_LABELS = { cpu:'CPU',gpu:'GPU',ram:'RAM',ssd:'SSD',psu:'PSU',cool:'COOL',net:'NET',case:'CASE',software:'SOFTWARE',commodities:'TRADE' };
export const SLOT_LABELS = TAB_LABELS;

const COMPAT_PAIRS = [['cpu','ram'],['cpu','gpu'],['gpu','psu'],['gpu','cool'],['ram','ssd'],['cpu','cool']];

// ═══════════════════════════════════════════════════════════════
// PARTS DATABASE — real products, basePrice in sats
// ═══════════════════════════════════════════════════════════════
const p = (id,name,slot,gen,maker,stats,basePrice,vol,rarity,power,desc) =>
  ({id,name,slot,gen,maker,stats,basePrice,volatility:vol,rarity,power,desc,type:'hardware'});

export const PARTS_DB = [
  // ─── CPU ──────────────────────────────────────────────────
  p('cpu_i3_10100',  'Intel Core i3-10100',       'cpu','GEN2','INTEL', {clock:1.0,threads:4},  3000,  0.3, 'common',   65,'4C/8T Comet Lake. Starter chip.'),
  p('cpu_r3_3100',   'AMD Ryzen 3 3100',          'cpu','GEN2','AMD',   {clock:1.2,threads:4},  3500,  0.3, 'common',   65,'4C/8T Zen 2. Budget warrior.'),
  p('cpu_i5_10400',  'Intel Core i5-10400',       'cpu','GEN2','INTEL', {clock:1.4,threads:6},  6000,  0.25,'common',   65,'6C/12T. Solid entry-level.'),
  p('cpu_r5_5600x',  'AMD Ryzen 5 5600X',         'cpu','GEN3','AMD',   {clock:1.8,threads:6},  18000,  0.25,'common',   65,'6C/12T Zen 3. The sweet spot.'),
  p('cpu_i5_12600k', 'Intel Core i5-12600K',      'cpu','GEN3','INTEL', {clock:1.9,threads:10},  22000,  0.25,'common',  125,'10C/16T Alder Lake hybrid.'),
  p('cpu_r7_5800x3d','AMD Ryzen 7 5800X3D',       'cpu','GEN3','AMD',   {clock:2.0,threads:8},  32000,  0.3, 'uncommon',105,'8C/16T V-Cache. Gaming king.'),
  p('cpu_i7_13700k', 'Intel Core i7-13700K',      'cpu','GEN4','INTEL', {clock:2.4,threads:16},  55000,  0.3, 'uncommon',125,'16C/24T Raptor Lake.'),
  p('cpu_r7_7800x3d','AMD Ryzen 7 7800X3D',       'cpu','GEN4','AMD',   {clock:2.5,threads:8},  68000,  0.3, 'uncommon',120,'8C/16T Zen 4 V-Cache.'),
  p('cpu_r9_7950x',  'AMD Ryzen 9 7950X',         'cpu','GEN4','AMD',   {clock:2.8,threads:16},  95000,  0.35,'rare',    170,'16C/32T Zen 4 flagship.'),
  p('cpu_i9_14900k', 'Intel Core i9-14900K',      'cpu','GEN4','INTEL', {clock:2.9,threads:24},  90000,  0.35,'rare',    253,'24C/32T Raptor Lake refresh.'),
  p('cpu_r9_9950x',  'AMD Ryzen 9 9950X',         'cpu','GEN5','AMD',   {clock:3.4,threads:16},  220000,  0.4, 'rare',    170,'16C/32T Zen 5. Next-gen IPC.'),
  p('cpu_i9_arrow',  'Intel Core Ultra 9 285K',   'cpu','GEN5','INTEL', {clock:3.2,threads:24},  240000,  0.4, 'rare',    125,'24C Arrow Lake. Efficiency.'),
  p('cpu_tr_7980x',  'AMD Threadripper 7980X',    'cpu','GEN5','AMD',   {clock:3.8,threads:64},  380000,  0.45,'legendary',350,'64C/128T. Server-class.'),
  p('cpu_epyc_9654', 'AMD EPYC 9654',             'cpu','XGEN','AMD',   {clock:4.0,threads:96},  750000,  0.6, 'legendary',360,'96C/192T Genoa. Datacenter.'),

  // ─── GPU ──────────────────────────────────────────────────
  p('gpu_1650',     'NVIDIA GeForce GTX 1650',      'gpu','GEN2','NVIDIA',{cores:1.0,vram:4},  4000,  0.35,'common',  75,'4GB. Entry-level mining.'),
  p('gpu_1660s',    'NVIDIA GeForce GTX 1660 Super', 'gpu','GEN2','NVIDIA',{cores:1.4,vram:6},  8000,  0.3, 'common', 125,'6GB. Reliable budget miner.'),
  p('gpu_rx580',    'AMD Radeon RX 580',             'gpu','GEN2','AMD',   {cores:1.2,vram:8},  6000,  0.3, 'common', 185,'8GB. Classic mining card.'),
  p('gpu_3060',     'NVIDIA GeForce RTX 3060',       'gpu','GEN3','NVIDIA',{cores:1.8,vram:12},  22000,  0.3, 'common', 170,'12GB. Great hash per watt.'),
  p('gpu_3070',     'NVIDIA GeForce RTX 3070',       'gpu','GEN3','NVIDIA',{cores:2.2,vram:8},  35000,  0.3, 'common', 220,'8GB. Sweet spot for cracking.'),
  p('gpu_6800xt',   'AMD Radeon RX 6800 XT',        'gpu','GEN3','AMD',   {cores:2.0,vram:16},  38000,  0.35,'uncommon',300,'16GB. Massive VRAM buffer.'),
  p('gpu_3080',     'NVIDIA GeForce RTX 3080',       'gpu','GEN3','NVIDIA',{cores:2.5,vram:12},  58000,  0.35,'uncommon',320,'12GB. Mining + cracking.'),
  p('gpu_4070ti',   'NVIDIA GeForce RTX 4070 Ti',   'gpu','GEN4','NVIDIA',{cores:2.8,vram:12},  78000,  0.35,'uncommon',285,'12GB Ada Lovelace.'),
  p('gpu_7900xtx',  'AMD Radeon RX 7900 XTX',       'gpu','GEN4','AMD',   {cores:3.0,vram:24},  85000,  0.4, 'rare',   355,'24GB RDNA 3. AMD flagship.'),
  p('gpu_4080s',    'NVIDIA GeForce RTX 4080 Super', 'gpu','GEN4','NVIDIA',{cores:3.2,vram:16},  100000,  0.4, 'rare',   320,'16GB. High-end cracking.'),
  p('gpu_4090',     'NVIDIA GeForce RTX 4090',       'gpu','GEN4','NVIDIA',{cores:3.8,vram:24},  160000,  0.4, 'rare',   450,'24GB. The absolute unit.'),
  p('gpu_5090',     'NVIDIA GeForce RTX 5090',       'gpu','GEN5','NVIDIA',{cores:4.2,vram:32},  250000,  0.45,'rare',   400,'32GB Blackwell. Next-gen.'),
  p('gpu_5090d',    'NVIDIA RTX 5090 NVLink Duo',   'gpu','GEN5','NVIDIA',{cores:4.8,vram:64},  420000,  0.5, 'legendary',600,'64GB dual-GPU. Insane.'),
  p('gpu_h100',     'NVIDIA H100 SXM5',             'gpu','XGEN','NVIDIA',{cores:5.0,vram:80},  900000,  0.6, 'legendary',700,'80GB HBM3. Datacenter AI.'),

  // ─── RAM ──────────────────────────────────────────────────
  p('ram_val_4g',   'Kingston ValueRAM 4GB DDR4',    'ram','GEN2','CORSAIR',{size:4,speed:1.0},  2000,  0.2, 'common',  5,'2133MHz. Bare minimum.'),
  p('ram_ven_8g',   'Corsair Vengeance 8GB DDR4',    'ram','GEN2','CORSAIR',{size:8,speed:1.2},  4500,  0.2, 'common',  8,'2400MHz. Gets it done.'),
  p('ram_rip_16g',  'G.Skill Ripjaws V 16GB DDR4',  'ram','GEN3','GSKILL', {size:16,speed:1.6},  14000,  0.25,'common', 12,'3200MHz. Standard issue.'),
  p('ram_ven_16e',  'Corsair ECC 16GB DDR4',         'ram','GEN3','CORSAIR',{size:16,speed:1.5},  18000,  0.2, 'common', 14,'Error-correcting. Stable.'),
  p('ram_ven_32g',  'Corsair Vengeance 32GB DDR4',   'ram','GEN3','CORSAIR',{size:32,speed:1.9},  28000,  0.25,'uncommon',15,'3600MHz. Comfortable.'),
  p('ram_tri_32g',  'G.Skill Trident Z5 32GB DDR5',  'ram','GEN4','GSKILL',{size:32,speed:2.4},  45000,  0.3, 'uncommon',18,'5600MHz DDR5.'),
  p('ram_dom_32g',  'Corsair Dominator 32GB DDR5',   'ram','GEN4','CORSAIR',{size:32,speed:2.5},  52000,  0.3, 'uncommon',18,'6000MHz. Premium.'),
  p('ram_tri_64g',  'G.Skill Trident Z5 RGB 64GB',  'ram','GEN4','GSKILL', {size:64,speed:2.8},  82000,  0.35,'rare',    22,'6400MHz. 3 proxy slots.'),
  p('ram_dom_64g',  'Corsair Dominator Titanium 64GB','ram','GEN5','CORSAIR',{size:64,speed:3.2},  145000,  0.4, 'rare',    25,'7200MHz. Overclocked.'),
  p('ram_dom_128g', 'Corsair Dominator 128GB DDR5',  'ram','GEN5','CORSAIR',{size:128,speed:3.6},  260000,  0.45,'legendary',30,'8000MHz. 5 proxy slots.'),
  p('ram_hbm_256g', 'Samsung HBM3E 256GB',           'ram','XGEN','SAMSUNG',{size:256,speed:4.0},  600000,  0.55,'legendary',20,'High Bandwidth Memory.'),

  // ─── SSD ──────────────────────────────────────────────────
  p('ssd_wd_250',   'WD Blue 250GB SATA',           'ssd','GEN2','WD',     {capacity:256,iops:1.0},  1500,  0.2, 'common', 3,'SATA III. Spins faster than HDD.'),
  p('ssd_sam_500',  'Samsung 870 EVO 500GB',        'ssd','GEN2','SAMSUNG',{capacity:512,iops:1.2},  3000,  0.2, 'common', 5,'Reliable SATA workhorse.'),
  p('ssd_sam_1tb',  'Samsung 970 EVO Plus 1TB',     'ssd','GEN3','SAMSUNG',{capacity:1000,iops:1.8},  12000,  0.25,'common', 8,'NVMe Gen3. Big speed jump.'),
  p('ssd_wd_1tb',   'WD Black SN770 1TB',           'ssd','GEN3','WD',     {capacity:1000,iops:1.6},  10000,  0.2, 'common', 7,'Budget NVMe daily driver.'),
  p('ssd_sam_2tb',  'Samsung 980 PRO 2TB',          'ssd','GEN3','SAMSUNG',{capacity:2000,iops:2.0},  22000,  0.25,'uncommon',10,'Gen3 flagship.'),
  p('ssd_sam_2tb4', 'Samsung 990 PRO 2TB',          'ssd','GEN4','SAMSUNG',{capacity:2000,iops:2.8},  42000,  0.3, 'uncommon',12,'Gen4. 7450 MB/s reads.'),
  p('ssd_wd_4tb',   'WD Black SN850X 4TB',          'ssd','GEN4','WD',     {capacity:4000,iops:3.0},  60000,  0.35,'rare',   14,'Gen4 flagship. Massive.'),
  p('ssd_sam_4tb5', 'Samsung 990 EVO Plus 4TB',     'ssd','GEN5','SAMSUNG',{capacity:4000,iops:4.0},  130000,  0.4,'rare',   18,'Gen5. 14,500 MB/s reads.'),
  p('ssd_sam_8tb',  'Samsung PM1743 8TB',           'ssd','GEN5','SAMSUNG',{capacity:8000,iops:4.5},  240000,  0.45,'legendary',22,'Enterprise Gen5.'),
  p('ssd_sam_16tb', 'Samsung PM9D3a 16TB',          'ssd','XGEN','SAMSUNG',{capacity:16000,iops:5.0},  550000,  0.55,'legendary',12,'Enterprise max capacity.'),

  // ─── PSU ──────────────────────────────────────────────────
  p('psu_evga_400', 'EVGA 400 N1',                  'psu','GEN2','CORSAIR', {wattage:400,eff:0.72},  2500,  0.2, 'common',  0,'400W. No 80+ rating.'),
  p('psu_cor_550',  'Corsair CV550 Bronze',          'psu','GEN2','CORSAIR', {wattage:550,eff:0.76},  5000,  0.2, 'common',  0,'550W Bronze. Entry gaming.'),
  p('psu_cor_650',  'Corsair RM650 Gold',            'psu','GEN3','CORSAIR', {wattage:650,eff:0.82},  15000,  0.2, 'common',  0,'650W Gold. Fully modular.'),
  p('psu_ss_650',   'Seasonic Focus GX-650',         'psu','GEN3','SEASONIC',{wattage:650,eff:0.84},  19000,  0.2, 'common',  0,'650W Gold. Dead silent.'),
  p('psu_cor_750',  'Corsair RM750x Gold',           'psu','GEN3','CORSAIR', {wattage:750,eff:0.85},  22000,  0.25,'uncommon',0,'750W Gold. Zero RPM mode.'),
  p('psu_ss_850',   'Seasonic Prime TX-850',         'psu','GEN4','SEASONIC',{wattage:850,eff:0.89},  40000,  0.3, 'uncommon',0,'850W Titanium. 12yr warranty.'),
  p('psu_cor_1000', 'Corsair HX1000i Platinum',      'psu','GEN4','CORSAIR', {wattage:1000,eff:0.91},  62000,  0.3,'rare',    0,'1000W Platinum. iCUE.'),
  p('psu_ss_1300',  'Seasonic Prime TX-1300',        'psu','GEN5','SEASONIC',{wattage:1300,eff:0.94},  120000,  0.35,'rare',   0,'1300W Titanium. 4090 ready.'),
  p('psu_cor_1600', 'Corsair AX1600i Titanium',      'psu','GEN5','CORSAIR', {wattage:1600,eff:0.96},  200000,  0.4,'legendary',0,'1600W Digital PSU.'),
  p('psu_ss_2200',  'Seasonic PRIME 2200W',          'psu','XGEN','SEASONIC',{wattage:2200,eff:0.98},  480000,  0.5,'legendary',0,'Mining rig PSU. Absolute unit.'),

  // ─── COOLING ──────────────────────────────────────────────
  p('cool_intl_stk','Intel Stock Cooler',            'cool','GEN2','INTEL',  {tdp:65,type:'air'},  1500,  0.15,'common', 5,'Box cooler. It tries.'),
  p('cool_cm_212',  'Cooler Master Hyper 212',       'cool','GEN2','NOCTUA', {tdp:95,type:'air'},  4000,  0.2, 'common', 8,'Budget tower legend.'),
  p('cool_cor_h60', 'Corsair H60 120mm AIO',         'cool','GEN3','CORSAIR',{tdp:150,type:'liquid'},  15000,  0.25,'common',12,'Entry AIO. Quiet.'),
  p('cool_noc_l12', 'Noctua NH-L12S',               'cool','GEN3','NOCTUA', {tdp:130,type:'air'},  12000,  0.2, 'common', 8,'Low-profile. ITX builds.'),
  p('cool_cor_h100','Corsair H100i Elite 240mm',     'cool','GEN3','CORSAIR',{tdp:200,type:'liquid'},  25000,  0.25,'uncommon',15,'240mm AIO. Great value.'),
  p('cool_noc_d15', 'Noctua NH-D15 chromax',        'cool','GEN4','NOCTUA', {tdp:250,type:'air'},  35000,  0.25,'uncommon',14,'Dual-tower king.'),
  p('cool_nzxt_x73','NZXT Kraken X73 360mm',        'cool','GEN4','NZXT',   {tdp:300,type:'liquid'},  48000,  0.3,'uncommon',20,'360mm LCD pump head.'),
  p('cool_cor_h170','Corsair H170i Elite 420mm',     'cool','GEN4','CORSAIR',{tdp:400,type:'liquid'},  80000,  0.35,'rare',   25,'420mm. Massive radiator.'),
  p('cool_ek_loop', 'EK Quantum Custom Loop',       'cool','GEN5','EKWB',   {tdp:500,type:'liquid'},  180000,  0.4,'legendary',35,'Full custom hardline.'),
  p('cool_ek_imm',  'EK Immersion Cooling Tank',    'cool','XGEN','EKWB',   {tdp:600,type:'cryo'},  400000,  0.5,'legendary',20,'Full submersion cooling.'),

  // ─── NETWORK ──────────────────────────────────────────────
  p('net_rtl_1g',   'Realtek RTL8111 1GbE',          'net','GEN2','INTEL',  {bandwidth:1,latency:0.8},  2000,  0.15,'common', 3,'Onboard 1G. Standard.'),
  p('net_int_i225', 'Intel I225-V 2.5GbE',           'net','GEN2','INTEL',  {bandwidth:2,latency:0.7},  5000,  0.2, 'common', 5,'2.5G onboard.'),
  p('net_int_ax210','Intel AX210 WiFi 6E',           'net','GEN3','INTEL',  {bandwidth:2,latency:0.6},  10000,  0.2,'common', 6,'WiFi 6E tri-band.'),
  p('net_mel_cx3',  'Mellanox ConnectX-3 10GbE',     'net','GEN3','MELLANOX',{bandwidth:3,latency:0.5},  18000,  0.25,'common',8,'10G SFP+. Server NIC.'),
  p('net_int_x550', 'Intel X550-T2 10GbE',           'net','GEN3','INTEL',  {bandwidth:4,latency:0.4},  35000,  0.3,'uncommon',12,'Dual-port 10G copper.'),
  p('net_int_e810', 'Intel E810 25GbE',              'net','GEN4','INTEL',  {bandwidth:5,latency:0.3},  55000,  0.3,'uncommon',15,'25G Ice Lake NIC.'),
  p('net_mel_cx5',  'Mellanox ConnectX-5 25GbE',     'net','GEN4','MELLANOX',{bandwidth:7,latency:0.2},  95000,  0.35,'rare',  18,'25G RDMA. Ultra-low lat.'),
  p('net_int_800',  'Intel E830 100GbE',             'net','GEN5','INTEL',  {bandwidth:8,latency:0.15},  180000,  0.4,'rare',  22,'100G Ethernet.'),
  p('net_mel_cx6',  'Mellanox ConnectX-6 100GbE',    'net','GEN5','MELLANOX',{bandwidth:10,latency:0.1},  350000,  0.45,'legendary',30,'100G InfiniBand.'),
  p('net_mel_cx7',  'Mellanox ConnectX-7 400GbE',    'net','XGEN','MELLANOX',{bandwidth:10,latency:0.05},  700000,  0.55,'legendary',15,'400G datacenter.'),

  // ─── CASE ─────────────────────────────────────────────────
  p('case_cm_q300', 'Cooler Master Q300L',           'case','GEN2','NZXT',  {airflow:1.0,style:0},  1000,  0.1, 'common', 0,'Micro-ATX budget box.'),
  p('case_nzxt_510','NZXT H510',                     'case','GEN2','NZXT',  {airflow:1.3,style:2},  3000,  0.15,'common', 0,'Clean design. Tight airflow.'),
  p('case_frac_mesh','Fractal Meshify C',            'case','GEN3','LIANLI',{airflow:2.0,style:3},  12000,  0.2, 'common', 0,'Mesh front. Great thermals.'),
  p('case_cor_4000','Corsair 4000D Airflow',          'case','GEN3','CORSAIR',{airflow:2.2,style:3},  14000,  0.2,'common', 0,'Airflow king. Clean cables.'),
  p('case_nzxt_h7', 'NZXT H7 Flow',                  'case','GEN3','NZXT',  {airflow:2.0,style:4},  18000,  0.2, 'uncommon',0,'Perforated top panel.'),
  p('case_ll_o11',  'Lian Li O11 Dynamic EVO',       'case','GEN4','LIANLI',{airflow:1.8,style:7},  28000,  0.25,'uncommon',0,'Dual-chamber showcase.'),
  p('case_cor_5000','Corsair 5000T RGB',              'case','GEN4','CORSAIR',{airflow:2.0,style:6},  35000,  0.25,'uncommon',0,'RGB fans included.'),
  p('case_ll_v3',   'Lian Li Lancool III',            'case','GEN4','LIANLI',{airflow:2.5,style:5},  25000,  0.25,'uncommon',0,'Mesh everything.'),
  p('case_nzxt_h9', 'NZXT H9 Elite',                 'case','GEN5','NZXT',  {airflow:2.2,style:8},  60000,  0.3, 'rare',    0,'Dual-glass showpiece.'),
  p('case_ll_desk', 'Lian Li DK-05 Desk Case',       'case','GEN5','LIANLI',{airflow:2.5,style:9},  120000,  0.35,'legendary',0,'Your desk IS the case.'),
  p('case_inwin_z', 'InWin Z-Tower',                 'case','XGEN','LIANLI',{airflow:3.0,style:10},  300000,  0.5,'legendary',0,'Zinc alloy sculpture.'),
];

// ═══════════════════════════════════════════════════════════════
// SOFTWARE
// ═══════════════════════════════════════════════════════════════
const sw = (id,name,stats,basePrice,rarity,repReq,desc,repeatable) =>
  ({id,name,slot:'software',gen:null,maker:null,stats,basePrice,volatility:0.15,rarity,power:0,desc,type:'software',repReq:repReq||0,repeatable:repeatable||false});

export const SOFTWARE_DB = [
  sw('sw_crypter','FUD Crypter',{effect:'av_bypass'},  10000, 'common',0,'Evades low-sec AV.',false),
  sw('sw_nse','NSE Scripts',{effect:'sec_levels'},  25000, 'common',0,'SEC levels on map hover.',false),
  sw('sw_dpi','Deep Packet Inspector',{effect:'ettercap'},  35000, 'uncommon',25,'Unlocks ettercap.',false),
  sw('sw_proxy','Proxychains',{effect:'proxy_cap_3'},  50000, 'uncommon',50,'Proxy chain 2→3.',false),
  sw('sw_tor','TOR Relay Network',{effect:'proxy_cap_4'},  120000, 'rare',150,'Proxy chain 3→4.',false),
  sw('sw_bribe','Bribe SOC Insider',{effect:'heat_minus_50'},  5000, 'common',0,'Instant -50% HEAT.',true),
  sw('sw_decoy','Decoy Packet Flooder',{effect:'trace_slow'},  20000, 'common',10,'Slow trace +20% for 60s.',true),
  sw('sw_zeroday','0-Day Exploit Pack',{effect:'bypass_sec'},  80000, 'rare',75,'Bypass any SEC once.',true),
  sw('sw_vpn','Stealth VPN Chain',{effect:'heat_resist'},  40000, 'uncommon',30,'Heat gains -25%.',false),
  sw('sw_rootkit','Polymorphic Rootkit',{effect:'persist_bonus'},  60000, 'rare',60,'Beacons 50% stealthier.',false),
  sw('sw_ai','AI Cracking Assistant',{effect:'hash_speed'},  150000, 'legendary',100,'ML-accelerated hashcat.',false),
];

// ═══════════════════════════════════════════════════════════════
// COMMODITIES
// ═══════════════════════════════════════════════════════════════
export const COMMODITIES = {
  ssn_fullz: {
  name: 'SSN Fullz',desc: 'Full identity packages',base: 60,vol: 40},
  cc_dumps:  {name:'CC Dumps',         base:100,   vol:50,  desc:'Stolen credit card data'},
  botnets:   {name:'Botnet Access',    base:300,  vol:200, desc:'Zombie net rentals'},
  exploits:  {name:'Exploit Kits',     base:1500, vol:800, desc:'Pre-packaged vuln tools'},
  zerodays:  {name:'Weaponized 0-Days',base:25000,vol:15000,desc:'Unpatched vuln exploits'},
  ransomkeys:{name:'Ransom Decryptors',base:5000, vol:4000,desc:'Keys from paid ransoms'},
  identities:{name:'Synthetic IDs',    base:750,  vol:500, desc:'Deepfake identity packages'},
};

// ═══════════════════════════════════════════════════════════════
// INDEXES
// ═══════════════════════════════════════════════════════════════
export const PARTS_BY_ID = {};
PARTS_DB.forEach(x => { PARTS_BY_ID[x.id] = x; });
SOFTWARE_DB.forEach(x => { PARTS_BY_ID[x.id] = x; });
export const PARTS_BY_SLOT = {};
HW_SLOTS.forEach(s => { PARTS_BY_SLOT[s] = PARTS_DB.filter(x => x.slot === s); });
PARTS_BY_SLOT.software = SOFTWARE_DB;

// ═══════════════════════════════════════════════════════════════
// SYNERGY
// ═══════════════════════════════════════════════════════════════
function genDist(g1,g2) {
  if (!g1||!g2) return 0;
  if (g1==='XGEN'||g2==='XGEN') return -1;
  return Math.abs((GENS[g1]?.tier||0)-(GENS[g2]?.tier||0));
}
export function calculateSynergy(rig) {
  let score=0; const details=[];
  for (const [a,b] of COMPAT_PAIRS) {
    const pA=rig[a]?PARTS_BY_ID[rig[a]]:null, pB=rig[b]?PARTS_BY_ID[rig[b]]:null;
    if (!pA||!pB) continue;
    const d=genDist(pA.gen,pB.gen); let ps,lb;
    if (d===-1)                          {ps=1;lb='XGEN';}
    else if (d===0&&pA.maker===pB.maker) {ps=3;lb='PERFECT';}
    else if (d===0)                      {ps=2;lb='MATCHED';}
    else if (d===1)                      {ps=0;lb='NEUTRAL';}
    else if (d===2)                      {ps=-2;lb='BOTTLENECK';}
    else                                 {ps=-4;lb='SEVERE';}
    score+=ps; details.push({slotA:a,slotB:b,pairScore:ps,label:lb});
  }
  const cas=rig.case?PARTS_BY_ID[rig.case]:null;
  if(cas)score+=Math.floor(cas.stats.airflow);
  let rating,mult,color;
  if(score>=16){rating='S';mult=1.30;color='#ffd866';}
  else if(score>=10){rating='A';mult=1.15;color='#a9dc76';}
  else if(score>=4){rating='B';mult=1.00;color='#78dce8';}
  else if(score>=0){rating='C';mult=0.90;color='#fc9867';}
  else{rating='D';mult=0.75;color='#ff6188';}
  return {score,rating,multiplier:mult,color,details};
}

// ═══════════════════════════════════════════════════════════════
// POWER BUDGET
// ═══════════════════════════════════════════════════════════════
export function calculatePowerBudget(rig) {
  let draw=0,pW=0,pE=0.70;
  HW_SLOTS.forEach(s=>{const x=rig[s]?PARTS_BY_ID[rig[s]]:null;if(!x)return;if(s==='psu'){pW=x.stats.wattage;pE=x.stats.eff;}else draw+=x.power;});
  return {totalDraw:draw,psuWattage:pW,psuEff:pE,headroom:pW-draw,stable:pW>=draw,utilPct:pW>0?Math.round(draw/pW*100):0};
}

// ═══════════════════════════════════════════════════════════════
// GAMEPLAY EFFECTS
// ═══════════════════════════════════════════════════════════════
export function getRigEffects(rig) {
  const syn=calculateSynergy(rig),pow=calculatePowerBudget(rig);
  const m=syn.multiplier,st=pow.stable?1:0.6;
  const cpu=rig.cpu?PARTS_BY_ID[rig.cpu]:null,gpu=rig.gpu?PARTS_BY_ID[rig.gpu]:null;
  const ram=rig.ram?PARTS_BY_ID[rig.ram]:null,ssd=rig.ssd?PARTS_BY_ID[rig.ssd]:null;
  const psu=rig.psu?PARTS_BY_ID[rig.psu]:null,cool=rig.cool?PARTS_BY_ID[rig.cool]:null;
  const net=rig.net?PARTS_BY_ID[rig.net]:null,cas=rig.case?PARTS_BY_ID[rig.case]:null;
  return {
    synergy:syn,power:pow,
    hashSpeed:Math.round(((cpu?.stats.clock||0.5)+(gpu?.stats.vram||0)*0.05)*m*st*100)/100,
    mineMultiplier:Math.round((gpu?.stats.cores||0)*m*st*100)/100,
    maxProxies:1+Math.floor((ram?.stats.size||0)/32),
    traceMultiplier:Math.round(Math.max(0.2,1/((ram?.stats.speed||1)*(psu?.stats.eff||0.7)))*m*st*100)/100,
    exfilMultiplier:Math.round((ssd?.stats.iops||1)*m*st*100)/100,
    scanCount:Math.max(1,Math.min(10,Math.floor((net?.stats.bandwidth||1)*st))),
    heatReduction:cool?Math.round(Math.min(0.8,(cool.stats.tdp/Math.max(1,pow.totalDraw))*(psu?.stats.eff||0.7)*(cas?.stats.airflow||1))*100)/100:0,
    repBonus:Math.floor((cas?.stats.style||0)*0.5),
    failChance:!pow.stable?Math.min(0.3,Math.abs(pow.headroom)/200):0,
  };
}

// ═══════════════════════════════════════════════════════════════
// UNIFIED MARKET ENGINE
// ═══════════════════════════════════════════════════════════════
const RMULT={
  'us-gov':{cpu:1,gpu:1.1,ram:1,ssd:.9,psu:.9,cool:1,net:.8,case:1,software:1},
  'ru-darknet':{cpu:.7,gpu:.6,ram:.8,ssd:1,psu:1.2,cool:1.3,net:1.1,case:.5,software:.6},
  'cn-financial':{cpu:.6,gpu:.7,ram:.6,ssd:.7,psu:.8,cool:.9,net:1,case:.7,software:.8},
  'eu-central':{cpu:1.2,gpu:1.3,ram:1.1,ssd:1.1,psu:1,cool:.8,net:.9,case:1.4,software:1.2},
};
const RMAKER={
  'us-gov':{NVIDIA:.9,INTEL:.85,CORSAIR:1.1},
  'ru-darknet':{AMD:.7,GSKILL:.6,MELLANOX:.8},
  'cn-financial':{SAMSUNG:.6,INTEL:.7,CORSAIR:.65},
  'eu-central':{NOCTUA:.8,SEASONIC:.85,LIANLI:.9},
};
const RSTOCK={'us-gov':.55,'ru-darknet':.40,'cn-financial':.65,'eu-central':.50};

export const MARKET_EVENTS = [
  {text:'Intel fab delay — Intel CPUs +60%',filter:x=>x.maker==='INTEL'&&x.slot==='cpu',mult:1.6},
  {text:'AMD Zen 5 hype — AMD prices +40%',filter:x=>x.maker==='AMD',mult:1.4},
  {text:'NVIDIA supply crunch — GPUs +80%',filter:x=>x.maker==='NVIDIA',mult:1.8},
  {text:'Mining boom — all GPUs +90%',filter:x=>x.slot==='gpu',mult:1.9},
  {text:'Mining crash — GPUs dumped at 35%',filter:x=>x.slot==='gpu',mult:.35},
  {text:'Samsung NAND oversupply — SSDs -50%',filter:x=>x.slot==='ssd',mult:.5},
  {text:'Corsair Black Friday — Corsair -30%',filter:x=>x.maker==='CORSAIR',mult:.7},
  {text:'Heatwave — cooling demand +70%',filter:x=>x.slot==='cool',mult:1.7},
  {text:'PSU shortage — power supplies +55%',filter:x=>x.slot==='psu',mult:1.55},
  {text:'US export ban — GEN5 parts +65%',filter:x=>x.gen==='GEN5',mult:1.65},
  {text:'Black Friday — everything -25%',filter:()=>true,mult:.75},
  {text:'Global supply crisis — all +40%',filter:()=>true,mult:1.4},
  {text:'DDR5 shortage — RAM prices ×2',filter:x=>x.slot==='ram',mult:2},
  {text:'Datacenter deal — NICs -45%',filter:x=>x.slot==='net',mult:.55},
  {text:'GEN4 clearance — GEN4 parts -30%',filter:x=>x.gen==='GEN4',mult:.7},
  {text:'Noctua factory flood — Noctua +50%',filter:x=>x.maker==='NOCTUA',mult:1.5},
  {text:'Software crackdown — tools +45%',filter:x=>x.type==='software',mult:1.45},
  {text:'Leaked exploit archive — software -35%',filter:x=>x.type==='software',mult:.65},
  {text:'G.Skill overstock — G.Skill RAM -40%',filter:x=>x.maker==='GSKILL',mult:.6},
  {text:'Seasonic recall — Seasonic PSUs +45%',filter:x=>x.maker==='SEASONIC',mult:1.45},
];

export function generateUnifiedMarket(region,btcIndex,reputation) {
  const rate=RSTOCK[region]||.5,rm=RMULT[region]||{},mb=RMAKER[region]||{};
  const ec=Math.random()<.3?2:1;
  const evts=[...MARKET_EVENTS].sort(()=>Math.random()-.5).slice(0,ec);
  const all=[...PARTS_DB,...SOFTWARE_DB.filter(s=>(s.repReq||0)<=reputation)];
  const avail=all.filter(()=>Math.random()<rate);
  const stock=avail.map(part=>{
    let price=part.basePrice*(1+(Math.random()*2-1)*part.volatility);
    price*=(rm[part.slot]||1);
    if(part.maker&&mb[part.maker])price*=mb[part.maker];
    for(const e of evts){if(e.filter(part))price*=e.mult;}
    price*=btcIndex;
    let qty;
    if(part.rarity==='common')qty=Math.floor(Math.random()*5)+1;
    else if(part.rarity==='uncommon')qty=Math.floor(Math.random()*3)+1;
    else if(part.rarity==='rare')qty=Math.random()<.6?1:0;
    else qty=Math.random()<.25?1:0;
    if(part.repeatable)qty=99;
    const f=Math.max(100,Math.round(price));
    const ratio=Math.round(f/part.basePrice*100);
    return{partId:part.id,price:f,qty,trend:ratio>115?'up':ratio<85?'down':'flat',ratio};
  }).filter(s=>s.qty>0);
  const commodityPrices={};
  Object.keys(COMMODITIES).forEach(k=>{
    const c=COMMODITIES[k];let pr=Math.max(10,Math.round((c.base+(Math.random()*c.vol*2)-c.vol)*btcIndex));
    if(Math.random()<.12)pr=Math.round(pr*.25);else if(Math.random()<.12)pr=Math.round(pr*3.5);
    commodityPrices[k]=pr;
  });
  return{stock,events:evts.map(e=>e.text),region,btcIndex,commodityPrices};
}

export function getSellPrice(partId,marketStock){
  const l=(marketStock||[]).find(s=>s.partId===partId);
  if(l)return Math.round(l.price*(.6+Math.random()*.2));
  const x=PARTS_BY_ID[partId];return x?Math.round(x.basePrice*.5):0;
}

export const RARITY_COLORS={common:'#727072',uncommon:'#78dce8',rare:'#a9dc76',legendary:'#ffd866'};
