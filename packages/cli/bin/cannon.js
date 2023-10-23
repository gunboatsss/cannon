#!/usr/bin/env node

import chalk from 'chalk';
import cli from '../dist/src/index.js';

cli
  .parseAsync()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    if (err.message && process.env.TRACE !== 'true') {
      console.error(chalk.red('Error: ' + err.message));
    } else {
      console.error(err);
    }
    process.exit(1);
  });
