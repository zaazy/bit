export const main = async function (ns) {
  const
    float_duration_sleep = ns.args[0] * 1e3
  // eslint-disable-next-line no-undef
  const parent_window = parent.window
  for (
    parent_window.d = parent_window.document,
    parent_window.w = parent_window;
    ;

  ) {
    try {
      // eslint-disable-next-line no-undef
      await ns.weaken(d.string_server_target)
    } catch (error) {
      await ns.sleep(float_duration_sleep)
    }
    await ns.sleep(float_duration_sleep)
  }
}
