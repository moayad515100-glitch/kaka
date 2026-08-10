// ==========================================
// مغامرات كاكا 2 | Kaka's Adventures 2
// Complete Single-File Application Logic (app.js)
// ==========================================

// 1. SOUND ENGINE (Web Audio API)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playPeeJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  playFlush() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 1.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 1.2);
    filter.Q.setValueAtTime(5, this.ctx.currentTime);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start();
    noise.stop(this.ctx.currentTime + 1.2);
  }

  playBossHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playHurt() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.setValueAtTime(80, this.ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.12 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + i * 0.12);
      osc.stop(this.ctx.currentTime + i * 0.12 + 0.3);
    });
  }
}

const sounds = new SoundEngine();

// 2. NETWORK P2P MANAGER
class NetworkManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.isConnected = false;
    this.roomCode = '';
  }

  createRoom(onCodeGenerated, onPeerConnected, onDataReceived) {
    try {
      if (typeof Peer === 'undefined') return;
      this.isHost = true;
      const randomCode = 'KAKA-' + Math.floor(1000 + Math.random() * 9000);
      this.roomCode = randomCode;

      this.peer = new Peer(randomCode);

      this.peer.on('open', (id) => {
        if (onCodeGenerated) onCodeGenerated(id);
      });

      this.peer.on('connection', (connection) => {
        this.conn = connection;
        this.setupConnectionListeners(onPeerConnected, onDataReceived);
      });

      this.peer.on('error', (err) => console.error('Peer error:', err));
    } catch (e) {
      console.warn('Network P2P Warning:', e);
    }
  }

  joinRoom(code, onPeerConnected, onDataReceived, onError) {
    try {
      if (typeof Peer === 'undefined') return;
      this.isHost = false;
      this.roomCode = code.toUpperCase().trim();

      this.peer = new Peer();

      this.peer.on('open', () => {
        this.conn = this.peer.connect(this.roomCode);
        this.setupConnectionListeners(onPeerConnected, onDataReceived);
      });

      this.peer.on('error', (err) => {
        if (onError) onError(err);
      });
    } catch (e) {
      if (onError) onError(e);
    }
  }

  setupConnectionListeners(onPeerConnected, onDataReceived) {
    if (!this.conn) return;

    this.conn.on('open', () => {
      this.isConnected = true;
      if (onPeerConnected) onPeerConnected();
    });

    this.conn.on('data', (data) => {
      if (onDataReceived) onDataReceived(data);
    });

    this.conn.on('close', () => {
      this.isConnected = false;
    });
  }

  send(data) {
    if (this.conn && this.isConnected) {
      this.conn.send(data);
    }
  }
}

// 3. PARTICLE SYSTEM
class Particle {
  constructor(x, y, vx, vy, color, size, life, shape = 'circle') {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.color = color; this.size = size; this.maxLife = life; this.life = life;
    this.shape = shape;
  }
  update() {
    this.x += this.vx; this.y += this.vy; this.vy += 0.15; this.life -= 1;
  }
  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = this.color;
    if (this.shape === 'circle') {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    } else if (this.shape === 'star') {
      ctx.font = `${this.size * 2}px sans-serif`; ctx.fillText('✨', this.x, this.y);
    } else if (this.shape === 'bubble') {
      ctx.strokeStyle = this.color; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.restore();
  }
}

class ParticleSystem {
  constructor() { this.particles = []; }
  addSplash(x, y, color = '#38bdf8', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2; const speed = 2 + Math.random() * 5;
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 2, color, 3 + Math.random() * 4, 20 + Math.random() * 20, 'circle'));
    }
  }
  addBubbles(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x + (Math.random() * 20 - 10), y, (Math.random() - 0.5) * 1.5, -1 - Math.random() * 2, 'rgba(255, 255, 255, 0.7)', 4 + Math.random() * 6, 30 + Math.random() * 30, 'bubble'));
    }
  }
  addSparkles(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x + (Math.random() * 40 - 20), y + (Math.random() * 40 - 20), (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, '#fbbf24', 6 + Math.random() * 4, 25 + Math.random() * 20, 'star'));
    }
  }
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) this.particles.splice(i, 1);
    }
  }
  draw(ctx) { for (const p of this.particles) p.draw(ctx); }
}

// 4. PHYSICS ENGINE
class PhysicsEngine {
  static checkAABB(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  static handlePlayerPlatforms(player, platforms) {
    player.grounded = false;
    for (const plat of platforms) {
      if (plat.isMoving) {
        plat.x += plat.vx || 0; plat.y += plat.vy || 0;
        if (plat.x < plat.minX || plat.x > plat.maxX) plat.vx *= -1;
        if (plat.y < plat.minY || plat.y > plat.maxY) plat.vy *= -1;
      }
      if (PhysicsEngine.checkAABB(player, plat)) {
        if (player.vy >= 0 && (player.y + player.height - player.vy) <= plat.y + 12) {
          player.y = plat.y - player.height;
          player.vy = 0;
          player.grounded = true;
          player.jumpCount = 0;
          if (plat.isMoving) player.x += plat.vx || 0;
          if (plat.isSpring) {
            player.vy = -15;
            player.scaleY = 1.5;
          }
        }
      }
    }
  }

  static checkHazards(player, hazards) {
    for (const haz of hazards) {
      if (PhysicsEngine.checkAABB(player, haz)) return true;
    }
    return false;
  }

  static checkToiletGoal(player, toiletGoal) {
    if (!toiletGoal) return false;
    return PhysicsEngine.checkAABB(player, toiletGoal);
  }
}

// 5. PLAYER CLASS
class Player {
  constructor(x, y, name, type) {
    this.x = x; this.y = y; this.width = 40; this.height = 40;
    this.vx = 0; this.vy = 0; this.speed = 5; this.jumpForce = -11.5; this.gravity = 0.55;
    this.grounded = false; this.jumpCount = 0; this.maxJumps = 2;
    this.name = name; this.type = type; // 'kaka' or 'bool'
    this.hp = 100; this.maxHp = 100; this.invulnerableTimer = 0;
    this.facing = 'right'; this.scaleX = 1; this.scaleY = 1; this.animFrame = 0;
    this.abilityCooldown = 0;
  }

