# Bitburner Scripts

Scripts for the game [Bitburner](https://github.com/danielyxie/bitburner).

---

## Installation

Save all the `.js` files in this repository to the root directory of the "home" server using the same filenames that they currently have in this repository.

---

## Overview

Here's an overview of what the executable scripts (located in the "bin" directory of this repository) are supposed to do, as well as usage information and examples for each one:

### "main.js" (6.9 GB)

* Reserve at least enough RAM to be able to run "hacker.js" (13.35 GB).
* Copy all scripts to all rooted servers.
* Run the helper scripts "ram.js"\* (6.6 GB), "servers.js" (8.85 GB), "tor.js"\* (3.8 GB), "programs.js"\* (3.7 GB), "botnet.js" (2.2 GB), "hacknet.js" (5.6 GB) and "weaken_manager.js" (4 GB) which should, respectively, attempt to:
  * Upgrade your home server's RAM.
  * Buy and replace old servers when appropriate.
  * Buy a TOR Router.
  * Buy programs from the dark web.
  * Exploit and root servers.
  * Buy and upgrade Hacknet nodes.
  * Run a variable amount of "cyclic_weaken.js" threads (1.75 GB) which gains hacking experience by continuously weakening the server that will be targeted by "hacker.js".
* Kill itself by spawning "hacker.js" which should then:
  * Make and execute a schedule containing information about when, where and how many threads (among other information) the "weaken.js", "grow.js" and "hack.js" worker scripts should be executed with.
  * Wait for a duration of time such that jobs in a new schedule will start finishing after the older schedule finishes.
  * Repeat.
* \* = SF-4 Required for these to properly function.

#### USAGE

  `run main.js [FLAGS ...] [OPTIONS ...]`

#### FLAGS

  `-a, --no-ram`

* Prevents the "ram.js" script from being started which is responsible for upgrading the RAM of the "home" server.

  `-b, --no-botnet`

* Prevents the "botnet.js" script from being started which is responsible for rooting servers in the network.

  `-e, --no-servers`

* Prevents the "servers.js" script from being started which is responsible for buying and replacing bought servers.

  `-f, --discrete`

* Run discrete batches instead of continuously. The former mode has downtime but may result in more correctly scheduled jobs compared to the latter.

  `-g, --no-programs`

* Prevents the "programs.js" script from being started which is responsible for buying programs from the "darkweb" server.

  `-h, --help`

* Displays a help message then exits.

  `-o, --no-tor`

* Prevents the "tor.js" script from being started which is responsible for buying a TOR Router.

  `-u, --no-weaken-manager`

* Prevents the "weaken_manager.js" script from being started which is responsible for running threads of "cyclic_weaken.js" to gain hacking experience.

  `-w, --no-hacknet`

* Prevents the "hacknet.js" script from being started which is responsible for buying and upgrading Hacknet nodes until the Hacknet node requirements for joining the Netburners faction are met.

#### OPTIONS

  `-c, --check-delay <SECONDS>`

* SECONDS = The duration of delay between each repeat of the helper scripts' main loops, in seconds. Should be a floating-point number > 0. Defaults to 10.

  `-d, --job-delay <SECONDS>`

* SECONDS = The duration of delay between each job, in seconds. Should be a floating-point number > 0. Defaults to 2.

  `-i, --target <SERVER>`

* SERVER = The server that should be targetted by the `weaken`, `grow` and `hack` functions. Should be a string. Defaults to choosing an optimal target using a scoring system based on the server's maximum cash, growth, required hacking level, and the player's current hacking level.

  `-j, --job-cap <CAP>`

* CAP = The maximum amount of jobs to execute per schedule. This is ignored when running in continuous mode. Should be an integer > 0. Defaults to 100.

  `-n, --server-name <NAME>`

* NAME = The name to be used for purchased servers. Should be a string. Defaults to "server".

  `-p, --precision <PRECISION>`

* PRECISION = A value used in determining how many cycles of bisection the binary search algorithm used for the percentage to steal calculator should use. Should be a floating point number > 0 <= 1. Values closer to 0 will result in greater precision in the calculation, but potentially longer run-times and compared to values closer to 1. Defaults to 0.01.

  `-r, --ram-utilisation <THRESHOLD>`

* THRESHOLD = The botnet's ram utilisation threshold after which upgrades/replacements should be bought for servers and the RAM of "home". Should be a floating point number >= 0 <= 1. Values closer to 0 will result in attempting more frequent upgrades/replacements at the cost of less efficient RAM utilisation to cash spenditure ratios. Defaults to 0.9.

  `-s, --steal-cap <CAP>`

* CAP = The maximum fraction of cash to steal from the target server per `hack` job. Should be an integer >= 0 <=1. Defaults to 0.9.

  `-k, --multiplier-skill <FLOAT>`
  
* FLOAT = The multiplier used to change the weight of the factor representing your skill against the target server used in the server scoring system. Should be a floating point number. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect. Defaults to 1.

  `-l, --multiplier-cash <FLOAT>`
  
* FLOAT = The multiplier used to change the weight of the factor representing the target server's maximum cash used in the server scoring system. Should be a floating point number. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect. Defaults to 1.

  `-m, --multiplier-growth <FLOAT>`
  
* FLOAT = The multiplier used to change the weight of the factor representing the target server's growth used in the server scoring system. Should be a floating point number. 1 = factor has normal importance, > 1 = factor has more importance, < 1 = factor has less importance, 0 = factor is not used, < 0 = factor has negative effect. Defaults to 1.

  `-q, --score-correction <METHOD>`
  
* METHOD = The method used to correct the factors used in the server scoring system. Can be "standard" (uses standard scoring) or "normal" (uses mean normalised scoring). Defaults to "standard".
  
  `-v, --ram-cyclic-weaken <FLOAT>`
  
* FLOAT = The fraction of the botnet's current available RAM to be used by "weaken_manager.js" to run threads of "cyclic_weaken.js". Should be a floating point number > 0. Defaults to 0.5.

#### EXAMPLES

  `run main.js`

* Runs the script using default values.

  `run main.js -ao --no-botnet --job-cap 4000 -i harakiri-sushi -r 0.7 --steal-cap=0.5 -q normal`

* Runs the script with up to 4000 jobs, targetting "harakiri-sushi", only upgrading/replacing servers when at least 0.7 of your network's total RAM is being used, stealing only up to 50% of harakiri-sushi's cash per "hack.js" job that finishes executing, and using the "mean normalised" score correction method, whilst the remaining variables are set to defaults. The "ram.js", "tor.js" and "botnet.js" helper scripts are also prevented from starting.

---

## "kill.js" (2.55 GB)

* Kill all running scripts.
* Optionally, kill only named scripts instead.
* Optionally, kill only scripts on named servers instead.
* Optionally, kill only named scripts on named servers instead.

### USAGE

  `run kill.js [FLAGS ...] [OPTIONS ...]`

#### FLAGS

  `-h, --help`

* Displays a help message then exits.

#### OPTIONS

  `-c, --script <SCRIPT>`

* SCRIPT = The name of a script to kill.

  `-e, --server <SERVER>`

* SERVER = The name of a server on which scripts will be killed.

#### EXAMPLES

  `run kill.js`

* Kills all running scripts.

  `run kill.js -c grow.js --script hack.js`

* Kills all scripts named "grow.js" and "hack.js" on any servers that they are currently running on.

  `run kill.js -e home --server harakiri-sushi`

* Kills all scripts currently running on the "home" and "harakiri-sushi" servers.

  `run kill.js -c grow.js --script hack.js -e home --server harakiri-sushi`

* Kills all scripts named "grow.js" and "hack.js" currently running on the "home" and "harakiri-sushi" servers.

---

### "contracts.js" (22.05 GB)

* Attempts to solve existing coding contracts in the network.

#### USAGE

  `run contracts.js [FLAGS ...] [OPTIONS]`

#### FLAGS

  `-h, --help`

* Displays a help message then exits.

  `-v, --verbose`

* If set, displays messages regarding successful attempts (in addition to standard failed attempt messages).

#### OPTIONS

  `-c, --check-delay`

* The duration of delay between each network-wide contract search and solve attempts, in seconds. Should be a floating-point number >= 0.001. By default, the script will only search for and attempt to solve contracts once, unless this option is manually set.

---

### "lshw.js" (7.25 GB)

* Display information about one or more servers.
* Optionally, display the information at regular intervals.

#### USAGE

  `run lshw.js [FLAGS ...] [OPTIONS ...] <ARGUMENT [ARGUMENT ...]>`

* ARGUMENT = Server to display the information about.

#### FLAGS

  `-h, --help`

* Displays a help message then exits.

#### OPTIONS

  `-d, --delay <SECONDS>`

* SECONDS = The duration of delay between updates, in seconds. Should be a floating-point number >= 0.001. By default, the script will only display server information once, unless this option is manually set.

  `-p, --precision <INTEGER>`

* INTEGER = The decimal places to display floating point values with. Should be an integer >= 0. Defaults to 2.

#### EXAMPLES

  `run lshw.js -d 1 --precision=4 home foodnstuff`

* Causes the terminal to output up-to-date information about the "home" and "foodnstuff" servers every second, using 4 decimal places for the floating point values it displays.

---

### "cp.js" (2.65 GB)

* Copy all files that contain particular substring(s) in their filenames from all servers to the current server.

#### USAGE

  `run cp.js [FLAGS ...] <ARGUMENT [ARGUMENT ...]>`

* ARGUMENT = Substring contained in the names of files to be copied to the current server.

#### FLAGS

  `-h, --help`

* Displays a help message then exits.

#### EXAMPLES

  `run cp.js .lit .script .txt`

* Copies all files that contain the strings ".lit", ".script" or ".txt" in their filename from all servers to the current server.

---

## License

This software is distributed and licensed under the terms of the BSD-2-Clause Plus Patent License.

### Contribution

Unless you explicitly state otherwise, any contribution submitted for inclusion in this software by you shall be licensed as above, without any additional terms or conditions.
