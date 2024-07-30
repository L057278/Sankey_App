/* sankey.js

This file is responsible for positioning and editing of the sankey diagram and dashboard page overall.

Contents:

1. Remove Missing Values: line 
2. Remove nodes and links by percentage: line
3. Timepoints on graph: line
4. Title: line 
5. Footnote: line
6. Legend: line
7. Tooltip: line 
8. Link Text button: line
9. Node Labels Hide: line
10. PowerBI click action: line
11. Manual Input Node/Link Colours: line
12. Set up date and download: line


If positions of the chunks above change, or new code chunks are added, please amend the list above as well.

*/





(el, x) => {


  console.log('1');
  
  // Set up height and width of the sankey plot
  d3.select('#SankeyPlot').style('height', '800px')
  d3.select('#SankeyPlot').style('width', '120%')
  
  /* 
      IMPORTANT: VALUES ABOVE MUST ALWAYS BE THE SAME AS VALUES IN
      dashboard_tab.R, in  sankeyNetworkOutput("SankeyPlot", width = "120%", height = "800px").
      IF YOU WANT TO AMEND HEIGHT AND WIDTH, ALSO CHANGE THEM IN dashboard_tab.R IN sankeyNetworkOutput.
      OR YOU WILL GET A BUG WHERE AFTER EACH UPDATE PLOT BUTTON PRESS YOU GET A PLOT WITH DIFFERENT DIMENSIONS.
  */


  
  /*
  Set up height and width of the visibility window. 
  It is necessary so title, or diagram, or footnote or legend are not 'cut-off' by visibility window when sizes change.
  Height is set to 1500 because it allows us plenty of space to go down or up with no disadvantages.
  Width is set to 100% to take all available webpage width.
  */
  d3.select('svg').style('width', '100%').style('height', '1500px');
  let svg = d3.select('svg');


  
  let margin_top;
  let margin_bottom;
  let margin_right;
  let margin_left;


  
  //Set up initial margins. The margins below look good for diagrams without extra features.
  //They can be changed later.
  d3.select('#SankeyPlot').style('margin-top', '50px')
  d3.select('#SankeyPlot').style('margin-bottom', '0px')
  d3.select('#SankeyPlot').style('margin-left', '0px')
  d3.select('#SankeyPlot').style('margin-right', '0px')


  
  //Delete old legend, append new one.
  //This is so when we change legend properties, only the legend with the latest properties appears.
  d3.select('#legend_here').remove()
  svg.append('g').attr('id', 'legend_here');



  //Now can refer to objects below just by 'link' and 'node'. Saves time and space.
  let link = d3.selectAll('.link');
  let node = d3.selectAll('.node');
 


  
  /*--------------------------- Remove Missing Values --------------------------- */
  //Removes missing values from the diagram
  //Accessible from Side menu -> Filters -> Remove Missing
  
  
  // This switch is accessed by sankey_function.R
  // Look up str_replace('mi in sankey_function.R to find
  let missing = false; 


  
  if (missing){
    
    
    // look through all nodes
    //select those with names beginning with 'Missing'
    //and remove them from plot
    node.each(function(){
      
      //select those with names beginning with 'Missing':
      if (d3.select(this).select('text').text().startsWith('Missing')){
        d3.select(this).remove()//and remove them from plot
      }
    })
    
    
    
    // look through all links
    // select those that have links to nodes beginning with 'Missing':
    //and remove them from plot
    link.each(function(d){
      
      //select those that have links to nodes beginning with 'Missing':
      if (d.target.name.startsWith('Missing')||d.source.name.startsWith('Missing')){
        d3.select(this).remove()//and remove them from plot
      }
    })

    
  }

  
 
  // TODO: find out if can remove this
  link = d3.selectAll('.link');
  node = d3.selectAll('.node');
 
 


  
/*--------------------------- Remove nodes and liks by percentage ---------------------------*/
//Removes nodes that have values less than chosen percentage, and their corresponding links
//Accessible from Side Menu -> Filters -> Treatment Percentage



//Removes all nodes with values less than this:
let chosenPercentage = 0;
//It is accessible from sankey_function.R
//Look up str_replace("chosenP in sankey_function.R


// look through all nodes:
    node.each(function(){

  //Save the name of each node:
  let nodeName = d3.select(this).select('text').text();
  //Use regex to extract the percentage from node's names:
  let percentage = nodeName.match(/\((\d+)%\)/);
  //Remove nodes that have less % than specified above:
  if (percentage && parseInt(percentage[1]) <= chosenPercentage){
    d3.select(this).remove()
  }
})




// look through all links:
link.each(function(d){

  //Extract percentages of the links, same way as above:
  let sourcePercentage = d.source.name.match(/\((\d+)%\)/);
  let targetPercentage = d.target.name.match(/\((\d+)%\)/);
  //Remove links(I think?) corresponding to this node:
  if ((sourcePercentage && parseInt(sourcePercentage[1]) <= chosenPercentage) || 
      (targetPercentage && parseInt(targetPercentage[1]) <= chosenPercentage)){
    d3.select(this).remove()
  }
})



  
 //TODO: Find out if this can be removed
  link = d3.selectAll('.link');
  node = d3.selectAll('.node');




 
  /*--------------------------- Timepoints on Graph ---------------------------*/
  //Supposed to move timepoints on graph?
  //As of 29/07/2024, inoperable.
  
  
  let timex = [];
  let xcoord;
  
  
  node.each(function(d,i) {
    let str = d3.select(this).attr("transform");
    str = str.match("([0-9]*\\.?[0-9]*),")[1];
    str = parseFloat(str);
    timex.push(str);
  });



  timex = [...new Set(timex)];
  let timepoints = svg
      .select('g')



  let time_labels = 0.0001;


  if (time_labels !== 0.0001 && time_labels.length === timex.length){
  
    for (let x = 0; x < timex.length; x++){
  
      timepoints
        .append('text')
        .attr('transform', 'translate('+(timex[x]+xcoord)+',-5)')
        .attr('font-size', '1vw')
        .attr('font-weight', 'bold')
        .text(time_labels[x])
    }
  }





/*--------------------------- Title ---------------------------*/
/*
Adds a title on top of the plot. 
Title adjusts window size, top and bottom margins, centres coordinates automatically.

Accessible from Side Menu -> General Styles -> Title
*/  

  // Holds the height of the title. It will be used to adjust bottom margin later.
  let textHeight=0;


  
    //SOMETHING AVERAGE, NO IDEA WHAT, DONT DELETE BECAUSE IT CRASHES
    const average = list => list.reduce((prev, curr) => prev + curr) / list.length;
    let average_x = average(timex);


  
    //------ACTUAL TITLE PART---------
    //Get dimensions of sankey plot (height, width etc so we can alignt title to it):
    let rect=d3.select('#SankeyPlot').node().getBoundingClientRect();

    //Take Sankey Plot's dimensions we need from rect, and take bout half of it, so the title is roughly in the centre:
    let center_x = rect.width/2.7;
    //Y coordinate of title is taken approximately:
    let top_y = -1*20;



    //TODO: find out if this can be removed. SVG height should in proficit by default. 
    //No adnjustments should be needed.
    let currentSvgHeight = parseInt(d3.select('svg').style('height'));
    d3.select('svg').style('height', (currentSvgHeight + 0) + 'px');


    
    /*
    IMPORTANT: THIS PART ATTACHES SANKEY PLOT TO THE TOP OF THE WINDOW.
    WITHOUT THIS PART, AS WINDOW HEIGHT AND AVAILABLE VERTICAL SPACE
    INCREASES, SANKEY PLOT GOES DOWN. 
    WITH THESE LINES, PLOT STAYS ON TOP:
    */
    d3.select('svg')
    .attr('viewBox', '0 0 ' + rect.width + ' ' + (currentSvgHeight + 0));


    
    //Title off/on switch depending on switch in general styles tab:
    let title = 1;
   //Accessible from sankey_function.R:
   //Look up str_replace('title in sankey_function.R

  
    if (title !== 1){
      
    //Set in general styles tab:
    let title_font;
    let title_size;
    let title_x;

      
    //Create the title with data above:
    let textElement = svg.select('g')
    .append('text')
    .attr('font-size', title_size+'vw')
    .attr('font-weight', 'bold')
    .attr('font-family', title_font)
    .text(title)

      
    // Take text window dimensions to alignt it with sankey automatically:
    let bbox = textElement.node().getBBox();
    // Calculate x position of title:
    let text_X = -1*bbox.width/2+center_x+2.5*title_x;
    //Calculate text height so we can increase window height to avoid cut-off later in the code:
    let textHeight = 1.5*bbox.height+20;

    
    //Move the title based on the x and y positions data above
    textElement.attr('transform', 'translate(' + text_X +',  ' + top_y + ')')


    //TODO: THIS SVG PART IS PROBABLY UNNECESSARY, AS SVG IS SET UP TO 1500 PX ABOVE. CAN REMOVE IT?
    //Extract the current svg window height
    let currentSvgHeight = parseInt(d3.select('svg').style('height'));
    d3.select('svg').style('height', (currentSvgHeight + textHeight) + 'px');


    //Change bottom margin by adding 'textHeight' to the already existing bottom margin:
    //Get current bottom margin
    let current_bottom_margin = parseInt(d3.select('#SankeyPlot').style('margin-bottom'));
    //Increase current bottom margin
    d3.select('#SankeyPlot').style('margin-bottom', (current_bottom_margin + textHeight/1.5) + 'px');
    
  }





  /*--------------------------- Footnote ---------------------------*/
 /*
 Adds a Footnote on the bottom of the plot. 
 Footnote automatically adjusts window size, bottom margin.

 Accessible from Side Menu -> General Styles -> Footnote
 */  

  //Footnote switch off/on depending on switch in general styles tab:
  let footnote = 1;
  /*
  Accessible from sankey_function.R: 
  look up str_replace('footnote in sankey_function.R
  */


  
  if (footnote !== 1){

    //get sankey plot dimensions
    let rect=d3.select('#SankeyPlot').node().getBoundingClientRect();



    //This is adjusted from the sankey_function.R
    let footnote_font;
    let footnote_size;
 
 

    //Create the footnote with the data above
    let textElement_footnote= svg.append('g')
      .append('text')
      .attr('font-size', footnote_size+'vw')
      .attr('font-family', footnote_font)
      .text(footnote)



    //Get the dimensons of the footnote
    let bbox_footnote = textElement_footnote.node().getBBox();
    let text_footnote_Height = bbox_footnote.height/2;

    
    
    // Calculate x position of footnote(want it to be near left bottom corner):
    let text_footnote_X = 15;
    //Y coordinate of footnote: height of sankey graph+ height of the footnote itself.
    
    let text_footnote_y = text_footnote_Height+ rect.height;


    
    //Move the title based on the data above
    textElement_footnote.attr('transform', 'translate(' + text_footnote_X +',  ' + text_footnote_y + ')')



    //Get current bottom margin
    let current_bottom_margin = parseInt(d3.select('#SankeyPlot').style('margin-bottom'));
    //Increase current bottom margin to accomodate for the footnote based on the footnote's size:
    d3.select('#SankeyPlot').style('margin-bottom', (current_bottom_margin + text_footnote_Height + 30) + 'px');
  }




  

/*--------------------------- Legend ---------------------------*/
// Draws a node-color legend in the bottom right corner of the sankey plot
// Accessible from: side menu -> nodes -> color group nodes -> add legend -> side menu -> graph styles

  
  // Activates legend.
  // Accessed from: sankey_function.R
  // To find, look up: legend_ in sankey_function.R
  let legend_bool = false;



  if (legend_bool){

    //Remove previous legend if it was turned on at least once before
    d3.select('#legend_here').remove()
    svg.append('g').attr('id', 'legend_here');



    //Setting variables
    let legend = d3.select('#legend_here');
    let legend_size;
    let legend_font;
    let legend_nrow;
    let legend_x;
    let legend_y;
    let unique_nodes = [];
    let unique_colors = [];
 
 
 
    //Setting wanted x and y positions of the legend relative to the sankey diagram
    legend_x=rect.width/1.5;
    legend_y=rect.height*1.05;
 
 
    //Collect all node types and their colors to visualise later
    node.each(function(d,i) {
      unique_colors.push(d3.select(this).select('rect').style('fill'));
      unique_nodes.push(d3.select(this).select('text').text().split(':')[0].trim());
    });
 
 
 
    unique_nodes = [...new Set(unique_nodes)];
    unique_colors = [...new Set(unique_colors)];
    let larg_width = 0;
    let cur_width = 0;
    let distance = 0;
    let y = 0;



    // Check if each node type has its own unique color
    if (unique_colors.length === unique_nodes.length){
      
      for (let x = 0; x < unique_nodes.length; x++){

        //Drawing color circles and node names on the legend:
        if (Math.floor(x/legend_nrow) === (y + 1)){
          larg_width = larg_width + 50;
          distance = distance + larg_width;
          larg_width = 0;
        }
        y = Math.floor(x/legend_nrow);
        legend.append("circle")
          .attr("cx",legend_x + distance)
          .attr("cy",legend_y + 30*(x-legend_nrow*y))
          .attr("r", 0.4*legend_size)
          .style("fill", unique_colors[x])
          .attr('class', 'legend_circles')
        legend.append("text")
          .attr("x", legend_x + 15 + distance)
          .attr("y", legend_y + 1 + 30*(x-legend_nrow*y))
          .text(unique_nodes[x])
          .style("font-size", legend_size+"px")
          .style("font-family", legend_font)
          .attr("alignment-baseline","middle")
          .attr('class', 'legend_labels')
 
        cur_width = legend
          .selectAll('.legend_labels')
          .nodes()[x]
          .getBBox()
          .width;
 
        larg_width = Math.max(larg_width, cur_width);
      }
    }

 
 
    // Place title relative to the legend's position(legend_x and legend_y)
    let legend_title;
    legend.append('text')
      .attr('transform', 'translate(' + (legend_x + 16) +', '+ (legend_y - 19) +')')
      .attr('font-size', '1.25vw')
      .attr('font-weight', 'bold')
      .text(legend_title)



    // Measure the height of the legend 
    let legendBBox = legend.node().getBBox();
    let legendHeight = legendBBox.height;
    // Get current bottom margin(free space below sankey plot)
    let current_bottom_margin = parseInt(d3.select('#SankeyPlot').style('margin-bottom'))



    // Increase the bottom margin to accomodate for the legend height so it does not intersect with the elements below
    d3.select('#SankeyPlot').style('margin-bottom', (legendHeight*1.4+textHeight/1.3) + 'px');



    /* Measure the height and width of the legend */
let legendWidth = legendBBox.width;
 
/* Append a rectangle behind the legend to contain it */
legend.insert('rect', ':first-child')
  .attr('x', legendBBox.x - 10)  // Add padding
  .attr('y', legendBBox.y - 10)  // Add padding
  .attr('width', legendWidth + 20)  // Add padding
  .attr('height', legendHeight + 20)  // Add padding
  .style('fill', 'white')  // Background color
  .style('stroke', 'black')  // Border color
  .style('stroke-width', 1);  // Border width
 
console.log('legendHeight:', legendHeight);
 
  } else {// remove legend traces
    d3.select('#legend_here').remove()
    svg.append('g').attr('id', 'legend_here');
  }

  
  
  
  
  
  /*--------------------------- Tooltip ---------------------------*/
  
  
  
  
  d3.selectAll('title').remove();
  
  
  
  let tip1 = d3.tip()
    .attr('class', 'd3-tip')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('padding', '6px')
    .style('color', '#fff')
    .style('border-radius', '4px')
    .style('opacity', 0)
    .style('pointer-events', 'none')
    .attr('class', 'noselect')
    .offset([-10, 0])
    .html(d => {
      return d.source.name + ' -> ' + d.target.name + '<br><strong>' + d.value + '</strong> people in this path,' + '<br>which started from ' + d.ORIGIN;
    });
  
  
    
  let tip2 = d3.tip()
    .attr('class', 'd3-tip')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('padding', '6px')
    .style('color', '#fff')
    .style('border-radius', '4px')
    .style('opacity', 0)
    .style('pointer-events', 'none')
    .attr('class', 'noselect')
    .offset([-10, 0])
    .html(d => {
      return d.name + '<br><strong>' + d.value + '</strong> people in this node!';
    });
  
    
    
  svg.call(tip1);
  svg.call(tip2);

  link.style('stroke-opacity', 0.901);
  



 
  /*--------------------------- Link Text button ---------------------------*/




  let linkText = svg.append('g');
  let data = link.data();
  let linkLength = data.length;
  let linkShow = false;
  let clicks = 0;
  
  
  
  d3.select('label[for=\"link_show\"]')
    .on('click', d => {
      linkShow = !linkShow;
      clicks = clicks + 1;
      if (clicks == 1){
        
        for (let x = 0; x < linkLength; x++){
          
          let d = data[x];
          linkText
            .append('text')
            .attr('class', 'linkText')
            .attr('x', -50 + d.source.x + (d.target.x - d.source.x) / 2)
            .attr('y', 50 + d.source.y + d.sy + (d.target.y + d.ty - d.source.y - d.sy) / 2)
            .attr('dy', '.35em')
            .attr('text-anchor', 'end')
            .attr('transform', null)
            .text('Origin: ' + d.ORIGIN + '/ ' + d.source.name + ' -> ' + d.target.name + ': ' + d.value)
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'start')
            .attr('opacity', 0);
        } 
      }
      
      if (linkShow){
        
        d3.selectAll('.linkText')
          .attr('opacity', 1)
      } else {
        
        d3.selectAll('.linkText')
          .attr('opacity', 0)
      }
    })




  
  /*--------------------------- Node Labels Hide ---------------------------*/
  //Hides all the text from the nodes.
  
  
  
  let nodeHide = false;
  if (nodeHide){
    node
      .select('text')
      .style('opacity', 0);
  } else {
    node
      .select('text')
      .style('opacity', 1);
  }
    



  link
    .on('mouseover', function(d){
      tip1.show(d)
        .style('pointer-events', 'none')
        .style('opacity', 0.9);

      
        

      //c
      
    })
    .on('mouseout',function(d){
      tip1.hide(d);
      
      //d
    })
    
  let fill;
  
  let units = 1;
  //a
  
  node
    .on('mouseover', function(d){
      tip2.style('opacity', 0.9)
        .show(d)
        .style('pointer-events', 'none');
      
      fill = d3.select(this)
                  .select('rect')
                  .style('fill');

      //b

      //e

    })
    .on('mouseout',function(d){
      tip2.hide(d);

      //b2
      
      
                  
      //f
      
    })




  
    /*--------------------------- PowerBI click action ---------------------------*/

  
    node
      .select('rect')
      .style("cursor", "pointer");
    node
    .on("mousedown.drag", null);

    let node_op;
    let powerBI = true;
    if (powerBI === true){
      node
        .on("click", function(d,i){
          node_op = d3.select(this)
            .select('rect')
            .style('opacity');
          node_op = parseFloat(node_op);
          allnodes_op = Math.min(parseFloat(node.nodes()[0].firstChild.style.opacity), 
                                parseFloat(node.nodes()[1].firstChild.style.opacity));

          

          if ((node_op === 0.9 && allnodes_op === 0.9) || (node_op === 0.5)){
            node
              .select('rect')
              .style('opacity', '0.5')


            if (node.select('text').style('opacity') !== '0'){
              node
                .select('text')
                .style('opacity', '0.5')

              d3.select(this)
                .select('text')
                .style('opacity', '1')
            }


            d3.select(this)
              .select('rect')
              .style('opacity', '0.9')

            

            let i2 = 0;
            link.each(d2 => {
              if (d2.source === d || d2.target == d){
                link.nodes()[i2].style.strokeOpacity = '0.5';
                link.nodes()[i2].style.opacity = '';
              } else {
                link.nodes()[i2].style.opacity = '0.3';
              }
              i2 = i2+1;
            })


          } else if (node_op === 0.9 && allnodes_op === 0.5){
            node
              .select('rect')
              .style('opacity', '0.9')

            if (node.select('text').style('opacity') !== '0'){
              node
                .select('text')
                .style('opacity', '1')
            }

            

            link
              .style('opacity', '')

            link
              .style('stroke-opacity', '0.2')
          }
        })
    }




  
    /*--------------------------- Manual Input Node/Link Colours ---------------------------*/

  
    let manual_colors;
    if (manual_colors){
      node
        .on('click', function(d){
          let node_fill = d3.select(this)
            .select('rect')
            .style('fill');
          let node_fill2 = prompt("Enter Node Colour: ", node_fill);
          if (node_fill2.includes('group:')){
            node_fill2 = node_fill2.split(':')[1]
            let i3 = 0;
            node.each(d2 => {
              if (d2.name === d.name){
                node.select('rect').nodes()[i3].style.fill = node_fill2;
              }
              i3 = i3+1;
            })

          } else if (node_fill2.includes('link:')){
            let node_group = node_fill2.split(':')[1];
            node_fill2 = node_fill2.split(':')[2];
            let i4 = 0;

            if (node_group === 'node_s'){

              link.each(d2 => {
                if (d2.source.name === d.name){
                  link.nodes()[i4].style.stroke = node_fill2;
                }
                i4 = i4+1;
              })

            } else if (node_group === 'node_e'){

              link.each(d2 => {
                if (d2.target.name === d.name){
                  link.nodes()[i4].style.stroke = node_fill2;
                }
                i4 = i4+1;
              })

            } else if (node_group === 'origin'){

              link.each(d2 => {
                if (d2.ORIGIN === d.name){
                  link.nodes()[i4].style.stroke = node_fill2;
                }
                i4 = i4+1;
              })

            } else {
              alert("Not a correct link grouping format.");
            }
           
          } else {
            d3.select(this)
              .select('rect')
              .style('fill', node_fill2)
          }
        })

      link
        .on('click', function(d){
          let link_fill = d3.select(this)
            .style('stroke');
          let link_fill2 = prompt("Enter Link Colour: ", link_fill);
          d3.select(this)
            .style('stroke', link_fill2)
        })

      d3.selectAll('.legend_circles')
        .on('click', function(d){
          let circle_fill = d3.select(this)
            .style('fill');
          let circle_fill2 = prompt("Enter Circle Colour: ", circle_fill);
          d3.select(this)
            .style('fill', circle_fill2);
        })
    }




  
    /*--------------------------- Set up date and download ---------------------------*/

  
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    d3.select('#downloadsvg').on('click', function() {
                d3.select(this)
                   .attr('href', 'data:application/octet-stream;base64,' + btoa(d3.select('#SankeyPlot').html()))
                   .attr('download', 'sankey-svg-network-' + today + '.svg')
             });




  
 }




