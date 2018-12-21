import React, { Component } from 'react';
import _ from 'underscore';
import { upload, checkIfMobile } from '../js/helpers';
import { urlToBase64 } from '../js/sos';
import loadImage from 'blueimp-load-image';
import ImageCrop from 'imagecrop';
import '../css/mediaUpload.css';

var cropping = false;

function readFile(file, callback) {
	var reader = new FileReader();

	reader.onloadend = function() {
		callback(file.name, reader.result);
	};

	reader.readAsDataURL(file);
}

function dataURLtoFile(dataurl, filename) {
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]),
		n = bstr.length,
		u8arr = new Uint8Array(n);

	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
}

function getImage(data, callback) {
	var img = new Image();
	img.onload = function() {
		var canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		canvas.src = img.src;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		callback(canvas);
	};
	img.src = data;
	img.width = 400;
	img.height = 400;
}

export default class MediaUpload extends Component {
	componentWillReceiveProps(nextProps) {
		var _this = this;
		if (nextProps.recrop !== _this.props.recrop && !cropping) {
			cropping = true;
			_this.onSelectFile(nextProps);
		}
	}

	onSelectFile(props, file = false) {
		const onChange = props.onChange;
		const isMobile = checkIfMobile();
		var recrop = props.recrop;
		var filename = !file && recrop ? _.last(recrop.split('/')) : file.name;

		if (!file && !recrop) {
			cropping = false;
			return;
		}

		if (file && file.type &&
			file.type.match(/^video\//) &&
			file.type.match(/^image\//)) {
			return alert('Invalid file format');
		}

		if (file && file.type &&
			file.type.match(/^video\//) &&
			file.type !== 'video/mp4') {
			return alert('Videos must be .mp4 file format');
		}

		if (!file && recrop) {
			urlToBase64(recrop, function(err, data) {
				file = dataURLtoFile(data, filename);
				getImage(data, function(canvas) {
					onImageLoad(canvas);
				});
			});
		} else {
			try {
				// jpegs need us to check the exif data and see if we need to rotate
				if (
					file &&
					file.type.match(/^image\//) &&
					file.type !== 'image/gif'
				) {
					loadImage(file, onImageLoad, {
						orientation: true
					});
				} else {
					const url = getFileURL();

					onChange(url, true);

					readFile(file, onDataURL);
				}
			} catch (error) {
				cropping = false;
				alert('Error uploading image');
			}
		}

		function getFileURL() {
			return URL.createObjectURL(file) + '#' + filename;
		}

		function getImagePreviewURL(img) {
			return img.src || img.toDataURL(file.type || 'image/jpeg');
		}

		function onImageLoad(img) {
			const url = getImagePreviewURL(img),
				maxSize = isMobile ? 300 : 400;

			const image = new Image();
			image.onload = () => {
				ImageCrop(image, {
					aspectRatio: 1,
					maxSize: [maxSize, maxSize]
				}).then(bounds => {
					if (bounds) {
						loadImage(file, onImageCrop, {
							orientation: true,
							aspectRatio: 1,
							maxWidth: maxSize,
							maxHeight: maxSize,
							cover: true,
							crop: true,
							top: bounds.top,
							left: bounds.left,
							sourceHeight: bounds.height,
							sourceWidth: bounds.width
						});
					} else {
						onImageCrop(img);
					}
				});
			};
			image.src = url;
		}

		function onImageCrop(img) {
			if (img.src) {
				onChange(img.src, true);
				onDataURL(filename, img.src);
			} else {
				// we need to figure out the file extension
				// based on the mime type of the data url
				// so that the server-side cropping can handle it
				const url = img.toDataURL(file.type || 'image/jpeg');
				const extMatch = /^data:image\/(.*?);/.exec(url);
				const newFilename = extMatch
					? `${filename}.${extMatch[1]}`
					: filename;
				onChange(url, true);
				onDataURL(newFilename, url);
			}
		}

		function onDataURL(filename, url) {
			upload(filename, url, (error, uploadData) => {
				recrop = '';
				cropping = false;
				if (error || !uploadData || !uploadData.url) {
					$(document.body).trigger('messenger:show', [
						'error',
						error || 'Error uploading image'
					]);
					onChange(null, false);
				} else {
					// preload before swapping in
					const preload = new Image();
					preload.onload = preload.onerror = function() {
						onChange(uploadData.url, false);
					};
					preload.src = uploadData.url;
				}
			});
		}
	}

	render() {
		return (
			<input
				type="file"
				onChange={event => this.onSelectFile(this.props, event && event.target.files[0])}
			/>
		);
	}
}
