import yargs from 'yargs'
import gen from './'

export default function main() {
  const args = yargs
    .strict()
    .usage(`$0 [options]`, `Generate bin file`)
    .option(`output`, {
      alias: `o`,
      type: `string`,
      describe: `Output file path`
    })
    .option(`project`, {
      alias: `p`,
      type: `string`,
      describe: `Project path, used for compute script path`
    })
    .options(`dryrun`, {
      type: 'boolean',
      describe: `Dryrun`
    })
    .options(`silent`, {
      type: 'boolean',
      describe: `Keep slient, not print any info to stdout`,
      default: false
    })
    .help()
    .argv

  gen(args)
}
