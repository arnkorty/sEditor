seditor
=================

A tiny, simple, no javascript dependencies WYSIWYG rich text editor based on the browser function execCommand.

This project inspired [bootstrap-wysihtml](https://github.com/steveathon/bootstrap-wysiwyg). 

Development is active, and ongoing.

Features
-----------

* Allows a custom built toolbar with no magic markup generators enabling the web site to use all the goodness of Bootstrap
* Does not force any styling - it's all up to you
* Uses standard browser features, no magic non-standard code, toolbar and keyboard configurable to execute any supported [browser command](https://developer.mozilla.org/en/docs/Rich-Text_Editing_in_Mozilla)
* Does not create a separate frame, backup text areas etc - instead keeps it simple and runs everything inline in a DIV
* (Optionally) cleans up trailing whitespace and empty divs and spans
* Requires a modern browser
* Supports mobile devices
* Supports multiple instances
* HTML Sanitization
* Drag and drop files to insert images
* Supports image upload

Styling for mobile devices
--------------------------

This editor should work pretty well with mobile devices, but you'll need to consider the following things when styling it:
- keyboards on mobile devices take a huge part of the screen
- having to scroll the screen to touch the toolbar can cause the editing component to lose focus, and the mobile device keyboard might go away
- mobile devices tend to move the screen viewport around to ensure that the focused element is shown, so it's best that the edit box is glued to the top

For the content attachment editor on MindMup, we apply the following rules to mobile device styling:
- edit box is glued to the top, so the focus doesn't jump around
- toolbar is below the edit box
- on portrait screens, edit box size is 50% of the screen
- on landscape screens, edit box size is 30% of the screen
- as the screen gets smaller, non-critical toolbar buttons get hidden into a "other" menu

Dependencies
------------
* [Font Awesome, just for icons](http://fontawesome.io/)

How to start
------------
```html
<script src="js/seditor.min.js"></script>
<link href="css/style.css" rel="stylesheet" />
<div class='editor'></div>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    sEditor('.editor');
  })
</script>
```
