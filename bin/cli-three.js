#!/usr/bin/env node

const pkg = require('../package.json');

const path = require('path')
const fs = require("fs");

const figlet = require("figlet");
const Printer = require("@darkobits/lolcatjs");
const program = require("commander");
const shell = require("shelljs");

const text = figlet.textSync(`Macaw-cli  ${pkg.version}`);
const textColor = Printer.fromString(text);

let inquirer
let ora
let chalk
let commandNotInHanderList = ['create']


async function main () {
  inquirer = await import('inquirer')
  inquirer = inquirer.default

  ora = await import('ora')
  ora = ora.default

  chalk = await import('chalk')
  chalk = chalk.default
}

function realCreateProcess (proName, hasSameNameDir) {
  inquirer.prompt([
    {
      type: 'list',
      message: '是否引入控件包:',
      name: 'ui-component',
      choices: ['是', '否']
    }
  ]).then(answersObj => {
    const spinner = ora(chalk.cyan('正在下载模板...\n')).start();

    if (!shell.which("git")) {
      shell.echo("Sorry, this script requires git");
      shell.exit(1);
    } else {
      shell.rm('-rf', 'macaw-template')
      shell.exec("git clone http://gitlab.shaopy.com/pub/macaw-template.git");
      shell.rm('-rf', 'macaw-template/.git')
      spinner.succeed(chalk.green('模板下载完成'));

      shell.sed('-i', 'macaw-template', `${proName}`, './macaw-template/index1.tpl');
      shell.sed('-i', 'macaw-template', `${proName}`, './macaw-template/config/conf-macaw.js');

      if (answersObj['ui-component'] === '否') {
        shell.cat('./macaw-template/index1.tpl', './macaw-template/index3.tpl').to('./macaw-template/index.html')
      } else {
        shell.cat('./macaw-template/index1.tpl', './macaw-template/index2.tpl', './macaw-template/index3.tpl').to('./macaw-template/index.html')
      }

      shell.rm('-rf', 'macaw-template/index1.tpl')
      shell.rm('-rf', 'macaw-template/index2.tpl')
      shell.rm('-rf', 'macaw-template/index3.tpl')

      if (hasSameNameDir) {
        shell.rm('-rf', proName)
      }
      
      fs.rename('macaw-template', proName, function (err) {
        if (err) {
          shell.exec(`rename macaw-template ${proName}`)
        }
        console.log(chalk.yellow(`\nSuccess 项目创建成功，请开启本地服务并指定端口 5500 进行访问`))
        console.log(chalk.yellow(`如：http://127.0.0.1:5500/${proName}/`))
      })
    }
  })
}

main().then(() => {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(textColor)
  
  const hander = {};
  
  program.arguments("<cmd> [env]").action(function(cmd, env) {
    if (hander[cmd]) {
      hander[cmd](env);
    } else {
        console.log(chalk.red(`很抱歉，暂未实现该 ${cmd} 命令`));

        let availableCommands = Object.keys(hander)
        availableCommands = availableCommands.concat(commandNotInHanderList)

        console.log(chalk.green('可用的命令：' + availableCommands.join(',')))
    }
  });

  const create = program.command('create <projectName>');
  create
      .description('create a project base in MacawJS')
      .action((proName) => {
        // 判断名称为 proName 的文件夹是否存在
        let filsDirs = shell.ls().stdout

        filsDirs = filsDirs.split('\n')
        filsDirs = filsDirs.filter(item => !!item)
        filsDirs = filsDirs.map(item => {
          return path.resolve(shell.pwd().stdout, item)
        })

        let hasSameNameDir = false
        filsDirs.forEach(item => {
          let stat = fs.statSync(item)
          let name = path.basename(item)
          if (stat.isDirectory() && name === proName) {
            hasSameNameDir = true
          }
        })

        if (hasSameNameDir) {
          inquirer.prompt([
            {
              type: 'input',
              message: '存在同名文件夹，是否覆盖(yes/no):',
              name: 'override'
            }
          ]).then(answersObj => {
            if (answersObj.override === 'yes') {
              realCreateProcess(proName, hasSameNameDir)
            } else {
              shell.exit(1);
            }
          })
        } else {
          realCreateProcess(proName)
        }
      })

  // 处理参数入口
  program.parse(process.argv);
})

