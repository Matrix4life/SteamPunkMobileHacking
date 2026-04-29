const tracks = {
  ambient: new Audio("/sounds/music/ambient_loop.wav"),
  pulse: new Audio("/sounds/music/pulse_loop.wav"),
  tension: new Audio("/sounds/music/tension_loop.wav"),
  attack: new Audio("/sounds/music/attack_loop.wav")
};

// setup
Object.values(tracks).forEach(track => {
  track.loop = true;
  track.volume = 0;
  track.play();
});

// core control
export function setIntensity(level) {
  // 0 = idle
  // 1 = scanning
  // 2 = spreading
  // 3 = detected / chaos

  tracks.ambient.volume = 0.4;

  tracks.pulse.volume   = level >= 1 ? 0.3 : 0;
  tracks.tension.volume = level >= 2 ? 0.4 : 0;
  tracks.attack.volume  = level >= 3 ? 0.7 : 0;
}
