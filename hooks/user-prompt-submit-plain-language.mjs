#!/usr/bin/env node
// UserPromptSubmit hook — repeat plain-language.md on every turn.
//
// The session-start guidelines are read once and drift as a conversation
// grows; this one rule is short enough to restate every turn. Claude Code only:
// on a small context window the repetition costs more than it buys, so it
// carries no porting.json listing.

import { emitDoc } from './_lib.mjs';

emitDoc(import.meta.url, 'plain-language.md', 'UserPromptSubmit');
