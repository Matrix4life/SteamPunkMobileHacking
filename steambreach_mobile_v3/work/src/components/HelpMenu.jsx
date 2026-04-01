import React from 'react';

export default function HelpMenu({ onClose, COLORS }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', background: COLORS.bg, border: `1px solid ${COLORS.primary}`, display: 'flex', flexDirection: 'column', boxShadow: `0 0 30px ${COLORS.primary}40` }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: `1px solid ${COLORS.primary}80`, background: `${COLORS.primary}15` }}>
          <span style={{ color: COLORS.primary, fontWeight: 'bold', letterSpacing: '2px' }}>[ STEAMBREACH OPERATOR MANUAL ]</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.danger, cursor: 'pointer', fontWeight: 'bold' }}>[ X ] CLOSE</button>
        </div>

        {/* Scrollable Content */}
        <div style={{ padding: '20px', overflowY: 'auto', color: COLORS.text, fontFamily: 'monospace', fontSize: '13px', lineHeight: '1.6' }}>
          
          <h3 style={{ color: COLORS.secondary, marginTop: 0 }}>[ RECON & ACCESS ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>nmap &lt;ip&gt;</span><span>Scan network or specific target</span>
            <span style={{ color: COLORS.primary }}>hydra &lt;ip&gt;</span><span>Brute-force SSH credentials</span>
            <span style={{ color: COLORS.primary }}>sqlmap &lt;ip&gt;</span><span>SQL injection attack</span>
            <span style={{ color: COLORS.primary }}>msfconsole &lt;ip&gt;</span><span>Exploit unpatched SMB</span>
            <span style={{ color: COLORS.primary }}>curl &lt;ip&gt;</span><span>Exploit HTTP/LFI vulnerability</span>
            <span style={{ color: COLORS.primary }}>spearphish &lt;e&gt;</span><span>Social engineer an employee</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ PRIVILEGE ESCALATION ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>pwnkit</span><span>Privilege escalation to root</span>
            <span style={{ color: COLORS.primary }}>ssh &lt;user@ip&gt;</span><span>Log in using stolen credentials</span>
            <span style={{ color: COLORS.primary }}>sendmail</span><span>Spoof internal emails (requires shell)</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ BOTNET & C2 ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>ettercap</span><span>ARP poison + sniff network comms</span>
            <span style={{ color: COLORS.primary }}>sliver</span><span>Deploy C2 botnet beacon (root)</span>
            <span style={{ color: COLORS.primary }}>chisel</span><span>Create SOCKS5 proxy tunnel (root)</span>
            <span style={{ color: COLORS.primary }}>disconnect &lt;ip&gt;</span><span>Remove proxy or botnet node</span>
            <span style={{ color: COLORS.primary }}>hping3 &lt;ip&gt;</span><span>Botnet SYN flood DDoS attack</span>
            <span style={{ color: COLORS.primary }}>mimikatz &lt;ip&gt;</span><span>Dump LSASS creds from botnet node</span>
            <span style={{ color: COLORS.primary }}>stash &lt;file&gt;</span><span>Stage exfil through botnet</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ PAYLOADS & MALWARE ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', marginBottom: '20px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>exfil &lt;file&gt;</span><span>Extract financial assets</span>
            <span style={{ color: COLORS.primary }}>rclone</span><span>Mass exfiltration of corporate data</span>
            <span style={{ color: COLORS.primary }}>download &lt;file&gt;</span><span>Save remote file locally</span>
            <span style={{ color: COLORS.primary }}>hashcat &lt;file&gt;</span><span>Crack hashes (-d for botnet pool)</span>
            <span style={{ color: COLORS.primary }}>john &lt;file&gt;</span><span>CPU-optimized local password cracker</span>
            <span style={{ color: COLORS.primary }}>fence intel</span><span>Sell exfiltrated data on the Darknet</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ ECONOMY & ITEMS ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px', marginBottom: '20px' }}>
            <span style={{ color: COLORS.primary }}>use &lt;item&gt;</span><span>Consume a hidden item (burner, 0day)</span>
            <span style={{ color: COLORS.primary }}>contracts</span><span>View AI fixer contracts board</span>
            <span style={{ color: COLORS.primary }}>market</span><span>Open Black Market Trading UI</span>
            <span style={{ color: COLORS.primary }}>shop</span><span>Access darknet software market</span>
            <span style={{ color: COLORS.primary }}>hardware / rig</span><span>Open hardware marketplace</span>
          </div>

          <h3 style={{ color: COLORS.secondary }}>[ SYSTEM & NAV ]</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '10px' }}>
            <span style={{ color: COLORS.primary }}>travel &lt;reg&gt;</span><span>Route gateway to new global subnet</span>
            <span style={{ color: COLORS.primary }}>status</span><span>View operator threat & inventory</span>
            <span style={{ color: COLORS.primary }}>ls / cd / pwd</span><span>Navigate file systems</span>
            <span style={{ color: COLORS.primary }}>cat &lt;file&gt;</span><span>Read file contents</span>
            <span style={{ color: COLORS.primary }}>clear</span><span>Clear terminal output</span>
            <span style={{ color: COLORS.primary }}>save</span><span>Save current progress</span>
            <span style={{ color: COLORS.primary }}>menu</span><span>Return to main menu</span>
          </div>
          
        </div>
      </div>
    </div>
  );
}