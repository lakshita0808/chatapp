export function emojiToReactionKey(emoji: string) {
  const codepoints = Array.from(emoji).map((char) => char.codePointAt(0)?.toString(16) || "");
  return `u_${codepoints.join("_")}`;
}

