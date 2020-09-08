// lib_root.js - 1.9GB
import {
  array_get_servers
}
  from '/bit/lib/lib_servers.js'

// returns an array of all rooted servers
export const array_get_servers_rooted = function (ns) {
  const array_servers = array_get_servers(ns)
  const array_servers_rooted = []
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) {
    ns.hasRootAccess(array_servers[integer_index_server]) &&
      array_servers_rooted.push(array_servers[integer_index_server])
  }
  return array_servers_rooted
}

// returns an array of all servers that are yet to be rooted
export const array_get_servers_unrooted = function (ns) {
  const array_servers = array_get_servers(ns)
  const array_servers_unrooted = []
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) {
    ns.hasRootAccess(array_servers[integer_index_server]) ||
      array_servers_unrooted.push(array_servers[integer_index_server])
  }
  return array_servers_unrooted
}
