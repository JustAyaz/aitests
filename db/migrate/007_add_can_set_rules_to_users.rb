class AddCanSetRulesToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :can_set_rules, :boolean, default: false, null: false
  end
end
