'use client'

import styles from './TextContent.module.css';

interface TextContentProps {
  body: string;
}

export function TextContent({ body }: TextContentProps) {
  const lines = body.split('\n');
  let inCodeBlock = false;
  let codeContent = '';
  let codeLang = '';

  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={i} className={styles.codeBlock}>
            {codeLang && <span className={styles.codeLang}>{codeLang}</span>}
            <code>{codeContent}</code>
          </pre>
        );
        inCodeBlock = false;
        codeContent = '';
        codeLang = '';
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += line + '\n';
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className={styles.h3}>{line.slice(4)}</h3>);
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className={styles.h2}>{line.slice(3)}</h2>);
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className={styles.h1}>{line.slice(2)}</h1>);
      return;
    }
    if (line.startsWith('- **')) {
      const match = line.match(/- \*\*(.+?)\*\*(.*)/);
      if (match) {
        elements.push(<li key={i} className={styles.li}><strong>{match[1]}</strong>{match[2]}</li>);
      }
      return;
    }
    if (line.startsWith('- ')) {
      elements.push(<li key={i} className={styles.li}>{line.slice(2)}</li>);
      return;
    }
    if (line.trim() === '') {
      elements.push(<div key={i} className={styles.spacer} />);
      return;
    }

    const withBold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    elements.push(<p key={i} className={styles.p} dangerouslySetInnerHTML={{ __html: withBold }} />);
  });

  // Flush remaining code block
  if (inCodeBlock) {
    elements.push(
      <pre key="last-code" className={styles.codeBlock}>
        {codeLang && <span className={styles.codeLang}>{codeLang}</span>}
        <code>{codeContent}</code>
      </pre>
    );
  }

  return (
    <section className={styles.contentBlock}>
      <div className={styles.textContent}>{elements}</div>
    </section>
  );
}
