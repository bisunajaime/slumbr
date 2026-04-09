// Bolds the first half of each word to guide the eye with minimal effort
export function bionicEncode(text: string): string {
  return text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      const boldLength = Math.ceil(token.length / 2);
      const bold = token.slice(0, boldLength);
      const rest = token.slice(boldLength);
      return `<b class="bionic">${bold}</b>${rest}`;
    })
    .join('');
}
