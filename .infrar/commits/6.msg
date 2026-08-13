fix(board): hide the loading skeleton once tasks render

The `.cards { display: grid }` rule overrode the browser's default
`[hidden] { display: none }`, so the skeleton list stayed visible as
three permanently-loading cards above the real task list. Add an
explicit `.cards[hidden] { display: none }` guard, matching the
existing guards for `.share-form[hidden]` and `.modal-overlay[hidden]`.
