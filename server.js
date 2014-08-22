var pathJoin = require('path').join;
var fuse = require('fuse4js');

var repo = {};
var path = pathJoin(__dirname, 'ele.git');

require('git-node-fs/mixins/fs-db')(repo, path);
require('js-git/mixins/path-to-entry')(repo);
require('js-git/mixins/formats')(repo);

var handlers = require('./handlers')(repo);

/*repo.readRef('refs/heads/master', onRef);

function onRef(err, hash) {
  if (err) throw err;
  console.log(hash);
  repo.loadAs('commit', hash, onCommit);
}

function onCommit(err, commit) {
  if (err) throw err;
  console.log(commit);

  var treeHash = commit.tree;
  readFile(treeHash, 'README.md', onFile)
}

function onFile(err, fileText) {
  if (err) throw err;

  console.log(fileText);
}

function readFile(treeHash, path, callback) {
  console.log("before");
  repo.pathToEntry(treeHash, path, onEntry);

  function onEntry(err, entry) {
    console.log("after");
    if (err) return callback(err);

    if (!entry || !entry.mode) {
      return callback();
    }

    repo.loadAs('text', entry.hash, callback);
  }
}*/


fuse.start('/tmp/tutorial/mnt', handlers, true, ['-o', 'allow_other']);

console.log(repo);
