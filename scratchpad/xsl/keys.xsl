<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" 
   xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
   xmlns:json="http://json.org/">
   <xsl:output indent="yes" omit-xml-declaration="yes" method="html" encoding="utf-8"/>
   <xsl:strip-space elements="*"/>
   <xsl:template match="/">
	   <html>
	   	<body>
	   		<xsl:apply-templates/>
	   	</body>
	   </html>
	</xsl:template>
   <xsl:template match="keys"><p><xsl:apply-templates/></p></xsl:template>
   <xsl:template match="key"><span><xsl:apply-templates/></span></xsl:template>
   <xsl:template match="options"><xsl:apply-templates/></xsl:template>
   <xsl:template match="option">[<xsl:apply-templates/>]</xsl:template>
   <xsl:template match="placeholder">&lt;<xsl:apply-templates select="text()"/>&gt;</xsl:template>

</xsl:stylesheet>