class AddCalendarToSlots < ActiveRecord::Migration[7.1]
  def change
    add_column :slots, :calendar_id, :integer
    add_index :slots, :calendar_id
  end
end
