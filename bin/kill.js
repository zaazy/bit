/* eslint-disable no-case-declarations */
/* eslint-disable no-fallthrough */
/* eslint-disable no-prototype-builtins */
/* kill.js - 2.55GB - TODO:
* maybe implement a loop that repeats logic until all appropriate scripts have actually been killed.
*/

import {
  string_sanitise,
  object_parse_arguments
} from '/bit/lib/lib_no_ns.js'
import { array_get_servers } from '/bit/lib/lib_servers.js'
import { void_kill_script_named_server_named } from '/bit/lib/lib_kill.js'

const object_get_constants = function () {
  return {
    object_argument_names: {
      script: {
        short: 'c',
        long: 'script'
      },
      server: {
        short: 'e',
        long: 'server'
      },
      help: {
        short: 'h',
        long: 'help'
      }
    }
  }
}

export const main = async function (ns) {
  // variables
  const
    array_servers = []
  const array_scripts = []
  let boolean_print_help = !1

  // argument parsing
  const
    object_argument_names = object_get_constants().object_argument_names
  const object_arguments = object_parse_arguments(ns.args)
  for (const string_argument in object_arguments) {
    if (object_arguments.hasOwnProperty(string_argument)) {
      const argument_value = object_arguments[string_argument]
      switch (string_argument) {
        case object_argument_names.script.short:
        // fall-through
        case object_argument_names.script.long:
          typeof argument_value === 'object'
            ? array_scripts.push(...argument_value)
            : array_scripts.push(argument_value)
          break
        case object_argument_names.server.short:
        // fall-through
        case object_argument_names.server.long:
          typeof argument_value === 'object'
            ? array_servers.push(...argument_value)
            : array_servers.push(argument_value)
          break
        case object_argument_names.help.short:
        // fall-through
        case object_argument_names.help.long:
          boolean_print_help = argument_value
          break
        case '_':
          continue
        default:
          const string_message_error = `Unknown argument passed: "${string_argument}".`
          ns.tprint(`ERROR: ${string_message_error}`)
          throw new Error(string_message_error)
      }
    }
  }

  // main

  if (boolean_print_help) { return void_print_help(ns) }
  array_scripts.length > 0
    ? array_servers.length > 0
      ? void_kill_scripts_named_servers_named(ns, array_servers, array_scripts)
      : void_kill_scripts_named(ns, array_scripts)
    : array_servers.length > 0
      ? void_kill_scripts_servers_named(ns, array_servers)
      : void_kill_scripts(ns)
}

// functions
const void_print_help = function (ns) {
  const object_argument_names = object_get_constants().object_argument_names
  ns.tprint(
    string_sanitise(`
DESCRIPTION
  Kill all running scripts.
  Optionally, kill only named scripts instead.
  Optionally, kill only scripts on named servers instead.
  Optionally, kill only named scripts on named servers instead.

USAGE
  run ${ns.getScriptName()} [FLAGS ...] [OPTIONS ...]

FLAGS
  -${object_argument_names.help.short}, --${object_argument_names.help.long}
    Displays this message then exits.

OPTIONS
  -${object_argument_names.script.short}, --${object_argument_names.script.long} <SCRIPT>
    SCRIPT = The name of a script to kill.

  -${object_argument_names.server.short}, --${object_argument_names.server.long} <SERVER>
    SERVER = The name of a server on which scripts will be killed.`
    )
  )
}

// kills running instances of named scripts on a named server
const void_kill_scripts_named_server_named = function (
  ns,
  string_server,
  array_scripts
) {
  for (
    let integer_index_script = 0;
    integer_index_script < array_scripts.length;
    ++integer_index_script
  ) {
    const string_script = array_scripts[integer_index_script]
    void_kill_script_named_server_named(ns, string_server, string_script)
  }
}

// kills running instances of named scripts on named servers
const void_kill_scripts_named_servers_named = function (
  ns,
  array_servers,
  array_scripts
) {
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) {
    const string_server = array_servers[integer_index_server]
    void_kill_scripts_named_server_named(ns, string_server, array_scripts)
  }
}

// kills running instances of named scripts on all servers
const void_kill_scripts_named = function (ns, array_scripts) {
  void_kill_scripts_named_servers_named(ns, array_get_servers(ns), array_scripts)
}

// kills all but this script on a named server
const void_kill_scripts_server_named = function (ns, string_server) {
  const array_scripts_running = ns.ps(string_server)
  for (
    let integer_index_script = 0;
    integer_index_script < array_scripts_running.length;
    ++integer_index_script
  ) {
    const object_script = array_scripts_running[integer_index_script]
    const string_script = object_script.filename
    string_script !== ns.getScriptName() &&
      void_kill_script_named_server_named(ns, string_server, string_script)
  }
}

// kills all but this script on named servers
const void_kill_scripts_servers_named = function (ns, array_servers) {
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) {
    const string_server = array_servers[integer_index_server]
    void_kill_scripts_server_named(ns, string_server)
  }
}

// kills running scripts on all servers
const void_kill_scripts = function (ns) {
  void_kill_scripts_servers_named(ns, array_get_servers(ns))
}
