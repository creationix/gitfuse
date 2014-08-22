var pathResolve = require('path').resolve;
var fuse = require('fuse4js');

var repo = {};
var path = pathResolve(process.cwd(), process.argv[2]);
console.log("Mounting %s", path);

require('git-node-fs/mixins/fs-db')(repo, path);
require('js-git/mixins/path-to-entry')(repo);
require('js-git/mixins/formats')(repo);

var handlers = require('./handlers')(repo);

fuse.start('/tmp/tutorial/mnt', handlers, false, []);

