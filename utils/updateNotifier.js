const updateNotifier = require('update-notifier');

const pkg = require('../package.json');

const notifier = updateNotifier({
    pkg,
    updateCommand: 'cligpt --update',
    updateCheckInterval: 1000 * 60, // 1 minute 
    shouldNotifyInNpmScript: true,
});

module.exports = { notifier };
