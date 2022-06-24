#!/usr/bin/env node

const commander = require('commander')
const pkg = require('../package.json')
const program = new commander.Command()

program
    .name(Object.keys(pkg.bin)[0]) // 在 Usage 最前面添加内容
    .usage('<command> [options]') // 添加 Usage 内容
    .version(pkg.version) // 指定版本号
    .option('-d, --debug', '是否开启调试模式', false)    // 设置 debug 参数 macaw-test --debug，在命令参数之后传入
    .option('-e, --envName', '设置环境变量名称') // 设置 envName 参数 macaw-test --envName prod，在命令参数之后传入

/**
 * command 注册子命令
 * macaw-test clone wx-tools
 * { any } <source> 必传参数
 * { any } [destination] 可选参数
 */
const clone = program.command('clone <source> [destination]');
clone
    .description('clone a repository') // 命令描述
    .option('-f, --force', '是否强制克隆') // 执行：macaw-test clone wx-tools abc --force
    .action((source, destination, cmdObj) => { // 传入的参数解析。cmdObj对应的是强制克隆
        console.log(source, destination, cmdObj.force) // wx-tools abc true
    })

/**
 * addCommand 注册子命令
 * macaw-test service start 8080
 * macaw-test service stop
 */
const service = new commander.Command('service')
service
    .command('start [port]')
    .description('start service at some port')
    .action((port) => {
        console.log('do service start', port)
    })
service
    .command('stop')
    .description('stop service')
    .action(() => {
        console.log('stop service')
    })
program.addCommand(service)


// 除了上面注册的命令，其他的都会命中到这里
/* program
    .arguments('<cmd> [options]')
    .description('Other command', {
        cmd: 'command name',
        options: 'options for command'
    })
    .action(function (cmd, options) {
        console.log(cmd, options)   // test option
    }) */

// 高级定制1：自定义help信息，执行lio-imooc-test -h
/* program.helpInformation = function () {
    return 'help1'
}
program.on('--help', function () {
    console.log('help2')
}) */

// 高级定制2：实现debug模式，执行lio-imooc-test --debug
/* program.on('option:debug', function () {
    if (program.debug) {
        process.env.LOG_LEVEL = 'verbose'
    }
    console.log(process.env.LOG_LEVEL)
}) */

// 高级定制3：对未知命令监听
program.on('command:*', function (obj) {
    console.log(obj)
    console.log('未知的命令：' + obj[0])

    const availableCommands = program.commands.map(cmd => cmd.name())
    console.log('可用的命令：' + availableCommands.join(',')) // 可用的命令：clone,service
})

program.parse(process.argv);

// program.outputHelp() // 打印出帮助信息
// console.log(program.opts()) // 打印传入的参数
