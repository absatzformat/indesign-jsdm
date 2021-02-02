JSDM.App = (function () {

	var _ = JSDM.i18n;

	/** ! returns global for undefined and null */
	var typeOf = function (obj) {
		var type = Object.prototype.toString.call(obj);
		return type.split(' ')[1].slice(0, -1).toLowerCase();
	};

	var hasProperty = function (obj, key) {
		return Object.prototype.hasOwnProperty.call(obj, key);
	};

	/** returns undefined if path could not be resolved */
	var getObjectValue = function (obj, path) {
		var keys = path.split('.');
		while (keys.length && obj) { obj = obj[keys.shift()]; };
		return obj;
	};

	var jsdm = function () {

		this.ui = new JSDM.Ui();
		this.selectedFile = null;
		this.selectedData = null;
		this.data = null;
	};

	jsdm.prototype.init = function () {
		this.initEvents();
		this.ui.show();
	};

	jsdm.prototype.initEvents = function () {

		this.ui.find('select_button').addEventListener('click', this.selectButtonClick.bind(this));
		this.ui.find('reload_button').addEventListener('click', this.reloadButtonClick.bind(this));
		this.ui.find('start_button').addEventListener('click', this.startButtonClick.bind(this));
	};

	jsdm.prototype.selectButtonClick = function () {

		this.selectInputFile();
	};

	jsdm.prototype.reloadButtonClick = function () {

		this.processSelectedFile();
	};

	jsdm.prototype.startButtonClick = function () {

		this.startDataMapping();
	};

	jsdm.prototype.selectInputFile = function () {

		var group = this.ui.find('main_group');

		group.enabled = false;

		var file = File.openDialog(_('Select file'), 'JSON:*.json');

		group.enabled = true;

		// TODO: check encoding
		// file.isEncodingAvailable

		if (file) {

			this.setSelectedFile(file);
			this.processSelectedFile();
		}
	};

	jsdm.prototype.setSelectedFile = function (file) {

		this.selectedFile = file;
		this.ui.find('file_path').text = file.fsName;
	};

	// TODO: maybe read file line by line and process json on the fly with oboe.js
	jsdm.prototype.processSelectedFile = function () {

		// clear view
		this.ui.find('data_view').removeAll();

		if (this.selectedFile && this.selectedFile.exists) {

			var file = this.selectedFile;

			// TODO: read file line by line and update progressbar

			file.open('r');
			file.seek(0);

			var bytes = file.read();

			file.close();

			this.data = JSON.parse(bytes);

			this.updateDataView();
		}
	};

	jsdm.prototype.updateDataView = function () {

		var view = this.ui.find('data_view');
		var data = this.data;
		var name = this.selectedFile.name;

		this.mapObjectToNode(data, view, name);

		if (view.items.length) {
			view.items[0].expanded = true;
		}
	};

	jsdm.prototype.mapObjectToNode = function (object, node, name) {

		var type = typeOf(object);

		if (type === 'object' || type === 'array') {

			var isArray = type === 'array';
			var subNode = node.add('node', name + ': ' + (isArray ? '[ ]' : '{ }'));

			subNode.dataRef = object;

			if (isArray) {
				for (var i = 0; i < object.length; i++) {
					this.mapObjectToNode(object[i], subNode, '' + i);
				}
			}
			else {
				for (var key in object) {
					this.mapObjectToNode(object[key], subNode, key);
				}
			}
		}
		else {
			var value = '' + object;
			if (value.length > 20) {
				value = value.substr(0, 20) + '...';
			}
			var item = node.add('item', name + ': ' + value);
			item.enabled = false;
		}
	};

	jsdm.prototype.startDataMapping = function () {

		var view = this.ui.find('data_view');
		var selectedItem = view.selection;

		if (selectedItem && hasProperty(selectedItem, 'dataRef')) {

			app.doScript(function () {

				try {
					this.doDataMapping(selectedItem.dataRef);
				}
				catch (e) {
					alert(e.toString() + ', ' + e.line, _('Error'));
				}
			}.bind(this), ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, _('Data mapping'));
		}
	};

	jsdm.prototype.doDataMapping = function (data) {

		if (typeOf(data) !== 'array') {
			data = [data];
		}

		var progressBar = this.ui.find('progressbar');
		var step = 100 / data.length;

		// app.activeDocument.documentPreferences.allowPageShuffle
		// app.activeDocument.documentPreferences.facingPages

		// var templatePage = app.activeWindow.activePage;
		var templateSpread = app.activeWindow.activeSpread;
		// var templatePage = app.activeDocument.spreads[0];
		// var xmlTags = app.activeDocument.xmlTags;

		// check spread
		// TODO: verify what to do if spread is incomplete

		if (
			templateSpread.allowPageShuffle &&
			app.activeDocument.documentPreferences.facingPages &&
			templateSpread.pages.length < 2
		) {
			templateSpread.pages.add();
		}

		var currentSpread = templateSpread;

		for (var i = 0; i < data.length; i++) {

			var newSpread = templateSpread.duplicate(LocationOptions.AFTER, currentSpread);

			for (var j = 0; j < newSpread.pages.length; j++) {
				this.mapDataToPage(newSpread.pages[j], data[i]);
			}

			currentSpread = newSpread;

			progressBar.value = (i + 1) * step;
		}

		// remove template page if desired
		if (false) {
			templatePage.remove();
		}

		progressBar.value = 0;
	};

	jsdm.prototype.mapDataToPage = function (page, data) {

		var pageItems = page.allPageItems;

		for (var i = 0; i < pageItems.length; i++) {

			var pageItem = pageItems[i];

			if (pageItem.isValid) {

				var xmlItem = pageItem.associatedXMLElement;

				if (xmlItem && xmlItem.isValid) {

					var tagName = xmlItem.markupTag.name;
					var value = getObjectValue(data, tagName);

					if (value !== undefined) {

						switch (pageItem.reflect.name) {
							case 'TextFrame': // text
								pageItem.contents = value.toString();
								break;
							case 'Rectangle': // images
							case 'Polygon':
							case 'Oval':
								var file = this.resolveFile(value, this.selectedFile);
								if (file && file.exists) {
									pageItem.place(file);
								}
								break;
						}
					}
				}
			}
		}
	};

	jsdm.prototype.resolveFile = function (path, referenceFile) {

		// check absolute path
		var file = new File(path);

		if (!file.exists && referenceFile instanceof File) {

			// check path relative to reference file
			file.changePath(decodeURI(referenceFile.path));
			file.changePath(path);
		}

		if (file.exists) {
			return file;
		}

		return null;
	};

	return jsdm;

})();