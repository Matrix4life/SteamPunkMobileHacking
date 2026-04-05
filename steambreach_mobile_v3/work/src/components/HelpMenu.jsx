import React from 'react';

export default function HelpMenu({ onClose, COLORS }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', justifyContent:'flex-end', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', padding: '20px 5% 20px 20px'}}>
      <div style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', background: COLORS.bg, border: `1px solid ${COLORS.primary}`, display: 'flex', flexDirection: 'column', boxShadow: `0 0 30px ${COLORS.primary}40` }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: `1px solid ${COLORS.primary}80`, background: `${COLORS.primary}15` }}>
          <span style={{ color: COLORS.primary, fontWeight: 'bold', letterSpacing: '2px' }}>[ STEAMBREACH OPERATOR MANUAL ]</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.danger, cursor: 'pointer', fontWeight: 'bold' }}>[ X ] CLOSE</button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '20px', overflowY: 'auto', color: COLORS.text, fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}>
          
          <h3 style={{ color: COLORS.secondary, marginTop: 0 }}>[ RECON & ACCESS ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>nmap</span><span>Scan for new targets / open network map</span>
            <span style={{ color: COLORS.primary }}>nmap &lt;ip&gt;</span><span>Scan specific target — shows vuln, employees, ports</span>
            <span style={{ color: COLORS.primary }}>ettercap</span><span>ARP poison + sniff internal Slack/Teams comms (inside node, requires Deep Packet Inspector)</span>
            <span style={{ color: COLORS.primary }}>hydra &lt;ip&gt;</span><span>Brute-force SSH credentials</span>
            <span style={{ color: COLORS.primary }}>sqlmap &lt;ip&gt;</span><span>SQL injection attack</span>
            <span style={{ color: COLORS.primary }}>msfconsole &lt;ip&gt;</span><span>Exploit unpatched SMB service</span>
            <span style={{ color: COLORS.primary }}>curl &lt;ip&gt;</span><span>Exploit HTTP/LFI vulnerability</span>
            <span style={{ color: COLORS.primary }}>spearphish &lt;e@ip&gt;</span><span>Social engineer an employee via live AI chat</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ PRIVILEGE ESCALATION ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>pwnkit</span><span>Escalate www-data → root via CVE-2021-4034. Trace +15%</span>
            <span style={{ color: COLORS.primary }}>ssh &lt;e@ip&gt; &lt;pass&gt;</span><span>Authenticate with stolen credentials — bypasses IDS logging</span>
            <span style={{ color: COLORS.primary }}>use 0day</span><span>Burn a hidden Zero-Day for instant root. No IDS logging</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ BOTNET & C2 ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>sliver</span><span>Deploy C2 botnet beacon (root) — ₿500/hr passive income per node</span>
            <span style={{ color: COLORS.primary }}>chisel</span><span>Create SOCKS5 proxy tunnel — slows trace (root)</span>
            <span style={{ color: COLORS.primary }}>disconnect &lt;ip&gt;</span><span>Remove proxy or botnet node, free proxy slot</span>
            <span style={{ color: COLORS.primary }}>hping3 &lt;ip&gt;</span><span>Botnet SYN flood — weakens Blue Team alertness</span>
            <span style={{ color: COLORS.primary }}>mimikatz &lt;ip&gt;</span><span>Dump LSASS credentials from a botnet node</span>
            <span style={{ color: COLORS.primary }}>stash &lt;file&gt;</span><span>Route exfil through botnet node (+3% heat vs +10% direct)</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ PAYLOADS & MALWARE ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>msfvenom</span><span>Deploy viral payloads (root)</span>
            <span style={{ color: COLORS.primary }}>eternalblue</span><span>Mass SMBv1 propagation (root)</span>
            <span style={{ color: COLORS.primary }}>reptile</span><span>Install stealth kernel rootkit (root)</span>
            <span style={{ color: COLORS.primary }}>xmrig</span><span>Deploy cryptominer for passive XMR (root)</span>
            <span style={{ color: COLORS.primary }}>shred</span><span>Destroy target file system (root)</span>
            <span style={{ color: COLORS.primary }}>openssl</span><span>Deploy ransomware payload (root)</span>
            <span style={{ color: COLORS.primary }}>crontab</span><span>Schedule logic bombs (root)</span>
            <span style={{ color: COLORS.primary }}>wipe</span><span>Scrub system logs (root)</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ DATA & CRACKING ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>exfil &lt;file&gt;</span><span>Extract financial assets</span>
            <span style={{ color: COLORS.primary }}>rclone</span><span>Mass exfiltration of corporate data</span>
            <span style={{ color: COLORS.primary }}>download &lt;file&gt;</span><span>Save remote file locally</span>
            <span style={{ color: COLORS.primary }}>hashcat &lt;file&gt;</span><span>Crack hashes (-d for botnet pool)</span>
            <span style={{ color: COLORS.primary }}>john &lt;file&gt;</span><span>CPU-optimized local password cracker</span>
            <span style={{ color: COLORS.primary }}>fence intel</span><span>Sell exfiltrated data on the Darknet</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ ECONOMY & ITEMS ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>use decoy</span><span>Deploy a Trace Decoy — Trace −30% (find in target files)</span>
            <span style={{ color: COLORS.primary }}>use burner</span><span>Burn a Burner VPN — Heat −25% (find in target files)</span>
            <span style={{ color: COLORS.primary }}>use 0day</span><span>Instant root via Zero-Day — no logging (find in target files)</span>
            <span style={{ color: COLORS.primary }}>contracts</span><span>View AI fixer contracts board</span>
            <span style={{ color: COLORS.primary }}>market</span><span>Open Black Market — buy/sell cc_dumps, botnets, exploits, zerodays</span>
            <span style={{ color: COLORS.primary }}>buy &lt;item&gt; &lt;qty&gt;</span><span>Buy a commodity at current market price</span>
            <span style={{ color: COLORS.primary }}>sell &lt;item&gt; &lt;qty&gt;</span><span>Sell a commodity from your stash</span>
            <span style={{ color: COLORS.primary }}>shop</span><span>Access darknet software marketplace</span>
            <span style={{ color: COLORS.primary }}>hardware / rig</span><span>Open hardware marketplace — buy and install rig components</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ MORALITY ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>assist</span><span>When prompted: quietly help a civilian — raises SIGNAL score</span>
            <span style={{ color: COLORS.primary }}>crashpc</span><span>When prompted: brick a civilian machine — raises CHAOS score</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ SYSTEM & NAV ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '185px 1fr', gap: '10px' }}>
            <span style={{ color: COLORS.primary }}>travel &lt;region&gt;</span><span>Reroute gateway to a new subnet — us-gov, ru-darknet, cn-financial, eu-central</span>
            <span style={{ color: COLORS.primary }}>status</span><span>Operator report: wanted level, botnet, morality, inventory</span>
            <span style={{ color: COLORS.primary }}>ls / cd / pwd</span><span>Navigate remote file systems</span>
            <span style={{ color: COLORS.primary }}>cat &lt;file&gt;</span><span>Read file contents (AI-generated)</span>
            <span style={{ color: COLORS.primary }}>exit</span><span>Disconnect from current node before trace hits 100%</span>
            <span style={{ color: COLORS.primary }}>clear</span><span>Clear terminal output</span>
            <span style={{ color: COLORS.primary }}>save</span><span>Save current progress</span>
            <span style={{ color: COLORS.primary }}>menu</span><span>Auto-save and return to main menu</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}
