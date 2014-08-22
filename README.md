gitfuse
=======

A CLI tool that mounts [js-git][] repos as local filesystems using [fuse4js][].

## Examples

Mounting a local bare git repo.

```sh
# Create a local bare repo by cloning a remote
> git clone --bare git@github.com:creationix/conquest.git
# Create a mountpoint
> mkdir conquest
# mount with some custom fuse options
# the `auto_umount` option is linux only.
> gitfuse -p conquest.git -m conquest -o allow_other,auto_umount
```

Mounting a remote github repo using Github's REST API.  Create a token at <https://github.com/settings/tokens/new>.

```sh
# Paste in your own token
> export GITHUB_TOKEN=a19e1bbf332ef7937a54c5f3de47b2813b27be42
# Create a mountpoint
> mkdir exploder
# Mount it!
> gitfuse -g creationix/exploder -p exploder -o allow_other
```

In either example, the fuse command blocks the terminal, so either background with `&` or open a new terminal tab to test the mount.

To umount either use `sudo umount /path/to/mountpoint` or use `fusermount -u /path/to/mountpoint`.

## Setup

This currently uses a C++ node addon to communicate with the fuse kernel module.  This is the [fuse4js][] Project.
You need to first install the dependencies for it before you can `npm install -g gitfuse`.

On linux, install the fuse dev headers and the fuse package.  
For ubuntu this is `apt-get install fuse libfuse-dev`.  
On OSX, I recommend installing <http://osxfuse.github.io/>.

Also There is a [V8 bug][] in node `v0.10.31` that causes segfaults when inflating the git data in js-git and [fuse4js][] doesn't work yet in node `v0.11.x` so I recommend you use [nvm][] to make sure you're running node `v0.10.30`.

## Installing

Once you have the fuse headers and userspace tools (`fusermount`) installed, you can install gitfuse.

```sh
> npm install -g gitfuse
```

Then have fun!

## Usage

```
> gitfuse

Mount a git repo as a file system

Usage: node ./gitfuse.js {options}

Options:
  -p, --path         path to local git bare repository (eg ./repo.git)                                                                                
  -g, --github       github repository (eg creationix/exploder)                                                                                       
  -m, --mountpoint   path to mount at                                                                                                                 
  -o, --fuseoptions  comma seperated fuse options (eg "allow_other,auto_unmount")                                                                     
  -d, --debug        enable debug for fuse4js                                                                                                         
```

## TODO

Currently this only mounts the git repo read-only.  In the future it will allow also writing to the repo and creating new commits.

## About

This was a Rackspace [hackday project][] by @creationix and @stufflebear.

[js-git]: https://github.com/creationix/js-git
[fuse4js]: https://github.com/bcle/fuse4js
[V8 bug]: https://github.com/joyent/node/pull/8224
[nvm]: https://github.com/creationix/nvm.git
[hackday project]: http://prezi.com/tmd0ycju3lui/gitfuse-overnight/