  update(keys, particles) {
    if (this.abilityCooldown > 0) this.abilityCooldown--;
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;

    let leftKey, rightKey, jumpKey, abilityKey;
    if (this.type === 'kaka') {
      leftKey = keys['KeyA'] || keys['a'];
      rightKey = keys['KeyD'] || keys['d'];
      jumpKey = keys['KeyW'] || keys['w'] || keys['Space'];
      abilityKey = keys['KeyS'] || keys['s'];
    } else {
      leftKey = keys['ArrowLeft']; rightKey = keys['ArrowRight'];
      jumpKey = keys['ArrowUp']; abilityKey = keys['ArrowDown'];
    }

    if (leftKey) { this.vx = -this.speed; this.facing = 'left'; }
    else if (rightKey) { this.vx = this.speed; this.facing = 'right'; }
    else { this.vx *= 0.75; }

    if (jumpKey && !this.prevJumpKey) {
      if (this.grounded) {
        this.vy = this.jumpForce; this.grounded = false; this.jumpCount = 1;
        this.scaleY = 1.3; this.scaleX = 0.8;
        if (this.type === 'kaka') sounds.playJump(); else sounds.playPeeJump();
        if (particles) particles.addSplash(this.x + 20, this.y + 40, this.type === 'kaka' ? '#d97706' : '#38bdf8', 6);
      } else if (this.jumpCount < this.maxJumps) {
        this.vy = this.jumpForce * 0.9; this.jumpCount++; this.scaleY = 1.2;
        if (this.type === 'kaka') sounds.playJump(); else sounds.playPeeJump();
      }
    }
    this.prevJumpKey = jumpKey;

    if (abilityKey && this.abilityCooldown === 0) {
      if (this.type === 'kaka' && !this.grounded) {
        this.vy = 14; this.abilityCooldown = 45;
      } else if (this.type === 'bool') {
        this.vx = (this.facing === 'right' ? 12 : -12); this.abilityCooldown = 40;
        if (particles) particles.addBubbles(this.x, this.y + 20, 8);
      }
    }

    this.vy += this.gravity; this.x += this.vx; this.y += this.vy;
    this.scaleX += (1 - this.scaleX) * 0.15; this.scaleY += (1 - this.scaleY) * 0.15;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > 1280) this.x = 1280 - this.width;
    this.animFrame += 0.1;
  }

  takeDamage(amount, particles) {
    if (this.invulnerableTimer > 0) return;
    this.hp -= amount; this.invulnerableTimer = 60;
    sounds.playHurt();
    if (particles) particles.addSplash(this.x + 20, this.y + 20, '#ef4444', 15);
  }

  draw(ctx) {
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 4) % 2 === 0) return;

    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    ctx.scale(this.facing === 'left' ? -this.scaleX : this.scaleX, this.scaleY);

    if (this.type === 'kaka') this.drawKaka(ctx);
    else this.drawBool(ctx);

    ctx.restore();
  }

  drawKaka(ctx) {
    // Red Hero Cape
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-24, 20 + Math.sin(this.animFrame) * 4); ctx.lineTo(-5, 18); ctx.fill();

    // Poop body
    const gradient = ctx.createLinearGradient(0, -20, 0, 20);
    gradient.addColorStop(0, '#f59e0b'); gradient.addColorStop(0.3, '#d97706'); gradient.addColorStop(1, '#78350f');
    ctx.fillStyle = gradient;

    ctx.beginPath(); ctx.ellipse(0, 10, 20, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 16, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -10, 11, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(2, -17, 5, 0, Math.PI * 2); ctx.fill();

    // Crown
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.moveTo(-8, -20); ctx.lineTo(-10, -28); ctx.lineTo(-4, -23); ctx.lineTo(0, -30); ctx.lineTo(4, -23); ctx.lineTo(10, -28); ctx.lineTo(8, -20); ctx.closePath(); ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(4, -4, 5, 0, Math.PI * 2); ctx.arc(12, -4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath(); ctx.arc(5, -4, 2.5, 0, Math.PI * 2); ctx.arc(13, -4, 2.5, 0, Math.PI * 2); ctx.fill();

    // Smile
    ctx.strokeStyle = '#451a03'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(8, 4, 4, 0, Math.PI); ctx.stroke();
  }

  drawBool(ctx) {
    const gradient = ctx.createLinearGradient(0, -20, 0, 20);
    gradient.addColorStop(0, '#7dd3fc'); gradient.addColorStop(0.5, '#38bdf8'); gradient.addColorStop(1, '#0284c7');
    ctx.fillStyle = gradient;

    ctx.beginPath(); ctx.moveTo(0, -22); ctx.bezierCurveTo(15, -5, 20, 10, 20, 14); ctx.arc(0, 14, 20, 0, Math.PI); ctx.bezierCurveTo(-20, 10, -15, -5, 0, -22); ctx.fill();

    // Cool Sunglasses
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.roundRect(-4, -6, 12, 10, 3); ctx.roundRect(10, -6, 12, 10, 3); ctx.fill();

    ctx.strokeStyle = '#0369a1'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(8, 8, 4, 0, Math.PI * 0.8); ctx.stroke();
  }
}

// 6. BOSS CLASS
class Boss {
  constructor(type, x, y) {
    this.type = type; this.x = x; this.y = y; this.width = 90; this.height = 90;
    this.vx = 0; this.vy = 0;
    this.maxHp = type === 1 ? 100 : (type === 2 ? 150 : 200);
    this.hp = this.maxHp;
    this.name = type === 1 ? "وحش الشفاطة العملاق" : (type === 2 ? "ملكة البكتيريا و الميكروبات" : "ملك رول الحمام المومياء");
    this.timer = 0; this.invulnerableTimer = 0; this.projectiles = []; this.animFrame = 0;
  }

