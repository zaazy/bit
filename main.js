/* eslint-disable no-prototype-builtins */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-fallthrough */
/* main.js - 6.9GB - TODO:
* Separate logic that requires source files so that they are only ran when you have the required source file - need a cheap way to check if you have source file?
* add a way to determine and notify if an unrecognised argument was passed
* use the same server choosing logic used in hacker.js for picking which server to run helper scripts on
* figure out a better way for this to run "hacker.js"
* Maybe make a cache script that saves runtime constants like max money of servers to a cache file to potentially reduce RAM usage further.
*/

import {
  string_sanitise,
  object_parse_arguments
} from 'lib_no_ns.js'
import {
  float_get_server_ram_free
} from 'lib_ram_server.js'
import {
  array_make_schedule_script,
  void_schedule_script_runner
} from 'lib_ram_script.js'
import { array_get_servers } from 'lib_servers.js'
import { array_get_files_with_string } from 'lib_ls.js'
import { void_kill_script_named_server_named } from 'lib_kill.js'

const object_get_constants = function () {
  return {
    // default values
    object_defaults: {
      // time period used for checking the time in seconds
      float_period_check_seconds: 10,
      // duration between each job used to prevent collisions between them to keep them in sequence
      float_padding_seconds: 2,
      // maximum amount of jobs to execute per schedule, used to prevent using up too much IRL RAM
      integer_job_cap: 100,
      // name of purchased servers
      string_servers_bought_name: 'server',
      // target
      string_server_target: '',
      // precision of the percentage to steal calculator
      float_precision: 0.01,
      // ram utilisiation threshold. upgrade ram or buy or replace servers when reached.
      float_ram_utilisation_threshold: 0.9,
      // the maximum percentage of cash that should be stolen from a server
      float_steal_cap: 0.9,
      // multiplier for skill factor used in server scoring system
      float_multiplier_factor_skill: 1,
      // multiplier for max cash factor used in server scoring system
      float_multiplier_factor_max_cash: 1,
      // multiplier for growth factor used in server scoring system
      float_multiplier_factor_growth: 1,
      // correction method for factors used in server scoring system. can be "standard" or "normal"
      string_method_score_correction: 'standard',
      // fraction of botnet's ram to use for cyclic weaken
      float_ram_fraction_for_weaken_cyclic: 0.5,
      // whether to run discrete batches or continuously
      boolean_discrete: !1,
      // whether to display help and exit
      boolean_print_help: !1
    },
    // helper scripts
    object_helpers: {
      string_nop: 'nop.js',
      string_hacker: 'hacker.js',
      string_hack_net: 'hacknet.js',
      string_ram: 'ram.js',
      string_servers: 'servers.js',
      string_tor: 'tor.js',
      string_programs: 'programs.js',
      string_botnet: 'botnet.js',
      string_weaken_manager: 'weaken_manager.js',
      string_cyclic_weaken: 'cyclic_weaken.js'
    },
    // argument names
    object_argument_names: {
      check_delay: {
        short: 'c',
        long: 'check-delay'
      },
      job_delay: {
        short: 'd',
        long: 'job-delay'
      },
      discrete: {
        short: 'f',
        long: 'discrete'
      },
      help: {
        short: 'h',
        long: 'help'
      },
      target: {
        short: 'i',
        long: 'target'
      },
      job_cap: {
        short: 'j',
        long: 'job-cap'
      },
      multiplier_skill: {
        short: 'k',
        long: 'multiplier-skill'
      },
      multiplier_cash: {
        short: 'l',
        long: 'multiplier-cash'
      },
      multiplier_growth: {
        short: 'm',
        long: 'multiplier-growth'
      },
      server_name: {
        short: 'n',
        long: 'server-name'
      },
      precision: {
        short: 'p',
        long: 'precision'
      },
      score_correction: {
        short: 'q',
        long: 'score-correction'
      },
      ram_utilisation: {
        short: 'r',
        long: 'ram-utilisation'
      },
      steal_cap: {
        short: 's',
        long: 'steal-cap'
      },
      weaken_manager: {
        short: 'u',
        long: 'weaken-manager'
      },
      ram_cyclic_weaken: {
        short: 'v',
        long: 'ram-cyclic-weaken'
      },
      ram: {
        short: 'a',
        long: 'ram'
      },
      servers: {
        short: 'e',
        long: 'servers'
      },
      tor: {
        short: 'o',
        long: 'tor'
      },
      programs: {
        short: 'g',
        long: 'programs'
      },
      botnet: {
        short: 'b',
        long: 'botnet'
      },
      hack_net: {
        short: 'w',
        long: 'hacknet'
      }
    },
    // programs
    array_programs: [
      'BruteSSH.exe',
      'FTPCrack.exe',
      'relaySMTP.exe',
      'HTTPWorm.exe',
      'SQLInject.exe',
      'DeepscanV1.exe',
      'DeepscanV2.exe',
      'Autolink.exe'
    ],
    // script extensions
    array_script_extensions: [
      '.js',
      '.ns',
      '.script'
    ]
  }
}

