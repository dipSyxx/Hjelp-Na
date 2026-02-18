const body = document.body;
const drawer = document.querySelector(".chat-drawer");
const openButtons = document.querySelectorAll("[data-open-chat]");
const closeButtons = document.querySelectorAll("[data-close-chat]");
const chatBody = document.getElementById("chatBody");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");

let introTimer = null;

function getRevealTargets() {
  const selectors = [
    ".topbar",
    ".topbar .logo",
    ".topbar .nav a",
    ".topbar .btn-small",
    ".hero",
    ".hero-copy > *",
    ".hero-actions .btn",
    ".hero-visual",
    ".section > h2",
    ".line-title",
    ".topic-card",
    ".flow-card",
    ".contact-section > h2",
    ".contact-section > p",
    ".contact-form .form-field",
    ".contact-form .form-submit",
    ".cta-strip",
    ".cta-box > *",
    ".mental-top",
    ".mental-intro > *",
    ".mental-check-card",
    ".mental-flow .line-title",
    ".mental-faq-item",
    ".mental-cta > *",
  ];

  const nodes = Array.from(document.querySelectorAll(selectors.join(",")));
  return [...new Set(nodes)];
}

function runIntroAnimation() {
  if (!body) return;
  if (introTimer) {
    clearTimeout(introTimer);
    introTimer = null;
  }

  const targets = getRevealTargets();
  targets.forEach((element, index) => {
    element.classList.add("anim-seq");
    const delay = Math.min(index * 55, 1400);
    element.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  body.classList.remove("page-loaded");
  body.classList.add("pre-animate");
  void body.offsetWidth;

  introTimer = window.setTimeout(() => {
    body.classList.add("page-loaded");
    body.classList.remove("pre-animate");
  }, 30);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runIntroAnimation, { once: true });
} else {
  runIntroAnimation();
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    runIntroAnimation();
  }
});

function openChat() {
  if (!drawer || !chatInput) return;
  body.classList.add("chat-open");
  drawer.setAttribute("aria-hidden", "false");
  setTimeout(() => chatInput.focus(), 120);
}

function closeChat() {
  if (!drawer) return;
  body.classList.remove("chat-open");
  drawer.setAttribute("aria-hidden", "true");
}

function addBubble(text, type) {
  if (!chatBody) return;
  const el = document.createElement("div");
  el.className = `bubble ${type}`;
  el.textContent = text;
  chatBody.appendChild(el);
  chatBody.scrollTop = chatBody.scrollHeight;
}

openButtons.forEach((button) =>
  button.addEventListener("click", (event) => {
    event.preventDefault();
    openChat();
  })
);
closeButtons.forEach((button) => button.addEventListener("click", closeChat));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeChat();
  }
});

if (chatForm && chatInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = chatInput.value.trim();
    if (!value) return;

    addBubble(value, "user");
    chatInput.value = "";

    setTimeout(() => {
      addBubble("Takk for at du skrev. En helsehjelper svarer deg straks.", "helper");
    }, 500);
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactForm.reset();

    if (!formSuccess) return;
    formSuccess.classList.remove("show");
    void formSuccess.offsetWidth;
    formSuccess.classList.add("show");
    formSuccess.setAttribute("aria-hidden", "false");

    setTimeout(() => {
      formSuccess.setAttribute("aria-hidden", "true");
    }, 2400);
  });
}
