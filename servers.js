// servers.js - 8.85GB - continually buys the best server with cash available if ram utilisation of the network is over threshold, unless there are 25 servers already, in which case deletes the worst server, unless all 25 have RAM == PurchasedServerMaxRam.
import {
  float_get_network_ram_utilisation,
  float_get_server_ram_total
} from '/bit/lib_ram_server.js'

export const main = async function (ns) {
  const float_period_check = 1e3 * ns.args[0]
  const string_servers_bought_name = ns.args[1]
  const float_ram_utilisation_threshold = ns.args[2]
  for (;;) {
    for (
      ;
      !boolean_servers_bought_all_max(ns) &&
      float_get_network_ram_utilisation(ns) > float_ram_utilisation_threshold &&
      boolean_conditions_server_delete_purchase(ns);

    ) {
      ns.deleteServer(string_get_server_bought_smallest(ns)),
      ns.purchaseServer(
        string_servers_bought_name,
        integer_get_server_ram_biggest_afforded(ns)
      ),
      await ns.sleep(float_period_check)
    }
    for (
      ;
      !boolean_servers_bought_all_max(ns) &&
      float_get_network_ram_utilisation(ns) > float_ram_utilisation_threshold &&
      (boolean_conditions_server_purchase_3(ns) ||
        boolean_conditions_server_purchase_2(ns) ||
        boolean_conditions_server_purchase_1(ns));

    ) {
      ns.purchaseServer(
        string_servers_bought_name,
        integer_get_server_ram_biggest_afforded(ns)
      ),
      await ns.sleep(float_period_check)
    }
    await ns.sleep(float_period_check)
  }
}

// functions

const object_get_constants = function () {
  return {
    // cost of server per 1 GB of RAM
    BaseCostFor1GBOfRamServer: 55000,
    // maximum amount of purchased servers allowed
    PurchasedServerLimit: 25,
    // minimum RAM of purchased servers possible
    integer_server_ram_min: 2,
    // maximum RAM of purchased servers possible. 2^20
    PurchasedServerMaxRam: 1048576
  }
}

// true if all bought servers have RAM == PurchasedServerMaxRam
const boolean_servers_bought_all_max = function (ns) {
  const array_servers_bought = ns.getPurchasedServers()
  if (array_servers_bought.length > 0) {
    let boolean_tripwire = !0
    for (
      let integer_index_server = 0;
      integer_index_server < array_servers_bought.length;
      ++integer_index_server
    ) {
      float_get_server_ram_total(ns, array_servers_bought[integer_index_server]) <
        object_get_constants().PurchasedServerMaxRam && (boolean_tripwire = !1)
    }
    return boolean_tripwire
  }
}

// returns bought server with smallest RAM
const string_get_server_bought_smallest = function (ns) {
  const array_servers_bought = ns.getPurchasedServers()
  if (array_servers_bought.length > 0) {
    let string_server_smallest
    let integer_size_smallest = object_get_constants().PurchasedServerMaxRam
    for (
      let integer_index_server = 0;
      integer_index_server < array_servers_bought.length;
      ++integer_index_server
    ) {
      const integer_server_ram_total = float_get_server_ram_total(
        ns,
        array_servers_bought[integer_index_server]
      )
      integer_server_ram_total < integer_size_smallest &&
        ((string_server_smallest = array_servers_bought[integer_index_server]),
        (integer_size_smallest = integer_server_ram_total))
    }
    return string_server_smallest
  }
}

// returns bought server with biggest RAM
const string_get_server_bought_biggest = function (ns) {
  const array_servers_bought = ns.getPurchasedServers()
  if (array_servers_bought.length > 0) {
    let string_server_biggest
    let integer_size_biggest = object_get_constants().integer_server_ram_min
    for (
      let integer_index_server = 0;
      integer_index_server < array_servers_bought.length;
      ++integer_index_server
    ) {
      const integer_server_ram_total = float_get_server_ram_total(
        ns,
        array_servers_bought[integer_index_server]
      )
      integer_server_ram_total > integer_size_biggest &&
        ((string_server_biggest = array_servers_bought[integer_index_server]),
        (integer_size_biggest = integer_server_ram_total))
    }
    return string_server_biggest
  }
}

