#!/usr/bin/env node

var pathResolve = require('path').resolve;
var fuse = require('fuse4js');
var optimist = require('optimist');

var repo = {};

var argv = optimist
  .usage('\nMount a git repo as a file system\n\nUsage: $0 {options}').wrap(150)
  .options('p', {
    alias: 'path',
    desc: 'path to local git bare repository (eg ./repo.git)'
  })
  .options('g', {
    alias: 'github',
    desc: 'github repository (eg creationix/exploder)'
  })
  .options('m', {
    alias: 'mountpoint',
    desc: 'path to mount at'
  })
  .options('o', {
    alias: 'fuseoptions',
    desc: 'comma seperated fuse options (eg "allow_other,auto_unmount")'
  })
  .options('d', {
    alias: 'debug',
    desc: 'enable debug for fuse4js'
  })
  .check(function (args) {
    if (!(args.g || args.p)) {
      throw "Path or github required.";
    }
    if (!args.m) {
      throw "Mount path required";
    }
  })

  .argv;

var mountpoint = pathResolve(process.cwd(), argv.mountpoint);

if (argv.path) {
  var path = pathResolve(process.cwd(), argv.path);
  console.log("Mounting %s at %s", path, mountpoint);
  require('git-node-fs/mixins/fs-db')(repo, path);
} else if (argv.github) {
  require('js-github/mixins/github-db')(repo, argv.github, process.env.GITHUB_TOKEN);
  console.log("Mounting https://github.com/%s at %s", argv.github, mountpoint);
  var cache = {};
  require('git-node-fs/mixins/fs-db')(cache, "/tmp/cache.git");
  require('js-git/mixins/add-cache')(repo, cache);
}

require('js-git/mixins/mem-cache')(repo);
require('js-git/mixins/path-to-entry')(repo);
require('js-git/mixins/read-combiner')(repo);
require('js-git/mixins/formats')(repo);

var handlers = require('./handlers')(repo, argv);

var fuseOptions = [];
if (argv.fuseoptions) {
  agrv.fuseOptions.split(',').forEach(function(option) {
    fuseOptions.push('-o', option);
  });
}

fuse.start(mountpoint, handlers, 'debug' in argv, fuseOptions);
