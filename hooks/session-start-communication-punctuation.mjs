#!/usr/bin/env node
// SessionStart hook — inject communication-punctuation.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-punctuation.md');