// main
export const main = async function (ns) {
  // variables
  const
    // defaults
    object_defaults = object_get_constants().object_defaults
    // argument names
  const object_argument_names = object_get_constants().object_argument_names
  // helper scripts
  const object_helpers = object_get_constants().object_helpers
  // threads of "nop.js" required to reserve enough RAM to run "hacker.js"
  const integer_threads_nop = integer_get_threads_nop(ns, object_helpers.string_hacker, ns.getScriptName())
  // if this server doesn't have enough RAM to run "hacker.js", eject
  if (
    !boolean_can_server_run_script_threads(
      ns,
      float_get_server_ram_free(ns, ns.getHostname()),
      object_helpers.string_nop,
      integer_threads_nop
    )
  ) {
    const string_message_error = `This server has insufficient RAM to run "${object_helpers.string_nop}" with "${integer_threads_nop}" thread(s).`
    throw (ns.tprint(`ERROR: ${string_message_error}`), new Error(string_message_error))
  }
  let
    string_servers_bought_name = object_defaults.string_servers_bought_name
  let integer_job_cap = object_defaults.integer_job_cap
  let float_padding_seconds = object_defaults.float_padding_seconds
  let float_precision = object_defaults.float_precision
  let float_steal_cap = object_defaults.float_steal_cap
  let float_period_check_seconds = object_defaults.float_period_check_seconds
  let string_server_target = object_defaults.string_server_target
  let float_ram_utilisation_threshold = object_defaults.float_ram_utilisation_threshold
  let float_multiplier_factor_skill = object_defaults.float_multiplier_factor_skill
  let float_multiplier_factor_max_cash = object_defaults.float_multiplier_factor_max_cash
  let float_multiplier_factor_growth = object_defaults.float_multiplier_factor_growth
  let string_method_score_correction = object_defaults.string_method_score_correction
  let float_ram_fraction_for_weaken_cyclic = object_defaults.float_ram_fraction_for_weaken_cyclic
  let boolean_discrete = object_defaults.boolean_discrete
  let boolean_print_help = object_defaults.boolean_print_help

  // argument parsing
  const object_arguments = object_parse_arguments(ns.args)
  for (const string_argument in object_arguments) {
    if (object_arguments.hasOwnProperty(string_argument)) {
      const argument_value = object_arguments[string_argument]
      switch (string_argument) {
        case object_argument_names.check_delay.short:
        // fall-through
        case object_argument_names.check_delay.long:
          float_period_check_seconds = argument_value
          break
        case object_argument_names.job_delay.short:
        // fall-through
        case object_argument_names.job_delay.long:
          float_padding_seconds = argument_value
          break
        case object_argument_names.discrete.short:
        // fall-through
        case object_argument_names.discrete.long:
          boolean_discrete = argument_value
          break
        case object_argument_names.help.short:
        // fall-through
        case object_argument_names.help.long:
          boolean_print_help = argument_value
          break
        case object_argument_names.target.short:
        // fall-through
        case object_argument_names.target.long:
          string_server_target = argument_value
          break
        case object_argument_names.job_cap.short:
        // fall-through
        case object_argument_names.job_cap.long:
          integer_job_cap = argument_value
          break
        case object_argument_names.multiplier_skill.short:
        // fall-through
        case object_argument_names.multiplier_skill.long:
          float_multiplier_factor_skill = argument_value
          break
        case object_argument_names.multiplier_cash.short:
        // fall-through
        case object_argument_names.multiplier_cash.long:
          float_multiplier_factor_max_cash = argument_value
          break
        case object_argument_names.multiplier_growth.short:
        // fall-through
        case object_argument_names.multiplier_growth.long:
          float_multiplier_factor_growth = argument_value
          break
        case object_argument_names.server_name.short:
        // fall-through
        case object_argument_names.server_name.long:
          string_servers_bought_name = argument_value
          break
        case object_argument_names.precision.short:
        // fall-through
        case object_argument_names.precision.long:
          float_precision = argument_value
          break
        case object_argument_names.score_correction.short:
        // fall-through
        case object_argument_names.score_correction.long:
          string_method_score_correction = argument_value
          break
        case object_argument_names.ram_utilisation.short:
        // fall-through
        case object_argument_names.ram_utilisation.long:
          float_ram_utilisation_threshold = argument_value
          break
        case object_argument_names.steal_cap.short:
        // fall-through
        case object_argument_names.steal_cap.long:
          float_steal_cap = argument_value
          break
        case object_argument_names.ram_cyclic_weaken.short:
        // fall-through
        case object_argument_names.ram_cyclic_weaken.long:
          float_ram_fraction_for_weaken_cyclic = argument_value
          break
      }
    }
  }

  const array_helpers = [
    {
      file: object_helpers.string_ram,
      threads_or_ram_botnet: 1,
      args: [float_period_check_seconds, float_ram_utilisation_threshold]
    },
    {
      file: object_helpers.string_servers,
      threads_or_ram_botnet: 1,
      args: [
        float_period_check_seconds,
        string_servers_bought_name,
        float_ram_utilisation_threshold
      ]
    },
    {
      file: object_helpers.string_tor,
      threads_or_ram_botnet: 1,
      args: [float_period_check_seconds]
    },
    {
      file: object_helpers.string_programs,
      threads_or_ram_botnet: 1,
      args: [
        float_period_check_seconds,
        object_get_constants().array_programs
      ]
    },
    {
      file: object_helpers.string_botnet,
      threads_or_ram_botnet: 1,
      args: [float_period_check_seconds]
    },
    {
      file: object_helpers.string_weaken_manager,
      threads_or_ram_botnet: 1,
      args: [
        float_period_check_seconds,
        object_get_constants().object_helpers.string_cyclic_weaken,
        float_ram_fraction_for_weaken_cyclic,
        float_padding_seconds
      ]
    },
    {
      file: object_helpers.string_hack_net,
      threads_or_ram_botnet: 1,
      args: [float_period_check_seconds]
    }
  ]

  for (const string_argument in object_arguments) {
    if (object_arguments.hasOwnProperty(string_argument)) {
      const argument_value = object_arguments[string_argument];
      ((object_argument_names.ram.short === string_argument && argument_value) ||
        (object_argument_names.ram.long === string_argument && !argument_value)) &&
        array_helpers.splice(
          integer_get_index_of_file(array_helpers, object_helpers.string_ram),
          1
        ),
      ((object_argument_names.servers.short === string_argument && argument_value) ||
        (object_argument_names.servers.long === string_argument && !argument_value)) &&
        array_helpers.splice(
          integer_get_index_of_file(
            array_helpers,
            object_helpers.string_servers
          ),
          1
        ),
      ((object_argument_names.tor.short === string_argument && argument_value) ||
        (object_argument_names.tor.long === string_argument && !argument_value)) &&
        array_helpers.splice(
          integer_get_index_of_file(array_helpers, object_helpers.string_tor),
          1
        ),
      ((object_argument_names.programs.short === string_argument && argument_value) ||
        (object_argument_names.programs.long === string_argument && !argument_value)) &&
        array_helpers.splice(
          integer_get_index_of_file(
            array_helpers,
            object_helpers.string_programs
          ),
          1
        ),
      ((object_argument_names.botnet.short === string_argument && argument_value) ||
        (object_argument_names.botnet.long === string_argument && !argument_value)) &&
        array_helpers.splice(
          integer_get_index_of_file(
            array_helpers,
            object_helpers.string_botnet
          ),
          1
        ),
      ((object_argument_names.hack_net.short === string_argument && argument_value) ||
        (object_argument_names.hack_net.long === string_argument && !argument_value)) &&
        array_helpers.splice(
          integer_get_index_of_file(
            array_helpers,
            object_helpers.string_hack_net
          ),
          1
        ),
      ((object_argument_names.weaken_manager.short === string_argument && argument_value) ||
        (object_argument_names.weaken_manager.long === string_argument && !argument_value)) &&
        array_helpers.splice(
          integer_get_index_of_file(
            array_helpers,
            object_helpers.string_weaken_manager
          ),
          1
        )
    }
  }

  // main
  if (boolean_print_help) { return void_print_help(ns) }
  // reserve enough RAM for "hacker.js"
  ns.exec(object_helpers.string_nop, ns.getHostname(), integer_threads_nop)
  void_copy_scripts(ns)
  void_schedule_script_runner(ns, array_make_schedule_script(ns, array_helpers))
  // kill "nop.js" scripts to free RAM
  void_kill_script_named_server_named(
    ns,
    ns.getHostname(),
    object_helpers.string_nop
  )
  ns.spawn(
    object_helpers.string_hacker,
    1,
    integer_job_cap,
    float_precision,
    float_steal_cap,
    float_padding_seconds,
    boolean_discrete,
    string_method_score_correction,
    float_multiplier_factor_skill,
    float_multiplier_factor_max_cash,
    float_multiplier_factor_growth,
    string_server_target
  )
}

