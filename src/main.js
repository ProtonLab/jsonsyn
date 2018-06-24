#! /usr/bin/env node

// Packages
const path     = require('path');
const chalk    = require('chalk');
const fs       = require('fs');
const jsonlint = require('jsonlint');

// Constants
const cwd    = process.cwd()
const env    = process.env.JSONSYN_ENV ? process.env.JSONSYN_ENV : 'test'
const debug  = env == 'debug' ? true : false
let exitcode = 0

// Functions

/**
 * Log to console
 * @function log
 * @param {string} l String to log
 */
function log(l) {
  console.log(chalk.bgBlue.white.bold("INFO:") + chalk.white.dim(' ' + l))
}

/**
 * Log error to console
 * @function error
 * @param {string} l String to log
 */
function error(l) {
  exitcode = 1
  console.log(chalk.bgRed.white.bold("ERROR:") + chalk.white.bold(' ' + l))
}

/**
 * Find all files inside a dir, recursively.
 * @function getAllFiles
 * @param  {string} dir Dir path string.
 * @return {string[]} Array with all file names that are inside the directory.
 */
const getAllFiles = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    if(!dir.includes('.git') && !dir.includes('node_modules')) {
      const name = path.join(dir, file);
      const isDirectory = fs.statSync(name).isDirectory();
      return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    } else {
      return [];
    }
  }, []);

log(`Starting in ${cwd}`)
if(debug) log(`Node environment: ${env}`);
if(debug) log(`Working dir: ${cwd}`);
const files = getAllFiles(cwd)
if(debug) log(`Files in dir (rcs): ${files}`);
for(file of files) {
  if(file.includes('.json')) {
    if(debug) log(`Current file: ${file}`);
    let fileContent = fs.readFileSync(file, 'utf-8');
    try{
      jsonlint.parse(fileContent);
    } catch(e) {
      error(`Error in file ${file}. ${e}`)
    }
  }
}
process.exit(exitcode)
