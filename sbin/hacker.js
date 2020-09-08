/* hacker.js - 13.35GB - TODO:
* refactor unecessary cloning/copying
* add a way to notify weaken_manager if hacker.js needs more ram so weaken_manager can kill some cyclic weakens and adjust float_ram_fraction_for_weaken_cyclic
* add a way to be able to target more than one server at a time?
* add a way to determine the optimal weights for the factors used in the server scoring function
* add a job cap thing that prevents running more jobs if the first worker in a cycle finishes. add a thing to worker script that writes to a file (or to `window`) its identifier, when it started, and when it finishes. add a padding optimiser that detects when tail collision occurs and increases padding each cycle if it does occur, and decreases it by half of how much it increases everytime no tail collision occurs
* add functionality that allows on-the-fly hot loading of settings from a file?
*/

// main

// functions

import { array_get_servers } from '../lib/lib_servers.js'
import {
  array_get_servers_useable
} from '/bit/lib/lib_ram_server.js'
import {
  object_make_server_used,
  void_copy_script_to
} from '/bit/lib/lib_ram_script.js'
import {
  object_get_server_ram_free_biggest,
  array_get_servers_used_updated,
  array_make_servers,
  object_get_clone,
  float_clamp
} from '/bit/lib/lib_no_ns.js'
import {
  array_get_servers_hackable,
  float_get_server_score
} from '/bit/lib/lib_score.js'
import {
  float_get_time_hack,
  float_get_time_grow,
  float_get_time_weaken
} from '/bit/lib/lib_time.js'

export const main = async function (ns) {
  const array_arguments = ns.args
  let integer_time_finishes = Date.now()
  for (;;) {
    integer_time_finishes <= Date.now() &&
    !boolean_array_scripts_any_running(
      ns,
      [
        string_get_script(ns, 'weaken'),
        string_get_script(ns, 'grow'),
        string_get_script(ns, 'hack')
      ]
    )
      ? ((integer_time_finishes =
          await void_runner(ns, ...array_arguments) + Date.now()),
      await ns.sleep(integer_time_finishes - Date.now()))
      : await ns.sleep(integer_time_finishes - Date.now())
  }
}

const object_get_constants = function (ns) {
  const object_get_bitnode_multipliers = function (ns) {
    try {
      // comment out the following line to save ~4GB
      return ns.getBitNodeMultipliers()
      throw new Error('WARNING: Uncommented the call to `getBitNodeMultipliers`.')
    } catch (error) {
      return (
        ns.print(`${JSON.stringify(error)}\nUsing default values instead.`),
        // from BitNode/BitNodeMultipliers
        {
          HackingLevelMultiplier: 1,
          StrengthLevelMultiplier: 1,
          DefenseLevelMultiplier: 1,
          DexterityLevelMultiplier: 1,
          AgilityLevelMultiplier: 1,
          CharismaLevelMultiplier: 1,

          ServerGrowthRate: 1,
          ServerMaxMoney: 1,
          ServerStartingMoney: 1,
          ServerStartingSecurity: 1,
          ServerWeakenRate: 1,

          HomeComputerRamCost: 1,

          PurchasedServerCost: 1,
          PurchasedServerLimit: 1,
          PurchasedServerMaxRam: 1,

          CompanyWorkMoney: 1,
          CrimeMoney: 1,
          HacknetNodeMoney: 1,
          ManualHackMoney: 1,
          ScriptHackMoney: 1,
          CodingContractMoney: 1,

          ClassGymExpGain: 1,
          CompanyWorkExpGain: 1,
          CrimeExpGain: 1,
          FactionWorkExpGain: 1,
          HackExpGain: 1,

          FactionPassiveRepGain: 1,
          FactionWorkRepGain: 1,
          RepToDonateToFaction: 1,

          AugmentationMoneyCost: 1,
          AugmentationRepCost: 1,

          InfiltrationMoney: 1,
          InfiltrationRep: 1,

          FourSigmaMarketDataCost: 1,
          FourSigmaMarketDataApiCost: 1,

          CorporationValuation: 1,

          BladeburnerRank: 1,
          BladeburnerSkillCost: 1,

          DaedalusAugsRequirement: 1
        }
      )
    }
  }

  // from https://github.com/danielyxie/bitburner/blob/master/src/Constants.js
  return {
    // factor used in determining the amount security increases by from a grow or hack
    ServerFortifyAmount: 0.002,
    // amount security decreases by from a weaken
    ServerWeakenAmount: 0.05,
    // base percentage cash increases by from a grow
    ServerBaseGrowthRate: 1.03,
    // max percentage cash increases by from a grow (accounts for server security)
    ServerMaxGrowthRate: 1.0035,
    // hacking multipliers
    object_hacking_multipliers: ns.getHackingMultipliers(),
    // bitnode multipliers
    object_bitnode_multipliers: object_get_bitnode_multipliers(ns),
    // filenames and ram cost of helper scripts
    array_workers: [
      {
        name: 'weaken.js',
        ram: function () {
          return ns.getScriptRam(this.name)
        }
      },
      {
        name: 'grow.js',
        ram: function () {
          return ns.getScriptRam(this.name)
        }
      },
      {
        name: 'hack.js',
        ram: function () {
          return ns.getScriptRam(this.name)
        }
      }
    ]
  }
}

