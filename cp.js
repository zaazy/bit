/* eslint-disable no-case-declarations */
/* eslint-disable no-fallthrough */
/* eslint-disable no-prototype-builtins */
/* cp.js - 2.65GB - TODO:
* set default to silent
* add verbose option
*/
import {
  string_sanitise,
  object_parse_arguments
} from 'lib_no_ns.js'
import { array_get_servers } from 'lib_servers.js'
import { array_get_files_with_string } from 'lib_ls.js'

const object_get_constants = function () {
  return {
    object_argument_names: {
      help: {
        short: 'h',
        long: 'help'
      }
    }
  }
}

// main
export const main = async function (ns) {
  // variables
  let boolean_print_help = !1
  // argument parsing
  const
    object_argument_names = object_get_constants().object_argument_names
  const object_arguments = object_parse_arguments(ns.args)
  const array_substrings = []
  for (const string_argument in object_arguments) {
    if (object_arguments.hasOwnProperty(string_argument)) {
      const argument_value = object_arguments[string_argument]
      switch (string_argument) {
        case object_argument_names.help.short:
        // fall-through
        case object_argument_names.help.long:
          boolean_print_help = argument_value
          break
        case '_':
          typeof argument_value === 'object'
            ? array_substrings.push(...argument_value)
            : array_substrings.push(argument_value)
          break
        default:
          const string_message_error = `Unknown argument passed: "${string_argument}".`
          throw (ns.tprint(`ERROR: ${string_message_error}`), new Error(string_message_error))
      }
    }
  }

  // main
  if (boolean_print_help) { return void_print_help(ns) }
  void_copy_files_with_to_current(ns, array_substrings)
}

// functions
const void_print_help = function (ns) {
  const object_argument_names = object_get_constants().object_argument_names
  ns.tprint(
    string_sanitise(`
DESCRIPTION
  Copy all files that contain particular substring(s) in their filenames from all servers to the current server.

USAGE
  run ${ns.getScriptName()} [FLAGS ...] <ARGUMENT [ARGUMENT ...]>

  ARGUMENT = Substring contained in the names of files to be copied to the current server.

FLAGS
  -${object_argument_names.help.short}, --${object_argument_names.help.long}
    Displays this message then exits.`
    )
  )
}

// copies string_file_to_copy from string_server_source to the current server
const void_copy_to_current = function (
  ns,
  string_server_source,
  files_to_copy
) {
  const string_input = JSON.stringify(files_to_copy)
  try {
    ns.scp(files_to_copy, string_server_source, ns.getHostname())
    ns.tprint(
      `Copied "${string_input}" located in the server "${string_server_source}".`
    )
  } catch (error) {
    ns.tprint(
      `${error}\nAttempted to copy "${string_input}" located in the server "${string_server_source}".`
    )
  }
}

// copies files that contain a substring from all servers to the current server
const void_copy_files_with_to_current = function (ns, substring) {
  const array_servers = array_get_servers(ns)
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) {
    const
      string_server_source = array_servers[integer_index_server]
    void_copy_to_current(ns, string_server_source, array_get_files_with_string(
      ns,
      string_server_source,
      substring
    ))
  }
}
