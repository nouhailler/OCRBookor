/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fr } from '../src/i18n/locales/fr.ts';
import { en } from '../src/i18n/locales/en.ts';

console.log('====================================================');
console.log('  OCRBookor — Internationalization (i18n) Test Suite');
console.log('====================================================\n');

let totalKeys = 0;
let missingKeys = 0;
let emptyKeys = 0;
let paramMismatches = 0;

function checkObject(frObj, enObj, namespace = '') {
  for (const key of Object.keys(frObj)) {
    const currentPath = namespace ? `${namespace}.${key}` : key;
    totalKeys++;

    const frVal = frObj[key];
    const enVal = enObj?.[key];

    if (enVal === undefined) {
      console.error(`❌ Missing English key: "${currentPath}"`);
      missingKeys++;
      continue;
    }

    if (typeof frVal === 'object' && frVal !== null) {
      checkObject(frVal, enVal, currentPath);
    } else {
      if (typeof enVal !== 'string' || enVal.trim() === '') {
        console.error(`❌ Empty or non-string English key: "${currentPath}"`);
        emptyKeys++;
      }

      // Check parameter tokens {param}
      const frParams = (typeof frVal === 'string' ? frVal.match(/\{[a-zA-Z0-9_]+\}/g) : null) || [];
      const enParams = (typeof enVal === 'string' ? enVal.match(/\{[a-zA-Z0-9_]+\}/g) : null) || [];

      for (const p of frParams) {
        if (!enParams.includes(p)) {
          console.warn(`⚠️ Warning: Parameter ${p} in French not found in English for "${currentPath}"`);
          paramMismatches++;
        }
      }
    }
  }
}

// Execute checks
checkObject(fr, en);

console.log(`\n📊 Translation Audit Summary:`);
console.log(`  • Total verified keys : ${totalKeys}`);
console.log(`  • Missing English keys: ${missingKeys}`);
console.log(`  • Empty English keys  : ${emptyKeys}`);
console.log(`  • Parameter warnings  : ${paramMismatches}`);

if (missingKeys === 0 && emptyKeys === 0) {
  console.log('\n✅ ALL i18n PARITY AND COMPLETENESS CHECKS PASSED!\n');
  process.exit(0);
} else {
  console.error('\n❌ i18n AUDIT FAILED WITH ERRORS.\n');
  process.exit(1);
}
