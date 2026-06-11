/** @param {string} text @param {string} lang */
export function speakLine(text, lang) {
  if (!window.speechSynthesis || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang =
    lang === "id"
      ? "id-ID"
      : lang === "tl"
        ? "fil-PH"
        : "en-US";
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

export function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}
