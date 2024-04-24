<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Coordinate.aspx.cs" Inherits="webpages_CoordTrans" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title></title>
<style>

    /* bg */
    .side{background:url(../../../../js/images/gplaypattern.jpg) repeat;}
    .bg-gplaypattern{background:url(coordinate/images/gplaypattern.png) repeat;}

</style>
</head>
<body class="bg-gplaypattern" onload="init();">
    <div class="wapper">

        <form id="form2" runat="server" class="from-basic-content">
            </form>


        <div id="coordinate-div" class="from-basic-content">
            <div class="from-title" style="text-align:center;"><span class="nav-icon nav-icon-02" ></span>坐標查詢</div>
            <div class="from-block">
                <label>格式&nbsp;
                <select id="coordinate-format">
                    <option value="TWD67">TWD67經緯度</option>
                    <option value="TM2_67">TWD67二度分帶</option>
                    <option value="TWD97">TWD97(WGS84)經緯度</option>
                    <option value="TM2_97">TWD97二度分帶</option>
                </select>
                    </label>

                
                    <div  class="from-item">
                        <span >經緯度&nbsp;</span><input id="coordinate-txt-x" type="text" placeholder="120.64681,24.180936"/>
                        
                        (範例 120.64681,24.180936)
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div class="from-item" style="margin-left:5px;display:none;">
                        緯度&nbsp;<input id="coordinate-txt-y" type="text" />
                    </div>

                

            </div>
            <div class="from-block">
                <input class="btn" id="coordinate-btn" type="submit" value="查詢" onclick="return coordinate.run();"/>
            </div>
            <div class="from-block">
                
                <div id="coordinate-result" class="from-content" style="display:none;">
                    <div class="from-content-title">查詢結果</div>
                    <div id="coordinate-result-content" class="from-content-content"></div>
                    
                </div>
            </div>
        </div>
</body>
</html>

<script src="Coordinate/coordinate.js"></script>
<script>

    function init() {
        
        coordinate.window = parent;
        coordinate.map = parent.map;
    }
</script>