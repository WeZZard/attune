#!/usr/bin/env node
// SessionStart hook — inject communication-practices.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-practices.md');
