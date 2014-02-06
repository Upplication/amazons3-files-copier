amazons3-files-copier
=====================

Process to copy a group of files stored in a bucket or path in AmazonS3 to another bucket or path


Copy method
--------



	@param {String|Object} amazon_credentials Two ways:
		1. Path to the file where credentials of amazon are stored (http://aws.amazon.com/sdkfornodejs/) 
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
	
	@returns {Promise}

