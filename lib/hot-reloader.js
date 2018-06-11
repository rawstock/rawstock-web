const chokidar = require('chokidar');
const path = require('path');
const _ = require('lodash');
const anymatch = require('anymatch');

class HotReloader {
  constructor({ paths, callback, ignores }) {
    this.paths = paths;
    this.ignores = ignores;
    this.callback = callback;
    this.ignorer = anymatch(this.ignores);
    this.watcher = null;
  }

  start() {
    this.watcher = chokidar.watch(this.paths, {
      ignoreInitial: true,
      ignored: this.ignores,
    });

    const handleChange = _.debounce(file => {
      this.delCache();
      this.callback(file);
    }, 300);

    this.watcher.on('change', handleChange);
  }

  close() {
    this.watcher.close();
    this.watcher = null;
  }

  delCache(cache = require.cache) {
    Object.keys(cache)
      .filter(p => !this.ignorer(p))
      .forEach(p => {
        delete cache[p];
      });
  }
}

module.exports = HotReloader;
