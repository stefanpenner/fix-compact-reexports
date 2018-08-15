#!/usr/bin/env node

'use strict';

const fs = require('fs');

const traverser = require('es-simpler-traverser');
const parser = require('@babel/parser');
const generator = require('@babel/generator');

const files = process.argv.slice(2);

function fix(code, file) {
  try {
    const parsed = parser.parse(code, { sourceType: 'module' });

    traverser(parsed, {
      enter(x, parent) {
        if (x.type === 'ExportNamedDeclaration') {
          x.type = 'ExportAllDeclaration';
          delete x.specifiers;
        }
      }
    });

    return generator.default(parsed).code;
  } catch (e) {
    if (e !== null && typeof e === 'object') {
      e.message = `Error from :${file} }\n${e.message}`
    }
    throw e;
  }
}

for (let file of files) {
  fs.writeFileSync(file, fix(fs.readFileSync(file, 'UTF8'), file));
}
