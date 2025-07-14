require './app'

start = Time.now.to_date.to_time + 8*60*60
end_time = start + 10*60*60

while start < end_time
  Slot.find_or_create_by(time: start)
  start += 30*60
end
