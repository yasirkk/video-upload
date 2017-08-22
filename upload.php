public function uploadChunkVideoAction(){

		$this->_getCommonFunctionModel();

		if ($this->getRequest()->isPost()) {
			$oGetData 	= $this->getRequest()->getPost();
			$target_path 	= $sDomain."/content-videos/"; 		// Upload Location 
			$tmp_name 		= $_FILES['fileToUpload']['tmp_name'];				// Temp name
			$filename 		= $_GET['filename']; 								// Filename
			$limit 			= $_GET['limit'];									// Packet Index
			$totalChunk		= $_GET['totalChunk'];								// No.of Chunks
			// if($limit == 1) {			
				
			// }
			$completeFilePath= $target_path.$limit.$filename;			// File full path with index
			$completeFile 	= fopen($completeFilePath, "a"); 			// File open in append mode
			$inputFile 		= fopen($tmp_name, "r");					// Temp file open in read mode
			if ( $inputFile ) {
			    while ( $buffer 	= fread( $inputFile, 1048576 ) ) { 	// Store temp Data into buffer
			       
			        fwrite($completeFile, $buffer);		 				// fwrite file 			
			    }   
			}
			fclose($completeFile);
			fclose($inputFile);

			if($limit == $totalChunk) {									// check total no.of chunks and packet index are same
				// Check same file already exist remove prevoius and update
				if (file_exists($sDomain . '/content-videos/' . $filename))
					unlink($sDomain . '/content-videos/' .$filename);
				if (file_exists($sDomain . '/content-videos/' . $filename))
					unlink($sDomain . '/content-videos/' . $filename);
				if (file_exists($sDomain . '/content-videos/' . $filename))
					unlink($sDomain . '/content-videos/' . $filename);

				$newFile 	=	fopen($target_path.$filename,'a'); 		// Create new file
				for($i=1;$i<=$totalChunk;$i++){
					$inFile = fopen($target_path.$i.$filename,'r'); 	// Read all file related to the file
					while($buffer = fread($inFile,1048576)){
						fwrite($newFile, $buffer);						// Merge all file into single file
					}
					fclose($inFile);
					unlink($target_path.$i.$filename);					// Delete chunked file from server location
				}
				fclose($newFile);
			}

			return new JsonModel(
						array(
							'result' => $limit,
						)
			);
		}

	}

	/**
	 * Video data submit for add and edit screens
	 * @author  Rijesh
	 * @param   null
	 * @return  redirect
	 */
	public function addEditSubmitVideoAction()
	{
		$this->_getVideoMngmntTable();
		
		$pageNo 		= ( isset($_GET['page']) && $_GET['page'] != '') ? $_GET['page'] : 1;
		$sMessage = null;
		if ( $this->getRequest()->isPost() ) { 
			$oGetData 		= $this->getRequest()->getPost();
			if ( $oGetData->title != '' && $oGetData->description ) {
				$videoId 					= (isset($oGetData->idVideo) && $oGetData->idVideo != '') ? $oGetData->idVideo : null;
				$currentVideo 				= (isset($oGetData->previous) && $oGetData->previous != '') ? $oGetData->previous : null;
				$aInsertData['video_nam'] 	= $oGetData->title;
				$aInsertData['video_dscptn']= $oGetData->description;
				$aInsertData['video'] 		= $oGetData->mp4File;

				$aWhere['video_id'] 		= $videoId;
				if ( $videoId != null ){
					$iReturnId 			= $this->_oVideoMngmnt->updateVideo($aInsertData,$aWhere);
					if($iReturnId != '') {
						$sMessage		= \Admin\Model\MessageClass::get('SUC077');
					} 
				} else {
					$iReturnId			= $this->_oVideoMngmnt->insertVideo($aInsertData);
					if ( $iReturnId != '') {
						$sMessage		= \Admin\Model\MessageClass::get('SUC076');
					} else {
						$sMessage		= \Admin\Model\MessageClass::get('ERR105');
					}
				} 
			}
		}
		$this->flashmessenger()->addMessage($sMessage);
		return new JsonModel (
			array(
				'page' => $pageNo,
			)
		);
