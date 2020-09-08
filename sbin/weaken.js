export const main = async function (ns) {
  await ns.sleep(Date.now() + ns.args[1]), await ns.weaken(ns.args[0])
}
