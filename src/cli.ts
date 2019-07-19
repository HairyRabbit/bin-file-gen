import yargs from 'yargs'
import gen from './'

export default function main() {
  const args = yargs
    .strict()
    .usage(`$0 [options]`, `Generate bin file`)
    .option(`name`, {
      alias: `n`,
      type: `string`,
      describe: `Bin file name`
    })
    .option(`project`, {
      alias: `p`,
      type: `string`,
      describe: `Project output dir`
    })
    .option(`output`, {
      alias: `o`,
      type: `string`,
      describe: `Bin file output dir`
    })
    .option(`entry`, {
      alias: `e`,
      type: `string`,
      describe: `Entry script path`
    })
    .options(`dryrun`, {
      type: 'boolean',
      describe: `Just dryrun`
    })
    .help()
    .argv

  gen(args)
}
