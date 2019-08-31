

/**
 * [exports chainable methods for toggling, adding and removing classes from an element]
 * @param  {[DOM node]} el [A DOM node]
 * @return {[Object]}    [An object containing these methods]
 */
module.exports = function classList(el) {
  var classlist = el.classList;

  return {
    toggle: function(classString) {
      classlist.toggle(classString);
      return this;
    },
    add: function(classString) {
      classlist.add(classString);
      return this;
    },
    remove: function(classString) {
      classlist.remove(classString);
      return this;
    }
  };
};
