#!/usr/bin/env node
// SessionStart hook — inject communication-technical-names.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-technical-names.md');