  update(players, particles) {
    this.animFrame += 0.08; this.timer++;
    if (this.invulnerableTimer > 0) this.invulnerableTimer--;

    let target = players[0];
    if (players[1] && Math.abs(players[1].x - this.x) < Math.abs(players[0].x - this.x)) target = players[1];

    if (this.type === 1) {
      if (this.timer % 120 === 0) {
        const angle = Math.atan2(target.y - this.y, target.x - this.x);
        this.projectiles.push({ x: this.x + 45, y: this.y + 45, vx: Math.cos(angle) * 7, vy: Math.sin(angle) * 7, width: 20, height: 20, life: 120, type: 'plunger_dart' });
        sounds.playBossHit();
      }
      if (this.timer % 200 === 0) { this.vy = -10; this.vx = target.x > this.x ? 4 : -4; }
      this.vy += 0.4; this.y += this.vy; this.x += this.vx;
      if (this.y > 480) { this.y = 480; this.vy = 0; this.vx = 0; }
    } else if (this.type === 2) {
      this.y = 200 + Math.sin(this.animFrame * 2) * 40; this.x += Math.sin(this.animFrame) * 3;
      if (this.timer % 140 === 0) {
        for (let i = -1; i <= 1; i++) {
          this.projectiles.push({ x: this.x + 45, y: this.y + 60, vx: i * 3, vy: 4, width: 24, height: 24, life: 150, type: 'germ_bubble' });
        }
        sounds.playBossHit();
      }
    } else if (this.type === 3) {
      this.x += Math.sin(this.animFrame * 1.5) * 4;
      if (this.timer % 150 === 0) {
        this.projectiles.push({ x: this.x + (target.x > this.x ? 90 : -30), y: 520, vx: target.x > this.x ? 6 : -6, vy: 0, width: 35, height: 35, life: 180, type: 'paper_boulder' });
        sounds.playBossHit();
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx; proj.y += proj.vy; proj.life--;
      for (const p of players) {
        if (PhysicsEngine.checkAABB(proj, p)) { p.takeDamage(15, particles); proj.life = 0; }
      }
      if (proj.life <= 0) this.projectiles.splice(i, 1);
    }

    // Boss body hits
    for (const p of players) {
      if (PhysicsEngine.checkAABB(this, p)) {
        if (p.vy > 0 && p.y + p.height - p.vy <= this.y + 25) {
          p.vy = -12; this.takeDamage(20, particles);
        } else {
          p.takeDamage(10, particles);
        }
      }
    }
  }

  takeDamage(amount, particles) {
    if (this.invulnerableTimer > 0) return;
    this.hp -= amount; this.invulnerableTimer = 30;
    sounds.playBossHit();
    if (particles) particles.addSparkles(this.x + 45, this.y + 45, 15);
  }

  draw(ctx) {
    if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 3) % 2 === 0) return;
    ctx.save();

