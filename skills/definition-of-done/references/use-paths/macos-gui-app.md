# Use path: macOS GUI app development

**When** — the result is a macOS desktop application or a change to one: an
AppKit/SwiftUI app, a window, a view, a menu, a document behavior.

**Consumer & interface** — a person driving the app with mouse and keyboard
through its windows, menus, and controls. The real interface is the running
app's UI, not the source and not the unit-test target.

**How to drive it in-session:**

- Build and launch the real app (`xcodebuild`/`swift build` then run the
  `.app`, or run from Xcode) — drive the built product.
- Drive the UI without stealing focus using the background computer-use
  automation (the `cua-driver` MCP): `start_session`, `launch_app`, then
  `get_window_state` to read the accessibility (AX) tree, and act by
  `element_index` (AX path) rather than pixel coordinates so it works on a
  backgrounded window. Re-read `get_window_state` after each action to
  confirm it landed.
- Assert on the AX tree — the values, enabled/disabled state, and existence
  of controls — which is the observable, scriptable surface of the UI.
- Drive menu commands via the AX menu bar; drive a document's open → edit →
  save → reopen cycle against a scratch file.

**Forks that matter:**

- Empty/first-launch state (no document, no prefs) vs restored state.
- A control's enabled vs disabled branch; a command's success vs its
  can't-apply branch.
- Save → close → reopen (does the state round-trip); undo after an edit.
- A modal/sheet's confirm vs cancel; a destructive action's confirm dialog.
- Window resize or multi-window only when the change is layout-specific.

**The honest limit:** the AX tree makes structure, control state, and
values observable and drivable, and a screenshot captures the pixels. What
cannot be driven or judged here: visual fidelity and layout aesthetics
(does it *look* right — spacing, alignment, Dark Mode appearance),
animation and transition smoothness, and any control not exposed to
accessibility. Drive the AX-reachable path, capture a screenshot as partial
evidence, then report the visual and motion qualities unverified — a human
at a real display owns them. Destructive actions (a delete, an overwrite)
run against scratch documents only.
