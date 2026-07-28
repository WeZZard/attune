#!/usr/bin/env node
// SessionStart hook — inject communication-sentences.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-sentences.md');
