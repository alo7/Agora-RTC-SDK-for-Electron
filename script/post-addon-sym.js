const execSync = require('child_process').execSync;
const fs = require('fs-extra');

const _arch = process.env.ARCH || process.arch;
const processPlatform = process.platform === 'darwin' ? 'mac' : 'win';
const _platform = process.env.PLATFORM || processPlatform;

function validateSymAndPost(name) {
  const symbolFileName = _platform === 'win' ? `${name}.pdb` : `${name}.sym`;
  const symbolFile = `./lib/symbol/${_platform}/${_arch}/${symbolFileName}`;
  const symbols = fs.readFileSync(symbolFile).toString();
  const headLine = symbols.substr(0, symbols.indexOf('\n'));
  console.log(`L1: ${headLine}`);
  const fields = headLine.split(' ');
  if (fields.length !== 5 && _platform === 'mac') {
    throw new Error('Invalid foramt of .sym file');
  }

  // post to backtrace
  const postUrl =
    _platform === 'win'
      ? 'https://alo7.sp.backtrace.io:6098/post?format=symbols&token=d91fb5cc0c786273a7de2a16453211c2f5bdbea356fc20c7d56ac4de811162c0&upload_file=alo7-portal.pdb'
      : 'https://alo7.sp.backtrace.io:6098/post?format=symbols&token=d91fb5cc0c786273a7de2a16453211c2f5bdbea356fc20c7d56ac4de811162c0';
  console.log(`curl -v --data-binary @${symbolFile} "${postUrl}"`);
  execSync(`curl -v --data-binary @${symbolFile} "${postUrl}"`);
  console.log(`post symbol file to backtrace: ${symbolFile}`);
}

validateSymAndPost('agora_node_ext.node');
validateSymAndPost('VideoSource');
