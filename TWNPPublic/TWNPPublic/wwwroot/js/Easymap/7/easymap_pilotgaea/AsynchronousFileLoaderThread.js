//const PrePathName = "../webgl/";
const FILELOADER_DATA = { /** 文字 */TEXT: 1, /** 二進制資料 */BINARY: 2, /** 影像 */IMAGE: 3, /** 二進制資料轉成影像 */BINARY_TO_IMAGE: 4, /** 二進制資料轉成影像 */XML: 5 };

function data_receiver (CmdId,index,Type,xmlHttp){
	if (xmlHttp.readyState == 4) {
		if (xmlHttp.status == 200) {
			let isArrayBuffer = false;
			let Data = null;
			switch (Type){
				case FILELOADER_DATA.TEXT:
					Data = xmlHttp.responseText;
					break;
				case FILELOADER_DATA.BINARY:
					Data = xmlHttp.response;
					isArrayBuffer = true;
					break;
				case FILELOADER_DATA.IMAGE:
					Data = xmlHttp.response;

					var img_type = null;
					var dv = new DataView(Data, 0, 5);
					var nume1 = dv.getUint8(0, true);
					var nume2 = dv.getUint8(1, true);
					var hex = nume1.toString(16) + nume2.toString(16);
					switch (hex) {
						case "8950":
							img_type = "image/png";
							break;
						case "4749":
							img_type = "image/gif";
							break;
						case "424d":
							img_type = "image/bmp";
							break;
						case "ffd8":
							img_type = "image/jpeg";
							break;
					}

					isArrayBuffer = true;
					break;
				case FILELOADER_DATA.XML:
					Data = xmlHttp.responseXML;
					break;
			}

			if (isArrayBuffer) {
				postMessage({ CmdId: CmdId, index: index, img_type:img_type,Data: Data }, [Data]);
			}
			else {
				postMessage({ CmdId: CmdId, index: index, Data: Data });
			}
		}
		else {
			postMessage({CmdId:CmdId,index:index,Data:null});
		}
	}
}

function DoGet (CmdId, index, Url,Type) {
	let xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		data_receiver(CmdId, index, Type, xmlHttp);
	};
	xmlHttp.open("GET", encodeURI(Url), true); // true for asynchronous
	switch (Type) {
		case FILELOADER_DATA.TEXT:
			break;
		case FILELOADER_DATA.BINARY:
			xmlHttp.responseType = "arraybuffer";
			break;
		case FILELOADER_DATA.IMAGE:
			xmlHttp.responseType = "arraybuffer";
			break;
		case FILELOADER_DATA.XML:
			xmlHttp.setRequestHeader("Content-Type", "text/xml");
			break;
	}
	xmlHttp.send(null);
}

onmessage = function (Event) {
	let CmdId = Event.data.CmdId;
	let Urls = Event.data.Urls;
	let Types = Event.data.Types;
	if (Array === Urls.constructor){//is Array
		let length = Urls.length;

		for (let i = 0; i < length; i++) {
			DoGet(CmdId, i, Urls[i],Types[i]);
		}
	}
	else {
		DoGet(CmdId, 0, Urls, Types);
	}
};

onerror = function (Event) {
	throw Event;
};