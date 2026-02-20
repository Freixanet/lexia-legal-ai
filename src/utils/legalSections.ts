export interface LegalAlert {
  type: 'red' | 'yellow';
  content: string;
}

export function extractAlerts(content: string): { cleanContent: string; alerts: LegalAlert[] } {
  const alerts: LegalAlert[] = [];

  const redAlertRegex = /🚨\s*\*?\*?ALERTA ROJA\*?\*?[:\s]*([\s\S]*?)(?=\n(?:#{2,}|⚠️|---|\n\n)|$)/gi;
  const yellowAlertRegex = /⚠️\s*\*?\*?ALERTA(?:\s*AMARILLA)?\*?\*?[:\s]*([\s\S]*?)(?=\n(?:#{2,}|🚨|---|\n\n)|$)/gi;

  let match;
  while ((match = redAlertRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text) alerts.push({ type: 'red', content: text });
  }

  while ((match = yellowAlertRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && !text.startsWith('(Solo si')) {
      alerts.push({ type: 'yellow', content: text });
    }
  }

  return { cleanContent: content, alerts };
}
