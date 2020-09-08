/* eslint-disable no-unused-expressions */
// lib_score.js - 2.25GB
import { array_get_servers_rooted } from '/bit/lib/lib_root.js'

const float_get_mean = function (array_numbers) {
  let float_total = 0
  for (
    let integer_index_number = 0;
    integer_index_number < array_numbers.length;
    ++integer_index_number
  ) { float_total += array_numbers[integer_index_number] }
  return float_total / array_numbers.length
}

// score correction methods
const float_get_standard_score = function (float_original, array_numbers) {
  const
    float_get_variance = function (array_numbers) {
      const float_mean = float_get_mean(array_numbers)
      let float_sum_squared_differences = 0
      for (
        let integer_index_number = 0;
        integer_index_number < array_numbers.length;
        ++integer_index_number
      ) {
        float_sum_squared_differences += Math.pow(
          array_numbers[integer_index_number] - float_mean,
          2
        )
      }
      return float_sum_squared_differences / array_numbers.length
    }
  const float_get_standard_deviation = function (array_numbers) {
    return Math.sqrt(float_get_variance(array_numbers))
  }
  return (
    (float_original - float_get_mean(array_numbers)) /
    float_get_standard_deviation(array_numbers)
  )
}

const float_get_mean_normalised_score = function (
  float_original,
  array_numbers
) {
  return (
    (float_original - float_get_mean(array_numbers)) /
    (Math.max(...array_numbers) - Math.min(...array_numbers))
  )
}

// returns a corrected score using a chosen correction method
const float_get_corrected_score = function (float_original, array_numbers, float_method_score_correction) {
  return float_method_score_correction(float_original, array_numbers)
}

const array_get_servers_trait = function (ns, array_servers, float_get_trait_score) {
  const array_servers_trait = []
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) { array_servers_trait.push(float_get_trait_score(ns, array_servers[integer_index_server])) }
  return array_servers_trait
}

// gives a score for how well you will be able to hack a server (how much cash you can take per hack, how long it takes and your chances of hacking it successfully) given your current hacking level and its required hacking level. adapted from various functions in Hacking.js
const float_get_skill_against = function (ns, string_server) {
  const float_player_hacking_level = ns.getHackingLevel()
  return (float_player_hacking_level - ns.getServerRequiredHackingLevel(string_server)) / float_player_hacking_level
}

const float_get_server_cash_max = function (ns, string_server) {
  return ns.getServerMaxMoney(string_server)
}

const float_get_server_growth = function (ns, string_server) {
  return ns.getServerGrowth(string_server)
}

// return array of rooted servers that have required hacking levels <= current hacking level, growth rates > 0 and max cash > 0
export const array_get_servers_hackable = function (ns) {
  const array_servers_rooted = array_get_servers_rooted(ns)
  const array_servers_hackable = []
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers_rooted.length;
    ++integer_index_server
  ) {
    const string_server = array_servers_rooted[integer_index_server]
    ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(string_server) &&
    ns.getServerMaxMoney(string_server) > 0 &&
    ns.getServerGrowth(string_server) > 0 &&
      array_servers_hackable.push(string_server)
  }
  return array_servers_hackable
}

// returns the score of a server which is calculated by taking into account its max cash, its growth rate and your skill against it as factors which are corrected and summed.
export const float_get_server_score = function (
  ns,
  string_server,
  string_method_score_correction,
  float_multiplier_factor_skill_argument,
  float_multiplier_factor_max_cash_argument,
  float_multiplier_factor_growth_argument
) {
  let
    float_method_score_correction = float_get_standard_score
  let float_multiplier_factor_skill = 1
  let float_multiplier_factor_max_cash = 1
  let float_multiplier_factor_growth = 1
  switch (string_method_score_correction) {
    case 'standard':
      float_method_score_correction = float_get_standard_score
      break
    case 'normal':
      float_method_score_correction = float_get_mean_normalised_score
      break
    default:
      ns.tprint(`WARNING: "${string_method_score_correction}" is not a valid value for the \`string_method_score_correction\` variable. Defaulting to "standard" method.`)
  }
  float_multiplier_factor_skill_argument !== null &&
    // eslint-disable-next-line no-sequences
    (float_multiplier_factor_skill = float_multiplier_factor_skill_argument),
  float_multiplier_factor_max_cash_argument !== null &&
    (float_multiplier_factor_max_cash = float_multiplier_factor_max_cash_argument),
  float_multiplier_factor_growth_argument !== null &&
    (float_multiplier_factor_growth = float_multiplier_factor_growth_argument)
  const
    float_get_score_factor = function (
      ns,
      string_server,
      float_method_score_correction,
      float_get_trait_score
    ) {
      return float_get_corrected_score(
        float_get_trait_score(ns, string_server),
        array_get_servers_trait(
          ns,
          array_get_servers_hackable(ns),
          float_get_trait_score
        ),
        float_method_score_correction
      )
    }

  const float_factor_skill = float_get_score_factor(
    ns,
    string_server,
    float_method_score_correction,
    float_get_skill_against
  )
  const float_factor_max_cash = float_get_score_factor(
    ns,
    string_server,
    float_method_score_correction,
    float_get_server_cash_max
  )
  const float_factor_growth = float_get_score_factor(
    ns,
    string_server,
    float_method_score_correction,
    float_get_server_growth
  )

  // can adjust the weights of the factors. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect.
  return (
    float_multiplier_factor_skill * float_factor_skill +
    float_multiplier_factor_max_cash * float_factor_max_cash +
    float_multiplier_factor_growth * float_factor_growth
  )
}
