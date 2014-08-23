
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
  var ref = argv.r || "refs/heads/master";

  var lengthCache = {};

  var files = {};
  var nextFd = 1;

  return {
    init: init,
    statfs: statfs,
    getattr: getattr,
    readdir: readdir,
    open: open,
    read: read,
    // write: write,
    release: release,
    // create: create,
    // unlink: unlink,
    // rename: rename,
    // mkdir: mkdir,
    // rmdir: rmdir,
    // destroy: destroy,
    // setxattr: setxattr,
  };

  function init(callback) {
    repo.readRef(ref, onRef);

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

  /*
   * Handler for the getattr() system call.
   * path: the path to the file
   * cb: a callback of the form cb(err, stat), where err is the Posix return code
   *     and stat is the result in the form of a stat structure (when err === 0)
   */
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

  /*
   * Handler for the readdir() system call.
   * path: the path to the file
   * cb: a callback of the form cb(err, names), where err is the Posix return code
   *     and names is the result in the form of an array of file names (when err === 0).
   */
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

  /*
   * Handler for the open() system call.
   * path: the path to the file
   * flags: requested access flags as documented in open(2)
   * cb: a callback of the form cb(err, [fh]), where err is the Posix return code
   *     and fh is an optional numerical file handle, which is passed to subsequent
   *     read(), write(), and release() calls.
   */
  function open(path, flags, callback) {
    console.log("OPEN", path);
    var file;
    repo.pathToEntry(treeHash, path, onEntry);

    function onEntry(err, entry) {
      if (err) return callback(-1);
      if (!entry || !entry.mode) return callback(-ENOENT);
      file = {
        path: path,
        mode: entry.mode,
        hash: entry.hash,
        blob: null,
      };
      repo.loadAs("blob", entry.hash, onBlob);
    }

    function onBlob(err, blob) {
      if (!blob) return callback(-1);
      var fd = nextFd++;
      files[fd] = file;
      file.blob = blob;
      return callback(0, fd);
    }
  }

  /*
   * Handler for the read() system call.
   * path: the path to the file
   * offset: the file offset to read from
   * len: the number of bytes to read
   * buf: the Buffer to write the data to
   * fh:  the optional file handle originally returned by open(), or 0 if it wasn't
   * cb: a callback of the form cb(err), where err is the Posix return code.
   *     A positive value represents the number of bytes actually read.
   */
  function read(path, offset, len, buf, fd, callback) {
    var file = files[fd];
    if (!file) return -EINVAL;
    var blob = file.blob;
    var length = Math.max(len, blob.length);
    blob.copy(buf, 0, offset, length);
    callback(length);
  }

  /*
   * Handler for the write() system call.
   * path: the path to the file
   * offset: the file offset to write to
   * len: the number of bytes to write
   * buf: the Buffer to read data from
   * fh:  the optional file handle originally returned by open(), or 0 if it wasn't
   * cb: a callback of the form cb(err), where err is the Posix return code.
   *     A positive value represents the number of bytes actually written.
   */
  function write() {
    console.log("TODO: Implement write", arguments);
  }

  /*
   * Handler for the release() system call.
   * path: the path to the file
   * fh:  the optional file handle originally returned by open(), or 0 if it wasn't
   * cb: a callback of the form cb(err), where err is the Posix return code.
   */
  function release(path, fd, callback) {
    delete files[fd];
    callback(0);
  }

  /*
   * Handler for the create() system call.
   * path: the path of the new file
   * mode: the desired permissions of the new file
   * cb: a callback of the form cb(err, [fh]), where err is the Posix return code
   *     and fh is an optional numerical file handle, which is passed to subsequent
   *     read(), write(), and release() calls (it's set to 0 if fh is unspecified)
   */
  function create(path, mode, callback) {
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
