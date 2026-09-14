import { useEffect, useRef } from "react";

const PARTICLE_COLORS = [
  { r: 167, g: 139, b: 250 },
  { r: 139, g: 92, b: 246 },
  { r: 245, g: 196, b: 81 },
  { r: 255, g: 255, b: 255 },
];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createParticle(width, height, density) {
  const color = PARTICLE_COLORS[
    Math.floor(Math.random() * PARTICLE_COLORS.length)
  ];

  return {
    x: random(0, width),
    y: random(0, height),
    vx: random(-0.12, 0.12),
    vy: random(-0.18, 0.18),
    radius: random(0.8, 2.35) * density,
    alpha: random(0.30, 0.88),
    twinkle: random(0, Math.PI * 2),
    twinkleSpeed: random(0.006, 0.018),
    color,
  };
}

export default function LiveVFX() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!context) {
      return undefined;
    }

    const motionReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const coarsePointer = window.matchMedia(
      "(pointer: coarse)"
    ).matches;

    const state = {
      width: 0,
      height: 0,
      dpr: 1,
      particles: [],
      shootingStars: [],
      nextShootingStar: 0,
      animationFrame: 0,
      mouse: {
        x: 0,
        y: 0,
        active: false,
      },
    };

    function resize() {
      const rect = canvas.getBoundingClientRect();

      state.dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      state.width = rect.width;
      state.height = rect.height;

      canvas.width = Math.floor(state.width * state.dpr);
      canvas.height = Math.floor(state.height * state.dpr);

      context.setTransform(
        state.dpr,
        0,
        0,
        state.dpr,
        0,
        0
      );

      const area = state.width * state.height;
      const baseCount = coarsePointer ? 22 : 46;
      const calculatedCount = Math.round(area / 30000);
      const count = Math.min(
        baseCount,
        Math.max(12, calculatedCount + baseCount)
      );

      state.particles = Array.from({ length: count }, () =>
        createParticle(state.width, state.height, coarsePointer ? 0.82 : 1)
      );
    }

    function spawnShootingStar(timestamp) {
      if (motionReduced) return;

      if (timestamp < state.nextShootingStar) return;

      if (Math.random() > 0.48) {
        state.nextShootingStar =
          timestamp + random(1100, 2600);
        return;
      }

      const startX = random(
        state.width * 0.05,
        state.width * 0.95
      );

      const startY = random(
        state.height * 0.04,
        state.height * 0.55
      );

      const length = random(95, 190);
      const speed = random(5.2, 8.8);
      const angle = random(
        Math.PI * 0.16,
        Math.PI * 0.29
      );

      const palette = Math.random() > 0.2
        ? { r: 175, g: 142, b: 255 }
        : { r: 245, g: 196, b: 81 };

      state.shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length,
        life: 0,
        maxLife: random(34, 58),
        color: palette,
        alpha: random(0.72, 1),
      });

      state.nextShootingStar =
        timestamp + random(1800, 4200);
    }

    function drawShootingStars() {
      if (!state.shootingStars.length) return;

      for (let index = state.shootingStars.length - 1; index >= 0; index -= 1) {
        const star = state.shootingStars[index];

        star.x += star.vx;
        star.y += star.vy;
        star.life += 1;

        const progress = star.life / star.maxLife;
        const fade =
          progress < 0.18
            ? progress / 0.18
            : Math.max(0, 1 - progress);

        const tailX =
          star.x - Math.cos(
            Math.atan2(star.vy, star.vx)
          ) * star.length;

        const tailY =
          star.y - Math.sin(
            Math.atan2(star.vy, star.vx)
          ) * star.length;

        const { r, g, b } = star.color;

        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(star.x, star.y);
        context.strokeStyle =
          `rgba(${r}, ${g}, ${b}, ${
            star.alpha * fade * 0.72
          })`;
        context.lineWidth = 2.1;
        context.lineCap = "round";
        context.shadowBlur = 12;
        context.shadowColor =
          `rgba(${r}, ${g}, ${b}, ${
            star.alpha * fade * 0.78
          })`;
        context.stroke();
        context.shadowBlur = 0;

        drawGlow(
          star.x,
          star.y,
          26,
          r,
          g,
          b,
          star.alpha * fade * 0.28
        );

        context.fillStyle =
          `rgba(${r}, ${g}, ${b}, ${
            star.alpha * fade
          })`;

        context.beginPath();
        context.arc(
          star.x,
          star.y,
          2.15,
          0,
          Math.PI * 2
        );
        context.fill();

        if (
          star.life > star.maxLife ||
          star.x > state.width + 80 ||
          star.y > state.height + 80
        ) {
          state.shootingStars.splice(index, 1);
        }
      }
    }

    function drawGlow(
      x,
      y,
      radius,
      r,
      g,
      b,
      alpha
    ) {
      const glow = context.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius
      );

      glow.addColorStop(
        0,
        `rgba(${r}, ${g}, ${b}, ${alpha})`
      );
      glow.addColorStop(
        0.35,
        `rgba(${r}, ${g}, ${b}, ${alpha * 0.26})`
      );
      glow.addColorStop(
        1,
        `rgba(${r}, ${g}, ${b}, 0)`
      );

      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    function render(timestamp) {
      context.clearRect(
        0,
        0,
        state.width,
        state.height
      );

      const connectionDistance = coarsePointer ? 72 : 105;

      spawnShootingStar(timestamp);
      drawShootingStars();

      for (const particle of state.particles) {
        particle.twinkle += particle.twinkleSpeed;

        const flicker =
          0.72 +
          Math.sin(particle.twinkle) * 0.28;

        if (!motionReduced) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < -20) {
            particle.x = state.width + 20;
          }

          if (particle.x > state.width + 20) {
            particle.x = -20;
          }

          if (particle.y < -20) {
            particle.y = state.height + 20;
          }

          if (particle.y > state.height + 20) {
            particle.y = -20;
          }

          if (state.mouse.active) {
            const dx =
              state.mouse.x - particle.x;
            const dy =
              state.mouse.y - particle.y;
            const distance =
              Math.sqrt(dx * dx + dy * dy) || 1;

            if (distance < 180) {
              const force =
                (180 - distance) / 180;

              particle.x -=
                (dx / distance) * force * 0.18;
              particle.y -=
                (dy / distance) * force * 0.18;
            }
          }
        }

        const { r, g, b } = particle.color;

        drawGlow(
          particle.x,
          particle.y,
          particle.radius * 9.5,
          r,
          g,
          b,
          particle.alpha * 0.13 * flicker
        );

        context.fillStyle =
          `rgba(${r}, ${g}, ${b}, ${
            Math.min(0.92, particle.alpha * 1.08 * flicker)
          })`;

        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );
        context.fill();
      }

      if (!coarsePointer && !motionReduced) {
        for (
          let index = 0;
          index < state.particles.length;
          index += 1
        ) {
          for (
            let otherIndex = index + 1;
            otherIndex < state.particles.length;
            otherIndex += 1
          ) {
            const particle = state.particles[index];
            const other = state.particles[otherIndex];

            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance =
              Math.sqrt(dx * dx + dy * dy);

            if (distance > connectionDistance) {
              continue;
            }

            const strength =
              1 - distance / connectionDistance;

            const mix =
              (particle.color.r +
                other.color.r) /
              2;

            const mixG =
              (particle.color.g +
                other.color.g) /
              2;

            const mixB =
              (particle.color.b +
                other.color.b) /
              2;

            context.beginPath();
            context.moveTo(
              particle.x,
              particle.y
            );
            context.lineTo(
              other.x,
              other.y
            );
            context.strokeStyle =
              `rgba(${mix}, ${mixG}, ${mixB}, ${
                strength * 0.085
              })`;
            context.lineWidth = 0.65;
            context.stroke();
          }
        }
      }

      if (!motionReduced && state.mouse.active) {
        drawGlow(
          state.mouse.x,
          state.mouse.y,
          145,
          139,
          92,
          246,
          0.055
        );

        drawGlow(
          state.mouse.x + 26,
          state.mouse.y - 18,
          85,
          245,
          196,
          81,
          0.025
        );
      }

      state.animationFrame = window.requestAnimationFrame(
        render
      );
    }

    function handlePointerMove(event) {
      state.mouse.x = event.clientX;
      state.mouse.y = event.clientY;
      state.mouse.active = true;
    }

    function handlePointerLeave() {
      state.mouse.active = false;
    }

    resize();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("blur", handlePointerLeave);

    state.nextShootingStar =
      performance.now() + random(450, 900);

    render(performance.now());

    return () => {
      window.cancelAnimationFrame(
        state.animationFrame
      );
      window.removeEventListener("resize", resize);
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );
      window.removeEventListener(
        "blur",
        handlePointerLeave
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="live-vfx-canvas"
      aria-hidden="true"
    />
  );
}
