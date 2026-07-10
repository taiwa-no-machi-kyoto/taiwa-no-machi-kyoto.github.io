const navToggle = document.querySelector(".nav-toggle");
const globalNav = document.querySelector(".global-nav");

if (navToggle && globalNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navToggle.classList.toggle("is-open", !isOpen);
    globalNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  globalNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.classList.remove("is-open");
      globalNav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
    });
  });
}

const fadeTargets = document.querySelectorAll(".fade-in");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

fadeTargets.forEach((target) => observer.observe(target));












const WORKER_URL = "https://okibench-proposal-trigger.0105931rikei.workers.dev";

const btn = document.getElementById("generateBtn");
const message = document.getElementById("message");
const downloadLink = document.getElementById("downloadLink");
downloadLink.style.display = "none";
downloadLink.removeAttribute("href");

btn.addEventListener("click", async () => {
  const industry = document.getElementById("industry").value.trim();
  const role = document.getElementById("role").value.trim();

  if (!industry || !role) {
    message.textContent = "業種と役職を入力してください。";
    return;
  }

  const jobId = crypto.randomUUID();

  message.textContent = "PDFを生成しています。少し待ってから自動確認します。";
  hideDownloadButton();

  await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      industry,
      role,
      job_id: jobId
    })
  });

  pollResult(jobId);
});

async function pollResult(jobId) {
  const statusUrl = `./results/${jobId}/status.json`;

  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(statusUrl, { cache: "no-store" });

      if (res.ok) {
        const data = await res.json();

        if (data.status === "success") {
          message.textContent = "PDFが完成しました。";
          showDownloadButton(data.pdf_url);
          return;
        }

        if (data.status === "quota_exceeded") {
          message.textContent = data.message;
          return;
        }

        message.textContent = data.message || "エラーが発生しました。";
        return;
      }
    } catch (e) {}

    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  message.textContent = "生成に時間がかかっています。しばらくしてから再度確認してください。";
}

function showDownloadButton(url) {
  downloadLink.href = url;
  downloadLink.style.display = "inline-block";
}

function hideDownloadButton() {
  downloadLink.style.display = "none";
  downloadLink.removeAttribute("href");
}


const bench = {
  width: 1200,
  minWidth: 1000,
  maxWidth: 2500,
  depth: 350,
  height: 420,
  braceOffset: 150,
  scale: 0.5,
  baseWidth: 1200
};

const svgParts = {};

function $(id) {
  return document.getElementById(id);
}

function setAttr(id, name, value) {
  const el = svgParts[id] || $(id);
  if (el) el.setAttribute(name, value);
}