    if (this.type === 1) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath(); ctx.ellipse(this.x + 45, this.y + 60, 40, 25, 0, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#92400e'; ctx.fillRect(this.x + 38, this.y + 5, 14, 55);
      ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(this.x + 30, this.y + 50, 8, 0, Math.PI * 2); ctx.arc(this.x + 60, this.y + 50, 8, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === 2) {
      ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.arc(this.x + 45, this.y + 45, 40, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#c084fc'; ctx.beginPath(); ctx.arc(this.x + 32, this.y + 38, 7, 0, Math.PI * 2); ctx.arc(this.x + 58, this.y + 38, 7, 0, Math.PI * 2); ctx.fill();
    } else if (this.type === 3) {
      ctx.fillStyle = '#f8fafc'; ctx.beginPath(); ctx.roundRect(this.x + 10, this.y + 10, 70, 75, 12); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.fillRect(this.x + 20, this.y + 35, 50, 14);
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(this.x + 35, this.y + 42, 4, 0, Math.PI * 2); ctx.arc(this.x + 55, this.y + 42, 4, 0, Math.PI * 2); ctx.fill();
    }

    for (const proj of this.projectiles) {
      ctx.fillStyle = proj.type === 'plunger_dart' ? '#ef4444' : (proj.type === 'germ_bubble' ? '#22c55e' : '#f1f5f9');
      ctx.beginPath(); ctx.arc(proj.x + proj.width / 2, proj.y + proj.height / 2, proj.width / 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// 7. 10 LEVELS DEFINITIONS
const LEVELS = [
  { id: 1, name: "المرحلة 1: حمام القصر", isBoss: false, startPos: { p1: { x: 80, y: 520 }, p2: { x: 140, y: 520 } }, toiletGoal: { x: 1160, y: 220, width: 60, height: 70 }, platforms: [ { x: 0, y: 580, width: 1280, height: 140, color: '#334155' }, { x: 250, y: 460, width: 180, height: 24, color: '#0284c7' }, { x: 500, y: 380, width: 180, height: 24, color: '#d97706' }, { x: 750, y: 300, width: 180, height: 24, color: '#8b5cf6' }, { x: 1100, y: 290, width: 140, height: 24, color: '#fbbf24' } ], hazards: [{ x: 460, y: 555, width: 40, height: 25, type: 'spikes' }], springs: [{ x: 700, y: 555, width: 40, height: 25, isSpring: true }] },
  { id: 2, name: "المرحلة 2: حلبة الفقاعات الصابونية", isBoss: false, startPos: { p1: { x: 80, y: 520 }, p2: { x: 140, y: 520 } }, toiletGoal: { x: 1150, y: 160, width: 60, height: 70 }, platforms: [ { x: 0, y: 580, width: 350, height: 140, color: '#334155' }, { x: 950, y: 580, width: 330, height: 140, color: '#334155' }, { x: 400, y: 440, width: 140, height: 20, color: '#38bdf8', isMoving: true, vx: 2, minX: 380, maxX: 650 }, { x: 720, y: 320, width: 140, height: 20, color: '#f59e0b', isMoving: true, vy: 1.5, minY: 260, maxY: 420 }, { x: 1100, y: 230, width: 150, height: 24, color: '#fbbf24' } ], hazards: [{ x: 350, y: 560, width: 600, height: 30, type: 'drain_water' }], springs: [] },
  { id: 3, name: "المرحلة 3: وحش الشفاطة العملاق 🪠", isBoss: true, bossType: 1, startPos: { p1: { x: 100, y: 500 }, p2: { x: 180, y: 500 } }, toiletGoal: { x: 1150, y: 510, width: 60, height: 70 }, platforms: [ { x: 0, y: 580, width: 1280, height: 140, color: '#1e293b' }, { x: 200, y: 420, width: 160, height: 20, color: '#dc2626' }, { x: 920, y: 420, width: 160, height: 20, color: '#dc2626' }, { x: 540, y: 320, width: 200, height: 20, color: '#f59e0b' } ], hazards: [], springs: [] },
  { id: 4, name: "المرحلة 4: شلالات أنابيب المياه", isBoss: false, startPos: { p1: { x: 80, y: 520 }, p2: { x: 140, y: 520 } }, toiletGoal: { x: 80, y: 140, width: 60, height: 70 }, platforms: [ { x: 0, y: 580, width: 1280, height: 140, color: '#1e293b' }, { x: 300, y: 460, width: 160, height: 20, color: '#0284c7' }, { x: 600, y: 380, width: 160, height: 20, color: '#0284c7' }, { x: 900, y: 300, width: 160, height: 20, color: '#0284c7' }, { x: 40, y: 210, width: 180, height: 24, color: '#fbbf24' } ], hazards: [{ x: 500, y: 555, width: 100, height: 25, type: 'spikes' }], springs: [{ x: 1100, y: 555, width: 50, height: 25, isSpring: true }] },
  { id: 5, name: "المرحلة 5: مغسلة الصابون الدوارة", isBoss: false, startPos: { p1: { x: 80, y: 520 }, p2: { x: 140, y: 520 } }, toiletGoal: { x: 1160, y: 160, width: 60, height: 70 }, platforms: [ { x: 0, y: 580, width: 250, height: 140, color: '#334155' }, { x: 320, y: 480, width: 130, height: 20, color: '#ec4899', isMoving: true, vy: 2, minY: 320, maxY: 500 }, { x: 580, y: 360, width: 130, height: 20, color: '#8b5cf6', isMoving: true, vx: 2, minX: 520, maxX: 780 }, { x: 880, y: 280, width: 130, height: 20, color: '#0284c7', isMoving: true, vy: 2, minY: 200, maxY: 380 }, { x: 1120, y: 230, width: 140, height: 24, color: '#fbbf24' } ], hazards: [{ x: 250, y: 560, width: 900, height: 30, type: 'spikes' }], springs: [] },
  { id: 6, name: "المرحلة 6: ملكة البكتيريا والميكروبات 🦠", isBoss: true, bossType: 2, startPos: { p1: { x: 100, y: 500 }, p2: { x: 180, y: 500 } }, toiletGoal: { x: 1150, y: 510, width: 60, height: 70 }, platforms: [ { x: 0, y: 580, width: 1280, height: 140, color: '#14532d' }, { x: 180, y: 440, width: 180, height: 20, color: '#22c55e' }, { x: 920, y: 440, width: 180, height: 20, color: '#22c55e' }, { x: 530, y: 340, width: 220, height: 20, color: '#a855f7' } ], hazards: [], springs: [] },
  { id: 7, name: "المرحلة 7: متاهة رولات الحمام", isBoss: false, startPos: { p1: { x: 80, y: 520 }, p2: { x: 140, y: 520 } }, toiletGoal: { x: 1160, y: 120, width: 60, height: 70 }, platforms: [ { x: 0, y: 580, width: 1280, height: 140, color: '#1e293b' }, { x: 200, y: 460, width: 150, height: 20, color: '#f8fafc' }, { x: 450, y: 360, width: 150, height: 20, color: '#f8fafc' }, { x: 700, y: 260, width: 150, height: 20, color: '#f8fafc' }, { x: 950, y: 180, width: 150, height: 20, color: '#f8fafc' }, { x: 1120, y: 190, width: 140, height: 24, color: '#fbbf24' } ], hazards: [{ x: 380, y: 555, width: 60, height: 25, type: 'spikes' }, { x: 850, y: 555, width: 60, height: 25, type: 'spikes' }], springs: [{ x: 400, y: 335, width: 40, height: 25, isSpring: true }] },
  { id: 8, name: "المرحلة 8: بركان الفلاش المطهّر", isBoss: false, startPos: { p1: { x: 80, y: 520 }, p2: { x: 140, y: 520 } }, toiletGoal: { x: 610, y: 100, width: 60, height: 70 }, platforms: [ { x: 0, y: 580, width: 1280, height: 140, color: '#1e293b' }, { x: 150, y: 460, width: 160, height: 20, color: '#ef4444' }, { x: 400, y: 360, width: 160, height: 20, color: '#ef4444' }, { x: 720, y: 360, width: 160, height: 20, color: '#ef4444' }, { x: 970, y: 460, width: 160, height: 20, color: '#ef4444' }, { x: 560, y: 170, width: 160, height: 24, color: '#fbbf24' } ], hazards: [{ x: 500, y: 555, width: 280, height: 25, type: 'spikes' }], springs: [{ x: 1020, y: 435, width: 40, height: 25, isSpring: true }] },
  { id: 9, name: "المرحلة 9: ملك رول الحمام المومياء 🧻", isBoss: true, bossType: 3, startPos: { p1: { x: 100, y: 500 }, p2: { x: 180, y: 500 } }, toiletGoal: { x: 1150, y: 510, width: 60, height: 70 }, platforms: [ { x: 0, y: 580, width: 1280, height: 140, color: '#0f172a' }, { x: 160, y: 420, width: 180, height: 20, color: '#f8fafc' }, { x: 940, y: 420, width: 180, height: 20, color: '#f8fafc' }, { x: 530, y: 320, width: 220, height: 20, color: '#fbbf24' } ], hazards: [], springs: [] },
  { id: 10, name: "المرحلة 10: قاعة العرش الذهبي الأسطوري 👑🚽", isBoss: false, startPos: { p1: { x: 80, y: 520 }, p2: { x: 140, y: 520 } }, toiletGoal: { x: 610, y: 100, width: 70, height: 80, isGolden: true }, platforms: [ { x: 0, y: 580, width: 1280, height: 140, color: '#312e81' }, { x: 150, y: 460, width: 180, height: 24, color: '#fbbf24' }, { x: 950, y: 460, width: 180, height: 24, color: '#fbbf24' }, { x: 350, y: 340, width: 160, height: 24, color: '#a855f7' }, { x: 770, y: 340, width: 160, height: 24, color: '#a855f7' }, { x: 550, y: 180, width: 180, height: 28, color: '#fbbf24' } ], hazards: [{ x: 350, y: 555, width: 580, height: 25, type: 'spikes' }], springs: [{ x: 220, y: 435, width: 40, height: 25, isSpring: true }, { x: 1020, y: 435, width: 40, height: 25, isSpring: true }] }
];

// 8. CUTSCENES SCRIPT DATA
const CUTSCENES = {
  1: { title: "المشهد 1: هزيمة وحش الشفاطة!", dialogues: [ { speaker: "كاكا 💩", avatar: "💩", text: "أخيراً! وحش الشفاطة العملاق سقط! كان يحاول شفطنا وإبعادنا عن طريق الكرسي!" }, { speaker: "بول 💧", avatar: "💧", text: "يا لها من معركة حامية! انظر، لقد ترك خلفه مفتاح الحمام الفضي!" }, { speaker: "كاكا 💩", avatar: "💩", text: "ممتاز يا بول! العرش أقرب مما نتخيل، هيا بنا لنواصل الطريق عبر أنابيب الصابون!" } ], bgType: "plunger_boss_defeat" },
  2: { title: "المشهد 2: سقوط ملكة البكتيريا!", dialogues: [ { speaker: "بول 💧", avatar: "💧", text: "احذر! فقاعات الميكروبات بدأت تتبخر بعد هزيمة ملكة البكتيريا!" }, { speaker: "كاكا 💩", avatar: "💩", text: "الحمد لله! لقد أغلقت الطريق بفقاعاتها السامة لفترة طويلة!" }, { speaker: "بول 💧", avatar: "💧", text: "انظر إلى الحائط... إنها خريطة قاعة العرش! كرسي الحمام الذهبي على بعد مراحل قليلة!" }, { speaker: "كاكا 💩", avatar: "💩", text: "إلى الأمام! لا شيء يوقف كاكا وبول عن العرش الأسطوري!" } ], bgType: "germ_boss_defeat" },
  3: { title: "المشهد 3: تفكيك مومياء رول الحمام!", dialogues: [ { speaker: "كاكا 💩", avatar: "💩", text: "تم تفكيك رول المومياء العملاق بالكامل! أصبح الطريق سالكاً!" }, { speaker: "بول 💧", avatar: "💧", text: "اسمع هذا الصدى... إنها المياه المقدسة لكرسي الحمام الذهبي تهمس بالداخل!" }, { speaker: "كاكا 💩", avatar: "💩", text: "المرحلة الأخيرة تفصلنا عن التتويج... تجهز يا صديقي، العرش ينتظرنا!" } ], bgType: "mummy_boss_defeat" },
  4: { title: "الختام الأسطوري: عرش الكرسي الذهبي! 👑🚽", dialogues: [ { speaker: "كاكا 💩", avatar: "💩", text: "يا للروعة! كرسي الحمام الذهبي الأسطوري! لقد وصلنا أخيراً!" }, { speaker: "بول 💧", avatar: "💧", text: "أجمل سحبة سيفون في التاريخ! لقد أتممنا كافة 10 مراحل بنجاح باهر!" }, { speaker: "كاكا وبول 💩💧", avatar: "👑", text: "شكراً لك أيها البطل على قيادتنا للفوز! أنت الأسطورة الحقيقية!" } ], bgType: "golden_toilet_victory" }
};

class CutsceneManager {
  constructor(screenEl, titleEl, textEl, speakerNameEl, speakerAvatarEl, nextBtn, illustrationEl, onFinish) {
    this.screenEl = screenEl; this.titleEl = titleEl; this.textEl = textEl;
    this.speakerNameEl = speakerNameEl; this.speakerAvatarEl = speakerAvatarEl;
    this.nextBtn = nextBtn; this.illustrationEl = illustrationEl; this.onFinish = onFinish;
    this.currentCutscene = null; this.dialogueIndex = 0;
    this.nextBtn.addEventListener('click', () => this.nextDialogue());
  }

  startCutscene(sceneId) {
    const scene = CUTSCENES[sceneId];
    if (!scene) { if (this.onFinish) this.onFinish(); return; }
    this.currentCutscene = scene; this.dialogueIndex = 0;
    this.titleEl.textContent = scene.title;
    this.renderIllustration(scene.bgType);
    this.showDialogueStep();
    this.screenEl.classList.remove('hidden');
    this.screenEl.classList.add('active');
  }

  showDialogueStep() {
    const step = this.currentCutscene.dialogues[this.dialogueIndex];
    if (!step) { this.finish(); return; }
    this.speakerNameEl.textContent = step.speaker;
    this.speakerAvatarEl.textContent = step.avatar;
    this.textEl.textContent = step.text;
  }

  nextDialogue() {
    this.dialogueIndex++;
    if (this.dialogueIndex >= this.currentCutscene.dialogues.length) this.finish();
    else this.showDialogueStep();
  }

  renderIllustration(bgType) {
    let icon = "🚽"; let sub = "النصر قريب!";
    if (bgType === 'plunger_boss_defeat') { icon = "🪠💥💩"; sub = "هزيمة وحش الشفاطة!"; }
    else if (bgType === 'germ_boss_defeat') { icon = "🦠⚡💧"; sub = "تطهير المكان من الميكروبات!"; }
    else if (bgType === 'mummy_boss_defeat') { icon = "🧻👑💩"; sub = "تفكيك مومياء رول الحمام!"; }
    else if (bgType === 'golden_toilet_victory') { icon = "🚽✨👑"; sub = "التتويج الأسطوري!"; }

    this.illustrationEl.innerHTML = `
      <div style="text-align: center; animation: float-anim 3s ease-in-out infinite;">
        <div style="font-size: 4.5rem; text-shadow: 0 0 20px rgba(245, 158, 11, 0.8);">${icon}</div>
        <div style="color: #fbbf24; font-weight: 800; font-size: 1.2rem; margin-top: 8px;">${sub}</div>
      </div>
    `;
  }

  finish() {
    this.screenEl.classList.add('hidden');
    this.screenEl.classList.remove('active');
    if (this.onFinish) this.onFinish();
  }
}

// 9. MAIN GAME ENGINE & CONTROLLER
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 1280; this.canvas.height = 720;

    this.hud = document.getElementById('hud');
    this.p1HealthEl = document.getElementById('p1-health');
    this.p2HudEl = document.getElementById('p2-hud');
    this.p2HealthEl = document.getElementById('p2-health');
    this.bossHudEl = document.getElementById('boss-hud');
    this.bossNameEl = document.getElementById('boss-name');
    this.bossHealthEl = document.getElementById('boss-health');
    this.hudLevelTitle = document.getElementById('hud-level-title');

    this.mainMenu = document.getElementById('main-menu');
    this.coopModal = document.getElementById('coop-modal');
    this.onlineLobbyModal = document.getElementById('online-lobby-modal');
    this.levelSelectModal = document.getElementById('level-select-modal');
    this.cutsceneScreen = document.getElementById('cutscene-screen');
    this.victoryModal = document.getElementById('victory-modal');
    this.gameoverModal = document.getElementById('gameover-modal');

    this.gameState = 'menu';
    this.gameMode = 'story';
    this.currentLevelId = 1;
    this.unlockedLevel = parseInt(localStorage.getItem('kaka2_unlocked') || '1', 10);

    this.players = []; this.boss = null; this.currentLevel = null;
    this.particles = new ParticleSystem(); this.keys = {};
    this.net = new NetworkManager();

    this.cutsceneManager = new CutsceneManager(
      this.cutsceneScreen,
      document.getElementById('cutscene-title'),
      document.getElementById('dialogue-text'),
      document.getElementById('speaker-name'),
      document.getElementById('speaker-avatar'),
      document.getElementById('btn-next-cutscene'),
      document.getElementById('cutscene-illustration'),
      () => this.onCutsceneFinished()
    );

    this.initEvents();
    this.renderLevelGrid();
    this.gameLoop();
  }

  initEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true; this.keys[e.key] = true; sounds.init();
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false; this.keys[e.key] = false;
    });

    document.getElementById('btn-story-mode').addEventListener('click', () => {
      this.gameMode = 'story'; this.startLevel(1);
    });

    document.getElementById('btn-coop-mode').addEventListener('click', () => {
      this.showScreen(this.coopModal);
    });

    document.getElementById('btn-level-select').addEventListener('click', () => {
      this.renderLevelGrid(); this.showScreen(this.levelSelectModal);
    });

    document.getElementById('btn-local-coop').addEventListener('click', () => {
      this.gameMode = 'coop_local'; this.startLevel(1);
    });

    document.getElementById('btn-online-coop').addEventListener('click', () => {
      this.showScreen(this.onlineLobbyModal);
      if (!this.net.peer) {
        this.net.createRoom(
          (code) => { const el = document.getElementById('room-code-display'); if (el) el.textContent = code; },
          () => {
            const statusEl = document.getElementById('host-status'); if (statusEl) statusEl.textContent = 'متصل! اللاعب الثاني متواجد الآن 🟢';
            const startBtn = document.getElementById('btn-start-online-host'); if (startBtn) { startBtn.classList.remove('disabled'); startBtn.disabled = false; }
          },
          (data) => this.handleNetworkData(data)
        );
      }
    });

    const tabHost = document.getElementById('tab-host');
    const tabJoin = document.getElementById('tab-join');
    const hostSection = document.getElementById('host-section');
    const joinSection = document.getElementById('join-section');

    tabHost.addEventListener('click', () => {
      tabHost.classList.add('active'); tabJoin.classList.remove('active');
      hostSection.classList.remove('hidden'); joinSection.classList.add('hidden');
    });

    tabJoin.addEventListener('click', () => {
      tabJoin.classList.add('active'); tabHost.classList.remove('active');
      joinSection.classList.remove('hidden'); hostSection.classList.add('hidden');
    });

    document.getElementById('btn-copy-code').addEventListener('click', () => {
      const code = document.getElementById('room-code-display').textContent;
      navigator.clipboard.writeText(code);
      document.getElementById('btn-copy-code').textContent = 'تم النسخ! ✓';
      setTimeout(() => document.getElementById('btn-copy-code').textContent = 'نسخ 📋', 2000);
    });

    document.getElementById('btn-start-online-host').addEventListener('click', () => {
      this.gameMode = 'coop_online'; this.startLevel(1);
      this.net.send({ type: 'start_game', levelId: 1 });
    });

    document.getElementById('btn-connect-join').addEventListener('click', () => {
      const codeInput = document.getElementById('room-code-input').value;
      const statusEl = document.getElementById('join-status');
      statusEl.textContent = 'جاري الاتصال... ⏳';

      this.net.joinRoom(
        codeInput,
        () => { statusEl.textContent = 'تم الاتصال بنجاح! 🟢'; },
        (data) => this.handleNetworkData(data),
        () => { statusEl.textContent = 'فشل الاتصال! تحقق من كود الغرفة. ❌'; }
      );
    });

    document.getElementById('btn-next-level').addEventListener('click', () => this.startLevel(this.currentLevelId + 1));
    document.getElementById('btn-retry-level').addEventListener('click', () => this.startLevel(this.currentLevelId));
    document.getElementById('btn-restart-gameover').addEventListener('click', () => this.startLevel(this.currentLevelId));

    document.querySelectorAll('.btn-back').forEach(btn => btn.addEventListener('click', () => this.showScreen(this.mainMenu)));
    document.querySelector('.btn-back-coop').addEventListener('click', () => this.showScreen(this.coopModal));

    if ('ontouchstart' in window) {
      document.getElementById('mobile-controls').classList.remove('hidden');
      const bindTouch = (id, keyName) => {
        const el = document.getElementById(id);
        el.addEventListener('touchstart', (e) => { e.preventDefault(); this.keys[keyName] = true; });
        el.addEventListener('touchend', (e) => { e.preventDefault(); this.keys[keyName] = false; });
      };
      bindTouch('btn-left', 'KeyA'); bindTouch('btn-right', 'KeyD');
      bindTouch('btn-jump', 'KeyW'); bindTouch('btn-ability', 'KeyS');
    }
  }

