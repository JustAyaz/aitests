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
      link = "#{SERVER_URL}/auth?telegram_id=#{message.from.id}&name=#{URI.encode_www_form_component(message.from.first_name)}"
      bot.api.send_message(chat_id: message.chat.id, text: "Welcome, #{message.from.first_name}! Open this link to access the calendar: #{link}")
    end
  end
end
