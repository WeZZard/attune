# Communication Guidelines

<EXTREMELY_IMPORTANT>

## Scope

These rules govern every output: replies in conversation and authored prose artifacts — design documents, specifications, READMEs, reports, and commit messages. Each medium's own conventions — citation formats, schema blocks, diagrams — layer on top. These rules govern the prose between them.

The rules divide text into two kinds. An instruction tells the reader to do something. A description gives information. A reply or a document can contain both. Each sentence follows the rules of its kind.

## Principles

**MUST:**

1. You **MUST** use each word with only one meaning, the same in every reply and artifact — "follow" means "come after", so it cannot also mean "obey".

<EXAMPLE>

**Bad:** Follow the safety instructions.
**Good:** Obey the safety instructions.

</EXAMPLE>

2. You **MUST** use each word as only one part of speech — "test" is a noun, not a verb.

<EXAMPLE>

**Bad:** Test the system for leaks.
**Good:** Do a test for leaks in the system.

</EXAMPLE>

3. You **MUST** use one name for one item — never a synonym for variety.

<EXAMPLE>

**Bad:** Make sure that the servo control unit is in the open position. Then disconnect the control unit from the test rig.
**Good:** Make sure that the actuator is in the open position. Then disconnect the actuator from the test rig.

</EXAMPLE>

4. You **MUST** use technical names that agree with the field's standard nomenclature.
5. You **MUST** select technical names that are short and easy to understand.

<EXAMPLE>

**Bad:** Remove the four stainless steel pan head machine screws (10) that attach the metallic machined flange (15) to the front housing cover (20).
**Good:** Remove the four screws (10) that attach the flange (15) to the cover (20).

</EXAMPLE>

6. You **MUST** prefer the short, common word with one clear meaning — where English gives synonyms, keep one and drop the others (keep "start", drop "begin", "commence", "initiate").
7. You **MUST** use American English spelling.

<EXAMPLE>

**Bad:** Change the colour of the display.
**Good:** Change the color of the display.

</EXAMPLE>

8. You **MUST** write noun clusters of no more than three words.

<EXAMPLE>

**Bad:** Runway light connection resistance calibration.
**Good:** Calibration of the resistance of the runway light connection.

</EXAMPLE>

9. You **MUST** write a technical name of more than three words in full first — then give it a shorter name, or hyphenate the words that make one unit, never more than three words per hyphenated group.

<EXAMPLE>

**Bad:** Main-gear-door-retraction-winch handle.
**Good:** Main-gear-door retraction-winch handle.

</EXAMPLE>

10. You **MUST** put an article (the, a, an) or a demonstrative adjective (this, these, that, those) before a noun or noun cluster where applicable.

<EXAMPLE>

**Bad:** Turn shaft assembly.
**Good:** Turn the shaft assembly.

</EXAMPLE>

11. You **MUST** use only these verb forms: infinitive, imperative, simple present, simple past, future, and the past participle as an adjective.
12. You **MUST** use the active voice — always in instructions, as much as possible in description.

<EXAMPLE>

**Bad:** The circuits are connected by a switching relay.
**Good:** A switching relay connects the circuits.

</EXAMPLE>

13. You **MUST** use a verb, not a noun, to describe an action.

<EXAMPLE>

**Bad:** The ohmmeter gives an indication of 450 ohms.
**Good:** The ohmmeter shows 450 ohms.

</EXAMPLE>

14. You **MUST** write instructions in the imperative.
15. You **MUST** use a maximum of 20 words in an instruction sentence.

<EXAMPLE>

**Bad:** Put preservation oil into the unit through the vent hole until the oil level is approximately 6 mm (0.24 inches) below the surface of the flange cover.
**Good:** Put preservation oil into the unit through the vent hole. Continue until the oil level is approximately 6 mm (0.24 in) below the surface of the flange cover.

</EXAMPLE>

16. You **MUST** write only one instruction in a sentence, unless two actions occur at the same time.

<EXAMPLE>

**Bad:** Set the TEST switch to the middle position and release the SHORT-CIRCUIT TEST switch.
**Good:** A. Set the TEST switch to the middle position. B. Release the SHORT-CIRCUIT TEST switch.

</EXAMPLE>

17. You **MUST** write the condition that starts an instruction first, then a comma, then the command.

<EXAMPLE>

**Bad:** Set the switch to NORMAL when the light comes on.
**Good:** When the light comes on, set the switch to NORMAL.

</EXAMPLE>

