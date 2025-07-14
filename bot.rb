require 'telegram/bot'
require 'securerandom'
require_relative 'app'

TOKEN = ENV['TELEGRAM_TOKEN']
SERVER_URL = ENV['SERVER_URL'] || 'http://localhost:4567'

Telegram::Bot::Client.run(TOKEN) do |bot|
  bot.listen do |message|
    case message.text
    when '/start'
      user = User.find_or_create_by(telegram_id: message.from.id) do |u|
        u.name = message.from.first_name
      end
      link = "#{SERVER_URL}/auth?token=#{user.token}"
      bot.api.send_message(chat_id: message.chat.id, text: "Welcome, #{message.from.first_name}! Open this link to access the calendar: #{link}")
    end
  end
end
