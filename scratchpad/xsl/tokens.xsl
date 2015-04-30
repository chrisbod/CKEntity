<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:json="http://json.org/">
	<xsl:output indent="no" omit-xml-declaration="yes" method="text" encoding="utf-8"/>
	<xsl:strip-space elements="*"/>
	<xsl:template match="/">
	[<xsl:apply-templates/>]
	</xsl:template>
	<xsl:template match="text()"/>
	<xsl:template match="placeholder">
		{
			"id":"<xsl:value-of select="@id"/>",
			"text":"<xsl:value-of select="@displayName"/>",
			"groups": [
				<xsl:apply-templates/>
			]


		}

	</xsl:template>

	<xsl:template match="group">
		{
			"label": "<xsl:value-of select="label"/>",
			"controls": [
					<xsl:apply-templates/>
			]

		}
		<xsl:if test="position() != last()">,</xsl:if>

	</xsl:template>
	<xsl:template match="radio">
		{ 
			"type": "radio",
			"options": [
				<xsl:apply-templates/>

			]
		}<xsl:if test="position() != last()">,</xsl:if>

	</xsl:template>
	<xsl:template match="item">
		{
			"value": "<xsl:value-of select="@name"/>",
			"text": "<xsl:value-of select="text()"/>"

		}<xsl:if test="position() != last()">,</xsl:if>
	</xsl:template>
	<xsl:template match="select">
		{ 
			"type": "select",
			"options": [
				<xsl:apply-templates/>

			]
		}<xsl:if test="position() != last()">,</xsl:if>

	</xsl:template>
	<xsl:template match="checkboxes">
		{ 
			"type": "checkboxes",
			"boxes": [
				<xsl:apply-templates/>

			]
		}<xsl:if test="position() != last()">,</xsl:if>

	</xsl:template>

</xsl:stylesheet>