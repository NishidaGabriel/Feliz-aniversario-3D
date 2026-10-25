
const canvas = document.getElementById("heartCanvas");
const ctx = canvas.getContext("2d");

let width, height;
let particles = [];
let stars = [];
let rotation = 0;
let mouseX = 0;
let mouseY = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    particles = [];
    stars = [];

    // Pontos que formam a superfície do coração
    for (let i = 0; i < 4500; i++) {
        const t = Math.random() * Math.PI * 2;
        const v = Math.random() * Math.PI;

        const x = 16 * Math.pow(Math.sin(t), 3);
        const y =
            13 * Math.cos(t) -
            5 * Math.cos(2 * t) -
            2 * Math.cos(3 * t) -
            Math.cos(4 * t);

        // Espalha os pontos pela profundidade
        const depth = Math.cos(v);
        const spread = Math.sin(v);

        particles.push({
            x: x * spread,
            y: y * spread,
            z: depth * 7,
            size: Math.random() * 1.8 + 0.4,
            phase: Math.random() * Math.PI * 2
        });
    }

    // Estrelas de fundo
    for (let i = 0; i < 180; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 1.5 + 0.3,
            alpha: Math.random()
        });
    }
}

function drawHeart(time) {
    ctx.clearRect(0, 0, width, height);

    const beat = 1 + Math.pow(
        Math.max(0, Math.sin(time * 0.003)),
        16
    ) * 0.07;

    // Fundo estrelado
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 160, 230, ${star.alpha})`;
        ctx.fill();
    }

    const scale = Math.min(width, height) / 38;
    const centerX = width / 2;
    const centerY = height / 2 - 15;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const tilt = Math.sin(rotation * 0.7) * 0.22;

    const projected = [];

    for (const p of particles) {
        // Rotação em 3D
        const x = p.x * cos - p.z * sin;
        const z = p.x * sin + p.z * cos;

        // Inclinação suave
        const y = p.y * Math.cos(tilt) - z * Math.sin(tilt);
        const finalZ = p.y * Math.sin(tilt) + z * Math.cos(tilt);

        // Perspectiva
        const perspective = 400 / (400 + finalZ * scale * 0.45);

        const px = centerX + x * scale * beat * perspective;
        const py = centerY - y * scale * beat * perspective;

        projected.push({
            x: px,
            y: py,
            z: finalZ,
            size: p.size * perspective,
            phase: p.phase
        });
    }

    // Desenha primeiro os pontos mais distantes
    projected.sort((a, b) => a.z - b.z);

    for (const p of projected) {
        const glow = 0.55 + 0.45 * Math.sin(time * 0.002 + p.phase);
        const depth = (p.z + 10) / 20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        ctx.fillStyle = depth > 0.5
            ? `rgba(255, ${90 + glow * 90}, 220, ${0.55 + glow * 0.45})`
            : `rgba(170, 30, 180, ${0.45 + glow * 0.4})`;

        ctx.shadowBlur = 5 + glow * 12;
        ctx.shadowColor = "#ff32cb";
        ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Pequenas partículas flutuantes
    for (let i = 0; i < 18; i++) {
        const angle = time * 0.0004 + i * Math.PI / 9;
        const radius = 130 + 18 * Math.sin(time * 0.001 + i);

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * 0.65;

        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ff9be5";
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#ff38bd";
        ctx.fill();
    }

    ctx.shadowBlur = 0;

    rotation += 0.008;
    requestAnimationFrame(drawHeart);
}

window.addEventListener("resize", resize);

window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

resize();
requestAnimationFrame(drawHeart);
