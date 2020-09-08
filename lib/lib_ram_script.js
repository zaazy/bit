/* eslint-disable no-unused-expressions */
// lib_ram_script.js - 4GB
import {
  object_get_server_ram_free_biggest,
  array_get_servers_used_updated,
  array_make_servers,
  float_clamp
} from './lib_no_ns.js'
import {
  float_get_server_ram_total,
  float_get_server_ram_used,
  float_get_network_ram_trait,
  float_get_network_ram_utilisation,
  array_get_servers_useable
} from 'lib_ram_server.js'

// makes a server used object
export const object_make_server_used = function (
  ns,
  string_server
) {
  return {
    name: string_server,
    get_ram_max: function () {
      return float_get_server_ram_total(ns, string_server)
    },
    ram_used: float_get_server_ram_used(ns, string_server),
    get_ram_free: function () {
      return this.get_ram_max() - this.ram_used
    },
    can_run_job: function (string_script, integer_threads) {
      return (
        ns.getScriptRam(string_script) * integer_threads <=
        this.get_ram_free()
      )
    },
    get_threads_max: function (string_script) {
      return Math.floor(
        this.get_ram_free() / ns.getScriptRam(string_script)
      )
    },
    apply_job: function (object_job) {
      this.ram_used +=
        object_job.integer_threads *
        ns.getScriptRam(object_job.string_script)
    }
  }
}

// makes a script schedule
export const array_make_schedule_script = function (ns, array_scripts) {
  const array_schedule = []
  let array_servers_used = array_make_servers(
    ns,
    array_get_servers_useable,
    object_make_server_used
  )
  for (
    let integer_index_script = 0;
    integer_index_script < array_scripts.length;
    ++integer_index_script
  ) {
    const object_script = array_scripts[integer_index_script]
    const string_script = object_script.file
    const threads_or_ram_botnet = object_script.threads_or_ram_botnet
    const array_arguments = object_script.args
    if (
      object_get_server_ram_free_biggest(array_servers_used).can_run_job(
        string_script,
        1
      )
    ) {
      let integer_threads
      if (threads_or_ram_botnet >= 1) integer_threads = threads_or_ram_botnet
      else {
        // assume we want to use fraction of botnet instead
        const float_ram_utilisation = float_get_network_ram_utilisation(ns)
        if (float_ram_utilisation >= threads_or_ram_botnet) { break }
        integer_threads = Math.floor(
          (float_get_network_ram_trait(ns, float_get_server_ram_total) *
            (threads_or_ram_botnet - float_ram_utilisation)) /
            ns.getScriptRam(string_script)
        )
      }
      for (
        ;
        integer_threads > 0 &&
        object_get_server_ram_free_biggest(array_servers_used).can_run_job(
          string_script,
          1
        );

      ) {
        const object_server_ram_free_biggest = object_get_server_ram_free_biggest(
          array_servers_used
        )
        const object_job = {
          string_script: string_script,
          string_server_used: object_server_ram_free_biggest.name,
          integer_threads: float_clamp(
            integer_threads,
            1,
            object_server_ram_free_biggest.get_threads_max(string_script)
          ),
          args: array_arguments
        };
        // eslint-disable-next-line no-sequences
        (integer_threads -= object_job.integer_threads),
        array_schedule.push(object_job),
        (array_servers_used = array_get_servers_used_updated(
          array_servers_used,
          object_job
        ))
      }
      integer_threads > 0 &&
        ns.tprint(
          `WARNING: Failed to run the remaining ${integer_threads} threads of "${string_script}". Skipped.`
        )
    } else ns.tprint(`WARNING: Unable to find a server to run "${string_script}". Skipped.`)
  }
  return array_schedule
}

// copies script in current server to a target server
export const void_copy_script_to = function (
  ns,
  string_script,
  string_server_used
) {
  ns.scp(
    string_script,
    ns.getHostname(),
    string_server_used
  )
}

// runs a script schedule
export const void_schedule_script_runner = function (
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
      ...object_job.args,
      integer_index_job
    )
  }
}