// returns true if any of the scripts in an array is running on any server
const boolean_array_scripts_any_running = function (ns, array_scripts) {
  const array_servers = array_get_servers(ns)
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) {
    const array_scripts_running = ns.ps(array_servers[integer_index_server])
    if (array_scripts_running.length > 0) {
      for (
        let integer_index_script = 0;
        integer_index_script < array_scripts_running.length;
        ++integer_index_script
      ) {
        for (
          let integer_index_scripts = 0;
          integer_index_scripts < array_scripts.length;
          ++integer_index_scripts
        ) {
          if (
            array_scripts_running[integer_index_script].filename ===
            array_scripts[integer_index_scripts]
          ) { return !0 }
        }
      }
    }
  }
  return !1
}

// returns the appropriate script name
const string_get_script = function (
  ns,
  string_job
) {
  const array_workers = object_get_constants(ns).array_workers
  switch (string_job) {
    case 'weaken':
      return array_workers[0].name
    case 'grow':
      return array_workers[1].name
    case 'hack':
      return array_workers[2].name
    default:
      throw new Error(`ERROR: Unrecognised job "${string_job}".`)
  }
}

// weaken, grow, hack

// the threads required for weaken to cause string_server_target's security to decrease by float_weaken_amount. adapted from `weaken` in NetscriptFunctions.js and `weaken` in Server.ts
const integer_get_threads_required_for_weaken = function (
  ns,
  float_weaken_amount
) {
  const object_constants = object_get_constants(ns)
  return (
    float_weaken_amount *
    Math.pow(object_constants.ServerWeakenAmount, -1) *
    Math.pow(object_constants.object_bitnode_multipliers.ServerWeakenRate, -1)
  )
}

// returns the threads required for weaken to cause string_server_target's security to reach minimum
const integer_get_threads_required_for_weaken_minimum_security = function (
  ns,
  string_server_target,
  float_server_target_security
) {
  return Math.ceil(
    integer_get_threads_required_for_weaken(
      ns,
      float_server_target_security -
        ns.getServerMinSecurityLevel(string_server_target)
    )
  )
}

// returns the security decrease from the weaken threads used. Adapted from `weaken` in NetscriptFunctions.js and `weaken` in Server.ts
const float_get_security_decrease_from_weaken = function (
  ns,
  integer_threads_weaken
) {
  return integer_threads_weaken * object_get_constants(ns).ServerWeakenAmount
}

// grow stuff

