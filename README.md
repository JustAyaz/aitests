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

The bot sends you a personalized link that automatically logs you in via `/auth`. Once logged in, you can browse weeks of 30-minute slots and mark your availability. Use the navigation links above the calendar to switch weeks.
