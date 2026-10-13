# Publishing events

Events use the existing blog admin and Blog API. No API endpoint, database field, or admin form change is required.

## Add an event

1. Open `/admin/blog/` and create the category `Events` if it does not already exist.
2. Create a normal blog post and select the `Events` category.
3. Start the slug with the event date in `YYYY-MM-DD-` format, for example:

   `2026-11-12-bengaluru-fleet-summit`

4. Use the existing content editor for the event details. Put these labelled lines near the beginning:

   ```html
   <p><strong>Event Date:</strong> 12 November 2026</p>
   <p><strong>Location:</strong> Bengaluru, Karnataka, India</p>
   <p><strong>Registration:</strong> <a href="https://example.com/register">Register now</a></p>
   ```

   `Location` is shown on event cards. The first link in a paragraph containing “Register”, “Registration”, or “Tickets” becomes the registration button. The date used by the page comes from the slug, so it remains machine-readable without a new API field.

5. Use the existing thumbnail field for the event cover image, add the rest of the event description as normal content, and publish the post.

## Build the public event pages

From the project directory, run:

```powershell
npm run publish-events
```

This reads published posts from the existing `Events` category, refreshes `events/events.json`, generates crawlable pages under `/events/<slug>/`, and then runs the normal site build and audit.

The current API address remains unchanged. If a different deployment needs to run the sync against the same API hosted at another address, set `ANSTEL_BLOG_API` for that command; this does not alter the website API configuration or fields.