  showScreen(screenEl) {
    [this.mainMenu, this.coopModal, this.onlineLobbyModal, this.levelSelectModal,
     this.cutsceneScreen, this.victoryModal, this.gameoverModal].forEach(s => {
      s.classList.add('hidden'); s.classList.remove('active');
    });

    if (screenEl) {
      screenEl.classList.remove('hidden'); screenEl.classList.add('active');
      this.hud.classList.add('hidden'); this.gameState = 'menu';
    } else {
      this.hud.classList.remove('hidden'); this.gameState = 'playing';
    }
  }

  renderLevelGrid() {
    const grid = document.getElementById('level-grid'); grid.innerHTML = '';
    LEVELS.forEach(lvl => {
      const card = document.createElement('div');
      const isLocked = lvl.id > this.unlockedLevel;
      card.className = `level-card ${isLocked ? 'locked' : ''} ${lvl.isBoss ? 'boss-level' : ''}`;
      card.innerHTML = `
        <div class="level-num">${lvl.id}</div>
        <div class="level-badge">${lvl.isBoss ? 'زعيم ⚔️' : (lvl.id === 10 ? 'العرش 👑' : 'عادي')}</div>
        <div class="stars-row">${isLocked ? '🔒' : '⭐⭐⭐'}</div>
      `;
      if (!isLocked) {
        card.addEventListener('click', () => {
          this.gameMode = 'level_select'; this.startLevel(lvl.id);
        });
      }
      grid.appendChild(card);
    });
  }

