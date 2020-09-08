/* eslint-disable no-case-declarations */
/* eslint-disable no-prototype-builtins */
/* eslint-disable no-fallthrough */
/* eslint-disable no-tabs */
/* lshw.js - 7.25GB - Display information about one or more servers. TODO:
* prevent parser from altering default values displayed in help message.
* add flags that prevent certain information from being displayed.
*/

import {
  string_sanitise,
  object_parse_arguments
} from '../lib/lib_no_ns.js'
import {
  float_get_time_hack,
  float_get_time_grow,
  float_get_time_weaken
} from '../lib/lib_time.js'
import { float_get_server_score } from '../lib/lib_score.js'

const object_get_constants = function () {
  return {
    // default values
    object_defaults: {
      // decimal places to use for displaying numerical information
      integer_precision: 2,
      // multiplier for skill factor used in server scoring system
      float_multiplier_factor_skill: 1,
      // multiplier for max cash factor used in server scoring system
      float_multiplier_factor_max_cash: 1,
      // multiplier for growth factor used in server scoring system
      float_multiplier_factor_growth: 1,
      // correction method for factors used in server scoring system. can be "standard" or "normal"
      string_method_score_correction: 'standard',
      // time period used for checking the time in seconds
      float_sleep_duration_seconds: 0
    },
    object_argument_names: {
      delay: {
        short: 'd',
        long: 'delay'
      },
      help: {
        short: 'h',
        long: 'help'
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
      precision: {
        short: 'p',
        long: 'precision'
      },
      score_correction: {
        short: 'q',
        long: 'score-correction'
      }
    }
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
  let
    float_multiplier_factor_skill = object_defaults.float_multiplier_factor_skill
  let float_multiplier_factor_max_cash = object_defaults.float_multiplier_factor_max_cash
  let float_multiplier_factor_growth = object_defaults.float_multiplier_factor_growth
  let string_method_score_correction = object_defaults.string_method_score_correction
  let float_sleep_duration_seconds = object_defaults.float_sleep_duration_seconds
  let integer_precision = object_defaults.integer_precision
  // initial state of the servers array
  let array_servers = []
  // whether to display help and exit
  let boolean_print_help = !1
  // argument parsing
  const object_arguments = object_parse_arguments(ns.args)
  for (const string_argument in object_arguments) {
    if (object_arguments.hasOwnProperty(string_argument)) {
      const argument_value = object_arguments[string_argument]
      switch (string_argument) {
        case object_argument_names.delay.short:
        // fall-through
        case object_argument_names.delay.long:
          float_sleep_duration_seconds = argument_value
          break
        case object_argument_names.help.short:
        // fall-through
        case object_argument_names.help.long:
          boolean_print_help = argument_value
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
        case object_argument_names.precision.short:
        // fall-through
        case object_argument_names.precision.long:
          integer_precision = argument_value
          break
        case object_argument_names.score_correction.short:
        // fall-through
        case object_argument_names.score_correction.long:
          string_method_score_correction = argument_value
          break
        case '_':
          array_servers = argument_value
          break
        default:
          const string_message_error = `Unknown argument passed: "${string_argument}".`
          throw (ns.tprint(`ERROR: ${string_message_error}`), new Error(string_message_error))
      }
    }
  }

  // main
  if (boolean_print_help) { return void_print_help(ns) }
  for (array_servers.length === 0 && array_servers.push(ns.getHostname()); ;) {
    for (
      let integer_index_server = 0;
      integer_index_server < array_servers.length;
      ++integer_index_server
    ) {
      const string_server = array_servers[integer_index_server]
      try {
        void_print_information(
          ns,
          string_server,
          integer_precision,
          string_method_score_correction,
          float_multiplier_factor_skill,
          float_multiplier_factor_max_cash,
          float_multiplier_factor_growth
        )
      } catch (error) {
        ns.tprint(JSON.stringify(error))
      }
    }
    if (float_sleep_duration_seconds < 1) break
    await ns.sleep(1e3 * float_sleep_duration_seconds)
  }
}

// functions
const void_print_help = function (ns) {
  const object_argument_names = object_get_constants().object_argument_names
  const object_defaults = object_get_constants().object_defaults
  ns.tprint(
    string_sanitise(`
DESCRIPTION
  Display information about one or more servers.
  Optionally, display the information at regular intervals.

USAGE
  run ${ns.getScriptName()} [OPTIONS ...] <ARGUMENT [ARGUMENT ...]>

  ARGUMENT = Server to display the information about.

FLAGS
  -${object_argument_names.help.short}, --${object_argument_names.help.long}
    Displays this message then exits.

OPTIONS
  -${object_argument_names.delay.short}, --${object_argument_names.delay.long} <SECONDS>
    SECONDS = The duration of delay between updates, in seconds. Should be a floating-point number >= 0.001. By default, the script will only display server information once, unless this option is manually set.

  -${object_argument_names.multiplier_skill.short}, --${object_argument_names.multiplier_skill.long} <FLOAT>
    FLOAT = The multiplier used to change the weight of the factor representing your skill against the target server used in the server scoring system. Should a floating point number. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect. Defaults to ${object_defaults.float_multiplier_factor_skill}.

  -${object_argument_names.multiplier_cash.short}, --${object_argument_names.multiplier_cash.long} <FLOAT>
    FLOAT = The multiplier used to change the weight of the factor representing the target server's maximum cash used in the server scoring system. Should a floating point number. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect. Defaults to ${object_defaults.float_multiplier_factor_max_cash}.

  -${object_argument_names.multiplier_growth.short}, --${object_argument_names.multiplier_growth.long} <FLOAT>
    FLOAT = The multiplier used to change the weight of the factor representing the target server's growth used in the server scoring system. Should a floating point number. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect. Defaults to ${object_defaults.float_multiplier_factor_growth}.

  -${object_argument_names.precision.short}, --${object_argument_names.precision.long} <INTEGER>
    INTEGER = The decimal places to display floating point values with. Should be an integer >= 0. Defaults to ${object_defaults.integer_precision}.

  -${object_argument_names.score_correction.short}, --${object_argument_names.score_correction.long} <METHOD>
    METHOD = The method used to correct the factors used in the server scoring system. Can be "standard" (uses standard scoring) or "normal" (uses mean normalised scoring). Defaults to "${object_defaults.string_method_score_correction}".`
    )
  )
}

const void_print_information = function (
  ns,
  string_server,
  integer_precision,
  string_method_score_correction,
  float_multiplier_factor_skill,
  float_multiplier_factor_max_cash,
  float_multiplier_factor_growth
) {
  const
    float_cash_max = ns.getServerMaxMoney(string_server)
  const float_cash_current = ns.getServerMoneyAvailable(string_server)
  const float_security_minimum = ns.getServerMinSecurityLevel(string_server)
  const float_security_current = ns.getServerSecurityLevel(string_server)
  const array_ram = ns.getServerRam(string_server)
  const float_ram_total = array_ram[0]
  const float_ram_used = array_ram[1]
  const float_ram_free = array_ram[0] - array_ram[1]
  const string_server_information =
    // comment out unneeded info
    `
Time:			${new Date().toISOString()}
Name:			${string_server}
Root access:		${ns.hasRootAccess(string_server)}
Maximum cash ($):	${float_cash_max.toFixed(integer_precision)}
Current cash ($):	${float_cash_current.toFixed(integer_precision)}
Current cash (%):	${((float_cash_current * 100) / float_cash_max).toFixed(integer_precision)}
Minimum security:	${float_security_minimum.toFixed(integer_precision)}
Current security:	${float_security_current.toFixed(integer_precision)}
Current security (x):	${(
      float_security_current / float_security_minimum
    ).toFixed(integer_precision)}
Growth rate:		${ns.getServerGrowth(string_server)}
hack() time (s):	${float_get_time_hack(ns, string_server, float_security_current).toFixed(integer_precision)}
grow() time (s):	${float_get_time_grow(ns, string_server, float_security_current).toFixed(integer_precision)}
weaken() time (s):	${float_get_time_weaken(ns, string_server, float_security_current).toFixed(integer_precision)}
Hacking level needed:	${ns.getServerRequiredHackingLevel(string_server)}
Score:			${float_get_server_score(
  ns,
  string_server,
  string_method_score_correction,
  float_multiplier_factor_skill,
  float_multiplier_factor_max_cash,
  float_multiplier_factor_growth
).toFixed(integer_precision)}
Ports needed for root:	${ns.getServerNumPortsRequired(string_server)}
RAM total (GB):		${float_ram_total.toFixed(integer_precision)}
RAM used (GB):		${float_ram_used.toFixed(integer_precision)}
RAM used (%):		${((float_ram_used * 100) / float_ram_total).toFixed(integer_precision)}
RAM free (GB):		${float_ram_free.toFixed(integer_precision)}
RAM free (%):		${((float_ram_free * 100) / float_ram_total).toFixed(integer_precision)}
`
  ns.tprint(string_server_information)
}
