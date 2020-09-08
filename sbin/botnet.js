// botnet.js - 2.2GB - opens ports and nukes any unrooted servers if the player's hacking level is high enough to do so and the appropriate number of object_exploits are present
import { array_get_servers_unrooted } from 'lib_root.js'

// main
export const main = async function (ns) {
  const float_period_check = 1e3 * ns.args[0]
  for (;;) {
    const array_servers_unrooted = array_get_servers_unrooted(ns)
    if (array_servers_unrooted.length === 0) break
    for (
      let integer_index_server = 0;
      integer_index_server < array_servers_unrooted.length;
      ++integer_index_server
    ) {
      const string_server_unrooted = array_servers_unrooted[integer_index_server]
      void_open_ports_try(ns, string_server_unrooted)
      try {
        ns.nuke(string_server_unrooted)
      } catch (error) {
        ns.print(JSON.stringify(error))
      }
    }
    await ns.sleep(float_period_check)
  }
}

// functions
const array_get_exploits = function (ns) {
  return [
    ns.brutessh,
    ns.ftpcrack,
    ns.relaysmtp,
    ns.httpworm,
    ns.sqlinject
  ]
}

// tries to open ports of server
const void_open_ports_try = function (ns, string_server_target) {
  const array_exploits = array_get_exploits(ns)
  for (
    let integer_index_exploit = 0;
    integer_index_exploit < array_exploits.length;
    ++integer_index_exploit
  ) {
    const string_exploit_function = array_exploits[integer_index_exploit]
    try {
      string_exploit_function(string_server_target)
    } catch (error) {
      ns.print(JSON.stringify(error))
    }
  }
}