// functions
const void_print_help = function (ns) {
  const
    object_defaults = object_get_constants().object_defaults
  const object_argument_names = object_get_constants().object_argument_names
  const object_helpers = object_get_constants().object_helpers
  ns.tprint(
    string_sanitise(`
USAGE
  run ${ns.getScriptName()} [FLAGS ...] [OPTIONS ...]

FLAGS
  -${object_argument_names.ram.short}, --no-${object_argument_names.ram.long}
    Prevents the "${object_helpers.string_ram}" script from being started which is responsible for upgrading the RAM of the "home" server.

  -${object_argument_names.botnet.short}, --no-${object_argument_names.botnet.long}
    Prevents the "${object_helpers.string_botnet}" script from being started which is responsible for rooting servers in the network.

  -${object_argument_names.servers.short}, --no-${object_argument_names.servers.long}
    Prevents the "${object_helpers.string_servers}" script from being started which is responsible for buying and replacing bought servers.

  -${object_argument_names.discrete.short}, --${object_argument_names.discrete.long}
    Run discrete batches instead of continuously. The former mode has downtime but may result in more correctly scheduled jobs compared to the latter.

  -${object_argument_names.programs.short}, --no-${object_argument_names.programs.long}
    Prevents the "${object_helpers.string_programs}" script from being started which is responsible for buying programs from the "darkweb" server.

  -${object_argument_names.help.short}, --${object_argument_names.help.long}
    Displays this message then exits.

  -${object_argument_names.tor.short}, --no-${object_argument_names.tor.long}
    Prevents the "${object_helpers.string_tor}" script from being started which is responsible for buying a TOR Router.

  -${object_argument_names.weaken_manager.short}, --no-${object_argument_names.weaken_manager.long}
    Prevents the "${object_helpers.string_weaken_manager}" script from being started which is responsible for running threads of "${object_helpers.string_cyclic_weaken}" to gain hacking experience.

  -${object_argument_names.hack_net.short}, --no-${object_argument_names.hack_net.long}
    Prevents the "${object_helpers.string_hack_net}" script from being started which is responsible for buying and upgrading Hacknet nodes until the Hacknet node requirements for joining the Netburners faction are met.

OPTIONS
  -${object_argument_names.check_delay.short}, --${object_argument_names.check_delay.long} <SECONDS>
    SECONDS = The duration of delay between each repeat of the helper scripts' main loops, in seconds. Should be a floating-point number > 0. Defaults to ${object_defaults.float_period_check_seconds}.

  -${object_argument_names.job_delay.short}, --${object_argument_names.job_delay.long} <SECONDS>
    SECONDS = The duration of delay between each job, in seconds. Should be a floating-point number > 0. Defaults to ${object_defaults.float_padding_seconds}.

  -${object_argument_names.target.short}, --${object_argument_names.target.long} <SERVER>
    SERVER = The server that should be targetted by the \`weaken\`, \`grow\` and \`hack\` functions. Should be a string. Defaults to choosing an optimal target using a scoring system based on the server's maximum cash, growth, required hacking level, and the player's current hacking level.

  -${object_argument_names.job_cap.short}, --${object_argument_names.job_cap.long} <CAP>
    CAP = The maximum amount of jobs to execute per schedule. This is ignored when running in continuous mode. Should be an integer > 0. Defaults to ${object_defaults.integer_job_cap}.

  -${object_argument_names.server_name.short}, --${object_argument_names.server_name.long} <NAME>
    NAME = The name to be used for purchased servers. Should be a string. Defaults to "${object_defaults.string_servers_bought_name}".

  -${object_argument_names.precision.short}, --${object_argument_names.precision.long} <PRECISION>
    PRECISION = A value used in determining how many cycles of bisection the binary search algorithm used for the percentage to steal calculator should use. Should be a floating point number > 0 <= 1. Values closer to 0 will result in greater precision in the calculation, but potentially longer run-times and compared to values closer to 1. Defaults to ${object_defaults.float_precision}.

  -${object_argument_names.ram_utilisation.short}, --${object_argument_names.ram_utilisation.long} <THRESHOLD>
    THRESHOLD = The botnet's ram utilisation threshold after which upgrades/replacements should be bought for servers and the RAM of "home". Should be a floating point number >= 0 <= 1. Values closer to 0 will result in attempting more frequent upgrades/replacements at the cost of less efficient RAM utilisation to cash spenditure ratios. Defaults to ${object_defaults.float_ram_utilisation_threshold}.

  -${object_argument_names.steal_cap.short}, --${object_argument_names.steal_cap.long} <CAP>
    CAP = The maximum fraction of cash to steal from the target server per \`hack\` job. Should be an integer >= 0 <=1. Defaults to ${object_defaults.float_steal_cap}.

  -${object_argument_names.multiplier_skill.short}, --${object_argument_names.multiplier_skill.long} <FLOAT>
    FLOAT = The multiplier used to change the weight of the factor representing your skill against the target server used in the server scoring system. Should a floating point number. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect. Defaults to ${object_defaults.float_multiplier_factor_skill}.

  -${object_argument_names.multiplier_cash.short}, --${object_argument_names.multiplier_cash.long} <FLOAT>
    FLOAT = The multiplier used to change the weight of the factor representing the target server's maximum cash used in the server scoring system. Should a floating point number. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect. Defaults to ${object_defaults.float_multiplier_factor_max_cash}.

  -${object_argument_names.multiplier_growth.short}, --${object_argument_names.multiplier_growth.long} <FLOAT>
    FLOAT = The multiplier used to change the weight of the factor representing the target server's growth used in the server scoring system. Should a floating point number. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect. Defaults to ${object_defaults.float_multiplier_factor_growth}.

  -${object_argument_names.score_correction.short}, --${object_argument_names.score_correction.long} <METHOD>
    METHOD = The method used to correct the factors used in the server scoring system. Can be "standard" (uses standard scoring) or "normal" (uses mean normalised scoring). Defaults to "${object_defaults.string_method_score_correction}".
  
  -${object_argument_names.ram_cyclic_weaken.short}, --${object_argument_names.ram_cyclic_weaken.long} <FLOAT>
    FLOAT = The fraction of the botnet's current available RAM to be used by ${object_helpers.string_weaken_manager} to run threads of "${object_helpers.string_cyclic_weaken}". Should be a floating point number > 0. Defaults to ${object_defaults.float_ram_fraction_for_weaken_cyclic}.`
    )
  )
}

