// Blog içeriği admin panelinde düz metin olarak yazılıyor; "## Başlık", "### Alt başlık" ve
// "- madde" satırları ham hâliyle görünüyordu. Bu küçük dönüştürücü sadece bu üç yapıyı ve
// paragrafları tanır — HTML üretmez (dangerouslySetInnerHTML yok), her parça React elemanı
// olduğu için içerikteki olası HTML/script metin olarak kalır.
export function RichText({ content }) {
  const blocks = content.replace(/\r\n/g, '\n').split(/\n{2,}/);
  return (
    <div className="rich-text">
      {blocks.map((block, index) => {
        const text = block.trim();
        if (!text) return null;
        if (text.startsWith('### ')) return <h3 key={index}>{text.slice(4)}</h3>;
        if (text.startsWith('## ')) return <h2 key={index}>{text.slice(3)}</h2>;
        const lines = text.split('\n');
        if (lines.every((line) => /^[-*] /.test(line.trim()))) {
          return (
            <ul key={index}>
              {lines.map((line, i) => (
                <li key={i}>{line.trim().slice(2)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index}>
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

// Liste kartları için ilk paragraftan kısa özet — başlık satırları atlanır.
export function excerpt(content, length = 160) {
  const firstParagraph =
    content
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .find((block) => block && !block.startsWith('#')) ?? '';
  const flat = firstParagraph.replace(/\s+/g, ' ');
  return flat.length > length ? `${flat.slice(0, length).replace(/\s+\S*$/, '')}…` : flat;
}
