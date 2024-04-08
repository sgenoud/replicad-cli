import { buildModuleEvaluator, runInContext } from "./vm.js";

export function runInContextAsOC(code, context = {}) {
  const editedText = `
${code}
let dp = {}
try {
  dp = defaultParams;
} catch (e) {}
return main(replicad, __inputParams || dp)
  `;

  return runInContext(editedText, context);
}

async function runAsFunction(code, params) {
  const oc = await OC;

  return runInContextAsOC(code, {
    oc,
    replicad,
    __inputParams: params,
  });
}

export async function runAsModule(code, params) {
  const module = await buildModuleEvaluator(code);

  if (module.default) return module.default(params || module.defaultParams);
  return module.main(replicad, params || module.defaultParams || {});
}

export default async (code, params) => {
  if (code.match(/^\s*export\s+/m)) {
    return runAsModule(code, params);
  }
  return runAsFunction(code, params);
};
