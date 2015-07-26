require 'rubygems'
require 'bundler/setup'
require 'sinatra'
configure do
  set :asset_host, ENV['ASSET_HOST']
  set :script_loading_timeout, ENV['SCRIPT_LOADING_TIMEOUT'] || 5000
  set :public_url, ENV['PUBLIC_URL'] || "/"
  set :startup_drive_scopes, 'https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive.file email profile'
  set :image_selector_drive_scopes, 'https://www.googleapis.com/auth/drive.install https://www.googleapis.com/auth/drive.file email profile https://www.googleapis.com/auth/photos.upload'
end
get '/' do
  erb :landing
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
  erb :drive_new
end
get "/drive/file/*" do
  erb :drive_new
end
