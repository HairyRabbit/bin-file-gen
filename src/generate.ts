import * as fs from 'fs'
import * as path from 'path'
import prompts from 'prompts'

import { BinFile } from './createBinFile'

export interface GenerateOptions {
  dryrun: boolean
  silent: boolean
  yes: boolean
  root: string
  ts: boolean
}

const DEFAULT_GENERATE_OPTIONS: GenerateOptions = {
  dryrun: false,
  silent: false,
  yes: false,
  root: '.',
  ts: false
}

export async function generate(binFile: BinFile, options: Partial<GenerateOptions> = {}) {
  const opts: GenerateOptions = { ...DEFAULT_GENERATE_OPTIONS, ...options }
  const {
    dryrun,
    silent,
    yes
  } = opts

  const result: string = render(binFile)

  if(!silent) report(binFile, result, opts)
  if(dryrun) return

  if(!silent && !yes) {
    const res = await prompts({
      type: 'confirm',
      name: 'answer',
      message: `[bin-file-gen] Confirm?`
    })

    if(false === res.answer) {
      console.log(`\n[bin-file-gen] Canceled`)
      return
    }
  }

  const dir: string = path.dirname(binFile.file)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(binFile.file, result, `utf-8`)
  if(!silent) console.log(`\n[bin-file-gen] Bin file created successful`)
}

function render(binFile: BinFile): string {
  return `\
${makeShebangLine(binFile)}

require('${binFile.script}')['${binFile.export}'](${binFile.args})
`
}

function report(binFile: BinFile, result: string, options: GenerateOptions): void {
  console.log(`\n[bin-file-gen] Summary:`)
  console.log()
  console.log(`  - Root:     ${options.root}`)
  console.log(`  - TSConfig: ${options.ts}`)
  console.log(`  - DryRun:   ${options.dryrun}`)
  console.log(`  - Ask:      ${!options.yes}`)
  console.log()
  console.log(`  - Name:     ${binFile.name}`)
  console.log(`  - File:     ${binFile.file}`)
  console.log(`  - Shebang:  ${makeShebangLine(binFile)}`)
  console.log(`  - Script:   ${binFile.script}`)
  console.log(`  - Export:   ${binFile.export}`)
  console.log(`  - Argument: ${binFile.args}`)
  console.log(`  - Template:\n`)
  console.log(`\`\`\``)
  console.log(result)
  console.log(`\`\`\``)
  console.log()
}

function makeShebangLine(binFile: BinFile): string {
  return `#!${binFile.bin} ${binFile.program}`
}