  startLevel(levelId) {
    if (levelId > 10) levelId = 10;
    this.currentLevelId = levelId;
    this.currentLevel = LEVELS.find(l => l.id === levelId) || LEVELS[0];

    this.players = [ new Player(this.currentLevel.startPos.p1.x, this.currentLevel.startPos.p1.y, "كاكا", "kaka") ];

    if (this.gameMode === 'coop_local' || this.gameMode === 'coop_online') {
      this.players.push(new Player(this.currentLevel.startPos.p2.x, this.currentLevel.startPos.p2.y, "بول", "bool"));
      this.p2HudEl.classList.remove('hidden');
    } else {
      this.p2HudEl.classList.add('hidden');
    }

    if (this.currentLevel.isBoss) {
      this.boss = new Boss(this.currentLevel.bossType, 600, 200);
      this.bossHudEl.classList.remove('hidden');
      this.bossNameEl.textContent = this.boss.name;
    } else {
      this.boss = null;
      this.bossHudEl.classList.add('hidden');
    }

    this.hudLevelTitle.textContent = this.currentLevel.name;
    this.showScreen(null);
  }

  handleNetworkData(data) {
    if (data.type === 'start_game') {
      this.gameMode = 'coop_online'; this.startLevel(data.levelId);
    } else if (data.type === 'p2_input' && this.players[1]) {
      this.players[1].remoteKeys = data.keys;
    }
  }

