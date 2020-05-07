#!/bin/bash
mkdir -p assets/icons
ln -sfr userpage/assets/icons/* assets/icons/

mkdir -p assets/fonts
ln -sfr userpage/assets/fonts/* assets/fonts/

mkdir -p assets/css
ln -sfr userpage/assets/css/* assets/css/

mkdir -p _layouts
ln -sfr userpage/_layouts/* _layouts/

mkdir -p _data
ln -sfr userpage/_data/* _data/

mkdir -p _includes
cp -f userpage/_includes/* _includes/