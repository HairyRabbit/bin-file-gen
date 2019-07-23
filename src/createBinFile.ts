export interface BinFile {
  name: string
  file: string
  bin: string
  program: string
  script: string
  export: string
  args: string
}

const DEFAULT_BIN: string = `/usr/bin/env`
const DEFAULT_PROGRAM: string = `node`
const DEFAULT_EXPORT: string = `default`
const DEFAULT_ARGS: string = `process.argv.slice(2)`
export const DEFAULT_SCRIPT_FILENAME: string = `cli`

type BinFileOptions = Readonly<Omit<BinFile, 'name' | 'file' | 'script'>>

const DEFAULT_BINFILE: BinFileOptions = {
  bin: DEFAULT_BIN,
  program: DEFAULT_PROGRAM,
  export: DEFAULT_EXPORT,
  args: DEFAULT_ARGS
}

function createBinFile(name: string, filePath: string, script: string, options: Partial<BinFileOptions> = {}): BinFile {
  return {
    ...DEFAULT_BINFILE, 
    ...options,
    name,
    file: filePath,
    script
  }
}

export default createBinFile