  gameLoop() {
    requestAnimationFrame(() => this.gameLoop());
    if (this.gameState === 'playing') this.update();
    this.draw();
  }

  update() {
    this.players.forEach((p, idx) => {
      const pKeys = (idx === 1 && p.remoteKeys) ? p.remoteKeys : this.keys;
      p.update(pKeys, this.particles);
      PhysicsEngine.handlePlayerPlatforms(p, this.currentLevel.platforms);

      if (PhysicsEngine.checkHazards(p, this.currentLevel.hazards) || p.y > 680) {
        p.takeDamage(25, this.particles);
        if (p.y > 680) {
          p.x = this.currentLevel.startPos[`p${idx+1}`].x;
          p.y = this.currentLevel.startPos[`p${idx+1}`].y;
          p.vy = 0;
        }
      }

      if (PhysicsEngine.checkToiletGoal(p, this.currentLevel.toiletGoal)) {
        this.onLevelComplete();
      }
    });

    if (this.boss) {
      this.boss.update(this.players, this.particles);
      this.bossHealthEl.style.width = `${Math.max(0, (this.boss.hp / this.boss.maxHp) * 100)}%`;
      if (this.boss.hp <= 0) {
        sounds.playVictory(); this.boss = null;
        this.bossHudEl.classList.add('hidden');
        this.onLevelComplete();
      }
    }

    this.particles.update();

    if (this.players.every(p => p.hp <= 0)) {
      this.gameState = 'gameover'; this.showScreen(this.gameoverModal);
    }

    if (this.players[0]) this.p1HealthEl.style.width = `${Math.max(0, this.players[0].hp)}%`;
    if (this.players[1]) this.p2HealthEl.style.width = `${Math.max(0, this.players[1].hp)}%`;

    if (this.net.isHost && this.net.isConnected && this.players[1]) {
      this.net.send({
        type: 'state_sync',
        p1: { x: this.players[0].x, y: this.players[0].y, hp: this.players[0].hp },
        p2: { x: this.players[1].x, y: this.players[1].y, hp: this.players[1].hp }
      });
    }
  }

