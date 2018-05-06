const path = require('path');
const execSync = require('child_process').execSync;
const fs = require('fs-extra');

const _arch = process.env.ARCH || process.arch;
const processPlatform = process.platform === 'darwin' ? 'mac' : 'win';
const isDebug = process.env.DEBUG ? process.env.DEBUG === 'true' : false;
const _platform = process.env.PLATFORM || processPlatform;
const addon_name = 'agora_node_ext.node';
const video_source_name = 'VideoSource';
/**
 * mac和windows的CI执行环境有差异，为了兼容两边这里基于当前文件指定路径
 */
const execBin = path.join(__dirname, '..', 'node_modules', '.bin', 'node-gyp');
// node-gyp rebuild --target=2.0.0-beta.7 --dist-url=https://atom.io/download/electron
// const cmd = `${execBin} --parallel --force --types prod,dev,optional --arch ${_arch} --module-dir ${moduleDir} ${
const cmd = `${execBin} rebuild --target=2.0.0-beta.7 --dist-url=https://atom.io/download/electron --arch ${_arch} ${
  isDebug ? '--debug' : ''
}`;

console.log(`build addon using command: ${cmd}`);
execSync(cmd, {
  cwd: path.join(__dirname, '..'),
});

if (_platform === 'mac') {
  function generateSymAndCopy(name) {
    const dSYMPath = path.join(
      __dirname,
      '..',
      'build',
      isDebug ? 'Debug' : 'Release',
      `${name}.dSYM`
    );
    const destPath = path.join(__dirname, '..', 'lib', 'symbol', _platform, _arch, `${name}.sym`);
    const dump_syms_tool = path.join(__dirname, '..', 'tools', 'dump_syms');
    const symbols = execSync(`${dump_syms_tool} ${dSYMPath}`).toString();
    const headLine = symbols.substr(0, symbols.indexOf('\n'));
    console.log(headLine);
    const fields = headLine.split(' ');
    if (fields.length !== 5) {
      throw new Error('Invalid foramt of .sym file');
    }
    fs.outputFileSync(destPath, symbols);
    console.log(`symbol file generated ${destPath}.`);
  }

  generateSymAndCopy(addon_name);
  generateSymAndCopy(video_source_name);
} else if (_platform === 'win') {
  function copyPdbFIle(name) {
    const symFile = path.join(
      __dirname,
      '..',
      'build',
      isDebug ? 'Debug' : 'Release',
      `${name}.pdb`
    );
    const destPath = path.join(__dirname, '..', 'lib', 'symbol', _platform, _arch);
    fs.mkdirpSync(destPath);
    fs.copyFileSync(symFile, path.join(destPath, `${name}.pdb`));
  }
  copyPdbFIle('agora_node_ext');
  copyPdbFIle(video_source_name);
}
