var App = (function () {

	var _ = i18n;

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

		this.ui = new Ui();

		this.progressBar = this.ui.find('progressbar');
		this.dataView = this.ui.find('data_view');
		this.logPanel = this.ui.find('log_panel');

		this.endingsNo = this.ui.find('endings_replace_no');
		this.endingsNewline = this.ui.find('endings_replace_newline');

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

	jsdm.prototype.handleError = function (error) {

		// alert(JSON.stringify(error));
		// alert(error.toString(), _('Error'));
		this.log(_('Error') + ': ' + error.toString() + '\n');
	};

	jsdm.prototype.processSelectedFile = function () {

		// clear view
		this.dataView.removeAll();

		if (this.selectedFile && this.selectedFile.exists) {

			var file = this.selectedFile;

			this.log('Loading file ' + file.name + '...');

			file.open('r');
			file.seek(0);

			var bytes = file.read();

			file.close();

			this.log(' ' + bytes.length + ' bytes\n');

			try {
				this.data = JSON.parse(bytes);
				this.updateDataView();
			}
			catch (err) {
				this.data = null;
				this.handleError(err);
			}
		}
	};

	jsdm.prototype.updateDataView = function () {

		var data = this.data;
		var name = this.selectedFile.name;

		// some random step, so we can see something
		var step = this.selectedFile.length ? (2000 / this.selectedFile.length) : 0;

		this.mapObjectToNode(data, this.dataView, name, step);

		this.progressBar.value = 100;

		if (this.dataView.items.length) {
			this.dataView.items[0].expanded = true;
		}

		this.progressBar.value = 0;
	};

	jsdm.prototype.mapObjectToNode = function (object, node, name, step) {

		this.progressBar.value += step;
		// this.ui.update();

		var type = typeOf(object);

		if (type === 'object' || type === 'array') {

			var isArray = type === 'array';
			var subNode = node.add('node', name + ': ' + (isArray ? '[ ]' : '{ }'));

			subNode.dataRef = object;

			if (isArray) {
				for (var i = 0; i < object.length; i++) {
					this.mapObjectToNode(object[i], subNode, '' + i, step);
				}
			}
			else {
				for (var key in object) {
					this.mapObjectToNode(object[key], subNode, key, step);
				}
			}
		}
		else {
			var value = this.truncateString('' + object, 20);
			var item = node.add('item', name + ': ' + value);
			item.enabled = false;
		}
	};

	jsdm.prototype.startDataMapping = function () {

		var selectedItem = this.dataView.selection;

		if (selectedItem && hasProperty(selectedItem, 'dataRef')) {

			app.doScript(function () {

				try {
					this.doDataMapping(selectedItem.dataRef);
				}
				catch (err) {
					this.handleError(err);
				}
			}.bind(this), ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, _('Data mapping'));
		}
	};

	jsdm.prototype.doDataMapping = function (data) {

		if (typeOf(data) !== 'array') {
			data = [data];
		}

		var step = data.length ? (100 / data.length) : 100;

		// app.activeDocument.documentPreferences.allowPageShuffle
		// app.activeDocument.documentPreferences.facingPages

		// var templatePage = app.activeWindow.activePage;

		// var templatePage = app.activeDocument.spreads[0];
		// var xmlTags = app.activeDocument.xmlTags;

		var templateSpread = app.activeWindow.activeSpread;
		if (templateSpread instanceof MasterSpread) {
			return;
		}

		// TODO: verify what to do if spread is incomplete

		if (
			templateSpread.allowPageShuffle &&
			app.activeDocument.documentPreferences.facingPages &&
			templateSpread.pages.length < 2
		) {
			templateSpread.pages.add();
		}

		// TODO: option to override master page items

		// for (var i = 0; i < templateSpread.pages.length; i++) {
		// 	var page = templateSpread.pages[i];
		// 	if(page.appliedMaster instanceof MasterSpread){
		// 		try{
		// 			page.appliedMaster.pageItems.everyItem().override(page);
		// 			page.pageItems.everyItem().detach();
		// 		}catch(err){

		// 		}
		// 	}
		// }

		var currentSpread = templateSpread;

		for (var i = 0; i < data.length; i++) {

			var newSpread = templateSpread.duplicate(LocationOptions.AFTER, currentSpread);

			for (var j = 0; j < newSpread.pages.length; j++) {
				this.mapDataToPage(newSpread.pages[j], data[i]);
			}

			currentSpread = newSpread;

			this.progressBar.value = (i + 1) * step;
			// this.ui.update();
		}

		// remove template page if desired
		if (this.ui.find('delete_template_checkbox').value) {
			templateSpread.remove();
		}

		this.progressBar.value = 0;
	};

	jsdm.prototype.mapDataToPage = function (page, data) {

		var pageItems = page.allPageItems;

		for (var i = 0; i < pageItems.length; i++) {

			var pageItem = pageItems[i];

			if (!pageItem.isValid) {
				continue;
			}

			var xmlItem = pageItem.associatedXMLElement;

			if (!xmlItem || !xmlItem.isValid) {
				continue;
			}

			var tagName = xmlItem.markupTag.name;
			var dataValue = getObjectValue(data, tagName);

			if (dataValue === undefined) {
				continue;
			}

			switch (pageItem.reflect.name) {

				case 'TextFrame': // text
					var stringArray = this.getStringArray(dataValue);
					for (var j = 0; j < stringArray.length; j++) {
						stringArray[j] = this.ensureLineEndings(stringArray[j]);
					}
					pageItem.contents = stringArray.join(', ');
					break;
				case 'Rectangle': // images
				case 'Polygon':
				case 'Oval':
					var stringArray = this.getStringArray(dataValue);
					if (stringArray.length) {
						var file = this.resolveFile(stringArray[0], this.selectedFile);
						if (file) {
							this.tryPlaceFile(pageItem, file);
						}
					}
					break;
			}
		}
	};

	jsdm.prototype.ensureLineEndings = function (str) {

		if (this.endingsNo.value === false) {
			var replace = '\r';
			if (this.endingsNewline.value === true) {
				replace = '\n';
			}
			str = str.replace(/\r?\n/g, replace);
		}

		return str;
	};

	jsdm.prototype.truncateString = function (str, length, elip) {

		if (str.length > length) {
			str = str.substr(0, length) + (typeOf(elip) === 'string' ? elip : '...');
		}
		return str;
	};

	jsdm.prototype.getStringArray = function (object) {

		var strings = [];
		var type = typeOf(object);

		switch (type) {
			case 'object':
				this.log(_('Error') + ': Trying to get string from Object');
				break;
			case 'array':
				for (var i = 0; i < object.length; i++) {
					var subType = typeOf(object[i]);
					if (subType === 'string' || subType === 'number') {
						strings.push('' + object[i]);
					}
				}
				break;
			default:
				strings.push('' + object);
		}

		return strings;
	};

	jsdm.prototype.tryPlaceFile = function (pageItem, file) {
		if (pageItem.isValid && file.exists) {
			try {
				pageItem.place(file);
			}
			catch (err) {
				this.handleError(err);
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

	jsdm.prototype.log = function (str) {
		this.logPanel.text += str;
	};

	return jsdm;

})();