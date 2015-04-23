//copied from sample file xhtmlstyle.html
//currently inline after page load
document.getElementById('editor1').innerHTML = 'some other text <br/><span data-entityId="Entity0" class="entity" contenteditable="false" tabindex="-1">[preexisting]</span>some text'
      
CKEDITOR.replace( 'editor1', {
					/*
					 * Style sheet for the contents
					 */
					contentsCss: 'css/xhtml.css',

					/*
					 * Special allowed content rules for spans used by
					 * font face, size, and color buttons.
					 *
					 * Note: all rules have been written separately so
					 * it was possible to specify required classes.
					 */
					/*extraAllowedContent: 'span(!FontColor1);span(!FontColor2);span(!FontColor3);' +
						'span(!FontColor1BG);span(!FontColor2BG);span(!FontColor3BG);' +
						'span(!FontComic);span(!FontCourier);span(!FontTimes);' +
						'span(!FontSmaller);span(!FontLarger);span(!FontSmall);span(!FontBig);span(!FontDouble)',*/
					allowedContent: true,
					/*
					 * Core styles.
					 */
					coreStyles_bold: {
						element: 'span',
						attributes: { 'class': 'Bold' }
					},
					coreStyles_italic: {
						element: 'span',
						attributes: { 'class': 'Italic' }
					},
					coreStyles_underline: {
						element: 'span',
						attributes: { 'class': 'Underline' }
					},
					coreStyles_strike: {
						element: 'span',
						attributes: { 'class': 'StrikeThrough' },
						overrides: 'strike'
					},
					coreStyles_subscript: {
						element: 'span',
						attributes: { 'class': 'Subscript' },
						overrides: 'sub'
					},
					coreStyles_superscript: {
						element: 'span',
						attributes: { 'class': 'Superscript' },
						overrides: 'sup'
					},

					/*
					 * Font face.
					 */

					// List of fonts available in the toolbar combo. Each font definition is
					// separated by a semi-colon (;). We are using class names here, so each font
					// is defined by {Combo Label}/{Class Name}.
					font_names: 'Comic Sans MS/FontComic;Courier New/FontCourier;Times New Roman/FontTimes',

					// Define the way font elements will be applied to the document. The "span"
					// element will be used. When a font is selected, the font name defined in the
					// above list is passed to this definition with the name "Font", being it
					// injected in the "class" attribute.
					// We must also instruct the editor to replace span elements that are used to
					// set the font (Overrides).
					font_style: {
						element: 'span',
						attributes: { 'class': '#(family)' },
						overrides: [
							{
								element: 'span',
								attributes: {
									'class': /^Font(?:Comic|Courier|Times)$/
								}
							}
						]
					},

					/*
					 * Font sizes.
					 */
					fontSize_sizes: 'Smaller/FontSmaller;Larger/FontLarger;8pt/FontSmall;14pt/FontBig;Double Size/FontDouble',
					fontSize_style: {
						element: 'span',
						attributes: { 'class': '#(size)' },
						overrides: [
							{
								element: 'span',
								attributes: {
									'class': /^Font(?:Smaller|Larger|Small|Big|Double)$/
								}
							}
						]
					} ,

					/*
					 * Font colors.
					 */
					colorButton_enableMore: false,

					colorButton_colors: 'FontColor1/FF9900,FontColor2/0066CC,FontColor3/F00',
					colorButton_foreStyle: {
						element: 'span',
						attributes: { 'class': '#(color)' },
						overrides: [
							{
								element: 'span',
								attributes: {
									'class': /^FontColor(?:1|2|3)$/
								}
							}
						]
					},

					colorButton_backStyle: {
						element: 'span',
						attributes: { 'class': '#(color)BG' },
						overrides: [
							{
								element: 'span',
								attributes: {
									'class': /^FontColor(?:1|2|3)BG$/
								}
							}
						]
					},

					/*
					 * Indentation.
					 */
					indentClasses: [ 'Indent1', 'Indent2', 'Indent3' ],

					/*
					 * Paragraph justification.
					 */
					justifyClasses: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyFull' ],

					/*
					 * Styles combo.
					 */
					stylesSet: [
						{ name: 'Strong Emphasis', element: 'strong' },
						{ name: 'Emphasis', element: 'em' },

						{ name: 'Computer Code', element: 'code' },
						{ name: 'Keyboard Phrase', element: 'kbd' },
						{ name: 'Sample Text', element: 'samp' },
						{ name: 'Variable', element: 'var' },

						{ name: 'Deleted Text', element: 'del' },
						{ name: 'Inserted Text', element: 'ins' },

						{ name: 'Cited Work', element: 'cite' },
						{ name: 'Inline Quotation', element: 'q' }
					],
					      toolbar :
      [
         ['entity','Styles', 'Format', 'Bold', 'Italic'],['Undo','Redo']
      ],
      extraPlugins: 'entity,clipboard'
});

