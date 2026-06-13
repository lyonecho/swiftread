# Swiftread

A fast, private **RSVP speed reader** — words flash one at a time at a fixed focal point (the red letter marks the optimal recognition point), so your eyes never move. Drop in a PDF, Word doc, or text and read a whole book one word at a time.

It's a single static page that installs as an app and works fully offline. Your books and reading positions never leave your device — they live in your browser's local storage, nothing is uploaded.

## Use it

Open the hosted page, then install it:

- **Mac (Safari):** File → Add to Dock
- **iPhone / iPad (Safari):** Share → Add to Home Screen
- **Chrome / Edge:** the install icon at the right of the address bar

## Features

- Adjustable speed, 100–1000 wpm, with smart pauses at punctuation and paragraph breaks
- **Context mode** — see dimmed neighboring words fading to the edges (toggle with the ≡ button or `C`)
- **Focus mode** — near-fullscreen giant words (⛶ button or `F`)
- PDF / DOCX / TXT / MD import (drag-and-drop on desktop, file picker on mobile)
- Per-book library that remembers exactly where you left off
- Keyboard: `Space` play/pause · `←/→` jump sentence · `↑/↓` speed · `C` context · `F` focus · `R` restart
- Touch: tap to play/pause · swipe left/right to jump a sentence

## Run locally

Any static server works, e.g.:

```sh
python3 -m http.server 8744
```

then open <http://localhost:8744>.
