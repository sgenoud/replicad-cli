import {
  Command,
  EnumType,
} from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";
import extractDefaultParamsFromCode from "./src/extractDefaultParams.js";
import builder from "./src/builder.js";
import saveShapes from "./src/saveShapes.js";

const fileFormat = new EnumType([
  "stl",
  "step",
  "stl-binary",
  "step-assembly",
  "json",
]);

await new Command()
  .name("replicad-cli")
  .description("A basic CLI for replicad.")
  .version("v1.0.0")
  .type("fileFormat", fileFormat)
  .option("-f --filetype [filetype:fileFormat]", "The output file format")
  .option("--project=[project:boolean]", "Create a SVG pretty projection", {default: false})
  .arguments("<input:file> [output:file]")
  .action(async ({ filetype, project }, input, output) => {
    const text = await Deno.readTextFile(input);
    const defaultParams = await extractDefaultParamsFromCode(text);

    const shapes = await builder.buildShapesFromCode(text, defaultParams);

    saveShapes(shapes, output || input, project ? "svg-project" : filetype);
  })
  .parse();
