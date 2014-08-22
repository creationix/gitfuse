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
};

var ENOENT = 2;
var EINVAL = 22;

module.exports = function(repo) {
  var commitHash;
  var treeHash;

  return {
    init: init,
    getattr: getattr,
    // readdir: readdir,
    // open: open,
    // read: read,
    // write: write,
    // release: release,
    // create: create,
    // unlink: unlink,
    // rename: rename,
    // mkdir: mkdir,
    // rmdir: rmdir,
    // destroy: destroy,
    // setxattr: setxattr,
    // statfs: statfs,
  };

  function init(callback) {
    if (callback) console.log("INIT");
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
      if (callback) {
        setInterval(init, 1000);
        callback();
      }
    }
  }

  function getattr(path, callback) {
    console.log("GETATTR", path);

    repo.pathToEntry(treeHash, path, onEntry);

    function onEntry(err, entry) {
      if (err) return callback(-1); // ???
      if (!entry || !entry.mode) {
        return callback(-ENOENT);
      }

      var mode = entry.mode;
      if (modes.isBlob(mode)) return repo.loadAs('blob', entry.hash, onBlob);

      if (mode === modes.tree) {
        return callback(0, {
          size: 4096,  // standard size of a directory
          mode: 040755 //directory with 755 permissions
        });
      }
      return callback(-EINVAL);

      function onBlob(err, blob) {
        if (err) return (-ENOENT);
        return callback(0, {
          size: blob.length,
          mode: entry.mode
        });
      }
    }
  }

  function readdir() {
    console.log("TODO: Implement readdir", arguments);
  }

  function open() {
    console.log("TODO: Implement open", arguments);
  }

  function read() {
    console.log("TODO: Implement read", arguments);
  }

  function write() {
    console.log("TODO: Implement write", arguments);
  }

  function release() {
    console.log("TODO: Implement release", arguments);
  }

  function create() {
    console.log("TODO: Implement create", arguments);
  }

  function unlink() {
    console.log("TODO: Implement unlink", arguments);
  }

  function rename() {
    console.log("TODO: Implement rename", arguments);
  }

  function mkdir() {
    console.log("TODO: Implement mkdir", arguments);
  }

  function rmdir() {
    console.log("TODO: Implement rmdir", arguments);
  }

  function destroy(callback) {
    console.log("DESTROY");
    callback();
  }

  function setxattr() {
    console.log("TODO: Implement setxattr", arguments);
  }

  function statfs(cb) {
    cb(0, fakeStats);
  }

};
