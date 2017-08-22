				function check(){										                        // function to check video upload completed
						
					if(flag_mp4 && flag_webm && flag_ogg  ){
                								
                		var vTitle			= $('#vidName').val();					// Video title
                		if($('#mp4Video').val() != '' ) {
                			if(fileFlag) {
                				var mp4File 	= uFilename + '.mp4';
                			} else {
                				var mp4File 	= 'video_'+randNum+'_'+$('#mp4Video')[0].files[0].name; // mp4 filename
                			}
                		} else {
                			var mp4File 		= prevVideo;
                		}
                		if($('#oggVideo').val() != '') {
                			if(fileFlag) {
                				var oggFile 	= uFilename + '.ogg';
                			} else {
	                			var oggFile 	= 'video_'+randNum+'_'+$('#oggVideo')[0].files[0].name; // ogg filename
                			}
                		}
    					if($('#webmVideo').val()){
    						if(fileFlag) {
    							var webmFile 	= uFilename + '.webm';
    						} else {
                				var webmFile 		= 'video_'+randNum+'_'+$('#webmVideo')[0].files[0].name;// webm filename
    						}
    					}
                		
                		var vDescription	= $('#vidDscrptn').val();				// video Description
          				var idVideo 		= $('#iVideoId').val(); 				// video id
              		
                		$.ajax({
						    type: "POST",
						    url: "/admin/add-edit-submit-video?page="+pageIdVideo,
						    data: {
						        title 		: vTitle,  
						        mp4File 	: mp4File,
						        oggFile  	: oggFile,
						        webmFile 	: webmFile,
						        description : vDescription,
						        idVideo 	: idVideo,
						        previous	: prevVideo, 			   
						    },
						    success: function(data) {
						    	 		// To prevent close, redirection action
						    		window.onbeforeunload = null;
									window.location.href=window.location.origin+'/admin/video-list/'+data.page;
								
						    }
						});
                	}
				}
				// Check transfer completed 
				if($('#mp4Video').val() != '') {
					if ( fileFlag ) {
						var upFilename 		= uFilename + '.mp4';
					} else {
						var upFilename		= 'video_'+randNum+'_'+$('#mp4Video')[0].files[0].name;
					}
					VideoManagement.createChunk($('#mp4Video')[0].files[0],'mp4progress',function(){console.log('mp4completed');
						 flag_mp4=true;
						 check();					
					},randNum,upFilename);	
				}
				// Check transfer completed
				if($('#oggVideo').val() != '') {
					if ( fileFlag ) {
						var upFilename 		= uFilename + '.ogg';
					} else {
						var upFilename		= 'video_'+randNum+'_'+$('#oggVideo')[0].files[0].name;
					}
					VideoManagement.createChunk($('#oggVideo')[0].files[0],'oggprogress',function(){ console.log('oggcompleted');	
						flag_ogg=true;
						check();
					},randNum,upFilename);	
				}
				// Check transfer completed
				if($('#webmVideo').val() != ''){
					if ( fileFlag ) {
						var upFilename 		= uFilename + '.webm';
					} else {
						var upFilename		= 'video_'+randNum+'_'+$('#webmVideo')[0].files[0].name;
					}
					VideoManagement.createChunk($('#webmVideo')[0].files[0],'webmprogress',function(){ console.log('webmcompleted');
						flag_webm=true;
					 	check();						
					},randNum,upFilename);		
				}
				if(flag_mp4 && flag_webm && flag_ogg) {
					check();
				}
			}
		});
	}

	VideoManagement.bindControls = function() {
		$(VideoManagement.elements.videoListGotoPageSubmit).click(function() {
			sVideoDataSubmit();
		});
	}
	// Pagination 
	function sVideoDataSubmit() {
		var iUserPageCount 		= parseInt($(VideoManagement.elements.videoListGotoPageSubmit).attr('data-page-count'));
			var iUserGotoValue 	= parseInt($(VideoManagement.elements.videoListGotoPageTxt).val());
			
			if (iUserGotoValue) {
				if (iUserGotoValue <= iUserPageCount) {
					$(VideoManagement.elements.sVideoListForm).attr('action', "/admin/video-list/"+iUserGotoValue);
					$(VideoManagement.elements.sVideoListForm).submit();
				} else {
					bootbox.alert("No such page exist");					
				}
			} else {
				bootbox.alert("No such page exist");				
			} 
	}
	$(VideoManagement.elements.videoListGotoPageTxt).keypress( function (e) {
			if (e.which != 8 && e.which != 0 && e.which != 13 && (e.which < 48 || e.which > 57)) {
				return false;
			}
		});

	//Disable Button if value is empty
	$(VideoManagement.elements.videoListGotoPageTxt).keyup( function (e) {
		// if the text box has value then only enable button
		if ($(this).val().length>0){
			$(VideoManagement.elements.videoListGotoPageSubmit).prop('disabled', false);
		} else {
			$(VideoManagement.elements.videoListGotoPageSubmit).prop('disabled', true);
		}
	});
	$(VideoManagement.elements.videoListGotoPageTxt).keydown( function (e) {
		if( e.keyCode == 13) {
			sVideoDataSubmit();
			e.preventDefault();
		}
	});

	$(VideoManagement.elements.Submit).click(function(){
		
		VideoManagement.validation(VideoManagement.elements.addVideo);
		
	});



	VideoManagement.createChunk	= function(fileContent,progressId,completedChunk,randNum,fName){
		const BYTES_PER_CHUNK 	= (2*1048576); 			// 1MB chunk sizes.
		var fileOfBlob 			= new File([fileContent], fileContent.name);
		const SIZE  			= fileContent.size; 	// video size
        var index 				= 0;
        var start 				= 0;
        var end 				= BYTES_PER_CHUNK;

        (function loop() {

           if( start < SIZE ) {
                index++;
                var chunk 			= fileOfBlob.slice(start, end); // Create chunk file of size 7 mb
                
                VideoManagement.uploadFile(chunk,fileContent,index,randNum,function(data){ // send chunk into upload function
                	start 				= end;
	                end 				= start + BYTES_PER_CHUNK;
	                var percentage 		= (BYTES_PER_CHUNK/SIZE)*data*100;
	                if (percentage < 100) {
	                	$('#'+progressId).css({'width':percentage+'%'});
	                	$('#'+progressId).text(Math.floor(percentage)+'%');
	                } else {
	                	$('#'+progressId).css({'width':'100%'});
	                	$('#'+progressId).text('100% completed');
	                }
	                loop();
                },fName);                  
            } else {
            	completedChunk();
            }
        })();
	}

	VideoManagement.uploadFile 		= function(blobFile,filename,index,randNum,done,fName){
		 		
 		var fd      	= new FormData();
        var size    	= filename.size;
        var nChunks 	= size/(2*1048576); 		// no.of chunks
        var tChunk  	= nChunks%1!=0 ? Math.ceil(nChunks) : nChunks; // total chunk
        
        fd.append('fileToUpload',blobFile);
        var pagIndex 		=window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
        
        $.ajax({
           	url 		: '/admin/chunk-upload-video?filename='+fName+'&&limit='+index+'&&totalChunk='+tChunk,
            data 		: fd,
            cache 		: false,
            contentType : false,
            processData	: false,
            type 		: 'POST',
            success 	: function(data){console.log(data);
            	done(data.result);
            },
            error 		: function (){	
		                    setTimeout(function () {
		                    	VideoManagement.uploadFile(blobFile,filename,index,randNum,done);
		                    },2000);
            			 }
        });
	}