// returns the number of threads of `grow` needed to grow `string_server_target` by the percentage `float_growth` when it has security of `float_server_security`. float_growth = How much the server is being grown by, in DECIMAL form (e.g. 1.5 rather than 50). adapted from `numCycleForGrowth` in https://github.com/danielyxie/bitburner/blob/master/src/Server/ServerHelpers.ts
const integer_get_threads_for_growth = function (
  ns,
  string_server_target,
  float_server_target_security,
  float_growth
) {
  const object_constants = object_get_constants(ns)
  let ajdGrowthRate = 1 + (object_constants.ServerBaseGrowthRate - 1) / float_server_target_security
  if (ajdGrowthRate > object_constants.ServerMaxGrowthRate) {
    ajdGrowthRate = object_constants.ServerMaxGrowthRate
  }

  const serverGrowthPercentage = ns.getServerGrowth(string_server_target) / 100

  const cycles = Math.log(float_growth) / (Math.log(ajdGrowthRate) * object_constants.object_hacking_multipliers.growth * serverGrowthPercentage * object_constants.object_bitnode_multipliers.ServerGrowthRate)

  return Math.ceil(cycles)
}

// Inverse function of integer_get_threads_for_growth. Returns the percentage growth in decimal form (e.g., 2 = 100% growth).
const float_get_growth_from_threads = function (
  ns,
  string_server_target,
  float_server_target_security,
  integer_threads
) {
  const object_constants = object_get_constants(ns)
  let ajdGrowthRate = 1 + (object_constants.ServerBaseGrowthRate - 1) / float_server_target_security
  if (ajdGrowthRate > object_constants.ServerMaxGrowthRate) {
    ajdGrowthRate = object_constants.ServerMaxGrowthRate
  }

  const serverGrowthPercentage = ns.getServerGrowth(string_server_target) / 100

  const float_growth = Math.pow(ajdGrowthRate, integer_threads * object_constants.object_hacking_multipliers.growth * serverGrowthPercentage * object_constants.object_bitnode_multipliers.ServerGrowthRate)

  return float_growth
}

// returns the threads required by grow to grow string_server_target's cash to its maximum when security is at float_server_target_security and current cash is at float_server_target_cash
const integer_get_threads_required_for_grow_cash_maximum = function (
  ns,
  string_server_target,
  float_server_target_security,
  float_server_target_cash
) {
  return integer_get_threads_for_growth(
    ns,
    string_server_target,
    float_server_target_security,
    ns.getServerMaxMoney(string_server_target) / float_server_target_cash
  )
}

// returns the security increase from the growth threads used. Adapted from `processSingleServerGrowth` in ServerHelpers.ts and `fortify` in Server.ts
const float_get_security_increase_from_grow = function (
  ns,
  integer_threads_grow
) {
  return (
    2 * object_get_constants(ns).ServerFortifyAmount * integer_threads_grow
  )
}

// hack stuff

// returns the percentage of the available cash in string_server_target that is stolen when it is hacked when it has float_server_target_security. adapted from calculatePercentMoneyHacked() in https://github.com/danielyxie/bitburner/blob/master/src/Hacking.js . See also `hackDifficulty` in https://github.com/danielyxie/bitburner/blob/master/src/Server.js
const float_get_percentage_cash_taken_per_hack = function (
  ns,
  string_server_target,
  float_server_target_security
) {
  const object_constants = object_get_constants(ns)
  const balanceFactor = 240

  const difficultyMult = (100 - float_server_target_security) / 100
  const skillMult = (ns.getHackingLevel() - (ns.getServerRequiredHackingLevel(string_server_target) - 1)) / ns.getHackingLevel()
  const percentMoneyHacked = difficultyMult * skillMult * object_constants.object_hacking_multipliers.money / balanceFactor
  if (percentMoneyHacked < 0) { return 0 }
  if (percentMoneyHacked > 1) { return 1 }

  return percentMoneyHacked * object_constants.object_bitnode_multipliers.ScriptHackMoney
}

// returns the threads required to steal "float_percentage_to_steal" of available money in string_server_target
const integer_get_threads_required_to_hack_percentage = function (
  ns,
  string_server_target,
  float_server_target_security,
  float_percentage_to_steal
) {
  return Math.ceil(
    float_percentage_to_steal /
      float_get_percentage_cash_taken_per_hack(
        ns,
        string_server_target,
        float_server_target_security
      )
  )
}

