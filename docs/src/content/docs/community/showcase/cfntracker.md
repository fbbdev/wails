---
title: CFN Tracker
---

![CFN Tracker](../../../../assets/showcase-images/cfntracker.webp)

[CFN Tracker](https://github.com/williamsjokvist/cfn-tracker) - Track any Street
Fighter 6 or V CFN profile's live matches. Check
[the website](https://cfn.williamsjokvist.se/) to get started.

## Features

- Real-time match tracking
- Storing match logs and statistics
- Support for displaying live stats to OBS via Browser Source
- Support for both SF6 and SFV
- Ability for users to create their own OBS Browser themes with CSS

### Major tech used alongside Wails

- [Task](https://github.com/go-task/task) - wrapping the Wails CLI to make
  common commands easy to use
- [React](https://github.com/facebook/react) - chosen for its rich ecosystem
  (radix, framer-motion)
- [Bun](https://github.com/oven-sh/bun) - used for its fast dependency
  resolution and build-time
- [Rod](https://github.com/go-rod/rod) - headless browser automation for
  authentication and polling changes
- [SQLite](https://github.com/mattn/go-sqlite3) - used for storing matches,
  sessions and profiles
- [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) -
  a http stream to send tracking updates to OBS browser sources
- [i18next](https://github.com/i18next/) - with backend connector to serve
  localization objects from the Go layer
- [xstate](https://github.com/statelyai/xstate) - state machines for auth
  process and tracking
