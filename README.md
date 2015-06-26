# ashurbanipal.web.ui - Javascript client UI to the ashurbanipal.web interfaces

## DESCRIPTION

The UI here is a very simple ('cause I'm not very good) single-page
application built using ExtJS (and an old one, at that.) Entering a
search term should result in a drop-down list of matching
texts. Selecting a text from the list displays its metadata in the
space next to the text field. Combined, style, and topic
recommendations are also shown in rows, below the text field and
details.

## FILES

* index.html: the skeletal application page

* pg.js: the Javascript code

* about.html: a secondary page

* left.svg, right.svg: arrows for viewing more recommendations.

* ext-at.js, ext-patches.js: Fixes from a friend.

### Further components

* Ashurbanipal.web.jmx: This file is a JMeter test plan for poking the
  application.

* nginx/nginx.conf: This is a Nginx configuration file used to
  configure the HTTP server for local testing.

## SEE ALSO

* [ashurbanipal.web](https://github.com/tmmcguire/ashurbanipal.web):
  Java Servlets supporting the web application.

* [ashurbanipal](https://github.com/tmmcguire/ashurbanipal):
  Applications to generate the data set on which recommendations are based.

## AUTHOR

Tommy M. McGuire wrote this.

## LICENSE

GNU GPLv2 or later.
