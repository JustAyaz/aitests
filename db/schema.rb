# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 11) do
  create_table "calendars", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "slots", force: :cascade do |t|
    t.datetime "time", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "note"
    t.integer "calendar_id"
    t.index ["calendar_id"], name: "index_slots_on_calendar_id"
  end

  create_table "slots_users", id: false, force: :cascade do |t|
    t.integer "slot_id"
    t.integer "user_id"
    t.integer "extra", default: 0, null: false
    t.index ["slot_id"], name: "index_slots_users_on_slot_id"
    t.index ["user_id"], name: "index_slots_users_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "telegram_id", null: false
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "token"
    t.boolean "can_set_rules", default: false, null: false
    t.boolean "admin", default: false, null: false
    t.boolean "superadmin", default: false, null: false
    t.integer "calendar_id"
    t.index ["calendar_id"], name: "index_users_on_calendar_id"
    t.index ["telegram_id"], name: "index_users_on_telegram_id", unique: true
    t.index ["token"], name: "index_users_on_token", unique: true
  end
end
