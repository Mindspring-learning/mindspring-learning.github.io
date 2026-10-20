
(function () {
  if (document.getElementById("mira-widget")) return;

  const widget = document.createElement("div");
  widget.id = "mira-widget";

  widget.innerHTML = `
    <section id="mira-panel" hidden
      aria-label="Mira Biology mentor">
      <header class="mira-header">
        <img class="mira-avatar"
          src="mira-face.png" alt="Mira">
        <div class="mira-heading">
          <h3 style="margin:0">Mira 💜</h3>
          <p>Your Biology Buddy</p>
        </div>
        <button class="mira-close"
          type="button" aria-label="Close Mira">×</button>
      </header>

      <div class="mira-content">
        <p id="mira-message" aria-live="polite">
          Hi, scientist! Ready to explore Biology with me?
        </p>

        <div class="mira-actions">
          <button class="mira-action" data-action="chapters">
            📚 Explore Biology
          </button>
          <button class="mira-action" data-action="quiz">
            🧠 Practice MCQs
          </button>
          <button class="mira-action" data-action="hint">
            💡 Give me a hint
          </button>
          <button class="mira-action" data-action="home">
            🏠 Back to MindSpring
          </button>
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
  const status = widget.querySelector("#mira-status");

  const chapters = [
    { name: "Biomolecules", terms: ["biomolecule"] },
    { name: "Cell Cycle and Cell Division",
      terms: ["cell cycle", "cell division"] },
    { name: "Cell: The Unit of Life",
      terms: ["cell"] }
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

  function showMessage(text) {
    message.textContent = text;
    status.replaceChildren();
  }

  toggle.addEventListener("click", function () {
    const opening = panel.hidden;
    panel.hidden = !opening;
    toggle.setAttribute("aria-expanded", String(opening));
    toggle.setAttribute("aria-label",
      opening ? "Close Mira" : "Open Mira");

    if (opening) {
      showMessage("Hi, scientist! 💜 What shall we learn today?");
    }
  });

  widget.querySelector(".mira-close")
    .addEventListener("click", function () {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    });

  widget.querySelectorAll("[data-action]")
    .forEach(button => {
      button.addEventListener("click", function () {
        const action = button.dataset.action;

        if (action === "chapters") {
          showMessage("Pick a chapter and let's explore it! 🔬");

          const available = chapters.filter(chapter =>
            findChapter(chapter.terms)
          );

          if (!available.length) {
            status.textContent =
              "Open your Biology section to find chapter links.";
            return;
          }

          available.forEach(chapter => {
            const link = findChapter(chapter.terms);
            if (!link) return;

            const chapterButton = document.createElement("button");
            chapterButton.className = "mira-action";
            chapterButton.textContent = "📖 " + chapter.name;
            chapterButton.addEventListener("click", () => {
              window.location.href = link;
            });
            status.appendChild(chapterButton);
          });
        }

        if (action === "quiz") {
          showMessage(
            "Quick challenge! Which organelle produces most " +
            "of the ATP in a typical eukaryotic cell?"
          );

          [
            ["Nucleus", false],
            ["Mitochondrion", true],
            ["Golgi apparatus", false]
          ].forEach(([answer, correct]) => {
            const option = document.createElement("button");
            option.className = "mira-action";
            option.textContent = answer;

            option.addEventListener("click", () => {
              showMessage(correct
                ? "Correct! 🎉 Mitochondria are a main site " +
                  "of aerobic ATP production."
                : "Not quite! 💜 Think about cellular respiration."
              );
            });

            status.appendChild(option);
          });
        }

        if (action === "hint") {
          showMessage(
            "Let's take it one concept at a time! " +
            "Read, recall, and then test yourself. 💜"
          );
        }

        if (action === "home") {
          window.location.href = "/";
        }
      });
    });
})();

