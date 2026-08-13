import { Font } from '@react-pdf/renderer';

let fontsRegistered = false;

export function registerFonts() {
  if (fontsRegistered) return;

  // When ANY custom font is registered, @react-pdf/renderer disables ALL
  // built-in fonts (Helvetica, Times-Roman, Courier). We must explicitly
  // register replacements for every font family referenced anywhere —
  // including Helvetica, which is the library's internal default.

  // Helvetica replacement (Roboto) — required as the library's internal default
  Font.register({
    family: 'Helvetica',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-normal.ttf', fontWeight: 400 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-700-normal.ttf', fontWeight: 700 },
    ],
  });

  // Inter — body text, table headers, captions
  Font.register({
    family: 'Inter',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf', fontWeight: 400 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf', fontWeight: 500 },
    ],
  });

  // JetBrains Mono — all numbers, amounts, dates
  Font.register({
    family: 'JetBrains Mono',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.ttf', fontWeight: 400 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-500-normal.ttf', fontWeight: 500 },
    ],
  });

  // Times-Roman replacement (Tinos) — titles and section headers
  Font.register({
    family: 'Times-Roman',
    fonts: [
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/tinos@latest/latin-400-normal.ttf', fontWeight: 400 },
      { src: 'https://cdn.jsdelivr.net/fontsource/fonts/tinos@latest/latin-700-normal.ttf', fontWeight: 700 },
    ],
  });

  fontsRegistered = true;
}