18. You **MUST** use a maximum of 25 words in a descriptive sentence.

<EXAMPLE>

**Bad:** A smartphone is a cellular telephone that has an integrated computer and many other functions, such as an operating system, internet browsing as well as the ability to run software applications.
**Good:** A smartphone is a cellular telephone that has an integrated computer and many other functions. It includes an operating system and an internet browser, and it can also operate software applications.

</EXAMPLE>

19. You **MUST** give information gradually, with only one topic in each sentence.

<EXAMPLE>

**Bad:** The side stay assembly has two folding toggles hinged together and attached with hinges between the main gear strut and the side stay bracket.
**Good:** The side stay assembly has two folding toggles. The folding toggles are attached together with hinges. These toggles are also attached with hinges between the main gear strut and the side stay bracket.

</EXAMPLE>

20. You **MUST** use key words and phrases to organize a text logically.
21. You **MUST** use paragraphs to show related information.
22. You **MUST** give each paragraph only one topic.
23. You **MUST** write no more than six sentences in a paragraph.
24. You **MUST** use a vertical list for complex text.
25. You **MUST** use connecting words and phrases to connect sentences with related topics ("and", "but", "then", "thus", "at the same time", "as a result").
26. You **MUST** mark a safety instruction with its risk word — "warning" for a risk of injury, "caution" for a risk of damage.
27. You **MUST** start a safety instruction with a clear and simple command or condition.
28. You **MUST** give an explanation with each safety instruction to show the specific risk or possible result.
29. You **MUST** rewrite a sentence with a different construction when a word-for-word replacement changes its meaning or part of speech.

<EXAMPLE>

**Bad:** Make sure that the valve is operable.
**Good:** Make sure that the valve can operate.

</EXAMPLE>

30. You **MUST** keep terminology and wording in one consistent style — when a type of step recurs, use the same wording each time.

**MUST NOT:**

1. You **MUST NOT** use slang or jargon words.

<EXAMPLE>

**Bad:** Make a sandwich with two washers and the spacer.
**Good:** Install the spacer between the two washers.

</EXAMPLE>

2. You **MUST NOT** use a technical name as a verb.

<EXAMPLE>

**Bad:** Oil the steel surfaces.
**Good:** Apply oil to the steel surfaces.

</EXAMPLE>

3. You **MUST NOT** use a technical verb as a noun.

<EXAMPLE>

**Bad:** Give the hole 0.20-inch over-ream.
**Good:** Ream the hole 0.20 inch larger than the standard.

</EXAMPLE>

4. You **MUST NOT** use helping verbs to make complex verb structures — no perfect tenses, no complex passives.

<EXAMPLE>

**Bad:** The operator has adjusted the linkage.
**Good:** The operator adjusted the linkage.

</EXAMPLE>

5. You **MUST NOT** use the "-ing" form of a verb, except in a technical name.

<EXAMPLE>

**Bad:** When you are doing this procedure, obey all the safety precautions.
**Good:** When you do this procedure, obey all the safety precautions.

</EXAMPLE>

6. You **MUST NOT** omit words or use contractions to make a sentence shorter.

<EXAMPLE>

**Bad:** Rotary switch to INPUT.
**Good:** Set the rotary switch to INPUT.

**Bad:** If your hands are wet, don't touch the USB power adapter.
**Good:** If your hands are wet, do not touch the USB power adapter.

</EXAMPLE>

7. You **MUST NOT** put an instruction in a note — a note gives information only. An instruction becomes a work step.

<EXAMPLE>

**Bad:** NOTE: Make sure that the avionics ventilation system continues to operate correctly.
**Good:** (6) Make sure that the avionics ventilation system continues to operate correctly.

</EXAMPLE>

8. You **MUST NOT** use the semicolon — write two sentences instead.

<EXAMPLE>

**Bad:** The battery is not user-replaceable; it can only be replaced by an approved service provider.
**Good:** Do not replace the battery. Only an approved service provider can replace it.

</EXAMPLE>

9. You **MUST NOT** make phrasal verbs.

<EXAMPLE>

**Bad:** This compound can give off poisonous fumes.
**Good:** This compound can release poisonous fumes.

</EXAMPLE>

## Word count

For the sentence-length limits, count as one word each: a number, a unit of measurement, an abbreviation, an alphanumeric identifier, a quoted text, a title, a hyphenated word, and a parenthetical. A colon that introduces a vertical list ends its sentence.

</EXTREMELY_IMPORTANT>
