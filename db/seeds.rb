require './app'

start_date = Date.today.beginning_of_week

User.find_or_create_by(telegram_id: '1') do |u|
  u.name = 'Admin'
  u.can_set_rules = true
end

(0...14).each do |d|
  day = start_date + d
  time = day.to_time + 15 * 60 * 60
  end_time = day.to_time + 24 * 60 * 60
  while time <= end_time
    Slot.find_or_create_by(time: time)
    time += 30 * 60
  end
end
