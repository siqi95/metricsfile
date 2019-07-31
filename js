var count=0;
var valuenew = 0;
var workingbutton = [];

 /* add tags to search bar */
function AddToSearch(element){
    document.getElementsByClassName('host')[element.value-1].blur();
    var rowbutton;
    document.getElementById('searchbox').style.display = "block";
    document.getElementById('searchbutton').style.display = "block";
    document.getElementById('holder1').style.display = "none";
    document.getElementById('holder2').style.display = "none";

     /* Each button has an attribute name=1 by default, it means this button has not been
    clicked and put into search bar. Once tags are selected, its value will be set to 0
    and once disselected, its value will be set to 1 again*/

     if (element.name == 1){
        /*each button has a unique count/ID. */
        count = element.value;
        element.id = count;
        workingbutton.push(element.id);
        var x = element.innerHTML;
        var name = "name"+count;
        var taginput = "taginput"+count;
        rowbutton = "rowbutton"+count;
        var inputlist = "browsers"+count;
        var form = "form"+count;

         element.style.backgroundColor = "#009bd0";

         /* workingbutton stands for tags that are selected, if there are over 10 tags
         searchbox's height will be fixed and it will be scrollable.*/
        if(workingbutton.length >10){
            document.getElementById("searchbox").style.height = "400px";
        }

         /* append table in search box */
        $("#lieb").append("<tr id="+count+">"+ "<td style='vertical-align:middle;'><label id="+name+">"+x+"</label></td>"+ "<td><form autocomplete='off' id="+form+"><input type='text' name='clear' autocomplete='nope' id="+taginput+" list="+inputlist+" ></form></td>"+"<td><button id="+rowbutton+" style='height:24px; width:26px;padding:0;border:none;background:none;margin-left: 485%'><a class='delete-alert table--icon danger' data-icon='&#xe62a;' data-original-title='Delete Metrics'></a></button><br></td>"+"</tr>");

         /* autofill tag values of input field*/
        var option = document.createElement("DATALIST");
        option.setAttribute("id", inputlist);
        $("#lieb").append(option);
        var Url = "https://"+domain+"/"+uid+"/"+graphite_key+"/graphite/tags/"+x;
        $.ajax({
            url : Url,
            type: "GET",
            success: function(result){
                    for(var i=0; i<result.values.length;i++){
                        var z = document.createElement("OPTION");
                        z.setAttribute("value", result.values[i].value);
                        $(`#${inputlist}`).append(z);
                    }
                },
            error:function(error){
                    console.log('Error: $(error)');
                }
            });

         /* hit enter button to do the search*/
        document.getElementById(form).addEventListener('submit', function(e) {
                e.preventDefault();
                document.getElementById('searchbutton').click();
        }, false);


         element.name = 0;
        document.getElementsByClassName("host")[element.value-1].blur();
       }
        /* if this tag has been clicked before, tag itelf is now being clicked
        to remove from search box, */
        else{
          element.style.backgroundColor = "#808080";
          var newthing = "rowbutton" + element.value;
          delete_row(newthing, element);
          remove_datalist(element);
          if (workingbutton.length == 0){
              display_hide_element();
          }
          document.getElementsByClassName("host")[element.value-1].blur();
        }

         /* remove tag from search box by clicking on delete button*/
        document.getElementsByClassName("host")[element.value-1].blur();
        $(`#${rowbutton}`).click(function() {
            var t = document.getElementById(rowbutton) ;
            var id = t.parentNode.parentNode.id;
            var i = t.parentNode.parentNode.rowIndex;
            document.getElementById(`${id}`).style.backgroundColor = "#808080";
            document.getElementById("lieb").deleteRow(i);
            remove_datalist(element);
            element.name = 1;
            workingbutton.splice(workingbutton.indexOf(element.value), 1);
            if (workingbutton.length == 0){
                display_hide_element();
            }
            document.getElementsByClassName("host")[element.value-1].blur();
        });

 }

 function display_hide_element(){
    document.getElementById('holder1').style.display = "block";
    document.getElementById('holder2').style.display = "block";
    document.getElementById('searchbox').style.display = "none";
    document.getElementById('searchbutton').style.display = "none";
    document.getElementsByClassName( "metricFilterResults")[0].style.display = "none";
    document.getElementById( 'my-output' ).style.display = "none"; 
}

 /*remove autofill to avoid duplicated autofill*/
function remove_datalist(element){
    var browser = "browsers" + element.value;
    var cList = document.querySelector(`#${browser}`);
    cList.remove(0);
}

 /* delete table[row] in searchbox */
function delete_row(item, element){
    var t = document.getElementById(item);
    var i = t.parentNode.parentNode.rowIndex;
    document.getElementById("lieb").deleteRow(i);
    element.name = 1;
    workingbutton.splice(workingbutton.indexOf(element.value), 1);
    document.getElementsByClassName("host")[element.value-1].blur();
    if (workingbutton.length == 0){
        display();
    }
}

 /* Send findSeries http requests to graphite-web */
function SendFindSeriesRequest(){
    var query= '';
    document.getElementsByClassName( "metricFilterResults")[0].style.display = "none";
    document.getElementById( 'my-output' ).innerHTML = "";

     /* fill in request URL by looping through working button*/
    workingbutton.forEach(function(item, index, array){
                    var id1 = 'name' + item;
                     var id2 = 'taginput' + item;
                     var tagname = document.getElementById(id1).innerHTML;
                     var tagvalue =  document.getElementById(id2).value;
                     query = query + "expr=" + tagname + "=" + tagvalue + "&";
                });
    var Url = "https://"+domain+"/"+uid+"/"+graphite_key+"/graphite/tags/findSeries?"+query;

     /* turn on spinner*/
    $(".dn").css("display", "inline");

     /* Send actual request*/
    $.ajax({
        url : Url,
        type: "GET",
        success: function(result){
            if (result == ""){
                document.getElementsByClassName( "metricFilterResults")[0].innerHTML = "Showing results";
                document.getElementsByClassName( "metricFilterResults")[0].style.display = "block";
                document.getElementById( 'my-output' ).style.display = "block";
                document.getElementById( 'my-output' ).innerHTML = "No data found";
                $(".dn").css("display", "none");
            } else {
                $('.metricFilterResults').html('Showing <strong>' + result.length + '</strong>  matches');
                $(".metricFilterResults").css("display","block");
                for(var i=0; i<result.length;i++){
                    var spans = '<li><span class="mrl"><label class="metricname" for="'+result[i]+'">'+result[i]+'</label></span>'+'<span class="mll floatR"> <button class="btn btn-positive quickviewbutton btn-S" data-metric="'+result[i]+'" onclick="myGrafana(this)" >Open in Grafana</button></span><br></li>';
                    $("#my-output").append($(spans));
                    $("#my-output").css("display","block");
                    $(".dn").css("display", "none");
                }
            } 
        },
        error:function(error){
            document.getElementsByClassName( "metricFilterResults")[0].innerHTML = "Search for tags failed";
            document.getElementsByClassName( "metricFilterResults")[0].style.display = "block";
            $(".dn").css("display", "none");
            console.log('Error $(error)');
        }
        });
}

 /* Check tagged metrics in Grafana*/
function myGrafana(element){
    var metric = element.getAttribute("data-metric");
    var index = metric.indexOf("=");
    var id = metric.substr(0, index) + "=";
    id = id.replace(";", "{");
    query = id + metric.substr(index+ 1, metric.length) + "}";
    composer_link = "//" + window.location.host+"/"+uid+"/"+ composer_url + query +"&target=" + query;
    window.open(composer_link, '_blank');
}