// returns the security increase from the hack threads. adapted from `hack` in NetscriptFunctions.js and `fortify` in Server.ts
const float_get_security_increase_from_hack = function (
  ns,
  string_server_target,
  float_server_target_security,
  float_server_target_cash,
  integer_threads_hack
) {
  let maxThreadNeeded = Math.ceil(1 / float_get_percentage_cash_taken_per_hack(ns, string_server_target, float_server_target_security) * (float_server_target_cash / ns.getServerMaxMoney(string_server_target)))
  if (isNaN(maxThreadNeeded)) {
    // Server has a 'max money' of 0 (probably). We'll set this to an arbitrarily large value
    maxThreadNeeded = 1e6
  }

  return object_get_constants(ns).ServerFortifyAmount * Math.min(integer_threads_hack, maxThreadNeeded)
}

// depending on the job:
// if string_get_script(ns, "weaken"): returns the threads required for weaken to cause string_server_target's security to reach minimum if possible, otherwise, return max threads that string_server_used can provide
// if string_get_script(ns, "grow"): returns the threads required by grow to grow string_server_target's cash to its maximum if possible, otherwise, return max threads that string_server_used can provide
// if string_get_script(ns, "hack"): returns the threads required to steal "float_percentage_to_steal" of available money in string_server_target if possible, otherwise, return max threads that string_server_used can provide
const integer_get_threads = function (
  ns,
  float_server_used_ram_free,
  string_script,
  string_server_target,
  float_server_target_security_current,
  float_server_target_cash_current,
  float_percentage_to_steal
) {
  const integer_get_threads_required = function (
    ns,
    string_script,
    string_server_target,
    float_server_target_security_current,
    float_server_target_cash_current,
    float_percentage_to_steal
  ) {
    switch (string_script) {
      case string_get_script(ns, 'weaken'):
        return integer_get_threads_required_for_weaken_minimum_security(
          ns,
          string_server_target,
          float_server_target_security_current
        )
      case string_get_script(ns, 'grow'):
        return integer_get_threads_required_for_grow_cash_maximum(
          ns,
          string_server_target,
          float_server_target_security_current,
          // counts 0 cash as 1 so it can still grow. adapted from `grow` in NetscriptFunctions.js
          float_clamp(float_server_target_cash_current, 1, 1 / 0)
        )
      case string_get_script(ns, 'hack'):
        return integer_get_threads_required_to_hack_percentage(
          ns,
          string_server_target,
          float_server_target_security_current,
          float_percentage_to_steal
        )
    }
  }

  return float_clamp(
    integer_get_threads_required(
      ns,
      string_script,
      string_server_target,
      float_server_target_security_current,
      float_server_target_cash_current,
      float_percentage_to_steal
    ),
    0,
    Math.trunc(
      float_server_used_ram_free / ns.getScriptRam(string_script)
    )
  )
}

// percentage to steal stuff

// returns the threads required by grow to grow a string_server_target's money back to its original value after stealing float_percentage_to_steal of it, and assuming security is at float_server_target_security
const integer_get_threads_required_for_cash_grow_after_percentage_stolen = function (
  ns,
  string_server_target,
  float_server_target_security,
  float_percentage_to_steal
) {
  return integer_get_threads_for_growth(
    ns,
    string_server_target,
    float_server_target_security,
    Math.pow(1 - float_percentage_to_steal, -1)
  )
}

