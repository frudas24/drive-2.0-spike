require 'rubygems'
require 'bundler/setup'
require 'sinatra'
configure do
  static_ts = '20150316155124'
  asset_host = ENV['ASSET_HOST']
  set :static_url, "#{asset_host}/#{static_ts}"  
  set :public_url, ENV['PUBLIC_URL'] || "/"
end
get '/' do
  erb :map_editor
end
get '/drive/install' do
  erb :drive_install
end
get '/drive/post_install' do
  erb :drive_post_install
end
get '/drive/new' do
  erb :drive_new
end
get '/drive/open' do
  erb :drive_open
end
