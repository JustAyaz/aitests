require './app'

start_date = Date.today.beginning_of_week
(0..6).each do |d|
  day = start_date + d
  time = day.to_time + 8 * 60 * 60
  end_time = time + 10 * 60 * 60
  while time < end_time
    Slot.find_or_create_by(time: time)
    time += 30 * 60
  end
end
