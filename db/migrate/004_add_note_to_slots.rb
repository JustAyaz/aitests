class AddNoteToSlots < ActiveRecord::Migration[7.1]
  def change
    add_column :slots, :note, :string
  end
end
