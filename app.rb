require 'sinatra'
require 'sinatra/activerecord'
require 'sinatra/json'
require 'telegram/bot'
require 'date'

set :database, {adapter: 'sqlite3', database: 'db/development.sqlite3'}

enable :sessions

# simple in-memory cache for slot data per week
SLOTS_CACHE = {}

class SlotUser < ActiveRecord::Base
  self.table_name = 'slots_users'
  belongs_to :slot
  belongs_to :user
end

class Calendar < ActiveRecord::Base
  has_many :slots
  has_many :users
end

class User < ActiveRecord::Base
  belongs_to :calendar, optional: true
  validates :telegram_id, presence: true, uniqueness: true
  validates :token, uniqueness: true
  before_create :set_token
  has_many :slot_users, class_name: 'SlotUser'
  has_many :slots, through: :slot_users

  private

  def set_token
    self.token ||= SecureRandom.hex(10)
  end
end

class Slot < ActiveRecord::Base
  belongs_to :calendar, optional: true
  validates :time, presence: true
  has_many :slot_users, class_name: 'SlotUser'
  has_many :users, through: :slot_users

  def participant_count
    slot_users.sum('1 + extra')
  end
end

helpers do
  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def current_calendar
    if session[:calendar_id]
      @current_calendar ||= Calendar.find_by(id: session[:calendar_id])
    elsif current_user
      session[:calendar_id] = current_user.calendar_id
      @current_calendar = current_user.calendar
    else
      @current_calendar ||= Calendar.first
    end
  end

  def admin?
    return false unless current_user
    return true if current_user.id == 1
    current_user.admin? || current_user.superadmin? || (ENV['ADMIN_IDS'] || '').split(',').include?(current_user.telegram_id.to_s)
  end

  def superadmin?
    current_user&.superadmin?
  end
end

get '/' do
  redirect '/calendar'
end


get '/auth' do
  token = params[:token]
  halt 400 unless token
  user = User.find_by(token: token)
  halt 400 unless user
  session[:user_id] = user.id
  session[:calendar_id] = user.calendar_id
  redirect '/calendar'
end

get '/register' do
  @user = current_user || User.new(telegram_id: params[:telegram_id], name: params[:name])
  erb :register
end

post '/register' do
  @user = User.find_or_create_by(telegram_id: params[:telegram_id]) do |u|
    u.name = params[:name]
    u.calendar_id = params[:calendar_id]
  end
  session[:user_id] = @user.id
  session[:calendar_id] = @user.calendar_id
  redirect '/calendar'
end

get '/calendar' do
  date = params[:week] ? Date.parse(params[:week]) : Date.today
  @start_week = date.beginning_of_week
  @prev_week = @start_week - 14
  @next_week = @start_week + 14
  @calendar = current_calendar
  erb :calendar
end

get '/admin' do
  halt 403 unless admin?
  if superadmin?
    if params[:calendar_id]
      @calendar = Calendar.find(params[:calendar_id])
      @users = @calendar.users.order(:name)
    else
      @calendars = Calendar.order(:name)
    end
  else
    @calendar = current_calendar
    @users = @calendar.users.order(:name)
  end
  erb :admin
end

post '/admin' do
  halt 403 unless admin?
  calendar = superadmin? ? Calendar.find(params[:calendar_id]) : current_calendar
  calendar.users.each do |u|
    allowed = params["allow_#{u.id}"] == '1'
    u.update(can_set_rules: allowed)
    if superadmin?
      is_admin = params["admin_#{u.id}"] == '1'
      u.update(admin: is_admin)
    end
  end
  redirect "/admin?calendar_id=#{calendar.id}"
end

post '/slots/:id/toggle' do
  halt 401 unless current_user
  payload = request.body.read
  data = payload.empty? ? {} : JSON.parse(payload)
  extra = data['extra'].to_i
  slot = Slot.find(params[:id])
  halt 403 unless slot.calendar_id == current_calendar&.id
  su = SlotUser.find_by(slot: slot, user: current_user)
  if su
    SlotUser.where(slot: slot, user: current_user).delete_all
  else
    SlotUser.create(slot: slot, user: current_user, extra: extra)
  end
  SLOTS_CACHE.clear
  content_type :json
  { success: true }.to_json
end

post '/slots/set_rule' do
  halt 401 unless current_user&.can_set_rules
  payload = request.body.read
  data = payload.empty? ? {} : JSON.parse(payload)
  ids = data['slot_ids']
  note = data['note']
  slots = Slot.where(id: ids, calendar_id: current_calendar&.id)
  slots.update_all(note: note)
  SLOTS_CACHE.clear
  content_type :json
  { success: true }.to_json
end

get '/api/slots' do
  content_type :json
  date = params[:week] ? Date.parse(params[:week]) : Date.today
  start_week = date.beginning_of_week
  key = "range_#{current_calendar&.id}_#{start_week}"
  if SLOTS_CACHE[key]
    return SLOTS_CACHE[key]
  end
  end_date = start_week + 14
  slots = Slot.includes(slot_users: :user)
              .where('time >= ? AND time < ? AND calendar_id = ?', start_week, end_date, current_calendar&.id)
              .order(:time)
  data = slots.map do |s|
    {
      id: s.id,
      time: s.time,
      count: s.participant_count,
      users: s.slot_users.map { |su| su.extra.positive? ? "#{su.user.name} +#{su.extra}" : su.user.name },
      selected: current_user ? s.slot_users.any? { |su| su.user_id == current_user.id } : false,
      note: s.note
    }
  end.to_json
  SLOTS_CACHE[key] = data
  data
end
