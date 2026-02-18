const body = document.body;
const drawer = document.querySelector(".chat-drawer");
const openButtons = document.querySelectorAll("[data-open-chat]");
const closeButtons = document.querySelectorAll("[data-close-chat]");
const chatBody = document.getElementById("chatBody");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const contactForm = document.getElementById("contactForm");
const formSuccess = document.getElementById("formSuccess");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let introTimer = null;
let interactionsReady = false;

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

function setupInteractiveCards() {
  const cards = Array.from(document.querySelectorAll("#mental .topic-card, .flow-grid .flow-card"));
  if (!cards.length) return;

  cards.forEach((card) => {
    card.setAttribute("tabindex", "0");

    const resetCard = () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--glow-x", "50%");
      card.style.setProperty("--glow-y", "50%");
      card.classList.remove("is-hovered");
    };

    if (!prefersReducedMotion.matches) {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.setProperty("--tilt-x", `${(-y * 7).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${(x * 9).toFixed(2)}deg`);
        card.style.setProperty("--glow-x", `${((x + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty("--glow-y", `${((y + 0.5) * 100).toFixed(1)}%`);
        card.classList.add("is-hovered");
      });
    }

    card.addEventListener("pointerenter", () => card.classList.add("is-hovered"));
    card.addEventListener("pointerleave", resetCard);
    card.addEventListener("focus", () => card.classList.add("is-hovered"));
    card.addEventListener("blur", resetCard);
  });
}

function setupFlowProgressInteraction() {
  const flowGrid = document.querySelector(".flow-grid");
  if (!flowGrid) return;

  const cards = Array.from(flowGrid.querySelectorAll(".flow-card"));
  if (!cards.length) return;

  const maxTrack = 74;
  const maxIndex = Math.max(cards.length - 1, 1);

  const setActiveStep = (stepIndex) => {
    const activeIndex = Math.max(0, Math.min(stepIndex, cards.length - 1));
    const progress = (activeIndex / maxIndex) * maxTrack;

    flowGrid.style.setProperty("--flow-progress", `${progress}%`);
    cards.forEach((card, index) => {
      card.classList.toggle("trail", index <= activeIndex);
      card.classList.toggle("is-active", index === activeIndex);
    });
  };

  cards.forEach((card, index) => {
    card.addEventListener("mouseenter", () => setActiveStep(index));
    card.addEventListener("focus", () => setActiveStep(index));
    card.addEventListener("click", () => setActiveStep(index));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      setActiveStep(index);
    });
  });

  flowGrid.addEventListener("mouseleave", () => setActiveStep(0));
  setActiveStep(0);
}

function setupSectionInteractions() {
  if (interactionsReady) return;
  interactionsReady = true;
  setupInteractiveCards();
  setupFlowProgressInteraction();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      runIntroAnimation();
      setupSectionInteractions();
    },
    { once: true }
  );
} else {
  runIntroAnimation();
  setupSectionInteractions();
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