// should return true if there is enough ram to provide the threads required by weaken to weaken to minimum security, then by grow to grow string_server_target's cash back to maximum after stealing float_percentage_to_steal of the cash, then by weaken to weaken to minimum security again if possible, otherwise, returns false. assumes security is at float_server_target_security
const boolean_is_ram_enough_after_hack_percentage = function (
  ns,
  float_server_used_ram_free,
  string_server_target,
  float_server_target_cash,
  float_server_target_security,
  float_percentage_to_steal
) {
  const
    float_server_target_security_after_hack =
      float_server_target_security +
      float_get_security_increase_from_hack(
        ns,
        string_server_target,
        float_server_target_security,
        float_server_target_cash,
        integer_get_threads(
          ns,
          float_server_used_ram_free,
          string_get_script(ns, 'hack'),
          string_server_target,
          float_server_target_security,
          float_server_target_cash,
          float_percentage_to_steal
        )
      )
  const integer_threads_required_for_weaken_minimum_security_after_hack = integer_get_threads_required_for_weaken_minimum_security(
    ns,
    string_server_target,
    float_server_target_security_after_hack
  )
  const float_server_target_security_after_weaken =
      float_server_target_security_after_hack -
      float_get_security_decrease_from_weaken(
        ns,
        integer_threads_required_for_weaken_minimum_security_after_hack
      )
  const integer_threads_required_for_cash_grow_after_percentage_stolen = integer_get_threads_required_for_cash_grow_after_percentage_stolen(
    ns,
    string_server_target,
    float_server_target_security_after_weaken,
    float_percentage_to_steal
  )
  const float_server_target_security_after_grow =
      float_server_target_security_after_weaken +
      float_get_security_increase_from_grow(
        ns,
        integer_threads_required_for_cash_grow_after_percentage_stolen
      )
  const integer_threads_required_for_weaken_minimum_security_after_grow = integer_get_threads_required_for_weaken_minimum_security(
    ns,
    string_server_target,
    float_server_target_security_after_grow
  )
  const ram_weaken = ns.getScriptRam(string_get_script(ns, 'weaken'))
  const float_ram_required =
      integer_threads_required_for_weaken_minimum_security_after_hack *
      ram_weaken +
      integer_threads_required_for_cash_grow_after_percentage_stolen *
      ns.getScriptRam(string_get_script(ns, 'grow')) +
      integer_threads_required_for_weaken_minimum_security_after_grow *
      ram_weaken
  return float_ram_required < float_server_used_ram_free
}

// returns the number of cycles of bisection to be done to reach a certain precision, rounded up to the nearest integer
const integer_get_cycles_for_bisection_precision = function (float_precision) {
  return Math.ceil(
    Math.log(Math.pow(float_precision, -1)) * Math.pow(Math.log(2), -1)
  )
}

// this should return optimum percentage to steal such that cash stolen at most is as high as float_steal_cap and string_server_target's security is able to be weakened to minimum with one weaken after the hack, its cash grown to 100% after one grow after the weaken, then its security weakened again to minimum with one weaken, all with the ram it has remaining after the hack by using a binary search algorithm
const float_get_percentage_to_steal = function (
  ns,
  float_server_used_ram_free,
  string_server_target,
  float_server_target_cash,
  float_server_target_security,
  float_precision,
  float_steal_cap
) {
  const integer_cycles_for_bisection_precision = integer_get_cycles_for_bisection_precision(
    float_precision
  )
  let
    float_ceiling = 1
  let float_floor = 0
  let float_percentage_to_steal = 0.5 * (float_ceiling + float_floor)
  for (
    let integer_index = 0;
    integer_index < integer_cycles_for_bisection_precision &&
    (boolean_is_ram_enough_after_hack_percentage(
      ns,
      float_server_used_ram_free,
      string_server_target,
      float_server_target_cash,
      float_server_target_security,
      float_percentage_to_steal
    )
      ? (float_floor = float_percentage_to_steal)
      : (float_ceiling = float_percentage_to_steal),
    (float_percentage_to_steal = 0.5 * (float_ceiling + float_floor)),
    !(float_percentage_to_steal > float_steal_cap));
    ++integer_index
  );
  // cap which can be used so not all money is stolen, which can be bad because it's harder to grow from 0 in most cases
  return float_percentage_to_steal > float_steal_cap
    ? float_steal_cap
    : float_percentage_to_steal
}

// servers

// sort an array of servers by their score, from lowest to highest
const void_sort_by_server_scores = function (
  ns,
  array_servers,
  string_method_score_correction,
  float_multiplier_factor_skill,
  float_multiplier_factor_max_cash,
  float_multiplier_factor_growth
) {
  return array_servers.sort(
    (string_element_0, string_element_1) =>
      float_get_server_score(
        ns,
        string_element_0,
        string_method_score_correction,
        float_multiplier_factor_skill,
        float_multiplier_factor_max_cash,
        float_multiplier_factor_growth
      ) -
      float_get_server_score(
        ns,
        string_element_1,
        string_method_score_correction,
        float_multiplier_factor_skill,
        float_multiplier_factor_max_cash,
        float_multiplier_factor_growth
      )
  )
}

