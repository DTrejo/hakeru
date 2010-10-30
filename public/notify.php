
<html> 
    <head> 
        <style> 
            body {
                font-family: Arial;
                font-size: 10pt;
				background-color: #f0edea;
            }
			a {
				color: #000;
				text-decoration: none;
			}
        </style> 
    </head> 
<body> 
    
   <a href="http://sridatta.ath.cx:8080/<?=$_GET[pipe]?>/#<?=$_GET['hash']?>" target="_blank">
 
    <b><?=$_GET[title]?></b><br /> 
    
    <?=$_GET[msg]?><br />    
   </a> 
 
</body> 
</html>