  onLevelComplete() {
    sounds.playFlush(); sounds.playVictory();

    if (this.currentLevelId >= this.unlockedLevel && this.unlockedLevel < 10) {
      this.unlockedLevel = this.currentLevelId + 1;
      localStorage.setItem('kaka2_unlocked', this.unlockedLevel.toString());
    }

    if (this.currentLevelId === 3) {
      this.gameState = 'cutscene'; this.cutsceneManager.startCutscene(1);
    } else if (this.currentLevelId === 6) {
      this.gameState = 'cutscene'; this.cutsceneManager.startCutscene(2);
    } else if (this.currentLevelId === 9) {
      this.gameState = 'cutscene'; this.cutsceneManager.startCutscene(3);
    } else if (this.currentLevelId === 10) {
      this.gameState = 'cutscene'; this.cutsceneManager.startCutscene(4);
    } else {
      this.gameState = 'victory'; this.showScreen(this.victoryModal);
    }
  }

  onCutsceneFinished() {
    if (this.currentLevelId === 10) {
      this.gameState = 'victory';
      document.getElementById('victory-title').textContent = 'مبروك! ختمت اللعبة بالكامل! 👑🚽';
      document.getElementById('victory-sub').textContent = 'أصبحت كابتن كرسي الحمام الذهبي الأسطوري!';
      this.showScreen(this.victoryModal);
    } else {
      this.startLevel(this.currentLevelId + 1);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, 720);
    bgGrad.addColorStop(0, '#0f0c29'); bgGrad.addColorStop(0.5, '#24243e'); bgGrad.addColorStop(1, '#302b63');
    this.ctx.fillStyle = bgGrad; this.ctx.fillRect(0, 0, 1280, 720);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'; this.ctx.lineWidth = 1;
    for (let x = 0; x < 1280; x += 60) { this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, 720); this.ctx.stroke(); }
    for (let y = 0; y < 720; y += 60) { this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(1280, y); this.ctx.stroke(); }

    if (this.currentLevel) {
      for (const plat of this.currentLevel.platforms) {
        this.ctx.fillStyle = plat.color || '#334155';
        this.ctx.beginPath(); this.ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 8); this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'; this.ctx.fillRect(plat.x + 4, plat.y, plat.width - 8, 4);
      }

      if (this.currentLevel.springs) {
        for (const sp of this.currentLevel.springs) {
          this.ctx.fillStyle = '#ec4899'; this.ctx.fillRect(sp.x, sp.y + 10, sp.width, sp.height - 10);
          this.ctx.fillStyle = '#f472b6'; this.ctx.fillRect(sp.x - 2, sp.y, sp.width + 4, 10);
        }
      }

      if (this.currentLevel.hazards) {
        for (const haz of this.currentLevel.hazards) {
          if (haz.type === 'spikes') {
            this.ctx.fillStyle = '#ef4444'; const count = Math.floor(haz.width / 20);
            for (let i = 0; i < count; i++) {
              this.ctx.beginPath(); this.ctx.moveTo(haz.x + i * 20, haz.y + haz.height);
              this.ctx.lineTo(haz.x + i * 20 + 10, haz.y); this.ctx.lineTo(haz.x + i * 20 + 20, haz.y + haz.height); this.ctx.fill();
            }
          } else if (haz.type === 'drain_water') {
            this.ctx.fillStyle = 'rgba(2, 132, 199, 0.6)'; this.ctx.fillRect(haz.x, haz.y, haz.width, haz.height);
          }
        }
      }

      const g = this.currentLevel.toiletGoal;
      if (g) {
        this.ctx.save();
        const isGold = g.isGolden || false;
        this.ctx.fillStyle = isGold ? '#fbbf24' : '#f8fafc';
        this.ctx.beginPath(); this.ctx.ellipse(g.x + g.width / 2, g.y + g.height - 15, g.width / 2, 15, 0, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.fillRect(g.x + 10, g.y, g.width - 20, 35);
        this.ctx.fillStyle = '#d97706'; this.ctx.fillRect(g.x + g.width - 20, g.y + 8, 8, 6);
        this.ctx.fillStyle = '#0f172a';
        this.ctx.beginPath(); this.ctx.ellipse(g.x + g.width / 2, g.y + g.height - 18, g.width / 3, 7, 0, 0, Math.PI * 2); this.ctx.fill();
        this.ctx.font = 'bold 12px Changa, sans-serif'; this.ctx.fillStyle = '#fbbf24'; this.ctx.textAlign = 'center';
        this.ctx.fillText(isGold ? '🚽 العرش الذهبي' : '🚽 الكرسي', g.x + g.width / 2, g.y - 10);
        this.ctx.restore();
      }
    }

    if (this.boss) this.boss.draw(this.ctx);
    for (const p of this.players) p.draw(this.ctx);
    this.particles.draw(this.ctx);
  }
}

// LAUNCH GAME
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
