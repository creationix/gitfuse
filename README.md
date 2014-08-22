gitfuse
=======

A CLI tool that mounts [js-git][] repos as local filesystems using [fuse4js][].

## Examples

Mounting a local bare git repo.

```sh
> git clone --bare git@github.com:creationix/conquest.git # Create a local bare repo by cloning a remote
> mkdir conquest # Create a mountpoint
> gitfuse -p conquest.git -m conquest -o allow_other,auto_umount # mount with some custom fuse options
```

Mounting a remote github repo using Github's REST API.  Create a token at <https://github.com/settings/tokens/new>.

```sh
> export GITHUB_TOKEN=a19e1bbf332ef7937a54c5f3de47b2813b27be42 # Paste in your own token
> mkdir exploder # Create a mountpoint
> gitfuse -g creationix/exploder -p exploder -o allow_other,auto_umount # mount with custom options
```

In either example, the fuse command blocks the terminal, so either background with `&` or open a new terminal tab to test the mount.

## Setup

This currently uses a C++ node addon to communicate with the fuse kernel module.  This is the [fuse4js][] Project.
You need to first install the dependencies for it before you can `npm install -g gitfuse`.

On linux, install the fuse dev headers and the fuse package.  
For ubuntu this is `apt-get install fuse libfuse-dev`.  
On OSX, I recommend installing <http://osxfuse.github.io/>.

## Installing

Once you have the fuse headers and userspace tools (`fusermount`) installed, you can install gitfuse.

```sh
> npm install -g gitfuse
```

Then have fun!

## TODO

Currently this only mounts the git repo read-only.  In the future it will allow also writing to the repo and creating new commits.

## About

This was a Rackspace hackday project by @creationix and @stufflebear.

A git backend for fuse4js using js-git

[js-git]: https://github.com/creationix/js-git
[fuse4js]: https://github.com/bcle/fuse4js
