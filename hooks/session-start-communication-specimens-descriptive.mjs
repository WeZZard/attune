#!/usr/bin/env node
// SessionStart hook — inject communication-specimens-descriptive.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-specimens-descriptive.md');
