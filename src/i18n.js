const { _path } = require('./utils')
const fs = require('fs')
const logger = require('./logger')

function getString(key, language = 'en', module = null)
{
	// TODO: Get from module if module !== null

	const path = _path('/src/locales/' + language + '.json')

	if(fs.existsSync(path)) {
		try {
			const locale = require(path)

			if(typeof(locale[key]) !== 'undefined') {
				return locale[key]
			}

			logger.log("Can't find key " + key + " for locale [" + language + "].")
		} catch (err) {
			logger.log(err)
			logger.log("Can't load locale [" + language + "].")
		}
	} else {
		logger.log("Can't load locale [" + language + "].")
	}

	if(language !== 'en')
		return getString(key, 'en', module)

	return null
}

module.exports = getString