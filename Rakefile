require 'rubygems'
begin
  require 'rake'
rescue LoadError
  puts 'This script should only be accessed via the "rake" command.'
  puts 'Installation: gem install rake -y'
  exit
end

require 'yaml'
require 'rake'
require 'rake/clean'
require 'rake/packagetask'

$:.unshift File.dirname(__FILE__) + "/lib"

#extracted from prototype js framework http://prototypejs.org
module PrototypeHelper
	APP_NAME     = 'prototype.simulate'
	RUBYFORGE_PROJECT = APP_NAME
	APP_TEMPLATE = "#{APP_NAME}.js.erb"
	APP_FILE_NAME= "#{APP_NAME}.js"

	APP_ROOT     = File.expand_path(File.dirname(__FILE__)) #APP_ROOT
	APP_SRC_DIR  = File.join(APP_ROOT, 'src') 							#SRC_DIR
	APP_DIST_DIR = File.join(APP_ROOT, 'dist') 							#DIST_DIR
	APP_PKG_DIR  = File.join(APP_ROOT, 'pkg') 							#PKG_DIR
	APP_DOC_DIR       = File.join(APP_ROOT, 'doc') 					#DOC_DIR
	APP_TEMPLATES_DIR = File.join(APP_ROOT, 'templates') 		#TEMPLATES_DIR
	APP_TEST_DIR      = File.join(APP_ROOT, 'test') 				#TEST_DIR
	APP_TEST_UNIT_DIR = File.join(APP_TEST_DIR, 'unit') 		#TEST_UNIT_DIR
	APP_TMP_DIR       = File.join(APP_TEST_UNIT_DIR, 'tmp') #TMP_DIR
	APP_VERSION       = YAML.load(IO.read(File.join(APP_SRC_DIR, 'constants.yml')))['PROTOTYPE_SIMULATE_VERSION'] #VERSION


  def self.sprocketize(path, source, destination = nil, strip_comments = true)
  	puts "path = #{path}"
  	puts "source = #{source}"
  	puts "destination = #{destination}"
  	puts "strip_comments = #{strip_comments}"
    require_sprockets
    secretary = Sprockets::Secretary.new(
      :root           => File.join(APP_ROOT, path),
      :load_path      => [APP_SRC_DIR],
      :source_files   => [source],
      :strip_comments => strip_comments
    )

    destination = File.join(APP_DIST_DIR, source) unless destination
    secretary.concatenation.save_to(destination)
  end

  def self.build_doc_for(file)
    mkdir_p APP_TMP_DIR
    temp_path = File.join(APP_TMP_DIR, "prototype.simulate.temp.js")
    sprocketize('dist', file, temp_path, false)
    rm_rf APP_DOC_DIR

		begin
		  PDoc::Runner.new(temp_path, {
		    :output    => APP_DOC_DIR,
		    :templates => File.join(APP_TEMPLATES_DIR, "html"),
		    :index_page => 'README.markdown'
		  }).run
		rescue Exception => e
			p e
			puts e.backtrace
		end


    rm_rf temp_path
  end

	def self.name_with_version(postfix=nil)
		"#{PrototypeHelper::APP_NAME}#{postfix and '.' + postfix}-#{PrototypeHelper::APP_VERSION}.js"
	end

  def self.require_sprockets
    require_submodule('Sprockets', 'sprockets')
  end

  def self.require_pdoc
    require_submodule('PDoc', 'pdoc')
  end

  def self.require_unittest_js
    require_submodule('UnittestJS', 'unittest_js')
  end

  def self.require_caja_builder
    require_submodule('CajaBuilder', 'caja_builder')
  end

  def self.require_submodule(name, path)
    begin
      require path
    rescue LoadError => e
      missing_file = e.message.sub('no such file to load -- ', '')
      if missing_file == path
        puts "\nIt looks like you're missing #{name}. Just run:\n\n"
        puts "  $ git submodule init"
        puts "  $ git submodule update vendor/#{path}"
        puts "\nand you should be all set.\n\n"
      else
        puts "\nIt looks like #{name} is missing the '#{missing_file}' gem. Just run:\n\n"
        puts "  $ gem install #{missing_file}"
        puts "\nand you should be all set.\n\n"
      end
      exit
    end
  end
end

%w[sprockets pdoc unittest_js caja_builder].each do |name|
  $:.unshift File.join(PrototypeHelper::APP_ROOT, 'vendor', name, 'lib')
end

unless ENV['rakefile_just_config']

namespace :doc do
  desc "Builds the documentation."
  task :build => [:require] do
    PrototypeHelper.build_doc_for(ENV['SECTION'] ? "#{ENV['SECTION']}.js" : 'prototype.simulate.js')
  end

  task :require do
    PrototypeHelper.require_pdoc
  end
end

task :default => [:dist, :package, :clean_package_source]

