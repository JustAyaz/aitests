require './app'


Calendar.destroy_all
User.destroy_all
Slot.destroy_all

cal_a = Calendar.create!(name: 'Calendar A')
cal_b = Calendar.create!(name: 'Calendar B')

admin = User.create!(telegram_id: '1', name: 'Superadmin', superadmin: true, admin: true, can_set_rules: true, calendar: cal_a)
User.create!(telegram_id: '2', name: 'User A', calendar: cal_a)
User.create!(telegram_id: '3', name: 'User B', calendar: cal_b)

[cal_a, cal_b].each do |cal|
  start_date = Date.today.beginning_of_week
  (0...14).each do |d|
    day = start_date + d
    time = day.to_time + 15 * 60 * 60
    end_time = day.to_time + 24 * 60 * 60
    while time <= end_time
      Slot.create!(time: time, calendar: cal)
      time += 30 * 60
    end
  end
end
