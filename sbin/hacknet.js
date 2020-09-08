// hacknet.js - 5.6 GB - purchases nodes and upgrades them until the node requirements for joining Netburners are met.

const object_get_nodes_stats = function (ns) {
  const object_output = {
    level: 0,
    ram: 0,
    cores: 0
  }
  const integer_nodes = ns.hacknet.numNodes()
  for (
    let integer_index_nodes = 0;
    integer_index_nodes < integer_nodes;
    ++integer_index_nodes
  ) {
    const object_node_stats = ns.hacknet.getNodeStats(integer_index_nodes)
    object_output.level += object_node_stats.level
    object_output.ram += object_node_stats.ram
    object_output.cores += object_node_stats.cores
  }
  return object_output
}

export const main = async function (ns) {
  const
    float_period_check = 1e3 * ns.args[0]
  const integer_level = 100
  const integer_ram = 8
  const integer_cores = 4
  for (; ns.hacknet.numNodes() <= 0;) {
    try {
      ns.hacknet.purchaseNode()
    } catch (error) {
      await ns.sleep(float_period_check)
    }
    await ns.sleep(float_period_check)
  }
  let object_nodes_stats = object_get_nodes_stats(ns)
  for (
    ;
    !(integer_level <= object_nodes_stats.level &&
    integer_ram <= object_nodes_stats.ram &&
    integer_cores <= object_nodes_stats.cores);

  ) {
    object_nodes_stats = object_get_nodes_stats(ns)
    const integer_nodes = ns.hacknet.numNodes()
    let
      integer_cost = ns.hacknet.getPurchaseNodeCost()
    let function_job = function () {
      ns.hacknet.purchaseNode()
    }
    for (
      let integer_index_nodes = 0;
      integer_index_nodes < integer_nodes;
      ++integer_index_nodes
    ) {
      const
        integer_cost_level = ns.hacknet.getLevelUpgradeCost(integer_index_nodes, 1)
      const integer_cost_ram = ns.hacknet.getRamUpgradeCost(integer_index_nodes, 1)
      const integer_cost_core = ns.hacknet.getCoreUpgradeCost(integer_index_nodes, 1)
      if (
        object_nodes_stats.level < integer_level &&
        integer_cost_level < integer_cost
      ) {
        integer_cost = integer_cost_level
        function_job = function () {
          ns.hacknet.upgradeLevel(integer_index_nodes, 1)
        }
      }
      if (
        object_nodes_stats.ram < integer_ram &&
        integer_cost_ram < integer_cost
      ) {
        integer_cost = integer_cost_ram
        function_job = function () {
          ns.hacknet.upgradeRam(integer_index_nodes, 1)
        }
      }
      if (
        object_nodes_stats.cores < integer_cores &&
        integer_cost_core < integer_cost
      ) {
        integer_cost = integer_cost_core
        function_job = function () {
          ns.hacknet.upgradeCore(integer_index_nodes, 1)
        }
      }
    }
    try {
      function_job()
    } catch (error) {
      await ns.sleep(float_period_check)
    }
    await ns.sleep(float_period_check)
  }
}
