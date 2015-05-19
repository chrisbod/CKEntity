Glossary

Entity - Christian's term to cover tokens, conditionals and user conditionals - i.e. things in a document that are not simply user input/text/images etc

Rules (translations and conditionals) - The rules/logic applied to conditionals (and user conditionals) to determine whether they are displayed

Properties (token) - the user configurable properties of a token e.g. format to display as

Token - rendered as <token>, formerly known as placeholder [best get Mathias to specify this more precisely] - tokens can be anything from a table to a currency symbol - their available/configurable properties can therefore be highly variable

Translatable - Christian's term for a Translation so he can differentiate it in his head from the more general english term translation 

Translation - formely known and often to referred to as a key - a predefined sentence/paragraph that the system may translate automatically. may contain conditionals and tokens which can have their own properties/rules set but the text of which cannot be edited

Conditional - A part of the document that will appear subject to the rules/logic defined by the user for it. A conditional is usually a subpart of a translatable but users can create their own. Conditionals have editable rules but no properties

User Conditional - [User conditional] A user created conditional (currently done by typing '[' but should also be available from a button in the editor). User conditionals should in theory be able to contain any number of nested entities including tokens and translatables...though there may be a great many bugs involved in complex nesting...


Key - former term for a translation

Placeholder - former term for a token

Pagebreak - these are represented in the browser by a horizontal bar inserted by the user

Tooltip - The element that appears when you select/click on an entity to allow you to go to the dialog to edit it's properties etc

Dialog - In the context of this project the term dialog refers to the dialogs generated for custom WallStreetDocs functionality - if you are referring to a general editor dialog then call it an editor dialog...

Bug - Something breaks!
Defect - Something is missing!


Visual Defects - When something looks bad/wrong but does not really affect useability(UX)

UX Defect/Issue/Problem - Issues that are behaviorially annoying/counterintuitive/affect useability but do not affect actual funtionality - if something does not behave as you expect it should or can't be found easily etc its a UX problem

Enhancement - A proposal for improving the application - i.e. a nice to have - if something is already working but it would be nice to improve then it's not a bug/defect it's an enhancement - note that some 'enhancements' may actually have been part of the original specification therefore they are in fact bugs/defects - for instance the ability to select an area and turn it into a conditional was part of the original spec but is not currently implemented - therefore at this stage it is a defect - defects can be downgraded to enhancements but enhancements shouldnt be promoted to bugs - they should have bugs reported about them instead!

The below need clarification for Christian:

Document heading - The heading that appears on the first page of a document
Page heading - headings that appear after the first page
Document footer - the footer that appears on the first page of a document
Page footer - footers that appear on any subsequent pages


