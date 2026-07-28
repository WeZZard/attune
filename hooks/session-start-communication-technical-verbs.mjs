#!/usr/bin/env node
// SessionStart hook — inject communication-technical-verbs.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-technical-verbs.md');
