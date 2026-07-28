#!/usr/bin/env node
// SessionStart hook — inject communication-recommendations.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-recommendations.md');
