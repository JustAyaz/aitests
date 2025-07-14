# aitests

This example uses Sinatra with SQLite to manage a simple calendar.

## Setup

```bash
bundle install
bundle exec rake db:migrate
bundle exec ruby db/seeds.rb
```

Run the application:

```bash
bundle exec ruby app.rb
```

Telegram bot script can be executed with:

```bash
TELEGRAM_TOKEN=your_token SERVER_URL=http://localhost:4567 ruby bot.rb
```

The bot sends you a personalized link that automatically logs you in via `/auth`. Once logged in, a Vue.js powered calendar displays 30‑minute slots with a polished Bootstrap theme. Click a slot to join or leave that time. Use the number field to add extra participants (up to 10) so your name appears as `Your Name +N`. Hover over a slot to see participant names. Use the **Add Rule** button to select multiple slots and set a note for them, which highlights those cells in green. Cells darken as more users select the same slot and navigation links allow you to switch weeks.
