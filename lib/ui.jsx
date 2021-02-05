var Ui = (function () {

	var _ = i18n;

	var ui = function () {

		this.window = new Window('palette', _('{ JSON } Data Mapper'), undefined, { borderless: false });
		// this.window.bounds = [100, 100, 480, 490];
		// this.window.size = [400, undefined];
		this.window.preferredSize = [360, 400];
		this.window.margins = 0;
		// this.window.opacity = 0.9;
		this.window.alignChildren = 'fill';

		this.mainGroup = this.addMainGroup(this.window);
		this.addProgressbar(this.mainGroup);
		this.mainPanel = this.addMainPanel(this.mainGroup);
		this.addFilePanel(this.mainPanel.children[0]);
		this.addDataPanel(this.mainPanel.children[0]);
		this.addOptionsPanel(this.mainPanel.children[1]);
		this.addLineEndingsPanel(this.mainPanel.children[1]);
		this.addLogPanel(this.mainPanel.children[2]);
		this.addStartButton(this.mainGroup);
	};

	ui.prototype.addMainGroup = function (parent) {

		var group = parent.add('group', undefined, { name: 'main_group' });
		group.orientation = 'column';
		group.alignChildren = 'fill';
		group.margins = 12;
		group.spacing = 12;

		return group;
	};

	ui.prototype.addMainPanel = function (parent) {

		var panel = parent.add('tabbedpanel');
		panel.alignChildren = 'fill';
		panel.margins = [0, 12, 0, 0];
		panel.spacing = 0;

		var dataTab = panel.add('tab', undefined, _('Data'));
		dataTab.alignChildren = 'fill'
		dataTab.margins = 0;
		dataTab.spacing = 12;

		var settingsTab = panel.add('tab', undefined, _('Settings'));
		settingsTab.alignChildren = 'fill';
		settingsTab.margins = 0;
		settingsTab.spacing = 12;

		var logsTab = panel.add('tab', undefined, _('Logs'));
		logsTab.alignChildren = 'fill';
		logsTab.margins = [12, 2, 0, 0];
		// logsTab.spacing = 12;

		return panel;
	};

	ui.prototype.addProgressbar = function (parent) {

		var bar = parent.add('progressbar', undefined, undefined, undefined, { name: 'progressbar' });
		bar.size = [undefined, 10];

		return bar;
	};

	ui.prototype.addFilePanel = function (parent) {

		var panel = parent.add('panel', undefined, _('File'));
		panel.alignChildren = 'fill';
		panel.margins = [12, 16, 12, 12];

		panel.add('edittext', undefined, undefined, { name: 'file_path', readonly: true });

		var buttonGroup = panel.add('group');
		buttonGroup.alignChildren = ['fill', 'center'];

		buttonGroup.add('button', undefined, _('Open'), { name: 'select_button' });
		buttonGroup.add('button', undefined, _('Reload'), { name: 'reload_button' });

		return panel;
	};

	ui.prototype.addDataPanel = function (parent) {

		var panel = parent.add('panel', undefined, _('Contents'));
		panel.alignChildren = 'fill';
		panel.margins = [12, 16, 12, 12];

		var view = panel.add('treeview', [undefined, undefined, undefined, 260], undefined, { name: 'data_view' });
		view.itemSize = [undefined, 24];

		return panel;
	};

	ui.prototype.addOptionsPanel = function (parent) {

		var panel = parent.add('panel', undefined, _('General'));
		panel.alignChildren = 'left';
		panel.margins = [12, 16, 12, 12];

		panel.add('checkbox', undefined, _('checkbox_template_delete'), { name: 'delete_template_checkbox' });

		return panel;
	};

	ui.prototype.addLineEndingsPanel = function (parent) {

		var panel = parent.add('panel', undefined, _('Convert line endings'));
		panel.orientation = 'row';
		panel.margins = [12, 16, 12, 12];
		panel.alignChildren = ['fill', 'left'];

		panel.add('radiobutton', undefined, _('No'), { name: 'endings_replace_no' }).value = true;
		panel.add('radiobutton', undefined, _('LF ( \\n )'), { name: 'endings_replace_newline' });
		panel.add('radiobutton', undefined, _('CR ( \\r )'), { name: 'endings_replace_return' });

		return panel;
	};

	ui.prototype.addLogPanel = function (parent) {

		var edit = parent.add('edittext', undefined, undefined, { name: 'log_panel', readonly: true, multiline: true, borderless: true });
		edit.alignment = ['fill', 'fill'];
	};

	ui.prototype.addStartButton = function (parent) {

		var button = parent.add('button', undefined, _('Start mapping'), { name: 'start_button' });
		button.size = [undefined, 40];
		// button.enabled = false;

		return button;
	};

	ui.prototype.find = function (elem) {
		return this.window.findElement(elem);
	};

	ui.prototype.show = function () {
		this.window.show();
	};

	ui.prototype.hide = function () {
		this.window.hide();
	};

	ui.prototype.update = function () {
		if (this.window.visible) {
			this.window.update();
		}
	};

	return ui;

})();