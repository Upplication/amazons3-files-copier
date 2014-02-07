amazons3-files-copier
=====================

Process to copy a group of files stored in a bucket or path in AmazonS3 to another bucket or path


### Copy method



	@param {String|Object} amazon_credentials Two ways:
		1. Path to the file where credentials of amazon are stored (Structure example in file 'sample-amazon.json') 
		2. Object with credentials (Ex.:
			{
				  accessKeyId: 'akid',//required
				  secretAccessKey: 'secret', //required
				  sessionToken: 'session', //optional
				  region: 'region' //optional
			}
	
	
	
	@param {Object} options. ex.:
	{
		 //required
		 from:{
			 BUCKET: 'bucketFrom',  //required {String}
			 path: 'pathFrom'  //required {String}
		 },
		 //required
		 to:{
			 BUCKET: 'bucketTo', //required {String}
			 path: 'pathTo'  //optional {String}
		 },
		 //optional
		 backup_to:{
			 BUCKET: 'bucketBackup', //required {String}
			 path: 'pathBackup'  //optional {String}
		 },
		 debug: true //optional {Boolean} Print log of each file
	}
	
	@returns {Q Promise} 

#### Example 

		var amazonCopier = require('amazons3-files-copier'),
			$AMAZON_CREDENTIALS_FILE_PATH = './amazon.json';

		amazonCopier.copy($AMAZON_CREDENTIALS_FILE_PATH, {
		        from:{
		            BUCKET: 'templater',
		            path: 'PRE/'
		        },
		        to:{
		            BUCKET: 'templater',
		            path: 'PRO/'
		        },
		        backup_to:{
		            BUCKET: 'templater-backup',
		            path: 'PRO/'
		        },
		        debug: false
		    })
	        .then(function () {
	            console.log('OK');
	        }, function (err) {
	            console.log('Error: ' + err);
	        });




