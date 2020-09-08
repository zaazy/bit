// lib_time.js - 6.25GB
const object_get_constants = function (ns) {
  const object_get_stats = function (ns) {
    try {
      // comment out the following line to save ~0.5GB
      return ns.getStats()
      // eslint-disable-next-line no-unreachable
      throw new Error('WARNING: Uncommented the call to `getStats`.')
    } catch (error) {
      ns.print(`${JSON.stringify(error)}\nUsing default values instead.`)
      return {
        hacking: ns.getHackingLevel(),
        strength: 1,
        defense: 1,
        dexterity: 1,
        agility: 1,
        charisma: 1,
        intelligence: 1
      }
    }
  }

  // object_constants are from https://github.com/danielyxie/bitburner/blob/master/src/Constants.js
  return {
    // hacking multipliers
    object_hacking_multipliers: ns.getHackingMultipliers(),
    // player stats
    object_stats: object_get_stats(ns)
  }
}

// Returns time it takes to complete a hack on a server, in seconds. Adapted from `calculateHackingTime` in Hacking.js
export const float_get_time_hack = function (ns, string_server_target, float_server_target_security) {
  const object_constants = object_get_constants(ns)
  const difficultyMult = ns.getServerRequiredHackingLevel(string_server_target) * float_server_target_security

  const baseDiff = 500
  const baseSkill = 50
  const diffFactor = 2.5
  const intFactor = 0.1
  const hack_stat = object_constants.object_stats.hacking
  const int = object_constants.object_stats.intelligence
  var skillFactor = (diffFactor * difficultyMult + baseDiff)
  // tslint:disable-next-line
  skillFactor /= (hack_stat + baseSkill + (intFactor * int))

  const hackTimeMultiplier = 5
  const hackingTime = hackTimeMultiplier * skillFactor / object_constants.object_hacking_multipliers.speed

  return hackingTime
}

// Returns time it takes to complete a grow operation on a server, in seconds. Adapted from `calculateGrowTime` in Hacking.js
export const float_get_time_grow = function (ns, string_server_target, float_server_target_security) {
  const growTimeMultiplier = 3.2 // Relative to hacking time. 16/5 = 3.2

  return growTimeMultiplier * float_get_time_hack(ns, string_server_target, float_server_target_security)
}

// Returns time it takes to complete a weaken operation on a server, in seconds. Adapted from `calculateHackingTime` in Hacking.js
export const float_get_time_weaken = function (ns, string_server_target, float_server_target_security) {
  const weakenTimeMultiplier = 4 // Relative to hacking time

  return weakenTimeMultiplier * float_get_time_hack(ns, string_server_target, float_server_target_security)
}
