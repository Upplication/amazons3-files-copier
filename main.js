var AWS = require('aws-sdk');
var Q = require('q');


/**
 * @method Copy one file in Amazon.
 *
 * @param s3Api {Function}
 * @param key {String}
 * @param from {Object}
 * @param to {Object}
 * @param debug {Boolean}
 * @returns {Promise}
 */
var _copyOneFile = (function (Q) {


    //If given params are ('from' path is 'FOLDER/AA/', 'to' path is 'FOLDER/BB/') and the file key is 'FOLDER/AA/ONE/file.txt', the output will be 'FOLDER/BB/ONE/file.txt'
    var _getToPath = function (key, from, to) {

        var output_path = '';

        if (to.path) {
            output_path += to.path;
        }

        output_path += key.substring(from.path.length);

        return output_path;
    };

    return function (s3Api, key, from, to, debug) {

        var deferred = Q.defer();

        s3Api.copyObject({
            Key: _getToPath(key, from, to),
            Bucket: to.BUCKET,
            CopySource: from.BUCKET + '/' + key
        }, function (err, data) {
            var result = '';
            if (err) {
                result = 'Error copying file';
                deferred.reject(err);
            } else {
                result = 'Successfully copied file';
                deferred.resolve();
            }

            if (debug){
                console.log(result + ': bucket \'' + from.BUCKET + '\', file \'' + key + '\' to bucket \'' + to.BUCKET + '\'' + (to.path ? ', path \'' + to.path + '\'' : ''));
            }

        });
        return deferred.promise;

    };


})(Q);


/**
 * method copyFiles Copy a group of files in Amazon.
 *
 * @param s3Api  {Function}
 * @param from {Object}
 * @param to {Object}
 * @param debug {Boolean}
 * @returns {Promise}
 */
var _copyFiles = function (s3Api, from, to, debug) {

    var deferred = Q.defer();

    s3Api.listObjects({
        Bucket: from.BUCKET,
        Prefix: from.path
    }, function (err, data) {
        if (err) {
            deferred.reject(err);
        } else {
            var promises = [];
            data.Contents.forEach(function (file) {
                promises.push(Q.fcall(function () {
                    if (file.Size > 0) {
                        return _copyOneFile(s3Api, file.Key, from, to, debug);
                    } else {
                        return undefined;
                    }
                }));
            });

            Q.all(promises)
                .then(function () {
                    deferred.resolve();
                });
        }

    });

    return deferred.promise;
};


/**
 * @method backupFiles Makes the backup if user wants to
 *
 * @param s3Api {Function}
 * @param options {Object}
 * @param debug {Boolean}
 * @returns {Promise}
 */
var _backupFiles = function (s3Api, options, debug) {
    var deferred = Q.defer();

    if (options.backup_to) {
        if (options.backup_to.BUCKET) {
            return _copyFiles(s3Api, options.to, options.backup_to, debug);
        } else {
            deferred.reject('Params required for backup. Check them!!');
        }
    } else {

        //No backup needed
        deferred.resolve();
    }

    return deferred.promise;
};


/**
 * @method copy
 *
 * @param {String} amazon_credentials_file Path to the file where credentials of amazon are stored.
 * @param {Object} options. ex.:
 * {
        //required
        from:{
            BUCKET: 'templater',  //required {String}
            path: 'PRE'  //required {String}
        },
        //required
        to:{
            BUCKET: 'templater', //required {String}
            path: 'PRO'  //optional {String}
        },
        //optional
        backup_to:{
            BUCKET: 'templater-backup', //required {String}
            path: 'PRO'  //optional {String}
        },
        debug: true //optional {Boolean}
    }
 * @returns {Promise}
 */

exports.copy = function (amazon_credentials_file, options) {

    AWS.config.loadFromPath(amazon_credentials_file);

    var s3Api = new AWS.S3(),
        debug = options.debug,
        deferred = Q.defer();

    if (options.from && options.from.BUCKET && options.from.path && options.to && options.to.BUCKET) {

        //1º make backup
        return _backupFiles(s3Api, options, debug)
            .then(function () {

                //2º copy
                return _copyFiles(s3Api, options.from, options.to, debug);
            });

    } else {
        deferred.reject('Params required. Check them!!');
    }

    return deferred.promise;

};



