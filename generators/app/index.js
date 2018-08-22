'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
    async prompting() {
        this.log(yosay('Welcome to the ' + chalk.red('Accedo - XDK2') + ' yeoman generator!'));
        this.answers = await this.prompt([{
            type    : 'input',
            name    : 'name',
            message : 'Your project name',
            default : this.appname // Default to current folder name
            }]);
    }
    
    writing() {
        this.fs.copy(
            this.templatePath('**/*'),
            this.destinationPath('')
        );
    }

    install() {
        this.installDependencies({
            npm: true,
            bower: false,
            yarn: false
        });
    }
    
    end() {
        this.log(yosay(this.answers.name + ' app generated!'));
    }
};