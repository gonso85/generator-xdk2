# Viki

## About VIKI
"VIKI" is the code name for the various skeleton/foundation/starting point applications per platform that the developers at the beginning of a PS engagement will clone to start off their project. At the minimum this would contain the build script to obtain more components/modules, minimal functional items such as navigation, configuration, framework (platform dependent).

## Please read the documentation before getting started.

## Git hooks setup

In *nix environments (Linux / MacOS / [WSL](https://msdn.microsoft.com/en-us/commandline/wsl/install_guide)), `npm install` should already plant symbolic links into `.git/hooks`.

For Windows users who use _Git Bash_ / _cmd_ / GUI tools like _SourceTree_ or _Git Extensions_, please note that you need to execute `npm install` in a CLI window with administrator privilege, otherwise symbolic links cannot be created. In case you have accidentally run `npm install` in CLI window without administrator privilege, you probably need to run `npm uninstall pre-commit pre-push` then `npm install pre-commit pre-push` with administrator privilege to fix the missing symbolic links.

## Useful Links

- [Get Started](https://accedobroadband.jira.com/wiki/display/VDKCTV/Get+Started)
- [Vikimap](https://accedobroadband.jira.com/wiki/display/VDKCTV/Vikimap)
- [Build Tools](https://accedobroadband.jira.com/wiki/display/VDKCTV/Build+Tools)
- [Code Structure](https://accedobroadband.jira.com/wiki/display/VDKCTV/Code+Structure)

## UNIT TESTING
* gulp test
* optional parameters
*  *--singleRun=[**true|false**] default **true***
    **true** will terminate the karma test runner immediately after running the coverage and unit tests
    **false** will keep karma test runner to watch for unit test changes
*  *--browser=[**Chrome|PhantomJS**] default **PhantomJS***
    browser that will be use to by karma to run the tests
*  *--debugMode=[**true|false**] default **false***
    **false** will notminified and obfuscated the application code.
* npm run unit-test
  To run unit test alone without coverage
* For more information see *http://karma-runner.github.io/1.0/index.html*