// return the RAM of the server with the biggest RAM that you can afford
const integer_get_server_ram_biggest_afforded = function (ns) {
  const object_constants = object_get_constants()
  let integer_server_ram_biggest_afforded = Math.pow(
    2,
    Math.trunc(
      Math.log2(
        ns.getServerMoneyAvailable('home') /
          object_constants.BaseCostFor1GBOfRamServer
      ) / Math.log2(2)
    )
  )
  return (
    integer_server_ram_biggest_afforded >
      object_constants.PurchasedServerMaxRam &&
      (integer_server_ram_biggest_afforded =
        object_constants.PurchasedServerMaxRam),
    integer_server_ram_biggest_afforded
  )
}

const boolean_conditions_server_purchase_1 = function (ns) {
  const integer_server_ram_biggest_afforded = integer_get_server_ram_biggest_afforded(
    ns
  )
  const object_constants = object_get_constants()
  if (
    // you have no bought servers yet
    ns.getPurchasedServers().length === 0 &&
    // RAM is at least equal to the minimum RAM possible for purchased servers
    integer_server_ram_biggest_afforded >=
      object_constants.integer_server_ram_min &&
    // RAM is at least equal to the RAM of "home" (probably a bad idea to hardcode this since the string_name of "home" might change in the future) or max ram.
    (integer_server_ram_biggest_afforded >=
      float_get_server_ram_total(ns, 'home') ||
      integer_server_ram_biggest_afforded >=
        object_constants.PurchasedServerMaxRam)
  ) { return !0 }
}

const boolean_conditions_server_purchase_2 = function (ns) {
  const integer_servers_bought_amount = ns.getPurchasedServers().length
  const object_constants = object_get_constants()
  if (
    // you have one or more servers already
    integer_servers_bought_amount > 0 &&
    // you currently own less than the maximum amount of purchased servers allowed
    integer_servers_bought_amount < object_constants.PurchasedServerLimit
  ) {
    const float_ram_server_bought_biggest = float_get_server_ram_total(
      ns,
      string_get_server_bought_biggest(ns)
    )
    // you dont own a server with max RAM yet, buy a server with RAM greater than the RAM of your biggest bought server
    if (
      float_ram_server_bought_biggest !==
        object_constants.PurchasedServerMaxRam &&
      float_ram_server_bought_biggest <
        integer_get_server_ram_biggest_afforded(ns)
    ) { return !0 }
  }
}

const boolean_conditions_server_purchase_3 = function (ns) {
  const integer_servers_bought_amount = ns.getPurchasedServers().length
  const object_constants = object_get_constants()
  const float_ram_server_bought_maximum = object_constants.PurchasedServerMaxRam
  if (
    // you have one or more servers already
    integer_servers_bought_amount > 0 &&
    // you currently own less than the maximum amount of purchased servers allowed
    integer_servers_bought_amount < object_constants.PurchasedServerLimit &&
    // you already bought a server with max ram, buy another server the max possible ram
    float_get_server_ram_total(ns, string_get_server_bought_biggest(ns)) ===
      float_ram_server_bought_maximum &&
    integer_get_server_ram_biggest_afforded(ns) >=
      float_ram_server_bought_maximum
  ) { return !0 }
}

const boolean_conditions_server_delete_purchase = function (ns) {
  const object_constants = object_get_constants()
  return (
    // you currently own the maximum amount of purchased servers allowed
    ns.getPurchasedServers().length === object_constants.PurchasedServerLimit &&
    // your servers do not all have the maximum RAM possible for purchased servers
    !boolean_servers_bought_all_max(
      ns,
      object_constants.PurchasedServerMaxRam
    ) &&
    // is cash at least equal to the price of the cheapest server bought + the next highest server after that, which is twice the price of the former, thus 3. this check is so that a server with the same RAM as before isn't bought.
    ns.getServerMoneyAvailable('home') >=
      3 *
      object_constants.BaseCostFor1GBOfRamServer *
      float_get_server_ram_total(ns, string_get_server_bought_smallest(ns))
  )
}
