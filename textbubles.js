define(["jquery", "text!./textbubles.css", "./d3.min"], function($, cssContent) {'use strict';
	$("<style>").html(cssContent).appendTo("head");
	return {
		initialProperties : {
			version: 1.0,
			qHyperCubeDef : {
				qDimensions : [],
				qMeasures : [],
				qInitialDataFetch : [{
					qWidth : 5,
					qHeight : 1000
				}]
			}
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				dimensions : {
					uses : "dimensions",
					min : 1,
					max : 1
				},
				measures : {
					uses : "measures",
					min : 1,
					max : 1
				},
				sorting : {
					uses : "sorting"
				},
				settings : {
					uses : "settings"
				}
			}
		},
		snapshot : {
			canTakeSnapshot : true
		},
		paint : function($element, layout) {
			// get qMatrix data array
			var qMatrix = layout.qHyperCube.qDataPages[0].qMatrix;
			// create a new array that contains the measure labels
			var measureLabels = layout.qHyperCube.qMeasureInfo.map(function(d) {
				return d.qFallbackTitle;
			});
			
			// Create a new array for our extension with a row for each row in the qMatrix
			var dataD3 ={"children" : []};
			var data = qMatrix.map(function(d) {
				// for each element in the matrix, create a new object that has a property
				// for the grouping dimension, the first metric, and the second metric
				return {
					"name":d[0].qText,
					"size":d[1].qNum
				}
			});
			dataD3["children"] = data;

			// Chart object width
			var width = $element.width();
			// Chart object height
			var height = $element.height();
			// Chart object id
			var id = "container_" + layout.qInfo.qId;

			// Check to see if the chart element has already been created
			if (document.getElementById(id)) {
				// if it has been created, empty it's contents so we can redraw it
				$("#" + id).empty();
			}
			else {
				// if it hasn't been created, create it with the appropiate id and size
				$element.append($('<div />').attr("id", id).width(width).height(height));
			}
			
			vizTextbubles(dataD3, measureLabels, width, height, id);
		}
	};
});


var vizTextbubles = function (data, labels, width, height, id) {
	var bleed = 100,
		width = width,
		height = height;

	var pack = d3.layout.pack()
		.sort(null)
		.size([width, height + bleed * 2])
		.padding(2);

	var svg = d3.select("#"+id).append("svg")
		.attr("width", width)
		.attr("height", height)
	  .append("g")
		.attr("transform", "translate(0," + -bleed + ")");

	  var node = svg.selectAll(".node")
		  .data(pack.nodes(flatten(data))
			.filter(function(d) { return !d.children; }))
		.enter().append("g")
		  .attr("class", "node")
		  .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	  node.append("circle")
		  .attr("r", function(d) { return d.r; });

	  node.append("text")
		  .text(function(d) { return d.name; })
		  .style("font-size", function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "px"; })
		  .attr("dy", ".35em");

 
 
	// Returns a flattened hierarchy containing all leaf nodes under the root.
	function flatten(root) {
	  var nodes = [];

	  function recurse(node) {
		if (node.children) node.children.forEach(recurse);
		else nodes.push({name: node.name, value: node.size});
	  }

	  recurse(root);
	  return {children: nodes};
	}

	d3.select(self.frameElement).style("height", height + "px");
 
}