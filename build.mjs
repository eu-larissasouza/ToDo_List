// Gera app.js: uma versão "sem módulos" do front end, para abrir o index.html
// com duplo clique (file://). Uso: npm run build
import { readFileSync, writeFileSync } from "node:fs";

const arquivos = ["js/taskStorage.js", "js/taskService.js", "main.js"];

const partes = arquivos.map((caminho) =>
  readFileSync(caminho, "utf8")
    .replace(/^import[\s\S]*?from\s+["'][^"']+["'];?\s*$/gm, "") // remove imports
    .replace(/^export\s+/gm, ""), // remove a palavra export
);

const saida =
  "/* ARQUIVO GERADO por build.mjs. Não edite: altere main.js e rode `npm run build`. */\n" +
  `(() => {\n${partes.join("\n")}\n})();\n`;

writeFileSync("app.js", saida);
console.log("app.js gerado.");