const array_get_servers_hackable_sorted_by_score = function (
  ns,
  string_method_score_correction,
  float_multiplier_factor_skill,
  float_multiplier_factor_max_cash,
  float_multiplier_factor_growth
) {
  return void_sort_by_server_scores(
    ns,
    array_get_servers_hackable(ns),
    string_method_score_correction,
    float_multiplier_factor_skill,
    float_multiplier_factor_max_cash,
    float_multiplier_factor_growth
  )
}

// return the hackable server at the stated position. 1 = best hackable server
const string_get_server_hackable_by_score_position = function (
  ns,
  integer_score_position,
  string_method_score_correction,
  float_multiplier_factor_skill,
  float_multiplier_factor_max_cash,
  float_multiplier_factor_growth
) {
  const array_servers_hackable = array_get_servers_hackable_sorted_by_score(
    ns,
    string_method_score_correction,
    float_multiplier_factor_skill,
    float_multiplier_factor_max_cash,
    float_multiplier_factor_growth
  )
  return array_servers_hackable[
    array_servers_hackable.length - integer_score_position
  ]
}

// make a server target object
const object_make_server_target = function (
  ns,
  string_server
) {
  return {
    name: string_server,
    get_security_minimum: function () {
      return ns.getServerMinSecurityLevel(string_server)
    },
    security_current: ns.getServerSecurityLevel(string_server),
    get_cash_maximum: function () {
      return ns.getServerMaxMoney(string_server)
    },
    cash_current: ns.getServerMoneyAvailable(string_server),
    job: function () {
      return this.security_current > this.get_security_minimum()
        ? string_get_script(ns, 'weaken')
        : this.cash_current < this.get_cash_maximum()
          ? string_get_script(ns, 'grow')
          : string_get_script(ns, 'hack')
    },
    apply_job: function (object_job) {
      switch (object_job.string_script) {
        case string_get_script(ns, 'weaken'):
          this.security_current = float_clamp(
            this.security_current -
              float_get_security_decrease_from_weaken(
                ns,
                object_job.integer_threads
              ),
            this.get_security_minimum(),
            1 / 0
          )
          break
        case string_get_script(ns, 'grow'):
          // counts 0 cash as 1 so it can still grow. adapted from `grow` in NetscriptFunctions.js
          this.cash_current = float_clamp(
            float_clamp(this.cash_current, 1, 1 / 0) *
              float_get_growth_from_threads(
                ns,
                this.name,
                this.security_current,
                object_job.integer_threads
              ),
            this.get_security_minimum(),
            1 / 0
          )
          // the following is adapted from `processSingleServerGrowth` in ServerHelpers.ts and `fortify` in Server.ts
          this.security_current += float_get_security_increase_from_grow(
            ns,
            object_job.integer_threads
          )
          break
        case string_get_script(ns, 'hack'):
          // the following is adapted from `hack` in NetscriptFunctions.js and `fortify` in Server.ts
          // deep copy
          const float_cash_before = JSON.parse(
            JSON.stringify(this.cash_current)
          )

          this.cash_current = float_clamp(
            this.cash_current -
              Math.floor(
                this.cash_current *
                  float_get_percentage_cash_taken_per_hack(
                    ns,
                    this.name,
                    this.security_current
                  )
              ) *
                object_job.integer_threads,
            0,
            1 / 0
          )

          this.security_current += float_get_security_increase_from_hack(
            ns,
            this.name,
            this.security_current,
            float_cash_before,
            object_job.integer_threads
          )
          break
        default:
          throw new Error(
            `ERROR: Unrecognised job "${object_job.string_script}".`
          )
      }
    }
  }
}

// scheduling

// return an object of job durations in seconds
const object_get_time_jobs = function (ns, string_server_target) {
  const object_time_jobs = {}
  return (
    (object_time_jobs[string_get_script(ns, 'weaken')] = float_get_time_weaken(
      ns,
      string_server_target,
      ns.getServerSecurityLevel(string_server_target)
    )),
    (object_time_jobs[string_get_script(ns, 'grow')] = float_get_time_grow(
      ns,
      string_server_target,
      ns.getServerSecurityLevel(string_server_target)
    )),
    (object_time_jobs[string_get_script(ns, 'hack')] = float_get_time_hack(
      ns,
      string_server_target,
      ns.getServerSecurityLevel(string_server_target)
    )),
    object_time_jobs
  )
}

