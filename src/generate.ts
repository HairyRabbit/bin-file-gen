import fs from 'fs'
import path from 'path'

export interface Options {
  dryrun: boolean
  shebang: string
  template: string
  entry: string
  output: string
  args: string
}


const DEFAULT_SHEBANG: string = `#!/usr/bin/env node`

const DEFAULT_TEMPLATE: string = `require('$entry').default($args)`

const DEFAULT_OPTIONS: Options = {
  dryrun: false,
  shebang: DEFAULT_SHEBANG,
  template: DEFAULT_TEMPLATE,
  entry: './cli',
  output: './bin',
  args: `process.argv.slice(2)`
}

export function generate(options: Partial<Options> = {}) {
  const { 
    dryrun,
    shebang,
    template,
    entry,
    output,
    args
  } = { ...DEFAULT_OPTIONS, ...options }

  const rendered: string = render(template, entry, args)
  const tpl: string = [shebang, rendered].join('\n')

  console.log(`[binit] Generate at "${output}":\n`)
  console.log(tpl)

  if(dryrun) return

  const dir: string = path.dirname(output)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(output, tpl, `utf-8`)
  console.log(`\n[binit] Bin file created successful`)
}

function render(tpl: string, entry: string, args: string): string {
  return tpl
    .replace(`$entry`, entry)
    .replace(`$args`, args)
}
