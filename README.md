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

The bot sends you a personalized link that automatically logs you in via `/auth`. Once logged in, a Vue.js powered calendar displays 30‑minute slots. Click any slot to toggle your participation. Cells darken as more users select the same time and show the number of attendees. Navigation links allow you to switch weeks.
