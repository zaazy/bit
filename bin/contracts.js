/* eslint-disable no-prototype-builtins */
/* eslint-disable no-case-declarations */
/* eslint-disable no-sequences */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-fallthrough */
/* contracts.js - 22.05 GB - attempts to solve existing coding contracts - TODO:
* should this be ran by main.js?
*/

import {
  string_sanitise,
  object_parse_arguments
} from '../lib/lib_no_ns.js'
import { array_get_files_with_string } from '../lib/lib_ls.js'
import { array_get_servers } from '../lib/lib_servers.js'

// main
export const main = async function (ns) {
  // argument parsing
  const
    object_constants = object_get_constants()
    // defaults
  const object_defaults = object_constants.object_defaults
  // argument names
  const object_argument_names = object_constants.object_argument_names
  let
    float_period_check_seconds = object_defaults.float_period_check_seconds
  let boolean_verbose = object_defaults.boolean_verbose
  let boolean_print_help = object_defaults.boolean_print_help
  const object_arguments = object_parse_arguments(ns.args)
  for (const string_argument in object_arguments) {
    if (object_arguments.hasOwnProperty(string_argument)) {
      const argument_value = object_arguments[string_argument]
      switch (string_argument) {
        case object_argument_names.check_delay.short:
        // fall-through
        case object_argument_names.check_delay.long:
          float_period_check_seconds = argument_value
          break
        case object_argument_names.verbose.short:
        // fall-through
        case object_argument_names.verbose.long:
          boolean_verbose = argument_value
          break
        case object_argument_names.help.short:
        // fall-through
        case object_argument_names.help.long:
          boolean_print_help = argument_value
          break
        case '_':
          continue
        default:
          const string_message_error = `Unknown argument passed: "${string_argument}".`
          throw (ns.tprint(`ERROR: ${string_message_error}`), new Error(string_message_error))
      }
    }
  }

  if (boolean_print_help) { return void_print_help(ns) }
  if (float_period_check_seconds > 0) {
    const float_period_check = 1e3 * float_period_check_seconds
    for (;;) {
      void_contracts_solver(ns, float_period_check_seconds, boolean_verbose),
      await ns.sleep(float_period_check)
    }
  } else void_contracts_solver(ns, float_period_check_seconds, boolean_verbose)
}

// functions

