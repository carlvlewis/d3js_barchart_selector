/*
  * A simplified version of the barchart that appears on nature.com 
  * http://www.nature.com/news/inequality-quantified-mind-the-gender-gap-1.12550
  *
  * Data source: National Science Foundation http://www.nsf.gov/statistics/seind12/append/c5/at05-17.pdf
*/



/* Hides the table and shows the SVG if javascript is enabled */
		$(".info-table-wrapper").css({"display":"none"});
		$(".salary-table-wrapper").css({"display":"none"});
		$(".info-chart").css({"display":"block"});
		$(".info-menu").css({"display":"block"});
		$(".nav-tabs").css({"display":"block"});

			/* Width and height */
			var w = 625,
			h = 300,
			/* Space between the bars */
			barPadding = 5,
			/* Padding used throughout the SVF */
			padding = 60,
			/* Delay used for transitions */
			delayLength = 500,
			infoTableArray = [],
			maleTableArray = [],
			femaleTableArray = [],
			/* An array to store the data from the ths within the tables head */
			headingRowArray = [],
			/* initial values for the selections on page load */
			selectedPosition = "all-positions",
			selectedSex = "both-sexes",
			maleSelected = "male",
			femaleSelected = "female",
			selectedField = "all-fields",
			adjustScaleCheck = false,
			maleObjectArray = [],
			femaleObjectArray = [],
			dataset = [],
			stack = d3.layout.stack();

			/* get the relevent row of male data */
			function getMaleTableData(x, y) {
				/* First remove the existing data from the arrays */
				while (maleObjectArray.length > 0) {
					maleObjectArray.shift();
					} 

				while (maleTableArray.length > 0) {
					maleTableArray.shift();
					} 

				$("table.info-table." + x + " .male ." + y).each( function() {
					var sometext = parseFloat($(this).text());
					maleTableArray.push(sometext);
				});

				/* Construct objects in the form { x:index, y:data } for each */
				/* and push these objects into the array maleObjectArray  */
				for (var i = 0; i < headingRowArray.length; i++) {
					var newObject = {};
					newObject.x = i;
					newObject.y = maleTableArray[i];
					maleObjectArray.push(newObject);
				};

			}

			/* get the relevent row of female data */
			function getFemaleTableData(x, y) {
				/* First remove the existing data from the arrays */
				while (femaleObjectArray.length > 0) {
					femaleObjectArray.shift();
					} 

				while (femaleTableArray.length > 0) {
					femaleTableArray.shift();
					} 

				$("table.info-table." + x + " .female ." + y ).each( function() {
					var sometext = parseFloat($(this).text());
					femaleTableArray.push(sometext);
				});

				/* As above in getMaleTableData */
				for (var i = 0; i < headingRowArray.length; i++) {
					var newObject = {};
					newObject.x = i;
					newObject.y = femaleTableArray[i];
					femaleObjectArray.push(newObject);
				};

			}

			/* The original function that gets the data from the total row */
			function getNewTableData(x, y) {
				/* First remove the existing data from the array */
				infoTableArray = [];
				$("table.info-table." + x + " .both-sexes ." + y).each( function() {
					var sometext = parseFloat($(this).text());
					infoTableArray.push(sometext);
				});
			};

			/* A function to transition the height of the bars and recalcuate the ticks of the yAxis */
			/* Called when the user chooses a new combination of options */
			function updateBars() {

					/* We pass new our array of arrays of objects into D3's stack function */
					stack(dataset);

					if(adjustScaleCheck) {
						/* Redefine Y scale with the new dataset */
						yScale.domain([0,				
								d3.max(dataset, function(d) {
									return d3.max(d, function(d) {
										return d.y0 + d.y;
									});
								})
							]);

						/* Call the Y axis again to adjust it to the new scale */
						d3.select(".info-chart .y")
							.transition()
							.duration(delayLength)
							.call(yAxis);
					} else {
						/* Redefine Y scale with the maximum values */
						yScale.domain([0, d3.max(maximumTableValue)]);

						/* Call the Y axis again to adjust it to the new scale */
						d3.select(".info-chart .y")
							.transition()
							.duration(delayLength)
							.call(yAxis);

					}

					/* Add a rect for each data value */
					groups.selectAll("rect")
					.data(function(d) { return d; })
					.transition()
					.duration(delayLength)
					.attr("y", function(d) {
						return yScale(d.y) + yScale(d.y0) - h;
					})
					.attr("height", function(d) {
						return h - yScale(d.y);
					});

			};

			/* get the data from the first heading row containing all the years */
			/* only needs to happen once */
			$("table.info-table.all-positions thead tr th:not(:first)").each(function() {
				var headingData = $(this).text();
				headingRowArray.push(headingData);
			});

			/* An initial call of the function to populate the graph on page load */
			getNewTableData(selectedPosition, selectedField);
			getMaleTableData(selectedPosition, selectedField);
			getFemaleTableData(selectedPosition, selectedField);

			/* store a copy of the top row, i.e. the one with the highest values for use when adjusting/reseting scale */
			var maximumTableValue = infoTableArray.concat();

			/* At this point all our arrays are populated with data as arrays of objects */
			/* We push those arrays of objects inside the master 'dataset' inorder to make use of the stack function */
			dataset.push(femaleObjectArray);
			dataset.push(maleObjectArray);

			/* We pass our array of arrays of objects into D3's stack function */
			stack(dataset);

			/* Define X scale */
			var xScale = d3.scale.linear()
				.domain([padding, w ])
				.range([padding, w  ]);		 

			/* Define Y scale */
			var yScale = d3.scale.linear()
				.domain([0,				
					d3.max(dataset, function(d) {
						return d3.max(d, function(d) {
							return d.y0 + d.y;
						});
					})
				])
				.range([h, padding]);

			/* Define X axis */
			var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom")
				.tickSize(0, 0)
				.ticks(0);

			/* Define Y axis */
			var yAxis = d3.svg.axis()
				.scale(yScale)
				.orient("left")
				.tickSize(6, 0)
				.ticks(7);

			/* Create SVG element */
			var svg = d3.select(".info-chart")
						.append("svg")
						.attr("width", w)
						.attr("height", h + (padding / 2));

			/* Add a group for each row of data */
			var groups = svg.selectAll("g")
				.data(dataset)
				.enter()
				.append("g")
				.style("fill", function(d, i) {
					return	i === 0 ? "#E53524" : "#F8B436"; 
				});

			/* Add a rect for each data value */
			var rects = groups.selectAll("rect")
				.data(function(d) { return d; })
				.enter()
				.append("rect")
				.attr("x", function(d, i) {
					return i * ((w - padding) / dataset[0].length) + padding;;
				})
				.attr("y", function(d) {
					return yScale(d.y) + yScale(d.y0) - h;
				})
				.attr("height", function(d) {
					return h - yScale(d.y);
				})
				.attr("width", (w - padding) / dataset[0].length - barPadding )
				/* When the user mouses over a bar show the tooltip div and fill it with the relevant data */
				/* Not such a great solution for touchscreens? */
				.on("mouseover", function(d) {

					/* Get this bar's x/y values, then augment for the tooltip */
					var xPosition;
					var toolTipHeight = parseInt($(".tooltip").css("height"));
					var yPosition = parseInt(d3.select(this).attr("y") ) + (parseInt(d3.select(this).attr("height")) / 2) - toolTipHeight;
					

					if ( d3.select(this).attr("x") < 350) {
						xPosition = parseFloat(d3.select(this).attr("x")) + 27;
						d3.select(".tooltip").classed("tooltip-left", false).classed("tooltip-right", true);
					} else {
						xPosition = parseFloat(d3.select(this).attr("x")) -140;
						d3.select(".tooltip").classed("tooltip-left", true).classed("tooltip-right", false);;
					}

					/* Update the tooltip position and value */
					d3.select(".tooltip")
						.style("left", xPosition + "px")
						.style("top", yPosition + "px")
						.select(".value")
						.text(d.y);

					/* Show the tooltip */
					d3.select(".tooltip").classed("hidden", false);

				})
				.on("mouseout", function() {
					/* Hide the tooltip */
					d3.select(".tooltip").classed("hidden", true);
					
				});

			/* Take the headingRowArray and use it lable the x axis */
			svg.selectAll("text")
				.data(headingRowArray)
				.enter()
				.append("text")
				.text(function(d) {
					return d;
				})
				.attr("x", function(d, i){
					return i * ((w - padding) / headingRowArray.length) + (((w - padding) / headingRowArray.length - barPadding) / 2) + padding; 
				 })
				.attr("y", function(d){
					return h + 12;
				})
				.attr("font-family", "sans-serif")
				.attr("font-size", "11px")
				.attr("fill", "black")
				.attr("text-anchor", "middle");	

			/* Create X axis */
			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + h +  ")")
				.call(xAxis);

			/* Create Y axis */
			svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" +  padding + ", 0)")
				.call(yAxis)
				/* Add some extra text for the unit alongside the axis */ 
				.append("text")
				.attr("transform", "rotate(-90)") 
				.attr("y", -padding +12) /* magic number just to stop the top of the T being cut off */
				.attr("x", -(h / 2))
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("Thousands");

			/* Event listner for when the user chooses a new option from the drop down menu */
			/* The values returned by the dropdown menus correspond to the classes of the relevant rows in the table */
			/* Calls getNewTableData, getMaleTableData and getFemaleTableData wutg these values */ 
			/* Finally calls the update bars function with chosenRow's new value  */
			d3.selectAll(".info-menu select")
				.on("change", function () {

					selectedPosition = d3.select(".info-menu .position-dropdown").property("value"),
					selectedField = d3.select(".info-menu .field-dropdown").property("value");

					/* Grab the table data that coresponds to the users choice */
					getNewTableData(selectedPosition, selectedField);
					getMaleTableData(selectedPosition, selectedField);
					getFemaleTableData(selectedPosition, selectedField);
					   
					/* Redraw the graph - taking into account the new data  selection */
					updateBars();

				});

			/* Event listner for when the user changes the adjust scale checkbox */
			d3.selectAll(".info-menu input").on("change", function() {
				adjustScaleCheck = d3.select(this).property("checked");

				/* Redraw the graph - taking into account the adjust scale choice */
				updateBars();
			});



