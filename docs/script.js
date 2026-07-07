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

btn.addEventListener("click", async () => {
  const industry = document.getElementById("industry").value.trim();
  const role = document.getElementById("role").value.trim();

  if (!industry || !role) {
    message.textContent = "業種と役職を入力してください。";
    return;
  }

  const jobId = crypto.randomUUID();

  message.textContent = "PDFを生成しています。少し待ってから自動確認します。";
  downloadLink.hidden = true;

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
          downloadLink.href = data.pdf_url;
          downloadLink.hidden = false;
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