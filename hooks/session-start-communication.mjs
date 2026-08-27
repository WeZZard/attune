#!/usr/bin/env node
// SessionStart hook — inject communication-guidelines.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-guidelines.md');
