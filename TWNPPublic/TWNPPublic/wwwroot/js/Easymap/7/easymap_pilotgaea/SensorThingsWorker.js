onmessage = function (Event) {
	let msg = Event.data[0];
	let wParam = Event.data[1];
	let lParam = Event.data[2];
	let path = Event.data[3];

	importScripts(path.corePath);

	switch (msg) {
		case "Region":
			if (wParam === "Data") {
				let regionAverage = ov.SensorThings.Preprocess.Region.Data(lParam, true);
				postMessage({
					type: "data",
					data: regionAverage
				});
			}
			else if (wParam === "Draw") {
				let offscreenCanvas = new OffscreenCanvas(lParam.canvasWidth, lParam.canvasHeight);
				lParam.canvas = offscreenCanvas;
				ov.SensorThings.Preprocess.Region.Draw(lParam, true);
				let imageBitmap = offscreenCanvas.transferToImageBitmap();
				postMessage({
					type: "draw",
					buffer: imageBitmap
				}, [imageBitmap]);
			}
			break;

		case "HeatMap":
			if (wParam === "Draw") {
				let offscreenCanvas = new OffscreenCanvas(lParam.canvasWidth, lParam.canvasHeight);
				lParam.canvas = offscreenCanvas;
				let buffer = ov.SensorThings.Preprocess.HeatMap.Draw(lParam, true);
				postMessage({
					type: "draw",
					buffer: buffer
				});
			}
			break;
		case "PointOverlay":
			if (wParam === "Draw") {
				let offscreenCanvas = new OffscreenCanvas(lParam.canvasWidth, lParam.canvasHeight);
				lParam.canvas = offscreenCanvas;
				ov.SensorThings.Preprocess.PointOverlay.Draw(lParam, true);
				let imageBitmap = offscreenCanvas.transferToImageBitmap();
				postMessage({
					type: "draw",
					buffer: imageBitmap
				}, [imageBitmap]);
			}
			break;
	}
};