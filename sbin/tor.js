// tor.js - 3.8GB - tries to continually buy TOR Router
export const main = async function (ns) {
  const float_period_check = 1e3 * ns.args[0]
  for (; !ns.scan('home').includes('darkweb');) {
    try {
      ns.purchaseTor()
    } catch (error) {
      ns.print(JSON.stringify(error))
    }
    await ns.sleep(float_period_check)
  }
}
