
/*
 * MindSpring — Mira Biology Knowledge Engine
 * Free, browser-based chapter search.
 *
 * Add new published Biology HTML pages to CHAPTERS.
 */

(function () {
  "use strict";

  const CHAPTERS = [
    {
      title: "Biomolecules",
      url: "Biomolecule.html"
    },
    {
      title: "Cell",
      url: "cell.html"
    },
    {
      title: "Cell Cycle and Cell Division",
      url: "cell cycle.11.html"
    }
  ];

  const cache = new Map();

  function cleanText(html) {
    const doc = new DOMParser().parseFromString(
      html,
      "text/html"
    );

    doc.querySelectorAll(
      "script, style, nav, footer, header, button, " +
      "input, textarea, select, noscript"
    ).forEach(el => el.remove());

    return (doc.querySelector("main, article") || doc.body)
      .innerText
      .replace(/\s+/g, " ")
      .trim();
  }

  async function loadChapter(chapter) {
    if (cache.has(chapter.url)) {
      return cache.get(chapter.url);
    }

    const promise = fetch(
      new URL(chapter.url, document.baseURI).href
    )
      .then(response => {
        if (!response.ok) {
          throw new Error("Could not load " + chapter.title);
        }
        return response.text();
      })
      .then(html => ({
        title: chapter.title,
        url: chapter.url,
        text: cleanText(html)
      }));

    cache.set(chapter.url, promise);

    try {
      return await promise;
    } catch (error) {
      cache.delete(chapter.url);
      throw error;
    }
  }

  function words(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  function findPassages(question, chapter) {
    const queryWords = [...new Set(words(question))];

    if (!queryWords.length) return [];

    const sentences = chapter.text.match(
      /[^.!?]+[.!?]?/g
    ) || [];

    return sentences
      .map(sentence => {
        const sentenceWords = new Set(words(sentence));
        const matches = queryWords.filter(word =>
          sentenceWords.has(word)
        ).length;

        return {
          text: sentence.trim(),
          score: matches
        };
      })
      .filter(item => item.score > 0 && item.text.length > 25)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  async function explain(question, chapterTitle) {
    const selected = CHAPTERS.filter(chapter =>
      !chapterTitle || chapter.title === chapterTitle
    );

    if (!selected.length) {
      return {
        found: false,
        message: "I couldn't find that chapter in my Biology index yet."
      };
    }

    const results = [];

    for (const chapterInfo of selected) {
      try {
        const chapter = await loadChapter(chapterInfo);
        const passages = findPassages(question, chapter);

        passages.forEach(passage => {
          results.push({
            ...passage,
            chapter: chapter.title,
            url: chapter.url
          });
        });
      } catch (error) {
        console.warn("Mira:", error.message);
      }
    }

    results.sort((a, b) => b.score - a.score);

    if (!results.length) {
      return {
        found: false,
        message:
          "I couldn't find a clear match in the uploaded Biology " +
          "chapters. Try a specific term from your chapter, or check " +
          "whether the chapter has been added to my index."
      };
    }

    return {
      found: true,
      message:
        "I found these relevant passages in your MindSpring notes. " +
        "Let's use them to understand the topic:",
      passages: results.slice(0, 5)
    };
  }

  window.MiraKnowledge = {
    chapters: CHAPTERS,
    explain: explain
  };
})();
