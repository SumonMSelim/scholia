import {readFile} from 'node:fs/promises'
import {extractText, getDocumentProxy} from 'unpdf'

// Removes what PDF extraction leaves behind and the Sanity API rejects: control characters,
// lone surrogates and private-use glyphs (bullet symbols from slide fonts become "-").
export function cleanText(t: string): string {
  return t
    .replace(/[•]/g, '-')
    .replace(/[-]/g, '')
    .replace(/[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/g, '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

export async function pdfPages(path: string): Promise<string[]> {
  const buf = await readFile(path)
  const pdf = await getDocumentProxy(new Uint8Array(buf))
  const {text} = await extractText(pdf, {mergePages: false})
  return text.map(cleanText)
}
