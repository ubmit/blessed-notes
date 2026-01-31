'use strict';

import chalk from 'chalk';

const log = {
  plain: (message: string) => console.log(chalk.white(message)),
  strong: (message: string) => console.log(chalk.white.bold(message)),
  warning: (message: string) => console.log(chalk.red(message)),
  success: (message: string) => console.log(chalk.green(message)),
};

export {log};
