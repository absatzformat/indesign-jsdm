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
		this.addFilePanel(this.mainGroup);
		this.addDataPanel(this.mainGroup);
		this.addOptionsPanel(this.mainGroup);
		this.addStartButton(this.mainGroup);
	};

	ui.prototype.addMainGroup = function (parent) {

		var group = parent.add('group', undefined, { name: 'main_group' });
		group.orientation = 'column';
		group.alignChildren = 'fill';
		group.margins = 12;

		return group;
	};

	ui.prototype.addProgressbar = function (parent) {

		var bar = parent.add('progressbar', undefined, undefined, undefined, { name: 'progressbar' });
		bar.size = [undefined, 10];

		return bar;
	};

	ui.prototype.addFilePanel = function (parent) {

		var panel = parent.add('panel', undefined, _('File'));
		panel.alignChildren = 'fill';

		panel.add('edittext', undefined, undefined, { name: 'file_path', readonly: true });

		var buttonGroup = panel.add('group');
		buttonGroup.alignChildren = ['fill', 'center'];

		buttonGroup.add('button', undefined, _('Open'), { name: 'select_button' });
		buttonGroup.add('button', undefined, _('Reload'), { name: 'reload_button' });

		return panel;
	};

	ui.prototype.addDataPanel = function (parent) {

		var panel = parent.add('panel', undefined, _('Data'));
		panel.alignChildren = 'fill';

		var view = panel.add('treeview', [undefined, undefined, undefined, 260], undefined, { name: 'data_view' });
		view.itemSize = [undefined, 24];

		return panel;
	};

	ui.prototype.addOptionsPanel = function (parent) {

		var panel = parent.add('panel', undefined, _('Options'));
		panel.alignChildren = 'left';

		panel.add('checkbox', undefined, _('checkbox_template_delete'), { name: 'delete_template_checkbox' });

		return panel;
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