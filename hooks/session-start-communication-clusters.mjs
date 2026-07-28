#!/usr/bin/env node
// SessionStart hook — inject communication-clusters.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'communication-clusters.md');
