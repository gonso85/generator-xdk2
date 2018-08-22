/**
 *  New a template
 */

module.exports = function (gulp, plugins, config, util) {

    var title = "Create a new controller and a new view";
    var config = {
        pathOfTemplateController: 'template/Controller.js',
        pathOfTemplateView: 'template/view.js',
        pathOfTemplateDs: 'template/Ds.js',
        pathOfTemplateClass: 'template/Class.js',
        destFolderOfTemplateRoot: 'src/js/app/template/'
    };

    return function (template, klass, extend) {
        util.startMsg(title);

        var fs = require('fs');
        var rename = require('gulp-rename');
        var replace = require('gulp-replace');
        var removeEmptyLines = require('gulp-remove-empty-lines');

        if (typeof template === 'string') {
            var templateName = template[0].toLowerCase() + template.substring(1);
            var templateFolder = config.destFolderOfTemplateRoot + templateName + "/";
            var viewName = templateName + "View";
            var viewPath = templateFolder + viewName + '.js';
            var controllerName = template[0].toUpperCase() + template.substring(1) + "Ctrl";
            var controllerPath = templateFolder + controllerName + '.js';
            var cssName = templateName;
            var dsName = template[0].toUpperCase() + template.substring(1) + "Ds";

            var createView = function () {
                gulp.src(config.pathOfTemplateView)
                    .pipe(rename(viewName + '.js'))
                    .pipe(replace(/\{VIEW_NAME\}/g, viewName))
                    .pipe(replace(/\{VIEW_ID\}/g, '#' + viewName))
                    .pipe(replace(/\{TEMPLATE_NAME\}/g, templateName))
                    .pipe(gulp.dest(templateFolder));

                console.log('Created ' + viewName + '.js in ' + config.destFolderOfTemplateRoot);
            };

            var createController = function () {
                gulp.src(config.pathOfTemplateController)
                    .pipe(rename(controllerName + '.js'))
                    .pipe(replace(/\{CTRL_NAME\}/g, controllerName))
                    .pipe(replace(/\{DS_NAME\}/g, dsName))
                    .pipe(replace(/\{VIEW_NAME\}/g, viewName))
                    .pipe(replace(/\{TEMPLATE_NAME\}/g, templateName))
                    .pipe(gulp.dest(templateFolder));

                console.log('Created ' + controllerName + '.js in ' + config.destFolderOfTemplateRoot);
            };


            var createDs = function () {
                gulp.src(config.pathOfTemplateDs)
                    .pipe(rename(dsName + '.js'))
                    .pipe(replace(/\{DS_NAME\}/g, dsName))
                    .pipe(replace(/\{TEMPLATE_NAME\}/g, templateName))
                    .pipe(gulp.dest(templateFolder));

                console.log('Created ' + dsName + '.js in ' + config.destFolderOfTemplateRoot);
            };

            fs.stat(controllerPath, function (err, stat) {
                if (err == null) {
                    console.log('Controller exists, please clean the file or rename your new template.');
                    util.finishMsg(title);
                    return;
                }

                fs.stat(viewPath, function (err, stat) {
                    if (err == null) {
                        console.log('View exists, please clean the file or rename your new template.');
                        util.finishMsg(title);
                        return;
                    }

                    createView();
                    createController();
                    createDs();

                    util.finishMsg(title);
                });
            });

            return;
        }

        if (typeof klass === 'string') {
            var classPath = klass,
                arr = classPath.split("/"),
                className = arr.pop(),
                classFolderPath = 'src/js/' + arr.join("/"),
                classFullPath = 'src/js/' + klass + ".js",
                extendedClassPath = extend ? ('"' + extend + '"') : "",
                extendedClassName = extend ? extend.split("/").pop() : "",
                extendedClassComma = extend ? "," : "",
                extendedClassSpace = extend ? " " : "",
                extendedClassSuperFunc = extend ? "this._super(opts);" : "";

            var createClass = function () {
                gulp.src(config.pathOfTemplateClass)
                    .pipe(rename(className + '.js'))
                    .pipe(replace(/\{CLASS_NAME\}/g, className))
                    .pipe(replace(/\{CLASS_PATH\}/g, classPath))
                    .pipe(replace(/\{EXTENDED_CLASS_NAME\}/g, extendedClassName))
                    .pipe(replace(/\{EXTENDED_CLASS_PATH\}/g, extendedClassPath))
                    .pipe(replace(/\{EXTENDED_CLASS_COMMA\}/g, extendedClassComma))
                    .pipe(replace(/\{EXTENDED_CLASS_SPACE\}/g, extendedClassSpace))
                    .pipe(replace(/\{EXTENDED_CLASS_SUPER_FUNC\}/g, extendedClassSuperFunc))
                    .pipe(removeEmptyLines())
                    .pipe(gulp.dest(classFolderPath));

                console.log('Created ' + className + '.js in ' + classFolderPath);
            };

            fs.stat(classFullPath, function (err, stat) {
                if (err == null) {
                    console.log('Class exists, please clean the file or rename your new class.');
                    util.finishMsg(title);
                    return;
                }

                createClass();
                util.finishMsg(title);
            });

            return;
        }

        util.error("Please define a name for your new template or class.");
    };
};