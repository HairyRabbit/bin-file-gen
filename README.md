<br/>

<div align=center>

# bin-file-gen

_Generate bin file for NodeJs scripts, base on your package.json_

_`npm i -D bin-file-gen`_

</div>


## Usage

```sh
$ bin-file-gen --dryrun

[bin-file-gen] Summary:

  - Name:     bin-file-gen
  - File:     ./bin/bin-file-gen
  - Shebang:  #!/usr/bin/env node
  - Script:   ../cli
  - Export:   default
  - Argument: process.argv.slice(2)
  - Template:

#!/usr/bin/env node

require('../cli')['default'](process.argv.slice(2))

```
