require 'sinatra'
require 'sinatra/activerecord'
require 'sinatra/json'
require 'telegram/bot'

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

get '/register' do
  @user = current_user || User.new
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
  @slots = Slot.order(:time).all
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
  redirect '/calendar'
end

get '/api/slots' do
  content_type :json
  slots = Slot.includes(:users).order(:time)
  data = slots.map { |s| { id: s.id, time: s.time, count: s.users.size, users: s.users.map(&:name) } }
  json data
end
