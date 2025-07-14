require 'sinatra'
require 'sinatra/activerecord'
require 'sinatra/json'
require 'telegram/bot'
require 'date'

set :database, {adapter: 'sqlite3', database: 'db/development.sqlite3'}

enable :sessions

class User < ActiveRecord::Base
  validates :telegram_id, presence: true, uniqueness: true
end

class Slot < ActiveRecord::Base
  validates :time, presence: true
  has_and_belongs_to_many :users
end

helpers do
  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end
end

get '/' do
  redirect '/calendar'
end


get '/auth' do
  telegram_id = params[:telegram_id]
  name = params[:name]
  halt 400 unless telegram_id && name
  user = User.find_or_create_by(telegram_id: telegram_id) do |u|
    u.name = name
  end
  session[:user_id] = user.id
  redirect '/calendar'
end

get '/register' do
  @user = current_user || User.new(telegram_id: params[:telegram_id], name: params[:name])
  erb :register
end

post '/register' do
  @user = User.find_or_create_by(telegram_id: params[:telegram_id]) do |u|
    u.name = params[:name]
  end
  session[:user_id] = @user.id
  redirect '/calendar'
end

get '/calendar' do
  date = params[:week] ? Date.parse(params[:week]) : Date.today
  @start_week = date.beginning_of_week
  @prev_week = @start_week - 7
  @next_week = @start_week + 7
  erb :calendar
end

post '/slots/:id/toggle' do
  halt 401 unless current_user
  slot = Slot.find(params[:id])
  if slot.users.include?(current_user)
    slot.users.delete(current_user)
  else
    slot.users << current_user
  end
  content_type :json
  { success: true }.to_json
end


post '/slots/set_rule' do
  halt 401 unless current_user
  ids = params[:slot_ids]
  ids = JSON.parse(ids) if ids.is_a?(String)
  Slot.where(id: ids).update_all(note: params[:note])
  content_type :json
  { success: true }.to_json
end

get '/api/slots' do
  content_type :json
  date = params[:week] ? Date.parse(params[:week]) : Date.today
  start_week = date.beginning_of_week
  slots = Slot.includes(:users).where(time: start_week..(start_week + 7)).order(:time)
  data = slots.map do |s|
    {
      id: s.id,
      time: s.time,
      count: s.users.size,
      users: s.users.map(&:name),
      selected: current_user ? s.users.include?(current_user) : false,
      note: s.note
    }
  end
  json data
end
