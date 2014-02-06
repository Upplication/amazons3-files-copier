amazons3-files-copier
=====================

Process to copy a group of files stored in a bucket or path in AmazonS3 to another bucket or path


Copy method
--------

	@param {String} amazon_credentials_file Path to the file where credentials of amazon are stored.
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

