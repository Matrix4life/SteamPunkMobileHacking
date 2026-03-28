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
  const [marketPrices, setMarketPrices] = useState(generateMarketPrices());
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

  const [director, setDirector] = useState(DEFAULT_DIRECTOR);
  const directorRef = useRef(DEFAULT_DIRECTOR);

  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);
        
         // Add state:
const [soundMap, setSoundMapState] = useState({});

// Pass to soundEngine whenever it changes:
useEffect(() => { setSoundMap(soundMap); }, [soundMap]);

  useEffect(() => {
    if (terminalEndRef.current) terminalEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
    if (inputRef.current && !isProcessing && (screen === 'game' || screen === 'login') && !showHelpMenu) inputRef.current.focus();
  }, [terminal, mapExpanded, screen, isProcessing, showHelpMenu]);

  // Initialize Capacitor native plugins
  useEffect(() => {
    initNative();
  }, []);

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
    inventory, rig, partsBag, softwareOwned, btcIndex, consumables, stash, currentRegion, marketPrices, world, unlockedFiles, contracts, director, timestamp: Date.now(),
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
      if (data.timestamp && data.botnet?.length > 0) {
        const hours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        const earned = Math.floor(hours * data.botnet.length * HOURLY_RATE);
        if (earned > 0) {
          setMoney(m => m + earned);
          setTerminal([{ type: 'out', text: `[SYSTEM] Offline C2 revenue: +$${earned.toLocaleString()}`, isNew: false }]);
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
    setCurrentRegion('us-gov'); setMarketPrices(generateMarketPrices());
    setUnlockedFiles([]); setContracts([]);
    setWorld(DEFAULT_WORLD);
    setDirector(DEFAULT_DIRECTOR); directorRef.current = DEFAULT_DIRECTOR;
    setTerminal([]); setIsInside(false); setTargetIP(null);
    setPrivilege('local'); setCurrentDir('~'); setMapExpanded(false);
    setActiveContract(null);
    setWantedTier('COLD'); setWalletFrozen(false); lastWantedTier.current = 'COLD';
    setScreen('game');
  };

  useEffect(() => {
    if (screen !== 'game' || !operator) return;
    const autoSaveTimer = setInterval(() => saveGame(`auto_${operator}`), 60000);
    return () => clearInterval(autoSaveTimer);
  }, [screen, operator, money, botnet, proxies, looted, wipedNodes, inventory, consumables, stash, currentRegion, world, contracts, director, heat, reputation]);

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
              setTerminal(prev => [...prev.map(t => ({ ...t, isNew: false 