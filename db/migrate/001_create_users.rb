class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.string :telegram_id, null: false
      t.string :name
      t.timestamps
    end
    add_index :users, :telegram_id, unique: true
  end
end
