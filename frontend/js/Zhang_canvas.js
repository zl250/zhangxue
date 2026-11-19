/*
  姓名：张雪 | 学号：24001010727 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
  说明：首页 Canvas 背景动画（粒子星链），原生 JavaScript 实现
*/

(function () {
  "use strict";

  var Zhang_canvas = document.getElementById("Zhang_canvas");
  if (!Zhang_canvas) {
    return;
  }

  var Zhang_ctx = Zhang_canvas.getContext("2d");
  var Zhang_reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var Zhang_colors = ["#4a9dff", "#22d3ee", "#8ec5ff", "#056de8"];
  var Zhang_linkDistance = 132;

  var Zhang_width = 0;
  var Zhang_height = 0;
  var Zhang_dpr = 1;
  var Zhang_particles = [];
  var Zhang_pointer = { x: -9999, y: -9999 };
  var Zhang_frameId = null;

  function Zhang_createParticle() {
    var Zhang_speed = 0.22;
    return {
      x: Math.random() * Zhang_width,
      y: Math.random() * Zhang_height,
      vx: (Math.random() - 0.5) * Zhang_speed,
      vy: (Math.random() - 0.5) * Zhang_speed,
      radius: Math.random() * 1.6 + 0.7,
      color: Zhang_colors[Math.floor(Math.random() * Zhang_colors.length)],
      alpha: Math.random() * 0.45 + 0.35
    };
  }

  function Zhang_resize() {
    Zhang_width = window.innerWidth;
    Zhang_height = window.innerHeight;
    Zhang_dpr = Math.min(window.devicePixelRatio || 1, 2);

    Zhang_canvas.width = Math.floor(Zhang_width * Zhang_dpr);
    Zhang_canvas.height = Math.floor(Zhang_height * Zhang_dpr);
    Zhang_canvas.style.width = Zhang_width + "px";
    Zhang_canvas.style.height = Zhang_height + "px";

    Zhang_ctx.setTransform(Zhang_dpr, 0, 0, Zhang_dpr, 0, 0);

    var Zhang_count = Math.min(
      Math.max(Math.round((Zhang_width * Zhang_height) / 16000), 40),
      120
    );

    Zhang_particles = [];
    for (var Zhang_i = 0; Zhang_i < Zhang_count; Zhang_i++) {
      Zhang_particles.push(Zhang_createParticle());
    }
  }

  function Zhang_drawParticles() {
    Zhang_ctx.clearRect(0, 0, Zhang_width, Zhang_height);

    for (var Zhang_i = 0; Zhang_i < Zhang_particles.length; Zhang_i++) {
      var Zhang_p = Zhang_particles[Zhang_i];

      if (!Zhang_reduceMotion) {
        Zhang_p.x += Zhang_p.vx;
        Zhang_p.y += Zhang_p.vy;
      }

      if (Zhang_p.x < -20) {
        Zhang_p.x = Zhang_width + 20;
      } else if (Zhang_p.x > Zhang_width + 20) {
        Zhang_p.x = -20;
      }

      if (Zhang_p.y < -20) {
        Zhang_p.y = Zhang_height + 20;
      } else if (Zhang_p.y > Zhang_height + 20) {
        Zhang_p.y = -20;
      }

      Zhang_ctx.beginPath();
      Zhang_ctx.arc(Zhang_p.x, Zhang_p.y, Zhang_p.radius, 0, Math.PI * 2);
      Zhang_ctx.fillStyle = Zhang_p.color;
      Zhang_ctx.globalAlpha = Zhang_p.alpha;
      Zhang_ctx.fill();
    }

    for (var Zhang_m = 0; Zhang_m < Zhang_particles.length; Zhang_m++) {
      for (var Zhang_n = Zhang_m + 1; Zhang_n < Zhang_particles.length; Zhang_n++) {
        var Zhang_a = Zhang_particles[Zhang_m];
        var Zhang_b = Zhang_particles[Zhang_n];
        var Zhang_dx = Zhang_a.x - Zhang_b.x;
        var Zhang_dy = Zhang_a.y - Zhang_b.y;
        var Zhang_distance = Math.sqrt(Zhang_dx * Zhang_dx + Zhang_dy * Zhang_dy);

        if (Zhang_distance < Zhang_linkDistance) {
          Zhang_ctx.beginPath();
          Zhang_ctx.moveTo(Zhang_a.x, Zhang_a.y);
          Zhang_ctx.lineTo(Zhang_b.x, Zhang_b.y);
          Zhang_ctx.strokeStyle = "#4a9dff";
          Zhang_ctx.globalAlpha =
            (1 - Zhang_distance / Zhang_linkDistance) * 0.22;
          Zhang_ctx.lineWidth = 1;
          Zhang_ctx.stroke();
        }
      }
    }

    Zhang_ctx.globalAlpha = 1;
    Zhang_frameId = window.requestAnimationFrame(Zhang_drawParticles);
  }

  function Zhang_handlePointerMove(Zhang_event) {
    Zhang_pointer.x = Zhang_event.clientX;
    Zhang_pointer.y = Zhang_event.clientY;

    for (var Zhang_i = 0; Zhang_i < Zhang_particles.length; Zhang_i++) {
      var Zhang_p = Zhang_particles[Zhang_i];
      var Zhang_dx = Zhang_p.x - Zhang_pointer.x;
      var Zhang_dy = Zhang_p.y - Zhang_pointer.y;
      var Zhang_distance = Math.sqrt(Zhang_dx * Zhang_dx + Zhang_dy * Zhang_dy);

      if (Zhang_distance < 110 && Zhang_distance > 0.1) {
        Zhang_p.x += (Zhang_dx / Zhang_distance) * 1.4;
        Zhang_p.y += (Zhang_dy / Zhang_distance) * 1.4;
      }
    }
  }

  Zhang_resize();
  Zhang_drawParticles();

  window.addEventListener("resize", Zhang_resize);
  window.addEventListener("pointermove", Zhang_handlePointerMove);

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      window.cancelAnimationFrame(Zhang_frameId);
      Zhang_frameId = null;
    } else if (Zhang_frameId === null) {
      Zhang_drawParticles();
    }
  });
})();
