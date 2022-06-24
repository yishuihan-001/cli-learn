#!/usr/bin/env node

const figlet = require("figlet");
const Printer = require("@darkobits/lolcatjs");
const program = require("commander");
// const inquirer = require("inquirer");
// const ora = require("ora");
const shell = require("shelljs");

const text = figlet.textSync("macaw-cli");
const textColor = Printer.fromString(text);
const pkg = require('../package.json');

let inquirer
let ora


async function main () {
  inquirer = await import('inquirer')
  ora = await import('ora')
}

main().then(() => {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
  
  const hander = {
    create: env => {
      const prompt = inquirer.createPromptModule()
      prompt([
          {
            type: "list",
            name: "jskind",
            message: "请选择编程语言",
            choices: ["react", "vue", "angular"]
          }
        ])
        .then(answers => {
          const spinner = ora("正在下载页面模板").start();
          console.log(answers);
  
          if (!shell.which("git")) {
            shell.echo("Sorry, this script requires git");
            shell.exit(1);
          } else {
            shell.exec("git clone https://github.com/xxx.git");
            shell.exec(`sed -i '' -e "s/xxx/${env}/g" ./xxx/package.json`);
            // todo 将文件夹的名字替换掉
            spinner.stop();
          }
        });
    }
  };
  
  program.arguments("<cmd> [env]").action(function(cmd, env) {
    if (hander[cmd]) {
      hander[cmd](env);
    } else {
      console.log(`很抱歉，暂未实现该${cmd}命令`);
    }
  });

  // 处理参数入口
  program.parse(process.argv);
})