// return true if a server has enough RAM to run a script with a stated number of threads
const boolean_can_server_run_script_threads = function (
  ns,
  float_server_used_ram_free,
  string_script,
  integer_threads
) {
  return !(
    ns.getScriptRam(string_script) * integer_threads >
    float_server_used_ram_free
  )
}

// return the difference in RAM requirements between two scripts
const float_get_ram_difference = function (
  ns,
  string_script_0,
  string_script_1
) {
  return ns.getScriptRam(string_script_0) - ns.getScriptRam(string_script_1)
}

// return the amount of threads of "nop.js" is required to make up RAM difference between two scripts
const integer_get_threads_nop = function (
  ns,
  string_script_0,
  string_script_1
) {
  return Math.ceil(
    float_get_ram_difference(ns, string_script_0, string_script_1) /
      ns.getScriptRam(object_get_constants().object_helpers.string_nop)
  )
}

// copies files to all rooted servers
const void_copy_files_to_servers = function (
  ns,
  array_files,
  string_source
) {
  const array_servers = array_get_servers(ns)
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) {
    ns.scp(
      array_files,
      string_source,
      array_servers[integer_index_server]
    )
  }
}

// copy all scripts from the current server to all servers
const void_copy_scripts = function (ns) {
  const string_host = ns.getHostname()
  void_copy_files_to_servers(
    ns,
    array_get_files_with_string(
      ns,
      string_host,
      object_get_constants().array_script_extensions
    ),
    string_host
  )
}

// returns the index of the scripts array which matches the filename input
const integer_get_index_of_file = function (
  array_scripts,
  string_file
) {
  for (
    let integer_index_script = 0;
    integer_index_script < array_scripts.length;
    ++integer_index_script
  ) {
    const
      object_script = array_scripts[integer_index_script]
    const string_script_file = object_script.file
    if (string_script_file === string_file) return integer_index_script
  }
}
