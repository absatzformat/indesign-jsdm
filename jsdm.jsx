// https://www.indesignjs.de/extendscriptAPI/indesign-latest
// https://adobeindd.com/view/publications/a0207571-ff5b-4bbf-a540-07079bd21d75/92ra/publication-web-resources/pdf/scriptui-2-16-j.pdf

//@target indesign
//@targetengine jsdm
//@strict on

//@include "lib/polyfills.js"

(function (context) {

	//@include "lib/i18n.jsx"
	//@include "lib/ui.jsx"
	//@include "lib/app.jsx"

	var dir = decodeURI(File($.fileName).path);

	if (File(dir + '/.dev').exists || !context.JSDM) {
		context.JSDM = new App();
	}

	context.JSDM.init();

})(this);