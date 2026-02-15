# My Year Planner (opinionated)

A simple one-pager app to plan your year. It’s an opinionated planner I’ve been using for years for my own quirky needs, but maybe you’ll find it useful too.

**The idea is simple:** it's a digital imitation of a wall calendar. You can paint days in different colors, add emojis and textures, write any text on them, and shape the year your way. That's basically it. Use it however you want and don't forget to save your data.

## Features

- **Layers** — create independent overlay layers (up to 8) to track different things on the same calendar. Each layer has its own color and can be toggled on/off. When multiple layers mark the same day, their colors stack as horizontal strips.
- **Week numbers** — ISO week numbers displayed on the left side of each month (Classic and Linear views).
- **Three views** — Linear (weeks as rows), Classic (monthly grids), and Column (months as columns, days as rows).
- **Custom text** — click any day number to add text or emoji to a cell.
- **Colors & textures** — paint days with colors or pattern textures via drag.
- **Print-ready** — fits on a single A4 landscape page with layer legend, preserved colors, and proper formatting.
- **Save/Load** — export and import your data as JSON. All data stored locally in your browser.

It all works locally in your browser, no server or cloud involved. 100% private and offline.

Ideas, bugfixes and PRs are welcome. Open [issues](https://github.com/vas3k/year.vas3k.cloud/issues) to discuss.

> 😎 **Demo:** download [demo.json](./examples/demo.json), open [year.vas3k.cloud](https://year.vas3k.cloud), scroll down, click "Load Data" and select this file

<https://github.com/user-attachments/assets/89565584-4bc5-451c-82ad-aa13f80e6d8e>

![](./docs/screen1.jpeg)

![](./docs/screen2.jpeg)

![](./docs/screen3.jpeg)

## Run it yourself

```bash
npm i
npm run dev
```

Then open <http://localhost:3000/>. Voilá!

For production deployments use `npm run build`

## Run in docker-compose

```yaml
# docker-compose.yml
---

services:
  app:
    build:
      context: https://github.com/vas3k/year.vas3k.cloud.git
      dockerfile: Dockerfile
    ports:
      - "3000:80"
```

