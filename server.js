var pathResolve = require('path').resolve;
var fuse = require('fuse4js');

var repo = {};

var path = pathResolve(process.cwd(), process.argv[2]);
console.log("Mounting %s", path);
require('git-node-fs/mixins/fs-db')(repo, path);

// require('js-github/mixins/github-db')(repo, 'creationix/exploder', process.env.GITHUB_TOKEN);
// var cache = {};
// require('git-node-fs/mixins/fs-db')(cache, "/tmp/cache.git");
// require('js-git/mixins/add-cache')(repo, cache);

require('js-git/mixins/mem-cache')(repo);
require('js-git/mixins/path-to-entry')(repo);
require('js-git/mixins/formats')(repo);
console.log(repo);

var handlers = require('./handlers')(repo);

fuse.start('/home/tim/Downloads/test-mount', handlers, false, ["-o", "auto_unmount"]);

