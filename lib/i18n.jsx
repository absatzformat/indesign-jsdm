var i18n = (function (translation) {

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
	'Yes': { de: 'Ja' },
	'No': { de: 'Nein' },
	'File': { de: 'Datei' },
	'Open': { de: 'Öffnen' },
	'Reload': { de: 'Aktualisieren' },
	'Select file': { de: 'Datei auswählen' },
	'Data': { de: 'Daten' },
	'Options': { de: 'Optionen' },
	'Start mapping': { de: 'Mapping starten' },
	'Error': { de: 'Fehler' },
	'checkbox_template_delete': { en: 'Delete selected spread after mapping', de: 'Ausgewählten Druckbogen nach Mapping löschen' },
	'Convert line endings': { de: 'Zeilenenden konvertieren' },
	'Contents': { de: 'Inhalt' },
	'Settings': { de: 'Einstellungen' },
	'General': { de: 'Allgemein' }
});