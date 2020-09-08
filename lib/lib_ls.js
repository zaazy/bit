/* eslint-disable no-case-declarations */
// lib_ls.js - 1.8GB
// build array of files to copy from string_server_source
export const array_get_files_with_string = function (
  ns,
  string_server_source,
  substring
) {
  const array_files_with_string = []
  const string_type_substring = typeof substring
  switch (string_type_substring) {
    case 'object':
      for (
        let integer_index_substring = 0;
        integer_index_substring < substring.length;
        ++integer_index_substring
      ) {
        const string_substring = substring[integer_index_substring]
        array_files_with_string.push(
          ns.ls(string_server_source, string_substring)
        )
      }
      break
    case 'string':
      array_files_with_string.push(ns.ls(string_server_source, substring))
      break
    default:
      const string_message_error = `Invalid input "${substring}" of type ${string_type_substring}.`
      throw (ns.tprint(`ERROR: ${string_message_error}`), new Error(string_message_error))
  }
  return array_files_with_string
}