const object_get_constants = function () {
  const
    object_argument_names = {
      check_delay: {
        short: 'c',
        long: 'check-delay'
      },
      help: {
        short: 'h',
        long: 'help'
      },
      verbose: {
        short: 'v',
        long: 'verbose'
      }
    }
  const object_defaults = {
    // time period used for checking the time in seconds
    float_period_check_seconds: 0,
    // whether to display notification messages or not
    boolean_verbose: !1,
    // whether to display help and exit
    boolean_print_help: !1
  }
  const object_solvers = {}
  object_solvers['Find Largest Prime Factor'] = function (data) {
    let fac = 2
    let n = data
    while (n > ((fac - 1) * (fac - 1))) {
      while (n % fac === 0) {
        n = Math.round(n / fac)
      }
      ++fac
    }
    return (n === 1 ? (fac - 1) : n)
  }
  object_solvers['Subarray with Maximum Sum'] = function (data) {
    const nums = data.slice()
    for (let i = 1; i < nums.length; i++) {
      nums[i] = Math.max(nums[i], nums[i] + nums[i - 1])
    }
    return Math.max(...nums)
  }
  object_solvers['Total Ways to Sum'] = function (data) {
    const ways = [1]
    ways.length = data + 1
    ways.fill(0, 1)
    for (let i = 1; i < data; ++i) {
      for (let j = i; j <= data; ++j) {
        ways[j] += ways[j - i]
      }
    }
    return ways[data]
  }
  object_solvers['Spiralize Matrix'] = function (data) {
    const spiral = []
    const m = data.length
    const n = data[0].length
    let u = 0
    let d = m - 1
    let l = 0
    let r = n - 1
    let k = 0
    while (true) {
      // Up
      for (let col = l; col <= r; col++) {
        spiral[k] = data[u][col]
        ++k
      }
      if (++u > d) {
        break
      }
      // Right
      for (let row = u; row <= d; row++) {
        spiral[k] = data[row][r]
        ++k
      }
      if (--r < l) {
        break
      }
      // Down
      for (let col = r; col >= l; col--) {
        spiral[k] = data[d][col]
        ++k
      }
      if (--d < u) {
        break
      }
      // Left
      for (let row = d; row >= u; row--) {
        spiral[k] = data[row][l]
        ++k
      }
      if (++l > r) {
        break
      }
    }
    return spiral
  }
  object_solvers['Array Jumping Game'] = function (data) {
    const n = data.length
    let i = 0
    for (let reach = 0; i < n && i <= reach; ++i) {
      reach = Math.max(i + data[i], reach)
    }
    return i === n ? 1 : 0
  }
  object_solvers['Merge Overlapping Intervals'] = function (data) {
    const intervals = data.slice()
    intervals.sort((a, b) => {
      return a[0] - b[0]
    })
    const result = []
    let start = intervals[0][0]
    let end = intervals[0][1]
    for (const interval of intervals) {
      if (interval[0] <= end) {
        end = Math.max(end, interval[1])
      } else {
        result.push([start, end])
        start = interval[0]
        end = interval[1]
      }
    }
    result.push([start, end])
    return result
  }
  object_solvers['Generate IP Addresses'] = function (data) {
    const ret = []
    for (let a = 1; a <= 3; ++a) {
      for (let b = 1; b <= 3; ++b) {
        for (let c = 1; c <= 3; ++c) {
          for (let d = 1; d <= 3; ++d) {
            if (a + b + c + d === data.length) {
              const A = parseInt(data.substring(0, a), 10)
              const B = parseInt(data.substring(a, a + b), 10)
              const C = parseInt(data.substring(a + b, a + b + c), 10)
              const D = parseInt(data.substring(a + b + c, a + b + c + d), 10)
              if (A <= 255 && B <= 255 && C <= 255 && D <= 255) {
                const ip = [A.toString(), '.',
                  B.toString(), '.',
                  C.toString(), '.',
                  D.toString()].join('')
                if (ip.length === data.length + 3) {
                  ret.push(ip)
                }
              }
            }
          }
        }
      }
    }
    return ret
  }
  object_solvers['Algorithmic Stock Trader I'] = function (data) {
    let maxCur = 0
    let maxSoFar = 0
    for (let i = 1; i < data.length; ++i) {
      maxCur = Math.max(0, maxCur += data[i] - data[i - 1])
      maxSoFar = Math.max(maxCur, maxSoFar)
    }
    return maxSoFar.toString()
  }
  object_solvers['Algorithmic Stock Trader II'] = function (data) {
    let profit = 0
    for (let p = 1; p < data.length; ++p) {
      profit += Math.max(data[p] - data[p - 1], 0)
    }
    return profit.toString()
  }
  object_solvers['Algorithmic Stock Trader III'] = function (data) {
    let hold1 = Number.MIN_SAFE_INTEGER
    let hold2 = Number.MIN_SAFE_INTEGER
    let release1 = 0
    let release2 = 0
    for (const price of data) {
      release2 = Math.max(release2, hold2 + price)
      hold2 = Math.max(hold2, release1 - price)
      release1 = Math.max(release1, hold1 + price)
      hold1 = Math.max(hold1, price * -1)
    }
    return release2.toString()
  }
  object_solvers['Algorithmic Stock Trader IV'] = function (data) {
    const k = data[0]
    const prices = data[1]
    const len = prices.length
    if (len < 2) {
      return 0
    }
    if (k > len / 2) {
      let res = 0
      for (let i = 1; i < len; ++i) {
        res += Math.max(prices[i] - prices[i - 1], 0)
      }
      return res
    }
    const hold = []
    const rele = []
    hold.length = k + 1
    rele.length = k + 1
    for (let i = 0; i <= k; ++i) {
      hold[i] = Number.MIN_SAFE_INTEGER
      rele[i] = 0
    }
    let cur
    for (let i = 0; i < len; ++i) {
      cur = prices[i]
      for (let j = k; j > 0; --j) {
        rele[j] = Math.max(rele[j], hold[j] + cur)
        hold[j] = Math.max(hold[j], rele[j - 1] - cur)
      }
    }
    return rele[k]
  }
  object_solvers['Minimum Path Sum in a Triangle'] = function (data) {
    const n = data.length
    const dp = data[n - 1].slice()
    for (let i = n - 2; i > -1; --i) {
      for (let j = 0; j < data[i].length; ++j) {
        dp[j] = Math.min(dp[j], dp[j + 1]) + data[i][j]
      }
    }
    return dp[0]
  }
  object_solvers['Unique Paths in a Grid I'] = function (data) {
    const n = data[0] // Number of rows
    const m = data[1] // Number of columns
    const currentRow = []
    currentRow.length = n
    for (let i = 0; i < n; i++) {
      currentRow[i] = 1
    }
    for (let row = 1; row < m; row++) {
      for (let i = 1; i < n; i++) {
        currentRow[i] += currentRow[i - 1]
      }
    }
    return currentRow[n - 1]
  }
  object_solvers['Unique Paths in a Grid II'] = function (data) {
    const obstacleGrid = []
    obstacleGrid.length = data.length
    for (let i = 0; i < obstacleGrid.length; ++i) {
      obstacleGrid[i] = data[i].slice()
    }
    for (let i = 0; i < obstacleGrid.length; i++) {
      for (let j = 0; j < obstacleGrid[0].length; j++) {
        if (obstacleGrid[i][j] === 1) {
          obstacleGrid[i][j] = 0
        } else if (i === 0 && j === 0) {
          obstacleGrid[0][0] = 1
        } else {
          obstacleGrid[i][j] = (i > 0 ? obstacleGrid[i - 1][j] : 0) + (j > 0 ? obstacleGrid[i][j - 1] : 0)
        }
      }
    }
    return obstacleGrid[obstacleGrid.length - 1][obstacleGrid[0].length - 1]
  }
  object_solvers['Sanitize Parentheses in Expression'] = function (data) {
    let left = 0
    let right = 0
    const res = []
    for (let i = 0; i < data.length; ++i) {
      if (data[i] === '(') {
        ++left
      } else if (data[i] === ')') {
        (left > 0) ? --left : ++right
      }
    }
    function dfs (pair, index, left, right, s, solution, res) {
      if (s.length === index) {
        if (left === 0 && right === 0 && pair === 0) {
          for (var i = 0; i < res.length; i++) {
            if (res[i] === solution) {
              return
            }
          }
          res.push(solution)
        }
        return
      }
      if (s[index] === '(') {
        if (left > 0) {
          dfs(pair, index + 1, left - 1, right, s, solution, res)
        }
        dfs(pair + 1, index + 1, left, right, s, solution + s[index], res)
      } else if (s[index] === ')') {
        if (right > 0) { dfs(pair, index + 1, left, right - 1, s, solution, res) }
        if (pair > 0) { dfs(pair - 1, index + 1, left, right, s, solution + s[index], res) }
      } else {
        dfs(pair, index + 1, left, right, s, solution + s[index], res)
      }
    }
    dfs(0, 0, left, right, data, '', res)
    return res
  }
  object_solvers['Find All Valid Math Expressions'] = function (data) {
    const num = data[0]
    const target = data[1]
    function helper (res, path, num, target, pos, evaluated, multed) {
      if (pos === num.length) {
        if (target === evaluated) {
          res.push(path)
        }
        return
      }
      for (let i = pos; i < num.length; ++i) {
        if (i !== pos && num[pos] === '0') {
          break
        }
        const cur = parseInt(num.substring(pos, i + 1))
        if (pos === 0) {
          helper(res, path + cur, num, target, i + 1, cur, cur)
        } else {
          helper(res, path + '+' + cur, num, target, i + 1, evaluated + cur, cur)
          helper(res, path + '-' + cur, num, target, i + 1, evaluated - cur, -cur)
          helper(res, path + '*' + cur, num, target, i + 1, evaluated - multed + multed * cur, multed * cur)
        }
      }
    }
    const result = []
    helper(result, '', num, target, 0, 0, 0)
    return result
  }
  return {
    object_solvers,
    object_defaults,
    object_argument_names
  }
}

