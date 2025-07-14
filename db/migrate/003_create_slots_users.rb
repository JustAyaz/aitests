class CreateSlotsUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :slots_users, id: false do |t|
      t.belongs_to :slot
      t.belongs_to :user
    end
  end
end
