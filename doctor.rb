#!/usr/bin/env ruby
# frozen_string_literal: true

require 'optparse'

class Doctor
  def initialize(options)
    @options = options
    @autofixed = 0
    @passed = 0
    @failed = 0
  end

  def self.run!(*args)
    new(*args).run!
  end

  def run!
    puts 'Running checks...'
    puts

    ensure_ngrok_is_installed
    ensure_yarn_install_has_been_ran
    ensure_node_modules_are_up_to_date

    puts
    print_stats
  end

  private

  # Checks

  def ensure_yarn_install_has_been_ran
    check \
      name: 'node_modules should be installed',
      check: cmd('stat node_modules'),
      fix: cmd('yarn install')
  end

  def ensure_node_modules_are_up_to_date
    check \
      name: 'node_modules should be up to date',
      check: cmd('yarn check --verify-tree'),
      fix: cmd('yarn install --check-files')
  end

  def ensure_ngrok_is_installed
    check \
      name: 'ngrok should be installed',
      check: cmd('command -v /usr/local/bin/ngrok'),
      fix: cmd('brew cask install ngrok')
  end

  def ensure_vscode_settings_json_are_symlinked
    vscode_dir = "#{Dir.pwd}/.vscode"

    check \
      name: '.vscode/settings.json should exist',
      check: cmd("stat #{vscode_dir}/settings.json"),
      fix: cmd(
        "ln -s #{vscode_dir}/settings.json.default "\
          "#{vscode_dir}/settings.json"
      )
  end

  def ensure_flow_config_is_generated
    check \
      name: '.flowconfig should be generated',
      check: cmd('stat .flowconfig'),
      fix: cmd('yarn run flow')
  end

  # Helpers

  attr_reader :options

  def check(*args)
    check = Check.new(*args)
    passes = check.passes?

    if passes
      print colorize(:green, '[OK]  ')
      @passed += 1
    else
      print colorize(:red, '[FAIL] ')
      @failed += 1
    end

    puts check.name

    unless passes
      if check.autofixable?
        if autofix?
          puts colorize(:yellow, 'Autofixing... ')
          puts

          if check.run_autofix
            puts
            puts colorize(:green, '[OK]')
            @autofixed += 1
          else
            puts
            puts colorize(:red, '[FAIL]')
            puts "  To manually fix, run: #{colorize(:yellow, check.fix.to_s)}"
          end
        else
          puts "  To manually fix: #{colorize(:yellow, check.fix.to_s)}"
        end
      else
        puts "  Not autofixable. To manually fix: #{colorize(:yellow, check.fix.to_s)}"
      end
    end
  end

  def autofix?
    !!options[:autofix]
  end

  def cmd(shell)
    Command.new(shell)
  end

  def print_stats
    print "Ran #{total_checks} check(s), "
    print colorize(:green, "#{@passed} passed")
    print ', '
    print colorize(:red, "#{@failed} failed")
    puts '.'

    if autofix?
      puts
      puts "Auto-fixed #{@autofixed} out of #{@failed}." if @failed > 0
    else
      puts
      puts "To autofix problems, run with #{colorize(:yellow, '-a')} flag."
    end
  end

  def total_checks
    @passed + @failed
  end

  COLOR_CODES = {
    green: 32,
    red: 31,
    yellow: 33
  }.freeze

  def colorize(color, string)
    "\e[#{COLOR_CODES[color]}m#{string}\e[0m"
  end

  class Command
    attr_reader :shell

    def initialize(shell)
      @shell = shell
    end

    def run(indent: false)
      cmd = shell
      cmd = "#{shell} | sed 's/^/  /'" if indent

      system(cmd)
    end

    def run_silently
      cmd = "#{shell} >/dev/null 2>&1"
      system(cmd)
    end

    def to_s
      shell
    end
  end

  class Check
    attr_reader :name, :fix

    def initialize(name:, check:, fix: nil)
      @name = name
      @check = check
      @fix = fix
    end

    def passes?
      !!check.run_silently
    end

    def autofixable?
      fix.is_a?(Command)
    end

    def run_autofix
      fix.run(indent: true)
    end

    private

    attr_reader :check
  end
end

# Parse options
options = {}

OptionParser.new do |opts|
  opts.banner = 'Usage: scripts/doctor [options]'

  opts.on('-a', '--autofix', 'Auto fix any issues') do |autofix|
    options[:autofix] = autofix
  end
end.parse!

Doctor.run!(options)