function setText(id, text) {
  const el = svgParts[id] || $(id);
  if (el) el.textContent = text;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function mmToPx(mm, scale = bench.scale) {
  return mm * scale;
}

async function loadSvg() {
  const container = $("svgContainer");

  try {
    const response = await fetch("./bench.svg");
    if (!response.ok) {
      throw new Error(`bench.svgを読み込めませんでした: ${response.status}`);
    }

    container.innerHTML = await response.text();
    initializeBench();
  } catch (error) {
    container.innerHTML = `
      <div class="error">
        <strong>SVGの読み込みに失敗しました。</strong><br>
        ${error.message}<br><br>
        対処：このフォルダで <code>python -m http.server</code> を実行し、
        <code>http://localhost:8000</code> から開いてください。
      </div>
    `;
  }
}

function initializeBench() {
  cacheSvgParts();
  registerEvents();
  updateBenchWidth(bench.width);
}

function cacheSvgParts() {
  [
    "main_size_label",
    "perspective_seat_1", "perspective_seat_2", "perspective_seat_3",
    "perspective_center_brace_front", "perspective_center_brace_back",
    "perspective_leg_front_right", "perspective_leg_back_right",
    "perspective_brace_right_depth", "perspective_brace_right_lower_depth",
    "perspective_screw_03", "perspective_screw_04", "perspective_screw_07",
    "perspective_screw_08", "perspective_screw_11", "perspective_screw_12",
    "perspective_seat_gap_line_1", "perspective_seat_gap_line_2",
    "perspective_seat_label", "perspective_leg_label", "perspective_leg_label_arrow",

    "top_seat_1", "top_seat_2", "top_seat_3",
    "top_brace_right",
    "top_screw_right_01", "top_screw_right_02", "top_screw_right_03",
    "top_screw_right_04", "top_screw_right_05", "top_screw_right_06",
    "top_dim_width_line", "top_dim_width_text",
    "top_dim_right_offset_line", "top_dim_right_offset_text",
    "top_note_label",

    "front_seat", "front_leg_right", "front_center_brace",
    "front_screw_03", "front_screw_04", "front_screw_06",
    "front_dim_width_line", "front_dim_width_text",
    "front_dim_right_offset_line", "front_dim_right_offset_text",
    "front_right_leg_guide_line", "front_leg_right_label",
    "front_center_brace_label",

    "cut_seat_1", "cut_seat_2", "cut_seat_3",
    "cut_seat_label",
    "cut_center_brace_1", "cut_center_brace_2",
    "cut_center_brace_label"
  ].forEach(id => {
    svgParts[id] = $(id);
  });
}

function registerEvents() {
  const range = $("benchWidthRange");
  const number = $("benchWidthNumber");

  range.addEventListener("input", event => {
    updateBenchWidth(event.target.value);
  });

  number.addEventListener("input", event => {
    updateBenchWidth(event.target.value);
  });
}

function updateBenchWidth(value) {
  const width = clamp(value, bench.minWidth, bench.maxWidth);
  bench.width = width;

  $("benchWidthRange").value = width;
  $("benchWidthNumber").value = width;

  updateTitle();
  updatePerspectiveView();
  updateTopView();
  updateFrontView();
  updateCutList();
}

function updateTitle() {
  setText(
    "main_size_label",
    `完成寸法：幅${bench.width}mm × 奥行${bench.depth}mm × 高さ${bench.height}mm ／ 主材料：2×4材`
  );
}

function viewScale(maxPx = 600) {
  return Math.min(bench.scale, maxPx / bench.width);
}

function updateTopView() {
  const scale = viewScale(600);
  const w = mmToPx(bench.width, scale);
  const offset = mmToPx(bench.braceOffset, scale);
  const braceWidth = 28;
  const rightBraceX = w - offset - braceWidth;

  ["top_seat_1", "top_seat_2", "top_seat_3"].forEach(id => {
    setAttr(id, "width", w);
  });

  setAttr("top_brace_right", "x", rightBraceX);

  const rightScrews = [
    ["top_screw_right_01", 7, 20],
    ["top_screw_right_02", 21, 20],
    ["top_screw_right_03", 7, 87],
    ["top_screw_right_04", 21, 87],
    ["top_screw_right_05", 7, 153],
    ["top_screw_right_06", 21, 153]
  ];

  rightScrews.forEach(([id, dx, y]) => {
    setAttr(id, "cx", rightBraceX + dx);
    setAttr(id, "cy", y);
  });

  setAttr("top_dim_width_line", "x2", w);
  setAttr("top_dim_width_text", "x", w / 2);
  setText("top_dim_width_text", `${bench.width}mm`);

  setAttr("top_dim_right_offset_line", "x1", rightBraceX + braceWidth);
  setAttr("top_dim_right_offset_line", "x2", w);
  setAttr("top_dim_right_offset_text", "x", (rightBraceX + braceWidth + w) / 2);

  setText("top_note_label", `座面板3本は奥行方向に並べる。${bench.width}mm方向がベンチの横幅。`);
}

function updateFrontView() {
  const scale = viewScale(600);
  const w = mmToPx(bench.width, scale);
  const startX = -60;
  const endX = startX + w;
  const offset = mmToPx(bench.braceOffset, scale);

  const legWidth = 38;
  const leftLegX = startX + offset - 20;
  const rightLegX = endX - offset - legWidth + 20;

  setAttr("front_seat", "width", w);

  setAttr("front_leg_right", "x", rightLegX);

  const centerBraceX = leftLegX + 25;
  const centerBraceW = Math.max(120, rightLegX - centerBraceX + 20);
  setAttr("front_center_brace", "x", centerBraceX);
  setAttr("front_center_brace", "width", centerBraceW);

  setAttr("front_screw_03", "cx", rightLegX + 13);
  setAttr("front_screw_04", "cx", rightLegX + 27);
  setAttr("front_screw_06", "cx", rightLegX - 12);

  setAttr("front_dim_width_line", "x1", startX);
  setAttr("front_dim_width_line", "x2", endX);
  setAttr("front_dim_width_text", "x", startX + w / 2);
  setText("front_dim_width_text", `${bench.width}mm`);

  setAttr("front_dim_right_offset_line", "x1", rightLegX + legWidth / 2);
  setAttr("front_dim_right_offset_line", "x2", endX);
  setAttr("front_dim_right_offset_text", "x", (rightLegX + legWidth / 2 + endX) / 2);

  setAttr("front_right_leg_guide_line", "x1", rightLegX + legWidth / 2);
  setAttr("front_right_leg_guide_line", "x2", rightLegX + legWidth / 2);

  setAttr("front_leg_right_label", "x", rightLegX - 35);

  const centerBraceMm = calculateCenterBraceLength();
  setText("front_center_brace_label", `中央補強材 ${centerBraceMm}mm`);
}

function updateCutList() {
  const scale = Math.min(bench.scale, 600 / bench.width);
  const seatDisplayWidth = mmToPx(bench.width, scale);

  ["cut_seat_1", "cut_seat_2", "cut_seat_3"].forEach(id => {
    setAttr(id, "width", seatDisplayWidth);
  });

  setText("cut_seat_label", `座面材 ${bench.width}mm × 3本`);

  const centerBraceMm = calculateCenterBraceLength();
  const centerBracePx = Math.min(mmToPx(centerBraceMm, bench.scale), 500);

  setAttr("cut_center_brace_1", "width", centerBracePx);
  setAttr("cut_center_brace_2", "width", centerBracePx);
  setText("cut_center_brace_label", `中央補強材 ${centerBraceMm}mm × 2本`);
}

function calculateCenterBraceLength() {
  return Math.max(800, bench.width - 200);
}

const originalPerspectivePoints = {
  perspective_seat_1: "-120,80 360,80 440,130 -40,130",
  perspective_seat_2: "-120,125 360,125 440,175 -40,175",
  perspective_seat_3: "-120,170 360,170 440,220 -40,220",
  perspective_center_brace_front: "-70,265 425,265 425,290 -70,290",
  perspective_center_brace_back: "-55,320 440,320 440,345 -55,345"
};

function updatePerspectiveView() {
  const ratio = bench.width / bench.baseWidth;
  const dx = (ratio - 1) * 180;

  setText("perspective_seat_label", `座面材 ${bench.width}mm × 3本`);

  [
    "perspective_leg_front_right",
    "perspective_leg_back_right",
    "perspective_brace_right_depth",
    "perspective_brace_right_lower_depth",
    "perspective_screw_03",
    "perspective_screw_04",
    "perspective_screw_07",
    "perspective_screw_08",
    "perspective_screw_11",
    "perspective_screw_12",
    "perspective_leg_label",
    "perspective_leg_label_arrow"
  ].forEach(id => {
    setAttr(id, "transform", `translate(${dx},0)`);
  });

  [
    "perspective_seat_1",
    "perspective_seat_2",
    "perspective_seat_3",
    "perspective_center_brace_front",
    "perspective_center_brace_back"
  ].forEach(id => stretchPerspectivePolygon(id, dx));

  setAttr("perspective_seat_gap_line_1", "x2", 570 + dx);
  setAttr("perspective_seat_gap_line_2", "x2", 580 + dx);
}

function stretchPerspectivePolygon(id, dx) {
  const source = originalPerspectivePoints[id];
  if (!source) return;

  const points = source
    .split(" ")
    .map(pair => {
      const [rawX, rawY] = pair.split(",").map(Number);
      const x = rawX > 300 ? rawX + dx : rawX;
      return `${x},${rawY}`;
    })
    .join(" ");

  setAttr(id, "points", points);
}

document.addEventListener("DOMContentLoaded", loadSvg);
