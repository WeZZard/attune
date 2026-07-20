# Use path: macOS CLI tool development

**When** — the result is a command-line tool or script run in a macOS
terminal: a shell script, a compiled binary, a `swift`/`python`/`node`
entry point invoked by argv.

**Consumer & interface** — a person (or another script) typing the command
at a shell. The real interface is the invocation: argv, stdin, environment,
exit code, stdout/stderr, and any files the run touches.

**How to drive it in-session:**

- Run the actual command the way a user types it — not the function it wraps.
  `./tool --flag value`, real argv, real working directory.
- Read the exit code every time (`echo $?` / `$LASTEXITCODE`); a zero exit is
  a fork's pass condition, a nonzero its fail.
- Capture stdout and stderr separately (`cmd >out.txt 2>err.txt`); assert on
  their content, not just that the command "ran."
- For a build product, build it first (`swift build`, `make`, `go build`)
  and drive the built artifact, never the source.
- Drive `--help`/`--version` too — they are the reader's use path and the
  cheapest fork.

**Forks that matter:**

- No args / missing required arg → the usage-error branch (nonzero exit,
  message to stderr).
- A flag's presence vs absence; mutually exclusive flags together.
- Empty stdin vs piped input; a path that does not exist.
- First run (no state/config file) vs second run (state present).
- Interrupt (`SIGINT`) mid-run if the tool holds a lock or writes partial
  output.

**The honest limit:** the terminal is fully in reach — stdout, stderr, exit
code, and touched files are all observable, so a CLI tool can usually be
driven end-to-end in-session. What cannot be driven here: behavior that
depends on a TTY the session lacks (interactive prompts, curses/TUI redraw,
color only emitted to a real terminal), and timing/throughput feel. Report
those unverified, with the non-interactive output as partial evidence.
