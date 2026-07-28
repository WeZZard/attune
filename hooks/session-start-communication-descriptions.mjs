#!/usr/bin/env node
// SessionStart hook — inject communication-descriptions.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-descriptions.md');
