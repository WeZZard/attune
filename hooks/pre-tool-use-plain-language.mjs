#!/usr/bin/env node
// PreToolUse hook (matcher: Write) — repeat plain-language.md right before
// a file is written.
//
// The per-prompt reminder fires at the top of a turn; by the time a long
// turn reaches a Write call the rule has decayed again, and Write is where
// authored prose leaves the session. Same document, same budget as the
// UserPromptSubmit hook — only the event differs. Claude Code only: no
// porting.json listing, and Codex's PreToolUse cannot inject context at all.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'plain-language.md', 'PreToolUse');
