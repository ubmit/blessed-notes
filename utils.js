'use strict';

const chalk = require ('chalk');

const log = {
  plain: message => console.log (chalk.white (message)),
  strong: message => console.log (chalk.white.bold (message)),
  warning: message => console.log (chalk.red (message)),
  success: message => console.log (chalk.green (message)),
};

module.exports = {log};
