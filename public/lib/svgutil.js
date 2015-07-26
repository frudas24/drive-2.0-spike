/*global _, $, MAPJS, jQuery, console*/
jQuery.fn.copyStyle = function (domNode) {
	'use strict';
	if (!this[0])  { return; } /* children without a role */
	var self = this, domStyle = window.getComputedStyle(domNode), currentStyle = window.getComputedStyle(this[0]);
	_.each(domStyle, function (prop) {
		if (domStyle[prop] !== currentStyle[prop]) {
			self.css(prop, domStyle[prop]);
		}
	});
	return self;
};
MAPJS.generateThumbnail = function (stage, timeout, width, height, scale) {
	'use strict';
	var toPixel = function (cssString, relativeTo) {
			var value = parseInt(cssString, 10);
			if (/[0-9]+%/.test(cssString)){
				return relativeTo * value / 100;
			}
			return value;
		},
		cloneAndStyle = function (jQueryList) {
			var result= $();
			jQueryList.each(function () {
				var domNode = this,
				domClone = $(domNode).clone().attr('class', '').copyStyle(domNode);
			result = result.add(domClone);
			});
			return result;
		},
		toSVG = function (source) {
			var offset = {
						x: source.data('offsetX'),
						y: source.data('offsetY')
					},
					stageWidth = source.data('width'),
					stageHeight = source.data('height'),
					result = MAPJS.createSVG().attr({'width': stageWidth, 'height': stageHeight});
			source.find('svg').each(function () {
				var objectToClone = $(this),
				clone = MAPJS.createSVG('g').appendTo(result);
			clone.attr('transform', 'translate(' + (offset.x + toPixel(objectToClone.css('left'), stageWidth))+',' + (offset.y + toPixel(objectToClone.css('top'), stageHeight)) +')');
				cloneAndStyle(objectToClone.children()).appendTo(clone);
			});
			source.find('.mapjs-node').each(function () {
				var objectToClone = $(this),
					clone = MAPJS.createSVG('rect').appendTo(result),
					data = objectToClone.data(),
					domStyle = window.getComputedStyle(this),
					radius = parseInt(domStyle.borderRadius || domStyle.borderBottomLeftRadius, 10);
				clone.attr({x: offset.x + data.x, y:  offset.y + data.y, width: data.width, height: data.height, rx: radius, ry: radius}).
				css({fill: domStyle.backgroundColor, stroke: domStyle.borderColor || domStyle.borderBottomColor, 'stroke-width': domStyle.borderWidth || domStyle.borderBottomWidth});
			});
			return result[0];
		},
		toSvgString = function (svgElement) {
				var	svgString = new XMLSerializer().serializeToString(svgElement);
				return 'data:image/svg+xml,' + svgString;
		},
		toCanvas = function (img) {
			var canvasWidth = img.width,
				canvasHeight =  img.height,
				canvas = $('<canvas>').attr({width: width, height: height})[0],
				ctx = canvas.getContext('2d');


			if (scale !== 1) {
				ctx.scale(scale, scale);
			}
			ctx.translate( (width- canvasWidth)/2, (height - canvasHeight)/2);

			ctx.drawImage(img, 0, 0);
			return canvas;
		},
		wordwrap = function (ctx, text, font, fontColor, maxWidth, lineHeight, x, y) {
			var lines =  [], width = 0, i, j, result;
			ctx.font   = font;
			while ( text.length ) {
				for( i=text.length; ctx.measureText(text.substr(0,i)).width > maxWidth; ) { i--;}
					result = text.substr(0,i);
					if ( i !== text.length ){
						for( j=0; result.indexOf(' ',j) !== -1;) {j=result.indexOf(' ',j)+1; }
						if (j) {
							result = result.substr(0, j);
						}
					}
					if (result.indexOf('\n')>=0) {
							result = text.substr(0,result.indexOf('\n') + 1);
					}
				lines.push( result );
				width = Math.max( width, ctx.measureText(lines[ lines.length-1 ]).width );
				text  = text.substr( lines[ lines.length-1 ].length, text.length );
			}
			ctx.fillStyle = fontColor;
			for ( i=0, j=lines.length; i<j; ++i ) {
				ctx.fillText( lines[i], x, y + lineHeight * i );
			}
		},
		paintText = function (stage, ctx) {
				var offset = {
						x: stage.data('offsetX'),
						y: stage.data('offsetY')
				};
				stage.find('.mapjs-node').each(function () {
					var node = $(this),
						span = node.find('span'),
						data = node.data(),
						domStyle = window.getComputedStyle(this),
						domStyleSpan = window.getComputedStyle(span[0]),
						textLeft = toPixel(domStyle.paddingLeft, data.width) + toPixel(domStyleSpan.marginLeft, data.width),
						textTop = (node.outerHeight(true) - span.innerHeight())/2,
						lineHeight = toPixel(domStyleSpan.lineHeight, 10);
					wordwrap(ctx, span.text(), domStyleSpan.font || (domStyleSpan.fontWeight +' ' + domStyleSpan.fontSize + ' '+domStyleSpan.fontFamily), domStyleSpan.color, span.outerWidth(true) + 3,lineHeight,
						 offset.x +	data.x + textLeft,
						 offset.y + data.y + textTop + 3 + lineHeight - toPixel(domStyleSpan.fontSize, 10)  );
				});
		},
		paintNodeImages = function (stage, canvas) {
			var result = jQuery.Deferred(),
				promises = [],
				ctx = canvas.getContext('2d'),
				offset = {
						x: stage.data('offsetX'),
						y: stage.data('offsetY')
				};
			stage.find('.mapjs-node').each(function () {
				var node = $(this),
						data = node.data(),
						domStyle = window.getComputedStyle(this),
						bgImage = domStyle.backgroundImage,
						src,
						addImage = function (srcUrl) {
							var img = new Image(),
								promise = jQuery.Deferred();
							promises.push(promise);
							img.crossOrigin = "Anonymous";
							img.onload = function () {
								var imgSize = domStyle.backgroundSize.split(' '),
										shownWidth = toPixel(imgSize[0], data.width),
										shownHeight = toPixel(imgSize[1], data.height);
								ctx.drawImage(img,
									offset.x + data.x + toPixel((domStyle.backgroundPositionX || domStyle.backgroundPosition.split(' ')[0]), data.width - shownWidth),
									offset.y + data.y + toPixel((domStyle.backgroundPositionY || domStyle.backgroundPosition.split(' ')[1]), data.height - shownHeight),
									shownWidth,
									shownHeight
								);
								promise.resolve();
							};
							img.src = srcUrl;
						};
				if(bgImage) {
					src = bgImage.match(/url\(["]?([^"\)]*)["]?\)/);
					if (src && src.length>1) {
						addImage(src[1]);
					}
				}
			});
			jQuery.when.apply($, promises).then(function () { paintText(stage, ctx); result.resolve(); }, result.reject, result.notify);
			return result;
		},
		svg, intermediateImg, canvas, png,
		intermediateImageLoaded = function () {
			result.notify('intermediate-img', intermediateImg);
			canvas = toCanvas(intermediateImg);
			result.notify('canvas', canvas);
			paintNodeImages(stage, canvas).done(function () {
				png = canvas.toDataURL('image/png');
				result.resolve(png);
			});
		},
		result = jQuery.Deferred();

	svg = toSVG(stage);
	result.notify('svg', svg);
	intermediateImg = new Image();
	intermediateImg.onload = intermediateImageLoaded;
	intermediateImg.src = toSvgString(svg); //domURL.createObjectURL(svgBlob);
	window.setTimeout(result.reject, timeout);
	return result.promise();
};

//var stage = $('[data-mapjs-role=stage]');
//MAPJS.generateThumbnail(stage, 1000, 500, 500, 1).progress(function (stage, element) {
//		jQuery('[tab='+stage+']').empty().append(element);
//	}).done(function (pngDataUrl) {
//		console.log('done');
//		jQuery('[tab=png]').empty().html('<img src="'+pngDataUrl+'"/>');
//	}).fail(function () {
//		console.log('did not complete on time');
//	});
//});
