'use strict';

var aws = require('aws-sdk');
var q = require('q');

/**
 * Returns the destination path of a file. Ex:
 * Given key "FOLDER/AA/file.txt", from "FOLDER/AA/" and to "FOLDER/BB/" the result will be "FOLDER/BB/file.txt"
 * @param {String} key File key
 * @param {String} from Origin path
 * @param {String} to Destination path
 * @returns {String} Destination file path
 */
var getDestinationPath = function (key, from, to) {
    var destPath = '';

    if (to['path']) {
        destPath += to['path'];
    }

    destPath += key.substring((from['path'] || '').length);

    return destPath;
};

/**
 * Copy a single file from one path to another.
 * @method copyOneFile
 * @param {aws.S3} api Amazon S3 API Instance
 * @param {String} key File key
 * @param {String} from SRC path
 * @param {String} to Destination path
 * @param {Boolean} debug Debug enabled
 * @returns {promise}
 */
var copyOneFile = function (api, key, from, to, debug) {
    var deferred = q.defer();

    api.copyObject({
        Key : getDestinationPath(key, from, to),
        Bucket : to.BUCKET,
        CopySource : from.BUCKET + '/' + key
    }, function (err) {
        var result = '';

        if (err) {
            result = 'Error copying file';
            deferred.reject(err);
        } else {
            result = 'Successfully copied file';
            deferred.resolve();
        }

        if (debug) {
            console.log(result + ': bucket \'' + from.BUCKET + '\', file \'' + key + '\' to bucket \''
                + to.BUCKET + '\'' + (to.path ? ', path \'' + to.path + '\'' : ''));
        }
    });

    return deferred.promise;
};

/**
 * Copy a group of files from a path to another
 * @method copyFiles
 * @param {aws.S3} api Amazon S3 API instance
 * @param {Object} from SRC options
 * @param {Object} to Destination options
 * @param {Boolean} debug Debug enabled
 * @returns {promise}
 */
var copyFiles = function (api, from, to, debug) {
    var deferred = q.defer();

    api.listObjects({
        Bucket : from.BUCKET,
        Prefix : from.path || ''
    }, function (err, data) {
        if (err) {
            deferred.reject(err);
        } else {
            var promises = [];

            data.Contents.forEach(function (file) {
                promises.push(q.fcall(function () {
                    if (file.Size > 0) {
                        return copyOneFile(api, file.Key, from, to, debug);
                    } else {
                        return undefined;
                    }
                }));
            });

            q.all(promises).then(function () {
                deferred.resolve();
            });
        }
    });

    return deferred.promise;
};

/**
 * Copies the files from the destination path to the specified backup path.
 * @method backupFiles
 * @param {aws.S3} api Amazon S3 API instance
 * @param {Object} options Backup options
 * @param {Boolean} debug Debug enabled?
 * @returns {promise}
 */
var backupFiles = function (api, options, debug) {
    var deferred = q.defer();

    if (options['backup_to']) {
        if (options.backup_to.BUCKET) {
            return copyFiles(api, options['to'], options['backup_to'], debug);
        } else {
            deferred.reject('Missing required params for backup. Check them!!');
        }
    } else {
        //No backup needed
        deferred.resolve();
    }

    return deferred.promise;
};

/**
 * Create the instance to access the amazon s3 API.
 * @param {Object} amazonCredentials Amazon Credentials
 * @returns {aws.S3} S3 API Instance
 */
var createS3Api = function (amazonCredentials) {
    var credentials, api;

    if (typeof amazonCredentials === 'string') {
        aws.config.loadFromPath(amazonCredentials);
        api = new aws.S3();
    } else if (typeof amazonCredentials === 'object'
        && amazonCredentials.accessKeyId
        && amazonCredentials.secretAccessKey) {
        credentials = new aws.Credentials({
            accessKeyId : amazonCredentials.accessKeyId,
            secretAccessKey : amazonCredentials.secretAccessKey,
            sessionToken : amazonCredentials['session']
        });

        api = new aws.S3({
            credentials : credentials,
            region : amazonCredentials['region']
        });
    }

    return api;
};

/**
 * Copies files from one bucket to another and optionally perform a backup to another bucket of the contents of the
 * destination bucket or path.
 * @method copy
 * @param {Object|String} amazonCredentials Path to the file where amazon credentials are stored (http://aws.amazon.com/sdkfornodejs/) or object with credentials (Ex.:
 * {
      accessKeyId: 'akid',//required
      secretAccessKey: 'secret', //required
      sessionToken: 'session', //optional
      region: 'region' //optional
   }
 * ).
 * @param {Object} options Options for the copy ex.:
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
 * @returns {promise}
 */
exports.copy = function (amazonCredentials, options) {
    var s3Api = createS3Api(amazonCredentials),
        debug = options.debug,
        deferred = q.defer();

    if (s3Api) {
        if (options.from && options.from.BUCKET && options.to && options.to.BUCKET) {

            //1st: backup
            return backupFiles(s3Api, options, debug)
                .then(function () {

                    //2nd: copy
                    return copyFiles(s3Api, options.from, options.to, debug);
                });

        } else {
            deferred.reject('Params required params. Check them!');
        }
    } else {
        deferred.reject('Wrong amazonS3 credentials. Check them!');
    }

    return deferred.promise;
};



