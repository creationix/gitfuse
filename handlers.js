var modes = require('js-git/lib/modes');

var fakeStats = {
  bsize: 1000000,
  frsize: 1000000,
  blocks: 1000000,
  bfree: 1000000,
  bavail: 1000000,
  files: 1000000,
  ffree: 1000000,
  favail: 1000000,
  fsid: 1000000,
  flag: 1000000,
  namemax: 1000000
}

module.exports = function(repo) {
  var commitHash;
  var treeHash;

  setInterval(init, 1000);

  return {init: init,
          statfs: statfs,
          getattr: getAttr};

  function init(callback) {
    repo.readRef('refs/heads/master', onRef);

    function onRef(err, hash) {
      if (err) {
        if (!callback) throw err;
        return callback(err);
      }

      if (hash === commitHash) {
        return;
      }
      commitHash = hash;
      repo.loadAs('commit', commitHash, onCommit);
    }

    function onCommit(err, hash) {
      if (err) {
        if (!callback) throw err;
        return callback(err);
      }
      treeHash = hash;
      if (callback) callback();
    }
  }

  function statfs(cb) {
    cb(0, fakeStats);
  }

  function getAttr(path, callback) {
    var stats = {};

    repo.pathToEntry(treeHash, path, onEntry);
    console.log(path);

    function onEntry(err, entry) {
      var mode = entry.mode;
      if (modes.isBlob(mode)) {
        repo.loadAs('blob',entry.hash, onBlob);
        return;
      }

      if (mode === modes.tree) {
        callback(0, {size: 4096, // standard size of a directory
                     mode: 040755}) //directory with 755 permissions
      } else {
        callback(-22);// -EINVAL
        return;
      }
    }
  }


  function readFile(path, callback) {
    console.log(path)
  }
}
