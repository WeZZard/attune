#!/usr/bin/env node
// SessionStart hook — inject communication-instructions.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-instructions.md');
