// weaken_manager.js - 4GB - continuously runs enough threads of cyclic_weaken.js to meet float_ram_fraction_for_weaken_cyclic.

import {
  array_make_schedule_script,
  void_schedule_script_runner
} from '/bit/lib_ram_script.js'

// main
export const main = async function (ns) {
  for (;;) {
    void_schedule_script_runner(
      ns,
      array_make_schedule_script(ns, [
        {
          file: ns.args[1],
          threads_or_ram_botnet: ns.args[2],
          args: [ns.args[3]]
        }
      ])
    ),
    await ns.sleep(1e3 * ns.args[0])
  }
}