// returns a hacking schedule item
const void_get_job = function (
  ns,
  object_server_target,
  object_time_jobs,
  array_servers_used,
  array_schedule,
  float_padding_seconds,
  float_precision,
  float_steal_cap
) {
  const
    object_server_used = object_get_server_ram_free_biggest(array_servers_used)
  const integer_get_time_job_finishes_seconds = function (
    array_schedule,
    object_time_jobs
  ) {
    if (array_schedule.length === 0) {
      return Math.max(
        object_time_jobs[string_get_script(ns, 'weaken')],
        object_time_jobs[string_get_script(ns, 'grow')],
        object_time_jobs[string_get_script(ns, 'hack')]
      )
    }
    {
      const object_job_last = array_schedule[array_schedule.length - 1]
      return (
        object_job_last.float_delay_seconds +
          object_time_jobs[object_job_last.string_script]
      )
    }
  }
  const string_script = object_server_target.job()
  const string_server_target = object_server_target.name
  const float_server_used_ram_free = object_server_used.get_ram_free()
  const float_server_target_security_before = object_server_target.security_current
  const float_server_target_cash_current = object_server_target.cash_current
  const object_job = {
    string_script: string_script,
    string_server_used: object_server_used.name,
    string_server_target: string_server_target,
    integer_threads: integer_get_threads(
      ns,
      float_server_used_ram_free,
      string_script,
      string_server_target,
      float_server_target_security_before,
      float_server_target_cash_current,
      float_get_percentage_to_steal(
        ns,
        float_server_used_ram_free,
        string_server_target,
        float_server_target_cash_current,
        float_server_target_security_before,
        float_precision,
        float_steal_cap
      )
    ),
    float_delay_seconds:
        integer_get_time_job_finishes_seconds(
          array_schedule,
          object_time_jobs
        ) -
        object_time_jobs[string_script] +
        float_padding_seconds,
    // simulate the effect of the job to the server to get the security after, which is needed to determine if we need to remove any jobs later on
    // this is the target server's security before this job's effects are applied
    float_server_target_security_before:
      float_server_target_security_before
  }
  const object_server_target_after = object_get_clone(object_server_target)
  object_server_target_after.apply_job(object_job)
  object_job.float_server_target_security_after = object_server_target_after.security_current
  return object_job
}

// makes a hacking schedule
const array_make_schedule_hacking = function (
  ns,
  integer_job_cap,
  float_precision,
  float_steal_cap,
  float_padding_seconds,
  string_server_target
) {
  const
    object_time_jobs = object_get_time_jobs(ns, string_server_target)
  const object_server_target = object_make_server_target(
    ns,
    string_server_target
  )
  const float_server_target_security_minimum = ns.getServerMinSecurityLevel(
    string_server_target
  )
  const array_schedule = []
  let
    array_servers_used = array_make_servers(
      ns,
      array_get_servers_useable,
      object_make_server_used
    )
  let integer_last_seen_job_index_with_security_minimum = -1
  for (
    ;
    integer_job_cap > array_schedule.length &&
    object_get_server_ram_free_biggest(array_servers_used).can_run_job(
      object_server_target.job(),
      1
    );

  ) {
    const object_job = void_get_job(
      ns,
      object_server_target,
      object_time_jobs,
      array_servers_used,
      array_schedule,
      float_padding_seconds,
      float_precision,
      float_steal_cap
    )
    if (object_job.float_server_target_security_after ===
      float_server_target_security_minimum) {
      integer_last_seen_job_index_with_security_minimum = array_schedule.length
    }
    array_schedule.push(object_job),
    // update object states based on new schedule item
    object_server_target.apply_job(object_job),
    (array_servers_used = array_get_servers_used_updated(
      array_servers_used,
      object_job
    ))
  }
  // return a schedule with jobs near the end that prevent it from achieving minimum security removed so the target server has minimum security when the schedule finishes. if no jobs achieve minimum security, return the original schedule.
  return (integer_last_seen_job_index_with_security_minimum > 0)
    ? array_schedule.slice(0, integer_last_seen_job_index_with_security_minimum + 1)
    : array_schedule
}

