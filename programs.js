// programs.js - 3.7GB - tries to continually buy programs
export const main = async function (ns) {
  const float_period_check = 1e3 * ns.args[0]
  const array_programs = ns.args[1]
  let boolean_has_all_programs = !1
  for (; !boolean_has_all_programs;) {
    let boolean_program_missing = !1
    for (
      let integer_index_program = 0;
      integer_index_program < array_programs.length;
      ++integer_index_program
    ) {
      const string_program = array_programs[integer_index_program]
      ns.fileExists(string_program, 'home') || (boolean_program_missing = !0)
      try {
        ns.purchaseProgram(string_program)
      } catch (error) {
        ns.print(JSON.stringify(error))
      }
    }
    boolean_program_missing || (boolean_has_all_programs = !0),
    await ns.sleep(float_period_check)
  }
}
