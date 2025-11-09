import { useEffect, useMemo, useState } from "react";
import styles from "./AnimatedLogo.module.scss";

const AnimatedLogo = () => {
  const fontVariations = useMemo(
    () => [
      ["𝔢", "𝔵", "𝔭", "𝔞", "𝔱"], // Fraktur
      ["𐌄", "𐋄", "𐌐", "𐌀", "𐌕"], // Old Italic
      ["𝖾", "𝗑", "𝗉", "𝖺", "𝗍"], // Sans-serif
      ["ₑ", "ₓ", "ₚ", "ₐ", "ₜ"], // Subscript
      ["ε", "א", "ר", "א", "ƭ"], // Mix
      ["𝕖", "𝕩", "𝕡", "𝕒", "𝕥"], // Double-struck
      ["乇", "}{", "卩", "卂", "ㄒ"], // CJK
      ["ꍟ", "ꊼ", "ꉣ", "ꍏ", "꓄"], // Extended A
      ["Σ", "X", "P", "Λ", "Ƭ"], // Greek
      ["ê", "x", "þ", "å", "†"], // Accents
      ["Э", "x", "p", "ӓ", "ҭ"], // Cyrillic
      ["ɇ", "x", "ᵽ", "Ⱥ", "ŧ"], // IPA-like
      ["E", "X", "P", "A", "T"],
    ],
    [],
  );

  const [letterPositions, setLetterPositions] = useState([0, 0, 0, 0, 0]);
  const [isAnimating, setIsAnimating] = useState(true);
  const [finalState, setFinalState] = useState(false);
  const [isRelaxed, setIsRelaxed] = useState(false);

  const finalWord = useMemo(() => ["E", "X", "P", "A", "T"], []);
  const directions: Array<"up" | "down"> = useMemo(
    () => ["up", "down", "up", "down", "up"],
    [],
  );

  // Build per-letter sequences: start with first word, mix rest per letter, append final word.
  // Run animation 2 times by duplicating the sequence (excluding final word in first pass).
  // For letters that scroll 'down' (X and A), rotate so the first glyph is last to allow downward scroll with content above.
  const letterSequences = useMemo(() => {
    const seqs: string[][] = [];
    for (let i = 0; i < 5; i++) {
      const perLetter = fontVariations.map((w) => w[i]);
      // First cycle: all variations
      // Second cycle: all variations again, then final word
      const firstCycle = [...perLetter];
      const secondCycle = [...perLetter, finalWord[i]];
      const doubled = [...firstCycle, ...secondCycle];

      if (directions[i] === "down") {
        const rotated = [...doubled.slice(1), doubled[0]];
        seqs.push(rotated);
      } else {
        seqs.push(doubled);
      }
    }
    return seqs;
  }, [fontVariations, finalWord, directions]);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setLetterPositions((prevPositions) => {
        const newPositions = prevPositions.map((pos, i) => {
          const maxIndex = letterSequences[i].length - 1;
          return pos < maxIndex ? pos + 1 : pos;
        });

        const allComplete = newPositions.every(
          (pos, i) => pos >= letterSequences[i].length - 1,
        );
        if (allComplete) {
          setIsAnimating(false);
          // Delay final state to let the last letters scroll into view
          setTimeout(() => {
            setFinalState(true);
            // After final state is set, delay the relaxed state transition
            setTimeout(() => {
              setIsRelaxed(true);
            }, 100);
          }, 300);
        }

        return newPositions;
      });
    }, 100); // Stable 250ms interval

    return () => clearInterval(interval);
  }, [isAnimating, letterSequences]);

  const renderText = () => {
    if (finalState) {
      // Final state: hard-coded EXPAT; X is tripled with accent and hover-merge effect
      return (
        <div
          className={`${styles.fullLogo} ${isRelaxed ? styles.fullLogoRelaxed : ""}`}
        >
          <span className={styles.letterStatic}>E</span>
          <span className={`${styles.xContainer} ${styles.xTriple}`}>
            <span className={`${styles.xLetter} ${styles.xBack}`}>X</span>
            <span className={`${styles.xLetter} ${styles.xMid}`}>X</span>
            <span className={`${styles.xLetter} ${styles.xFront}`}>X</span>
          </span>
          <span className={styles.letterStatic}>P</span>
          <span className={styles.letterStatic}>A</span>
          <span className={styles.letterStatic}>T</span>
        </div>
      );
    }

    // Slot machine effect: each letter scrolls vertically
    const indices = [0, 1, 2, 3, 4];
    const allComplete = letterPositions.every(
      (pos, i) => pos >= letterSequences[i].length - 1,
    );

    return indices.map((letterIndex) => {
      const dir = directions[letterIndex];
      const currentPosition = letterPositions[letterIndex];
      const seq = letterSequences[letterIndex];
      const isFinal = letterIndex === 1 && allComplete && !isAnimating;

      const translateY =
        dir === "down"
          ? `translateY(calc(var(--letter-h) * (${currentPosition} - ${seq.length - 1})))`
          : `translateY(calc(var(--letter-h) * ${-currentPosition}))`;

      // For X at final position, apply triple effect
      if (isFinal && !finalState) {
        return (
          <span key={`x-${letterIndex}`} className={styles.letterSlot}>
            <span className={`${styles.xContainer} ${styles.xTriple}`}>
              <span className={`${styles.xLetter} ${styles.xBack}`}>X</span>
              <span className={`${styles.xLetter} ${styles.xMid}`}>X</span>
              <span className={`${styles.xLetter} ${styles.xFront}`}>X</span>
            </span>
          </span>
        );
      }

      return (
        <span key={`char-${letterIndex}`} className={styles.letterSlot}>
          <div
            className={styles.letterStack}
            style={{
              transform: translateY,
              transition: "transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            {seq.map((glyph, variationIndex) => (
              <span key={`var-${variationIndex}`} className={styles.letter}>
                {glyph}
              </span>
            ))}
          </div>
        </span>
      );
    });
  };

  return (
    <div className={styles.logoContainer} translate="no" lang="en">
      <div className={styles.logoText}>{renderText()}</div>
    </div>
  );
};

export default AnimatedLogo;
