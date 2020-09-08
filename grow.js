export const main = async function (ns) {
  await ns.sleep(Date.now() + ns.args[1]), await ns.grow(ns.args[0])
}
