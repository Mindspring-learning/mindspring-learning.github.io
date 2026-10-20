
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
        <button class="mira-close" type="button"
          aria-label="Close Mira">×</button>
      </header>

      <div class="mira-content">
        <span class="mira-mood-label" id="mira-mood">Happy Mira</span>
        <p id="mira-message" aria-live="polite">
          Hi, scientist! Ready to explore Biology?
        </p>

        <div class="mira-actions">
          <button class="mira-action" data-action="chapters">
            📚 Explore Biology
          </button>
          <button class="mira-action" data-action="quiz">
            🧠 Practice MCQs
          </button>
          <button class="mira-action" data-action="knowledge">
            ✨ Ask about a topic
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
  const moodLabel = widget.querySelector("#mira-mood");
  const status = widget.querySelector("#mira-status");

  let lastQuestionId = null;
  let currentQuestion = null;
  let currentHint = "";
  let questionLocked = false;

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
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", callback);
    status.appendChild(button);
    return button;
  }

  function addTextInput(placeholder, submitLabel, callback) {
    const form = document.createElement("form");
    form.className = "mira-question-form";

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.setAttribute("aria-label", placeholder);
    input.required = true;
    input.maxLength = 180;

    const submit = document.createElement("button");
    submit.className = "mira-action";
    submit.type = "submit";
    submit.textContent = submitLabel;

    form.append(input, submit);
    status.appendChild(form);

    form.addEventListener("submit", event => {
      event.preventDefault();
      const value = input.value.trim();
      if (!value) return;
      callback(value);
    });

    input.focus();
  }

  const chapters = [
    {
      name: "Biomolecules",
      terms: ["biomolecule", "biomolecules"],
      title: "Biomolecules"
    },
    {
      name: "Cell Cycle and Cell Division",
      terms: ["cell cycle", "cell division"],
      title: "Cell Cycle and Cell Division"
    },
    {
      name: "Cell: The Unit of Life",
      terms: ["cell: the unit", "cell structure"],
      title: "Cell: The Unit of Life"
    }
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

  // Biology question bank. Add new questions to this array.
  const questionBank = [
    {
      id: "bio1",
      chapter: "Cell: The Unit of Life",
      question: "Which organelle is the main site of aerobic ATP production in a typical eukaryotic cell?",
      options: [
        "Nucleus",
        "Mitochondrion",
        "Golgi apparatus",
        "Lysosome"
      ],
      answer: 1,
      explanation: "Mitochondria are a major site of aerobic respiration and ATP production in eukaryotic cells.",
      hint: "Think about the organelle associated with cellular respiration."
    },
    {
      id: "bio2",
      chapter: "Cell: The Unit of Life",
      question: "Which structure regulates the movement of substances into and out of a cell?",
      options: [
        "Cell membrane",
        "Nucleolus",
        "Ribosome",
        "Chromosome"
      ],
      answer: 0,
      explanation: "The plasma membrane is selectively permeable and regulates exchange between the cell and its surroundings.",
      hint: "Think of the boundary that surrounds the cell."
    },
    {
      id: "bio3",
      chapter: "Cell: The Unit of Life",
      question: "Which cell structure is directly involved in protein synthesis?",
      options: [
        "Lysosome",
        "Central vacuole",
        "Ribosome",
        "Centrosome"
      ],
      answer: 2,
      explanation: "Ribosomes translate messenger RNA to build polypeptide chains.",
      hint: "These structures may be free in the cytoplasm or attached to rough ER."
    },
    {
      id: "bio4",
      chapter: "Cell: The Unit of Life",
      question: "Which organelle contains enzymes involved in intracellular digestion?",
      options: [
        "Lysosome",
        "Chloroplast",
        "Nucleolus",
        "Smooth ER"
      ],
      answer: 0,
      explanation: "Lysosomes contain hydrolytic enzymes that break down many biological materials.",
      hint: "Think of the cell's digestive compartment."
    },
    {
      id: "bio5",
      chapter: "Cell Cycle and Cell Division",
      question: "During which stage of mitosis do chromosomes align at the equatorial plate?",
      options: [
        "Prophase",
        "Metaphase",
        "Anaphase",
        "Telophase"
      ],
      answer: 1,
      explanation: "During metaphase, chromosomes align at the cell's equatorial plate.",
      hint: "It occurs after prophase and before anaphase."
    },
    {
      id: "bio6",
      chapter: "Cell Cycle and Cell Division",
      question: "What separates and moves towards opposite poles during anaphase of mitosis?",
      options: [
        "Nucleoli only",
        "Cell walls",
        "Sister chromatids",
        "The plasma membrane"
      ],
      answer: 2,
      explanation: "Sister chromatids separate and move towards opposite poles during anaphase of mitosis.",
      hint: "Each replicated chromosome consists of two copies joined at the centromere."
    },
    {
      id: "bio7",
      chapter: "Cell Cycle and Cell Division",
      question: "DNA replication takes place during which part of interphase?",
      options: [
        "G1 phase",
        "S phase",
        "G2 phase",
        "M phase"
      ],
      answer: 1,
      explanation: "DNA synthesis takes place during the S phase of interphase.",
      hint: "The letter in this phase's name refers to synthesis."
    },
    {
      id: "bio8",
      chapter: "Cell Cycle and Cell Division",
      question: "Which process divides the cytoplasm after nuclear division?",
      options: [
        "Replication",
        "Transcription",
        "Translation",
        "Cytokinesis"
      ],
      answer: 3,
      explanation: "Cytokinesis divides the cytoplasm to form daughter cells.",
      hint: "Karyokinesis divides the nucleus; recall the term for cytoplasmic division."
    },
    {
      id: "bio9",
      chapter: "Biomolecules",
      question: "Which class of biomolecules includes enzymes that catalyse most biological reactions?",
      options: [
        "Proteins",
        "Mineral salts",
        "Water",
        "Nucleic acids only"
      ],
      answer: 0,
      explanation: "Most enzymes are proteins, although some RNA molecules can also catalyse reactions.",
      hint: "Think of polymers made from amino acids."
    },
    {
      id: "bio10",
      chapter: "Biomolecules",
      question: "Which monomers form proteins?",
      options: [
        "Monosaccharides",
        "Fatty acids",
        "Amino acids",
        "Nucleotides"
      ],
      answer: 2,
      explanation: "Proteins are made from amino acids linked by peptide bonds.",
      hint: "Peptide bonds connect these building blocks."
    },
    {
      id: "bio11",
      chapter: "Biomolecules",
      question: "Which bond links amino acids in a polypeptide chain?",
      options: [
        "Glycosidic bond",
        "Peptide bond",
        "Hydrogen bond only",
        "Phosphodiester bond"
      ],
      answer: 1,
      explanation: "A peptide bond links the carboxyl group of one amino acid to the amino group of another.",
      hint: "The bond's name is closely associated with peptides."
    },
    {
      id: "bio12",
      chapter: "Biomolecules",
      question: "Which of the following is a monosaccharide?",
      options: [
        "Starch",
        "Cellulose",
        "Glycogen",
        "Glucose"
      ],
      answer: 3,
      explanation: "Glucose is a monosaccharide, while starch, cellulose and glycogen are polysaccharides.",
      hint: "Choose the simple sugar rather than a large carbohydrate polymer."
    }
  ];

  function pickQuestion() {
    let pool = questionBank.filter(q => q.id !== lastQuestionId);

    if (!pool.length) pool = questionBank.slice();

    const question = pool[Math.floor(Math.random() * pool.length)];
    lastQuestionId = question.id;
    currentQuestion = question;
    questionLocked = false;
    currentHint = question.hint;

    setMood(
      "thinking",
      "🧠 " + question.chapter + "\n\n" + question.question
    );

    question.options.forEach((option, index) => {
      const button = addOption(
        String.fromCharCode(65 + index) + ". " + option,
        () => checkAnswer(index)
      );
      button.dataset.answerIndex = index;
    });

    addOption("💡 Show hint", () => {
      setMood("thinking", "Hint 💡 " + currentHint);
      addOption("Back to question", showCurrentQuestion);
    });
  }

  function showCurrentQuestion() {
    if (!currentQuestion) return pickQuestion();

    setMood(
      "thinking",
      "🧠 " + currentQuestion.chapter + "\n\n" +
      currentQuestion.question
    );

    currentQuestion.options.forEach((option, index) => {
      addOption(
        String.fromCharCode(65 + index) + ". " + option,
        () => checkAnswer(index)
      );
    });

    addOption("💡 Show hint", () => {
      setMood("thinking", "Hint 💡 " + currentHint);
      addOption("Back to question", showCurrentQuestion);
    });
  }

  function checkAnswer(index) {
    if (questionLocked || !currentQuestion) return;
    questionLocked = true;

    const correct = index === currentQuestion.answer;

    setMood(
      correct ? "celebrating" : "thinking",
      (correct ? "🎉 Correct! Great job, scientist!" :
        "💜 Not quite — mistakes help us learn!") +
      "\n\n" + currentQuestion.explanation
    );

    addOption("🔄 Try another MCQ", pickQuestion);
    addOption("🔁 Retry this question", showCurrentQuestion);
  }

  function showKnowledgeSearch() {
    setMood(
      "happy",
      "Ask me about a Biology topic from your MindSpring chapters! 💜"
    );

    addTextInput("e.g. Explain anaphase", "Ask Mira", async question => {
      setMood("thinking", "Let me search your Biology notes... 🔎");

      if (!window.MiraKnowledge ||
          typeof window.MiraKnowledge.explain !== "function") {
        setMood(
          "thinking",
          "My chapter-search file isn't connected yet. Please check that " +
          "mira-knowledge.js is uploaded and included in index.html."
        );
        addOption("Try again", showKnowledgeSearch);
        return;
      }

      try {
        const result = await window.MiraKnowledge.explain(question);

        if (!result.found) {
          setMood("thinking", result.message);
          addOption("Ask another question", showKnowledgeSearch);
          return;
        }

        setMood("happy", result.message);

        result.passages.forEach(passage => {
          const paragraph = document.createElement("p");
          paragraph.textContent =
            "📘 " + passage.chapter + ": " + passage.text;
          status.appendChild(paragraph);
        });

        addOption("Explain another topic", showKnowledgeSearch);
        addOption("Practice MCQs", pickQuestion);
      } catch (error) {
        setMood(
          "thinking",
          "I couldn't search the notes just now. Please check the chapter file paths and try again."
        );
        addOption("Try again", showKnowledgeSearch);
      }
    });
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
        pickQuestion();
      }

      if (action === "knowledge") {
        showKnowledgeSearch();
      }

      if (action === "hint") {
        if (currentQuestion) {
          setMood("thinking", "Hint 💡 " + currentHint);
          addOption("Back to question", showCurrentQuestion);
        } else {
          setMood(
            "thinking",
            "💡 Choose one small idea from the chapter, recall its meaning, " +
            "and connect it to an example. You can also ask me about a topic!"
          );
          addOption("Ask about a topic", showKnowledgeSearch);
        }
      }

      if (action === "home") {
        window.location.href = "/";
      }
    });
  });

  widget.classList.add("mira-happy");
})();
