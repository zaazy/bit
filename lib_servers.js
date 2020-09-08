// lib_servers.js - 1.85GB

// returns an array of all servers in the game
export const array_get_servers = function (ns) {
  const string_host = ns.getHostname()
  const array_servers = [string_host]
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) {
    const array_scan_results = ns.scan(array_servers[integer_index_server])
    for (
      let integer_index_scan_result = 0;
      integer_index_scan_result < array_scan_results.length;
      ++integer_index_scan_result
    ) {
      array_servers.indexOf(array_scan_results[integer_index_scan_result]) === -1 &&
        array_servers.push(array_scan_results[integer_index_scan_result])
    }
  }
  return array_servers
}
