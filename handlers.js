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

module.exports = function(repo, argv) {
  var commitHash;
  var treeHash;

  var lengthCache = {};

  return {
    init: init,
    statfs: statfs,
    getattr: getattr,
    readdir: readdir,
    open: open,
    read: read,
    write: write,
    release: release,
    create: create,
    unlink: unlink,
    rename: rename,
    mkdir: mkdir,
    rmdir: rmdir,
    destroy: destroy,
    setxattr: setxattr,
  };

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

    function onCommit(err, commit) {
      if (err) {
        if (!callback) throw err;
        return callback(err);
      }
      treeHash = commit.tree;
      if (callback) {
        setInterval(init, argv.github ? 30000 : 500);
        callback();
      }
    }
  }

  function getattr(path, callback) {

    repo.pathToEntry(treeHash, path, onEntry);

    function onEntry(err, entry) {
      if (err) return callback(-1); // ???
      if (!entry || !entry.mode) {
        return callback(-ENOENT);
      }

      var mode = entry.mode;
      if (modes.isBlob(mode)) {
        if (entry.hash in lengthCache) {
          return callback(0, {
            size: lengthCache[entry.hash],
            mode: entry.mode & 0777555
          });
        }
        return repo.loadAs('blob', entry.hash, onBlob);
      }

      if (mode === modes.tree) {
        return callback(0, {
          size: 4096,  // standard size of a directory
          mode: 040555 //directory with 755 permissions
        });
      }
      return callback(-EINVAL);

      function onBlob(err, blob) {
        if (err) return (-ENOENT);
        lengthCache[entry.hash] = blob.length;
        return callback(0, {
          size: blob.length,
          mode: entry.mode & 0777555
        });
      }
    }
  }

  function readdir(path, callback) {
    repo.pathToEntry(treeHash, path, onEntry);

    function onEntry(err, entry) {
      if (err) return callback(-1);
      if (!entry || !entry.mode) return callback(-ENOENT);
      if (entry.mode !== modes.tree) return callback(-EINVAL);
      repo.loadAs("tree", entry.hash, onTree);
    }

    function onTree(err, tree) {
      if (err) return callback(-1);
      if (!tree) return callback(-ENOENT);
      var names = Object.keys(tree).filter(function (name) {
        return tree[name].mode !== modes.commit;
      });
      return callback(0, names);
    }
  }

  function open(path, flags, callback) {
    console.log("OPEN", path);
    repo.pathToEntry(treeHash, path, onEntry);

    function onEntry(err, entry) {
      if (err) return callback(-1);
      if (!entry || !entry.mode) return callback(-ENOENT);
      return callback(0);
    }
  }

  function read(path, offset, len, buf, fd, callback) {
    console.log("READ", path, offset, len);
    repo.pathToEntry(treeHash, path, onEntry);

    function onEntry(err, entry) {
      if (err) return callback(-1);
      if (!entry || !entry.mode) return callback(-ENOENT);
      if (!modes.isBlob(entry.mode)) return callback(-EINVAL);
      repo.loadAs("blob", entry.hash, onBlob);
    }

    function onBlob(err, blob) {
      if (err) return callback(-1);
      var length = Math.max(len, blob.length);
      blob.copy(buf, 0, offset, length);
      callback(length);
    }
  }

  function write() {
    console.log("TODO: Implement write", arguments);
  }

  function release(path, fd, callback) {
    callback(0);
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
