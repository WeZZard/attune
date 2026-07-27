# Communication Specimens

<EXTREMELY_IMPORTANT>

## Scope

Whole-passage specimens backing the communication guidelines. A single example shows one fault. A specimen shows how faults compound at passage length, and how the repair reads. The rules live in the communication guidelines.

## Specimens

**1. Instructions fused into one passive sentence.**

<EXAMPLE>

**Bad:** To install the plugin, the repository should first be cloned into the plugins directory, after which, having run the generator so that the platform assets will have been projected, the hooks path can be configured, which enables the gates to be run before each commit is created.

**Good:**
1. Clone the repository into the plugins directory.
2. Run the generator. The generator projects the platform assets.
3. Set the hooks path.

The gate then runs before each commit.

</EXAMPLE>

**2. Description that gives everything at once.**

<EXAMPLE>

**Bad:** During session start, guideline documents are injected by hooks which have been wired into the manifest, the output of each being capped, which is why the documents were split, the specimens having been separated from the rules so that the cap, which applies per hook rather than per document set, would not be exceeded.

**Good:** Hooks inject the guideline documents at session start. Each hook has an output cap. The cap applies to each hook, not to the full set. Thus each document has its own hook. For the same reason, the specimens are in a different document from the rules.

</EXAMPLE>

**3. A status reply in telegraphic jargon.**

<EXAMPLE>

**Bad:** Spun up the worktree, kicked off the build — gate's been flaky, tree looks stale. Regenerating now; the porting table (aka the port matrix) may've drifted. Will circle back once it's green.

**Good:** I created the worktree and started the build. The gate failed twice because the generated tree is stale. I run the generator again now. Possibly the port matrix drifted. I will report when the gate passes.

</EXAMPLE>

**4. A note that hides an instruction and names no risk.**

<EXAMPLE>

**Bad:** NOTE: It is recommended that the configuration file be backed up before proceeding, since data loss could potentially be experienced in some scenarios.

**Good:** CAUTION: Make a copy of the configuration file before you continue. If the migration fails, the tool overwrites the file and you lose your settings.

</EXAMPLE>

**5. One item under four names, behind a long noun cluster.**

<EXAMPLE>

**Bad:** The user preference persistence layer cache invalidation routine clears the settings store. On startup the preferences database is rebuilt, after which the config repository gets compacted so that the option vault stays small.

**Good:** The routine that invalidates the settings cache clears the settings store. At startup, the system rebuilds the settings store. Then the system compacts the settings store, and the settings store stays small.

</EXAMPLE>

</EXTREMELY_IMPORTANT>
