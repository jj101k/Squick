/* Squick(...)
 *
 * Main API entry point, creates elements. Syntax is broadly:
 *
 * Squick(name, <attributes,> <contents>);
 *
 * Both the attributes and the contents are entirely optional.
 *
 * - name: The HTML element name, goes straight to document.createElement()
 * - attributes: A map of javascript DOM element property names to
 *   values, called as element[key] = value. Plain map values (eg.
 *   for the "style" property) are handled specially by recursing
 *   rather than assigning directly. Beware that class (className)
 *   and style.float (style.cssFloat / style.styleFloat) do not
 *   have the names you might expect! For compatibility, setting
 *   style.cssFloat or style.styleFloat will set both.
 * - contents: An array of items which are vaguely like DOM nodes,
 *   or just a single such item. Plain text (and other misc objects)
 *   will be converted into DOM text nodes; everything which looks
 *   like a DOM node will be kept as-is.
 *
 * If you provide an empty name, you'll get back the return of
 * document.createDocumentFragment(). The attributes will still be
 * added but won't be of much use to you, and beware that document
 * fragments themselves may not be retained once they have been
 * added to the node tree.
 *
 * You can use this to effectively create a DOM text node, ie:
 *   Squick("", "This is some text");
 */
function Squick() {
  var node;
  function is_plain_map(a) {
    return(typeof a == "object" && !a.prototype);
  }
  function copy_map_tree(a, b) {
    for(var k in a) {
      if(is_plain_map(a[k])) {
        b[k] = b[k] || {};
        copy_map_tree(a[k], b[k]);
      } else b[k] = a[k];
    }
  }
  var name, attributes={}, contents=[];
  var parser = Squick.typedArguments([
    {
      parse: function(a) {
        name = a;
      }
    },
    {
      test: is_plain_map,
      parse: function(a) {
        attributes = a;
      },
    },
    {
      parse: function(a) {
        contents = (a.constructor === Array) ? a : [a];;
      },
    }
  ]);
  parser(arguments);

  var node = name ? document.createElement(name) : document.createDocumentFragment();
  copy_map_tree(attributes, node);
  contents.forEach(function(item) {
    var child;
    if(typeof item.nodeType == "undefined")
      child = document.createTextNode(item);
    else child = item;
    node.appendChild(child);
  });
  return node;
}
/* Squick.typedArguments(argument_handers)
 *
 * Returns a function which, when called with your arguments property,
 * will run through and parse them all into whatever variables
 * you're after. argument_handlers is an array of objects with
 * properties:
 *
 * - parse: A function which does your own desired work on the
 *   current argument.
 * - test: A function (given the current argument) which returns
 *   false if this handler is to be skipped. If not provided, it
 *   will be considered to return true.
 */
Squick.typedArguments = function(argument_handlers) {
  var f = function() {};
  argument_handlers.reverse().forEach(function(h) {
    f = function(args) {
      if(args.length == 0) return;
      if( (!h.test) || h.test(args[i])) {
        h.parse(args[i]);
        args = args.slice(1);
      }
      return f(args);
    };
  });
};
