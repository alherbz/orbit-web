Add a per-task Share action that emails a task via the API

Each task row gets a Share button that reveals an inline email form.
Submitting POSTs { email } to /api/tasks/:id/share through the existing
same-origin proxy and shows the outcome inline: a success note on 2xx,
or the server's error message (including the mail provider's message
when present) on failure. Styling reuses the existing card/input look;
no new dependencies.
