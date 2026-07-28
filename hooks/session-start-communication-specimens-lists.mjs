#!/usr/bin/env node
// SessionStart hook — inject communication-specimens-lists.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-specimens-lists.md');