// runs a hacking schedule
const void_schedule_hacking_runner = function (
  ns,
  array_schedule
) {
  for (
    let integer_index_job = 0;
    integer_index_job < array_schedule.length;
    ++integer_index_job
  ) {
    const object_job = array_schedule[integer_index_job]
    void_copy_script_to(
      ns,
      object_job.string_script,
      object_job.string_server_used
    )
    ns.exec(
      object_job.string_script,
      object_job.string_server_used,
      object_job.integer_threads,
      object_job.string_server_target,
      1e3 * object_job.float_delay_seconds - Date.now(),
      integer_index_job
    )
  }
}

// picks a target if one isn't already chosen, run schedule(s).
const void_runner = async function (
  ns,
  integer_job_cap,
  float_precision,
  float_steal_cap,
  float_padding_seconds,
  boolean_discrete,
  string_method_score_correction,
  float_multiplier_factor_skill,
  float_multiplier_factor_max_cash,
  float_multiplier_factor_growth,
  string_server_target_argument
) {
  const parent_window = parent.window
  parent_window.d = parent_window.document
  parent_window.w = parent_window
  // makes and runs a schedule, returns the the time it'll take to finish in milliseconds.
  if (boolean_discrete) {
    const
      integer_time_start = Date.now()
    // if no target was given, pick one
    let string_server_target = string_server_target_argument
    string_server_target_argument === '' &&
      (string_server_target = string_get_server_hackable_by_score_position(
        ns,
        1,
        string_method_score_correction,
        float_multiplier_factor_skill,
        float_multiplier_factor_max_cash,
        float_multiplier_factor_growth
      ))
    d.string_server_target = string_server_target
    const array_schedule = array_make_schedule_hacking(
      ns,
      integer_job_cap,
      float_precision,
      float_steal_cap,
      float_padding_seconds,
      string_server_target
    )
    return (
      void_schedule_hacking_runner(ns, array_schedule),
      1e3 *
        (array_schedule[array_schedule.length - 1].float_delay_seconds +
          float_padding_seconds) -
        integer_time_start +
        Date.now()
    )
  }
  // makes and runs a schedule, sleeps for the length of the sum of the paddings of the previous schedule, repeats.
  {
    const void_runner_loop = async function (
      ns,
      integer_job_cap,
      float_precision,
      float_steal_cap,
      float_padding_seconds,
      string_server_target
    ) {
      const integer_time_start = Date.now()
      return (
        (array_schedule = array_make_schedule_hacking(
          ns,
          integer_job_cap,
          float_precision,
          float_steal_cap,
          float_padding_seconds,
          string_server_target
        )),
        array_schedule.length > 0
          ? void_schedule_hacking_runner(ns, array_schedule)
          : await ns.sleep(1e3 * float_padding_seconds),
        integer_time_start
      )
    }
    let
      array_schedule = []
    let integer_time_start
    // if no target was given, pick one
    let string_server_target = string_server_target_argument
    for (;;) {
      string_server_target_argument === '' &&
        (string_server_target = string_get_server_hackable_by_score_position(
          ns,
          1,
          string_method_score_correction,
          float_multiplier_factor_skill,
          float_multiplier_factor_max_cash,
          float_multiplier_factor_growth
        )),
      // tell cyclic_weaken.js what to target
      (d.string_server_target = string_server_target),
      array_schedule.length === 0
        ? (integer_time_start = await void_runner_loop(
          ns,
          integer_job_cap,
          float_precision,
          float_steal_cap,
          float_padding_seconds,
          string_server_target
        ))
        : (await ns.sleep(
          array_schedule.length * float_padding_seconds * 1e3 -
              integer_time_start +
              Date.now()
        ),
        (integer_time_start = await void_runner_loop(
          ns,
          integer_job_cap,
          float_precision,
          float_steal_cap,
          float_padding_seconds,
          string_server_target
        )))
    }
  }
}
