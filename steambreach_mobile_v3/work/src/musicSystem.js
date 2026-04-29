const tracks = {
  ambient: new Audio("/sounds/music/ambient_loop.wav"),
  pulse: new Audio("/sounds/music/pulse_loop.wav"),
  tension: new Audio("/sounds/music/tension_loop.wav"),
  attack: new Audio("/sounds/music/attack_loop.wav"),
};

let started = false;

Object.values(tracks).forEach((track) => {
  track.loop = true;
  track.volume = 0;
});

function fade(track, target, speed = 0.03) {
  const step = () => {
    const diff = target - track.volume;

    if (Math.abs(diff) < 0.01) {
      track.volume = target;
      return;
    }

    track.volume = Math.max(0, Math.min(1, track.volume + Math.sign(diff) * speed));
    requestAnimationFrame(step);
  };

  step();
}

export async function startMusic() {
  if (started) return;
  started = true;

  await Promise.all(
    Object.values(tracks).map((track) =>
      track.play().catch(() => {})
    )
  );

  setIntensity(0);
}

export function setIntensity(level) {
  fade(tracks.ambient, 0.35);

  fade(tracks.pulse, level >= 1 ? 0.25 : 0);
  fade(tracks.tension, level >= 2 ? 0.35 : 0);
  fade(tracks.attack, level >= 3 ? 0.65 : 0);
}

export function stopMusic() {
  Object.values(tracks).forEach((track) => {
    track.pause();
    track.currentTime = 0;
    track.volume = 0;
  });

  started = false;
}

export function triggerDrop() {
  fade(tracks.attack, 1, 0.08);

  setTimeout(() => {
    fade(tracks.attack, 0.65, 0.04);
  }, 1500);
}
