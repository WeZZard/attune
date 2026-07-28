#!/usr/bin/env node
// SessionStart hook — inject execution-guidelines.md.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'execution-guidelines.md');
