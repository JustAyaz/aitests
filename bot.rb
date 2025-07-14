require 'telegram/bot'
require 'net/http'
require 'uri'
require 'json'

TOKEN = ENV['TELEGRAM_TOKEN']
SERVER_URL = ENV['SERVER_URL'] || 'http://localhost:4567'

Telegram::Bot::Client.run(TOKEN) do |bot|
  bot.listen do |message|
    case message.text
    when '/start'
      uri = URI("#{SERVER_URL}/register")
      bot.api.send_message(chat_id: message.chat.id, text: "Welcome, #{message.from.first_name}! Your Telegram ID is #{message.from.id}. Use this ID to register on the website.")
    end
  end
end
