// ram.js - 6.6GB - tries to continually upgrade the RAM of "home" as long as the ram utilisation of your network is over threshold and you have sufficient cash.
import { float_get_network_ram_utilisation } from '/bit/lib_ram_server.js'
export const main = async function (ns) {
  const float_period_check = 1e3 * ns.args[0]
  const float_ram_utilisation_threshold = ns.args[1]
  for (;;) {
    try {
      for (
        ;
        ns.getServerMoneyAvailable('home') >= ns.getUpgradeHomeRamCost() &&
        float_get_network_ram_utilisation(ns) > float_ram_utilisation_threshold;

      ) { ns.upgradeHomeRam() }
    } catch (error) {
      ns.print(JSON.stringify(error))
    }
    await ns.sleep(float_period_check)
  }
}
