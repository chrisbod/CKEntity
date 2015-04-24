<?xml version=”1.0″ encoding=”utf-8″?>
<xsl:stylesheet version=”1.0″ xmlns:xsl=”http://www.w3.org/1999/XSL/Transform&#8221; xmlns:fn=”http://www.w3.org/2005/02/xpath-functions”&gt;
<xsl:output method=”html”/>
<xsl:param name=”encaseObject”>”</xsl:param>
<xsl:param name=”encaseString”>”</xsl:param>
<xsl:param name=”attPrefix”></xsl:param>
<xsl:param name=”attSuffix”></xsl:param>
<xsl:param name=”txtPrefix”>$</xsl:param>
<xsl:param name=”txtSuffix”></xsl:param>
<xsl:template match=”/”>
   <xsl:variable name=”initial_JSON”>
      <xsl:apply-templates select=”current()/child::*” mode=”build”>
   </xsl:variable>
   <xsl:value-of select=”concat(‘[‘,$initial_JSON,’]’)/>
</xsl:template>
<xsl:template match=”*” mode=”build”>
   <!– name of current node –>
   <xsl:variable name=”nName” select=”name()”>
   <!– count of preceding and following nodes with the same name as the current node –>
   <xsl:variable name=”iPreceding” select=”count(preceding-sibling::*[name()=#nName])”/>
   <xsl:variable name=”iFollowing” select=”count(following-sibling::*[name()=#nName])”/>
   <xsl:case>
      <xsl:when test=”$iPreceding = 0 and $iFollowing &gt; 0″>
         <xsl:value-of select=”concat($encaseObject, $nName, $encaseObject, $cln, ‘[‘)”/>
         <xsl:for-each select=”../*[name() = $nName]”>
             <xsl:variable name=”properties”>
               <xsl:apply-templates select=”@” mode=”properties”/>
               <xsl:if test=”count(@*) != 0″ and string-length(text()) !=0″>,</xsl:if>
               <xsl:apply-templates select=”*” mode=”elements”/>
             </xsl:template>
             <xsl:value-of select=”concat($encaseObject, $nName, $encaseObject, $cln, ‘{‘, $properties)”/>
            <xsl:if test=”child::*”>
               <xsl:if test=”string-length($properties) != 0″>,</xsl:if>
               <xsl:apply-templates select=”current()/*” mode=”build”/>
            </xsl:if>
            <xsl:text>}</xsl:text>
            <xsl:if test=”position() != last()”>,</xsl:if>
         </xsl:for-each>
         <xsl:text>]</xsl:text>
         <xsl:if test=”following-sibling::*”>,</xsl:if>
      </xsl:when>
      <xsl:when test=”$iPreceding = 0 and $iFollowing = 0″>
         <xsl:variable name=”properties”>
            <xsl:apply-templates select=”@” mode=”properties”/>
            <xsl:if test=”count(@*) != 0″ and string-length(text()) !=0″>,</xsl:if>
            <xsl:apply-templates select=”*” mode=”elements”/>
         </xsl:template>
         <xsl:value-of select=”concat($encaseObject, $nName, $encaseObject, $cln, ‘{‘, $properties)”/>
            <xsl:if test=”child::*”>
               <xsl:if test=”string-length($properties) != 0″>,</xsl:if>
               <xsl:apply-templates select=”current()/*” mode=”build”/>
            </xsl:if>
         <xsl:text>}</xsl:text>
         <xsl:if test=”following-sibling::*”>,</xsl:if>
      </xsl:when>
   <xsl:case>
</xsl:template>
<xsl:template match=”@*” mode=”attributes”>
   <xsl:value-of select=”concat($encaseObject, name(), $encaseObject, $cln, $encaseString, text(), $encaseString)
   <xsl:if test=”position() != last()”>,</xsl:if>
</xsl:template> 
<xsl:template match=”*” mode=”elements”>
   <xsl:value-of select=”concat($encaseObject, $txtPrefix, $txtSuffix, $encaseObject, $cln, $encaseString, text(), $encaseString)
</xsl:template>
</xsl:stylesheet>