desc "Builds the distribution"
task :dist do
  $:.unshift File.join(PrototypeHelper::APP_ROOT, 'lib')
  require 'protodoc'
  require 'fileutils'
  FileUtils.mkdir_p PrototypeHelper::APP_DIST_DIR

  Dir.chdir(PrototypeHelper::APP_SRC_DIR) do
    File.open(File.join(PrototypeHelper::APP_DIST_DIR, PrototypeHelper::APP_FILE_NAME), 'w+') do |dist|
      dist << Protodoc::Preprocessor.new(PrototypeHelper::APP_TEMPLATE)
    end
  end
  Dir.chdir(PrototypeHelper::APP_DIST_DIR) do
    FileUtils.copy_file PrototypeHelper::APP_FILE_NAME, PrototypeHelper::name_with_version
  end
  if File.directory?("website")
    FileUtils.mkdir_p "website/dist"
    FileUtils.copy_file "dist/#{PrototypeHelper::APP_FILE_NAME}", "website/dist/#{PrototypeHelper::APP_SRC_DIR}"
    FileUtils.copy_file "dist/#{PrototypeHelper::APP_FILE_NAME}", "website/dist/#{PrototypeHelper::name_with_version}.js"
  end
end

desc "regenerate distribution"
task :redist => [:clobber, :dist] do
end

Rake::PackageTask.new(PrototypeHelper::APP_NAME, PrototypeHelper::APP_VERSION) do |package|
  package.need_tar_gz = true
  package.package_dir = PrototypeHelper::APP_PKG_DIR
  package.package_files.include(
    '[A-Z]*',
    'config/*.sample',
    "dist/#{PrototypeHelper::APP_FILE_NAME}",
    'lib/**',
    'src/**',
    'script/**',
    'tasks/**',
    'test/**',
    'website/**'
  )
end

desc "Builds the distribution, runs the JavaScript unit + functional tests and collects their results."
task :test => [:dist, :test_units, :test_functionals]

if ARGV.to_s.match /test/
	require 'jstest'
	desc "Runs all the JavaScript unit tests and collects the results"
	JavaScriptTestTask.new(:test_units, 4711) do |t|
		testcases        = ENV['TESTCASES']
		tests_to_run     = ENV['TESTS']    && ENV['TESTS'].split(',')
		browsers_to_test = ENV['BROWSERS'] && ENV['BROWSERS'].split(',')

		t.mount("/dist")
		t.mount("/src")
		t.mount("/test")

		Dir["test/unit/*_test.html"].sort.each do |test_file|
		  tests = testcases ? { :url => "/#{test_file}", :testcases => testcases } : "/#{test_file}"
		  test_filename = test_file[/.*\/(.+?)\.html/, 1]
		  t.run(tests) unless tests_to_run && !tests_to_run.include?(test_filename)
		end

		%w( safari firefox ie konqueror opera ).each do |browser|
		  t.browser(browser.to_sym) unless browsers_to_test && !browsers_to_test.include?(browser)
		end
	end

	desc "Runs all the JavaScript functional tests and collects the results"
	JavaScriptTestTask.new(:test_functionals, 4712) do |t|
		testcases        = ENV['TESTCASES']
		tests_to_run     = ENV['TESTS']    && ENV['TESTS'].split(',')
		browsers_to_test = ENV['BROWSERS'] && ENV['BROWSERS'].split(',')

		t.mount("/dist")
		t.mount("/src")
		t.mount("/test")

		Dir["test/functional/*_test.html"].sort.each do |test_file|
		  tests = testcases ? { :url => "/#{test_file}", :testcases => testcases } : "/#{test_file}"
		  test_filename = test_file[/.*\/(.+?)\.html/, 1]
		  t.run(tests) unless tests_to_run && !tests_to_run.include?(test_filename)
		end

		%w( safari firefox ie konqueror opera ).each do |browser|
		  t.browser(browser.to_sym) unless browsers_to_test && !browsers_to_test.include?(browser)
		end
	end
end

desc "process with google closure compiler"
task :compile => :redist do
	here = File.dirname(__FILE__)

	output_file = File.join here, 'dist', PrototypeHelper::name_with_version('min')
	input_file = File.join here, 'dist', PrototypeHelper::name_with_version
	jar_path = File.join  here, 'vendor', 'google_closure_compiler', 'compiler.jar'

	options = []

#	options << "--compilation_level=ADVANCED_OPTIMIZATIONS"
#	options << "--compilation_level=WHITESPACE_ONLY"
	options << "--js=#{input_file}"
	options << "--js_output_file=#{output_file}"

	system "java -jar #{jar_path} #{options.join ' '}"

end

task :clean_package_source do
  rm_rf File.join(PrototypeHelper::APP_PKG_DIR, PrototypeHelper::name_with_version)
end

Dir['tasks/**/*.rake'].each { |rake| load rake }

end

