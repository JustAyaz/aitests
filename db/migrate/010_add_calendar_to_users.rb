class AddCalendarToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :calendar_id, :integer
    add_index :users, :calendar_id
  end
end
