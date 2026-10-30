/** Every user-facing string. `{name}` placeholders are filled by t(). */
export const en = {
  "app.name": "{{title}}",
  "layout.skipToContent": "Skip to main content",
  "home.title": "{{title}}",
  "home.intro":
    "Edit src/pages/home.tsx to get started. Components come from FTDS.",
  // @if api
  "home.api.checking": "Checking the api",
  "home.api.up": "Api is up",
  "home.api.down": "Api is not responding",
  "home.api.recheck": "Check again",
  // @else
  "home.clicked": "Clicked {count} times",
  // @endif
  "notFound.title": "Page not found",
  "notFound.body": "If you typed the address, check it is correct.",
  "notFound.home": "Go to the home page",
  "error.title": "Sorry, there is a problem",
  "error.body": "Try again. If it keeps happening, contact support.",
  "error.retry": "Try again",
} as const;
