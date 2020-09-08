// lib_ram_server.js - 2GB
import {
  array_get_servers_rooted
}
  from '/bit/lib_root.js'

// returns the total ram of a server
export const float_get_server_ram_total = function (ns, string_server) {
  return ns.getServerRam(string_server)[0]
}

// returns the used ram of a server
export const float_get_server_ram_used = function (ns, string_server) {
  return ns.getServerRam(string_server)[1]
}

// returns the amount of free ram of a server
export const float_get_server_ram_free = function (ns, string_server) {
  return (
    float_get_server_ram_total(ns, string_server) -
    float_get_server_ram_used(ns, string_server)
  )
}

//  returns the total RAM trait from all the servers you have root access to
export const float_get_network_ram_trait = function (ns, float_get_ram_trait) {
  const array_servers_rooted = array_get_servers_rooted(ns)
  let float_network_ram_trait = 0
  for (
    let integer_index_server_rooted = 0;
    integer_index_server_rooted < array_servers_rooted.length;
    ++integer_index_server_rooted
  ) {
    float_network_ram_trait += float_get_ram_trait(
      ns,
      array_servers_rooted[integer_index_server_rooted]
    )
  }
  return float_network_ram_trait
}

//  returns the RAM utilisation of the botnet as a decimal
export const float_get_network_ram_utilisation = function (ns) {
  return (
    float_get_network_ram_trait(ns, float_get_server_ram_used) /
    float_get_network_ram_trait(ns, float_get_server_ram_total)
  )
}

// returns an array of rooted servers that have ram > 0
export const array_get_servers_useable = function (ns) {
  const array_servers_rooted = array_get_servers_rooted(ns)
  const array_servers_useable = []
  for (
    let integer_index_server_rooted = 0;
    integer_index_server_rooted < array_servers_rooted.length;
    ++integer_index_server_rooted
  ) {
    const string_server_rooted =
      array_servers_rooted[integer_index_server_rooted]
    float_get_server_ram_total(ns, string_server_rooted) > 0 &&
      array_servers_useable.push(string_server_rooted)
  }
  return array_servers_useable
}
