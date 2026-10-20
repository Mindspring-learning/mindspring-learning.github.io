
(function () {
  if (document.getElementById("mira-widget")) return;

  const widget = document.createElement("div");
  widget.id = "mira-widget";

  widget.innerHTML = `
    <section id="mira-panel" hidden aria-label="Mira Biology mentor">
      <header class="mira-header">
        <img class="mira-avatar" src="mira-face.png" alt="Mira">
        <div class="mira-heading">
          <h3 style="margin:0">Mira 💜</h3>
          <p>Your Biology Buddy</p>
        </div>
        <button class="mira-close" type="button" aria-label="Close Mira">×</button>
      </header>

      <div class="mira-content">
        <span class="mira-mood-label" id="mira-mood">Happy Mira</span>
        <p id="mira-message" aria-live="polite">
          Hi, scientist! Ready to explore Biology?
        </p>

        <div class="mira-actions">
          <button class="mira-action" data-action="chapters">📚 Explore Biology</button>
          <button class="mira-action" data-action="quiz">🧠 Practice MCQs</button>
          <button class="mira-action" data-action="hint">💡 Give me a hint</button>
          <button class="mira-action" data-action="home">🏠 Back to MindSpring</button>
        </div>

        <div id="mira-status"></div>
      </div>
    </section>

    <button id="mira-toggle" type="button"
      aria-label="Open Mira" aria-expanded="false"
      aria-controls="mira-panel">
      <img src="mira-face.png" alt="">
    </button>
  `;

  document.body.appendChild(widget);

  const panel = widget.querySelector("#mira-panel");
  const toggle = widget.querySelector("#mira-toggle");
  const message = widget.querySelector("#mira-message");
  const moodLabel = widget.querySelector("#mira-mood");
  const status = widget.querySelector("#mira-status");

  function setMood(mood, text) {
    widget.classList.remove(
      "mira-happy", "mira-thinking", "mira-celebrating"
    );

    widget.classList.add("mira-" + mood);

    const labels = {
      happy: "Happy Mira 😊",
      thinking: "Thinking Mira 🤔",
      celebrating: "Celebrating Mira 🎉"
    };

    moodLabel.textContent = labels[mood] || "Mira 💜";
    message.textContent = text;
    status.replaceChildren();
  }

  function addOption(label, callback) {
    const button = document.createElement("button");
    button.className = "mira-action";
    button.textContent = label;
    button.addEventListener("click", callback);
    status.appendChild(button);
  }

  const chapters = [
    { name: "Biomolecules", terms: ["biomolecule"] },
    { name: "Cell Cycle and Cell Division",
      terms: ["cell cycle", "cell division"] },
    { name: "Cell: The Unit of Life", terms: ["cell"] }
  ];

  function findChapter(terms) {
    const links = Array.from(document.querySelectorAll("a[href]"));

    for (const term of terms) {
      const match = links.find(link =>
        link.textContent.toLowerCase().includes(term)
      );
      if (match) return match.href;
    }

    return null;
  }

  toggle.addEventListener("click", function () {
    const opening = panel.hidden;
    panel.hidden = !opening;
    toggle.setAttribute("aria-expanded", String(opening));
    toggle.setAttribute("aria-label", opening ? "Close Mira" : "Open Mira");

    if (opening) {
      setMood("happy", "Hi, scientist! 💜 What shall we learn today?");
    }
  });

  widget.querySelector(".mira-close").addEventListener("click", function () {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    toggle.focus();
  });

  widget.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", function () {
      const action = button.dataset.action;

      if (action === "chapters") {
        setMood("happy", "Choose a chapter and let's explore it! 🔬");

        const available = chapters.filter(chapter =>
          findChapter(chapter.terms)
        );

        if (!available.length) {
          status.textContent =
            "Open your Biology section to find your chapter links.";
          return;
        }

        available.forEach(chapter => {
          const url = findChapter(chapter.terms);
          addOption("📖 " + chapter.name, () => {
            window.location.href = url;
          });
        });
      }

      if (action === "quiz") {
        setMood("thinking",
          "Quick challenge! Which organelle produces most ATP during aerobic respiration in a typical eukaryotic cell?");

        [
          ["Nucleus", false],
          ["Mitochondrion", true],
          ["Golgi apparatus", false]
        ].forEach(([answer, correct]) => {
          addOption(answer, () => {
            if (correct) {
              setMood("celebrating",
                "You got it! 🎉 Mitochondria are the main site of aerobic ATP production. Keep going, scientist!");
            } else {
              setMood("thinking",
                "Not quite, but you're learning! 💜 Hint: think about cellular respiration.");
              addOption("Try again", () => {
                button.dispatchEvent(new Event("click"));
              });
            }
          });
        });
      }

      if (action === "hint") {
        setMood("thinking",
          "Let's think it through together! 💡 Break the concept into smaller steps, recall what you know, and then try the question again.");
      }

      if (action === "home") {
        window.location.href = "/";
      }
    });
  });

  widget.classList.add("mira-happy");
})();
