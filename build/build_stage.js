const execSync = require("child_process").execSync;
const chalk = require('chalk');

// git 对所有冲突的地方都会生成下面这种格式的信息，所以写个检测冲突文件的正则
const isConflictRegular = "^<<<<<<<\\s|^=======$|^>>>>>>>\\s";

function gitPush(version) {
    let results;
    try {
        // git grep 命令会执行 perl 的正则匹配所有满足冲突条件的文件
        results = execSync(`git grep -n -P "${isConflictRegular}"`, {
            encoding: "utf-8"
        });
    } catch (e) {
        try {
            console.log("没有发现冲突，开始 add...");
            results = execSync(`git add -A `, {
                encoding: "utf-8"
            });
            console.log(results);
            console.log("add结束， 开始commit...");
            results = execSync(`git commit -m build_version_${version}`, {
                encoding: "utf-8"
            });
            console.log(results);
            console.log(chalk.green("commit结束， 开始push..."));
            results = execSync(`git push `, {
                encoding: "utf-8"
            });
            console.log(results);
            // console.log("push结束， 开始打tag...");
            
            // var tagVersion = `sale_${version}`;
            // results = execSync(`git tag -a ${tagVersion} -m ${tagVersion}`, {
            //     encoding: "utf-8"
            // });
            // console.log(results);
            // console.log(chalk.green(`tag版本号 ${tagVersion}， 开始发布tag...`));
            // results = execSync(`git push origin ${tagVersion}`, {
            //     encoding: "utf-8"
            // });
            // console.log(results);
            
            
            console.log(chalk.cyan(`git发布成功， ----- ${version}`));
        } catch (e) {
            console.log("");
            console.log("");
            console.log("\x1B[31m >>>>>>>>>>>>>>> " + results + " <<<<<<<<<<<<<<<<<< \x1B[0m");
            console.log("");
            console.log("");
            console.log("\x1B[31m >>>>>>>>>>>>>>>自动发布失败<<<<<<<<<<<<<<<<<< \x1B[0m");
            console.log("");
            console.log("");
        }
    }

    if (results) {
        console.log("");
        console.log("");
        console.log("\x1B[31m >>>>>>>>>>>>>>>发现冲突，请解决后再提交，冲突文件<<<<<<<<<<<<<<<<<< \x1B[0m");
        console.error(results.trim());
        console.log("");
        console.log("");
        console.log("\x1B[31m >>>>>>>>>>>>>>>自动发布失败<<<<<<<<<<<<<<<<<< \x1B[0m");
        console.log("");
        console.log("");
        return false;
    }
    return true;
}

module.exports = gitPush;
