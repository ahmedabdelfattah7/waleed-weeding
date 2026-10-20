/* Background music.
   Plays the file set in config.js. If that file is missing, a soft plucked
   oud-style melody (maqam Hijaz) is generated in the browser instead.
   While music plays, <body> has the class "music-on". */
const Music = (() => {
  const file = new Audio(CONFIG.music);
  file.loop = true;
  let useSynth = false, playing = false;

  /* ----- fallback melody ----- */
  let ctx, out, timer, step = 0, next = 0;
  const NOTE = { D3: 146.83, D4: 293.66, Eb4: 311.13, Fs4: 369.99, G4: 392, A4: 440, Bb4: 466.16, C5: 523.25, D5: 587.33 };
  const TUNE = [['D4',1],['Eb4',.5],['Fs4',.5],['G4',1],['A4',2],['Bb4',.5],['A4',.5],['G4',1],['Fs4',.5],['G4',.5],['A4',2],
                ['D5',1],['C5',.5],['Bb4',.5],['A4',1],['G4',1],['Fs4',.5],['Eb4',.5],['D4',3]];
  const BEAT = 0.42;

  function pluck(freq, t, len, vol = 0.22) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o2.type = 'triangle';
    o.frequency.value = freq; o2.frequency.value = freq * 2.003;
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(freq * 8, t);
    lp.frequency.exponentialRampToValueAtTime(freq * 1.5, t + len + 0.3);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.6);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(out);
    o.start(t); o2.start(t); o.stop(t + len + 0.7); o2.stop(t + len + 0.7);
  }

  function schedule() {
    while (next < ctx.currentTime + 0.3) {
      const [note, beats] = TUNE[step % TUNE.length];
      pluck(NOTE[note], next, beats * BEAT);
      if (step % 6 === 0) pluck(NOTE.D3, next, 3, 0.12);
      next += beats * BEAT;
      step++;
    }
  }

  function synthSetup() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    out = ctx.createGain(); out.gain.value = 0.5;
    const echo = ctx.createDelay(), feedback = ctx.createGain();
    echo.delayTime.value = 0.28; feedback.gain.value = 0.3;
    out.connect(ctx.destination); out.connect(echo);
    echo.connect(feedback); feedback.connect(echo); echo.connect(ctx.destination);
  }
  function synthPlay() { ctx.resume(); clearInterval(timer); next = ctx.currentTime + 0.1; timer = setInterval(schedule, 100); }
  function synthPause() { clearInterval(timer); }

  /* ----- controls ----- */
  function setPlaying(on) { playing = on; document.body.classList.toggle('music-on', on); }
  function resume() { useSynth ? synthPlay() : file.play().catch(() => {}); }
  function pause() { useSynth ? synthPause() : file.pause(); }

  // pause while the phone is locked / tab hidden, carry on when back
  document.addEventListener('visibilitychange', () => {
    if (playing) document.hidden ? pause() : resume();
  });

  return {
    // must run inside a tap: browsers only allow sound after the user taps
    start() {
      synthSetup();
      file.play()
        .then(() => setPlaying(true))
        .catch(() => { useSynth = true; synthPlay(); setPlaying(true); });
    },
    toggle() {
      playing ? pause() : resume();
      setPlaying(!playing);
    }
  };
})();
