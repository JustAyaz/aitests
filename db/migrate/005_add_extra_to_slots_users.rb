class AddExtraToSlotsUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :slots_users, :extra, :integer, default: 0, null: false
  end
end
