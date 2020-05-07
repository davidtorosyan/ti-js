This directory contains scripts for local development and running.

Prerequisites:
1. Install `ruby` using your favorite package manager
2. Install Bundler using `gem install bundler`

Run:
1. Run [install.sh](install.sh) to setup the environment
2. Run [run.sh](run.sh) to run the site locally
3. Run [update.sh](update.sh) when it's time to update package versions

Notes:
* Make sure to run `run.sh` from the root directory.
* You can visit the site at http://localhost:4000/

To use this as a root site:
* `git submodule add <repo> userpage`
* `./userpage/bootstrap.sh`
* Update `scripts/README.md`, `_config.yml`, and `index.md`

To update:
* `git pull --recurse-submodules`
* `./userpage/scripts/refresh.sh`