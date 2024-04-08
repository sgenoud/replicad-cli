import { buildModuleEvaluator, runInContext } from "./vm.js";

export default async function extractDefaultParamsFromCode(code) {
  if (code.match(/^\s*export\s+/m)) {
    const module = await buildModuleEvaluator(code);
    return module.defaultParams || null;
  }

  const editedText = `
${code}
let dp = null
try {
  dp = defaultParams;
} catch (e) { }
return dp
  `;

  try {
    return runInContext(editedText, {});
  } catch (e) {
    return {};
  }
}
