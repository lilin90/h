'use strict';

/**
 * Function which determines if it is possible to lozengify a given phrase.
 *
 * @param {String} phrase A potential query term.
 *
 * @returns {Bool} True if the input phrase can be lozengified and false otherwise.
 *
 * @example
 * // returns True
 * canLozengify('foo')
 * @example
 * // returns False
 * canLozengify('foo)
 */
function canLozengify(phrase) {
  phrase = phrase.trim();
  // if there is no word
  if (!phrase) {
    return false;
  }
  // if phrase starts with a double quote, it has to end with one
  if (phrase.indexOf('"') === 0 && phrase.indexOf('"', 1) !== phrase.length - 1) {
    return false;
  }
  // if phrase ends with a double quote it has to start with one
  if (phrase.indexOf('"', 1) === phrase.length - 1 && phrase.indexOf('"') !== 0) {
    return false;
  }
  // if phrase starts with a single quote, it has to end with one
  if (phrase.indexOf("'") === 0 && phrase.indexOf("'", 1) !== phrase.length - 1) {
    return false;
  }
  // if phrase ends with a single quote it has to start with one
  if (phrase.indexOf("'", 1) === phrase.length - 1 && phrase.indexOf("'") !== 0) {
    return false;
  }
  return true;
}

/**
 * Function which determines if a phrase can be lozengified as is or
 * if it needs to be divided into a facet name and value first.
 *
 * @param {String} phrase A potential query term.
 *
 * @returns {Bool} True if the input phrase is ready to be
 * lozengified and false otherwise.
 *
 * @example
 * // returns True
 * shouldLozengify('foo:bar')
 * @example
 * // returns False
 * shouldLozengify('foo:"bar')
 */
function shouldLozengify(phrase) {
  var facetName;
  var facetValue;
  var i;

  // if the phrase has a facet and value
  if (phrase.indexOf(':') >= 0) {
    i = phrase.indexOf(':');
    facetName = phrase.slice(0, i).trim();
    facetValue = phrase.slice(i+1, phrase.length).trim();

    if (!canLozengify(facetName)) {
      return false;
    }
    if (facetValue.length > 0 && !canLozengify(facetValue)) {
      return false;
    }
  }
  else if (!canLozengify(phrase)) {
    return false;
  }
  return true;
}

function getLozengeValuesAndIncompleteSearchTerms(queryString) {
  var inputTerms = '';
  var quoted;
  var queryTerms = [];
  queryString.split(' ').forEach(function(term) {
    if (quoted) {
      inputTerms = inputTerms + ' ' + term;
      if (shouldLozengify(inputTerms)) {
        queryTerms.push(inputTerms);
        inputTerms = '';
        quoted = false;
      }
    } else {
      if (shouldLozengify(term)) {
        queryTerms.push(term);
      } else {
        inputTerms = term;
        quoted = true;
      }
    }
  });
  return {
    lozengeValues: queryTerms,
    incompleteInputValue: inputTerms,
  };
}

/**
 * Function which returns individual lozenge from a string.
 *
 * @param {String} queryString A string of query terms.
 *
 * @returns {Array} queryTerms An array of individual query terms.
 *
 * @example
 * // returns ['foo', 'key:"foo bar"', 'gar']
 * getLozengeValues('foo key:"foo bar" gar')
 */
function getLozengeValues(queryString) {
  return getLozengeValuesAndIncompleteSearchTerms(queryString).lozengeValues;
}

/**
 * Function which returns an incomplete quoted sentance from a string.
 *
 * @param {String} queryString A string of query terms.
 *
 * @returns {String} inputTerms A string which starts with a quote but
 * doesnt have an end quote.
 *
 * @example
 * // returns ['"bar gar']
 * getIncompleteInputValue('foo "bar gar')
 */
function getIncompleteInputValue(queryString) {
  return getLozengeValuesAndIncompleteSearchTerms(queryString).incompleteInputValue;
}

module.exports = {
  shouldLozengify: shouldLozengify,
  getLozengeValues: getLozengeValues,
  getIncompleteInputValue: getIncompleteInputValue,
};