JSDM.i18n = (function (translation) {

	return function () {

		var args = [].slice.call(arguments);
		var key = args[0];

		if (typeof key !== 'string') {
			throw TypeError('Invalid translation string')
		}

		args[0] = translation[key] ? translation[key] : { en: key };

		return localize.apply(localize, args);
	};

})({
	'File': { de: 'Datei' },
	'Open': { de: 'Öffnen' },
	'Reload': { de: 'Aktualisieren' },
	'Select file': { de: 'Datei auswählen' },
	'Data': { de: 'Daten' },
	'Options': { de: 'Optionen' },
	'Start mapping': { de: 'Mapping starten' }
});