const void_print_help = function (ns) {
  const object_argument_names = object_get_constants().object_argument_names
  ns.tprint(
    string_sanitise(`
DESCRIPTION
  Attempts to solve existing coding contracts in the network.

USAGE
  run ${ns.getScriptName()} [FLAGS ...] [OPTIONS]

FLAGS
  -${object_argument_names.help.short}, --${object_argument_names.help.long}
    Displays this message then exits.
  
  -${object_argument_names.verbose.short}, --${object_argument_names.verbose.long}
    If set, displays messages regarding successful attempts (in addition to standard failed attempt messages).

OPTIONS
  -${object_argument_names.check_delay.short}, --${object_argument_names.check_delay.long} <SECONDS>
    SECONDS = The duration of delay between each network-wide contract search and solve attempts, in seconds. Should be a floating-point number >= 0.001. By default, the script will only search for and attempt to solve contracts once, unless this option is manually set.`
    )
  )
}

const array_get_contracts = function (ns) {
  const
    array_contracts = []
  const array_servers = array_get_servers(ns)
  for (
    let integer_index_server = 0;
    integer_index_server < array_servers.length;
    ++integer_index_server
  ) {
    const
      string_server = array_servers[integer_index_server]
    const array_contract_names = array_get_files_with_string(
      ns,
      string_server,
      '.cct'
    )
    for (
      let integer_index_contracts = 0;
      integer_index_contracts < array_contract_names.length;
      ++integer_index_contracts
    ) {
      // check if this really is a contract or just a file with .cct in its name
      const string_contract = array_contract_names[integer_index_contracts]
      typeof ns.codingcontract.getContractType(
        string_contract,
        string_server
      ) ===
        'string' &&
        array_contracts.push(
          {
            name: string_contract,
            location: string_server,
            type: ns.codingcontract.getContractType(
              string_contract,
              string_server
            ),
            data: ns.codingcontract.getData(string_contract, string_server),
            solve: function (answer, boolean_verbose) {
              return ns.codingcontract.attempt(
                answer,
                string_contract,
                string_server,
                {
                  returnReward: boolean_verbose
                }
              )
            }
          }
        )
    }
  }
  return array_contracts
}

const void_contracts_solver = function (
  ns,
  boolean_verbose
) {
  const
    object_solvers = object_get_constants().object_solvers
  const array_contracts = array_get_contracts(ns)
  for (
    let integer_index_contract = 0;
    integer_index_contract < array_contracts.length;
    ++integer_index_contract
  ) {
    const
      object_contract = array_contracts[integer_index_contract]
    const answer = object_solvers[object_contract.type](object_contract.data)
    const output = object_contract.solve(answer, boolean_verbose)
    switch (output) {
      case '':
      // fall-through
      case !1:
        ns.tprint(
`
Failed to solve:
${JSON.stringify(object_contract)}
Using input:
${answer}`
        )
        break
      case !0:
        break
      default:
        ns.tprint(
`
${output}`
        )
        break
    }
  }
}
