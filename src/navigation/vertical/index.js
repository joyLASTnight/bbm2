/*

Array of object

Top level object can be:
1. Header
2. Group (Group can have navItems as children)
3. navItem

* Supported Options

/--- Header ---/

header

/--- nav Grp ---/

title
icon (if it's on top level)
tag
tagVariant
children

/--- nav Item ---/

icon (if it's on top level)
title
route: [route_obj/route_name] (I have to resolve name somehow from the route obj)
tag
tagVariant

*/
import dashboard from './dashboard'
import master from './master'
import transaksi from './transaksi'
import keuangan from './keuangan'
import kepegawaian from './kepegawaian'

// Array of sections
export default [...dashboard, ...master, ...transaksi, ...keuangan, ...kepegawaian]
