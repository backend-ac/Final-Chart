let worldValues = [];

d3.csv("./data/AIU-All-Women-Dataset-csv.csv", d => {
	return {
		geo: d.region.replace(/\s/g, ''),
		category: d.region,
		country: d.country,
		countries_items: 0,
		value: +d.allpreg_abortion,
		safe_abortions: +d.safe_abortions,
		lesssafe_abortions: +d.lesssafe_abortions,
		leastsafe_abortions: +d.leastsafe_abortions,

		pct_matdeaths_abortions: +d.pct_matdeaths_abortions,
		pct_matdeaths_safeabs: +d.pct_matdeaths_safeabs,
		pct_matdeaths_unsafeabs: +d.pct_matdeaths_unsafeabs,

		all_abortion_costs_service: +d.all_abortion_costs_service,
		all_abortion_costs_safe: +d.all_abortion_costs_safe,
		all_abortion_costs_lesssafe: +d.all_abortion_costs_lesssafe,

		all_pac_costs: +d.all_pac_costs,
		all_pac_costs_safe_abortion: +d.all_pac_costs_safe_abortion,
		all_pac_costs_unsafe_ab: +d.all_pac_costs_unsafe_ab,

	}
}).then(rawData => {

	// Group the data by region and sum the values of allpreg_abortion
	const groupData = d3.rollup(rawData,
		v => d3.sum(v, d => d.value),
		d => d.category
	);

	const width = 500;
	const height = 310;
	const radius = Math.min(width, height) /2 ;
	const margins = {top: 10, right: 0, bottom: 100, left: 20};

	var barData = {};
	for(item in rawData ){
		if( item != 'columns' ){
			let key = rawData[item].geo;
			if(barData.hasOwnProperty(key) ){
				barData[key] = {
					geo: key,
					country: rawData[item].category,
					country_items: barData[key].country_items + 1,
					leastsafe_abortions: barData[key].leastsafe_abortions += rawData[item].leastsafe_abortions,
					lesssafe_abortions: barData[key].lesssafe_abortions += rawData[item].lesssafe_abortions,
					safe_abortions: barData[key].safe_abortions += rawData[item].safe_abortions,
					value: barData[key].value += rawData[item].value,

					pct_matdeaths_abortions: barData[key].pct_matdeaths_abortions += rawData[item].pct_matdeaths_abortions,
					pct_matdeaths_safeabs: barData[key].pct_matdeaths_safeabs += rawData[item].pct_matdeaths_safeabs,
					pct_matdeaths_unsafeabs: barData[key].pct_matdeaths_unsafeabs += rawData[item].pct_matdeaths_unsafeabs,

					all_abortion_costs_service: barData[key].all_abortion_costs_service += rawData[item].all_abortion_costs_service,
					all_abortion_costs_safe: barData[key].all_abortion_costs_safe += rawData[item].all_abortion_costs_safe,
					all_abortion_costs_lesssafe: barData[key].all_abortion_costs_lesssafe += rawData[item].all_abortion_costs_lesssafe,

					all_pac_costs: barData[key].all_pac_costs += rawData[item].all_pac_costs,
					all_pac_costs_safe_abortion: barData[key].all_pac_costs_safe_abortion += rawData[item].all_pac_costs_safe_abortion,
					all_pac_costs_unsafe_ab: barData[key].all_pac_costs_unsafe_ab += rawData[item].all_pac_costs_unsafe_ab,
				};
			} else{
				barData[key] = {
					geo: key,
					country: rawData[item].category,
					country_items: 1,
					leastsafe_abortions: rawData[item].leastsafe_abortions,
					lesssafe_abortions: rawData[item].lesssafe_abortions,
					safe_abortions: rawData[item].safe_abortions,
					value: rawData[item].value,

					pct_matdeaths_abortions: rawData[item].pct_matdeaths_abortions,
					pct_matdeaths_safeabs: rawData[item].pct_matdeaths_safeabs,
					pct_matdeaths_unsafeabs: rawData[item].pct_matdeaths_unsafeabs,

					all_abortion_costs_service: rawData[item].all_abortion_costs_service,
					all_abortion_costs_safe: rawData[item].all_abortion_costs_service,
					all_abortion_costs_lesssafe: rawData[item].all_abortion_costs_service,

					all_pac_costs: rawData[item].all_pac_costs,
					all_pac_costs_safe_abortion: rawData[item].all_pac_costs_safe_abortion,
					all_pac_costs_unsafe_ab: rawData[item].all_pac_costs_unsafe_ab,
				};
			}
			
			let w_item = {
				name: rawData[item].country,
				value: rawData[item].pct_matdeaths_abortions
			};

			worldValues.push(w_item);
			barData[key].average_all_abortion_costs_service = barData[key].all_abortion_costs_service / barData[key].country_items
			barData[key].average_all_abortion_costs_safe = barData[key].all_abortion_costs_safe / barData[key].country_items
			barData[key].average_all_abortion_costs_lesssafe = barData[key].all_abortion_costs_lesssafe / barData[key].country_items

			barData[key].average_all_pac_costs = barData[key].all_pac_costs / barData[key].country_items
			barData[key].average_all_pac_costs_safe_abortion = barData[key].all_pac_costs_safe_abortion / barData[key].country_items
			barData[key].average_all_pac_costs_unsafe_ab = barData[key].all_pac_costs_unsafe_ab / barData[key].country_items
		}
	}

	let mainData = barData;
	barData = Object.values(barData);
	let w_cols = ['safe_abortions', 'lesssafe_abortions', 'leastsafe_abortions'];
	let w_cols_labels = ['Safe', 'Lesssafe', 'Leastsafe'];

	let worldData = [];
	for( key in w_cols ){
		let total_value = 0;
		for( item in barData ){
			total_value += barData[item][w_cols[key]];
		}
		worldData[key] = {
			label: w_cols_labels[key],
			value: total_value,
			col: w_cols[key]
		}
	}

	// Create a pie layout
	const pie = d3.pie()
		.sort(null)
		.value(d => d[1])
		.padAngle(0.03);

	// Set the arc generator function
	const arc = d3.arc()
		.innerRadius(0)
		.outerRadius(170);

	// Set the color scale
	const color = d3.scaleOrdinal()
		.domain(groupData.keys())
		.range(['#a5b783', '#c6cbc4', '#cfe2f3', '#619ee1', '#4451ba'])

	// Append the SVG element
	const svg = d3.select('#pie-chart')
		.append('svg')
		.attr("viewBox", [0, 10, width, height+180])
		.append('g')
		.attr('transform', `translate(${width / 2}, ${height -70})`);

	// Add the pie chart
    const paths = svg.selectAll('.arc')
		.data(pie(groupData))
		.enter()
		.append('path')
		.attr('class', d => d.data[0].replace(/\s/g, ''))
		.attr('data-item', d => d.data[0].replace(/\s/g, ''))
		.attr('d', arc)
		.attr('fill', (d, i) => color(i))
		.attr("stroke", "#000")
    	.attr("stroke-width", 1)
    	.style('opacity', 0.8);

	paths.append('title').text(d => Math.round(d.value));
	// Add the mouseover event listener
	paths.on("mouseover", function(d) {
		d3.select(this).style("fill", '#d6b312');
	});

	// Add the mouseout event listener
	paths.on("mouseout", function(d) {
		d3.select(this).style("fill", d.groupData);
	});

    paths.on("click", function(d) {
		let cur_item = d3.select(this).attr("data-item");
    	d3.select("#region-name").text("Statistics on the number of different types of abortions in " + cur_item + " region");

		d3.selectAll('#pie-chart .active')
			.classed('active', false)
			.style('stroke-width', 1)
      		.style('opacity', 0.8);

		d3.select(this).style("stroke", "#333")
    		.style("stroke-width", 2).style('opacity', 2);
    	
		d3.select(this).classed('active', true);

		for( item in worldData ){
			if( worldData[item].col == 'leastsafe_abortions' ){
				worldData[item].value = mainData[cur_item].leastsafe_abortions;
			}
			if( worldData[item].col == 'lesssafe_abortions' ){
				worldData[item].value = mainData[cur_item].lesssafe_abortions;
			}
			if( worldData[item].col == 'safe_abortions' ){
				worldData[item].value = mainData[cur_item].safe_abortions;
			}
		}

		const xScale = d3.scaleBand()
			.domain(worldData.map(d => d.label))
			.range([50, 300])
			.padding(0.2);

		const yScale = d3.scaleLinear()
			.domain([0, d3.max(worldData, d => d.value)])
			.range([height - margins.bottom, margins.top]);

		const t = d3.transition().duration(1000);

		bar = bar
			.data(worldData, d => d.geo)
			.join(
				enter => enter.append('rect')
				.attr("class", 'bar_item')
				.attr("x", d => xScale(d.label))
				.attr("y", d => yScale(d.value))
				.attr("height", 0)
				.attr("width", 50)
				.attr("fill", d => colors(d.label))
				.call(enter => enter.transition(t)
				.attr("height", d => yScale(0) - yScale(d.value))),
				update => update.transition(t)
				.attr("x", d => xScale(d.label))
				.attr("y", d => yScale(d.value))
				.attr("height", d => yScale(0) - yScale(d.value))
				.attr("width", 50),
				exit => exit.transition(t)
				.attr("y", yScale(0))
				.attr("height", 0)
			.remove()
			);

		// Add the tooltip when hover on the bar
		bar.append('title').text(d => Math.round(d.value));
		bar.on("mouseover", function(d) {
			d3.select(this).style("fill", '#d6b312');
		});
		
		// Add the mouseout event listener
		bar.on("mouseout", function(d) {
			d3.select(this).style("fill", d.groupData);
		});

		const yAxis = d3.axisLeft(yScale)

		yGroup.transition(t)
			.call(yAxis)
			.selection()
			.call(g => g.select(".domain"));

	});

  	d3.select(document).on("click", function(event) {
    	if(event.target.closest('path') == null){
      		d3.selectAll('#pie-chart .active')
				.classed('active', false)
				.style('stroke-width', 1)
      			.style('opacity', 0.8);

    		d3.select("#region-name").text("Statistics on the number of different types of abortions around the world");
	
	  		var barData = {};
	  		for(item in rawData ){
				if( item != 'columns' ){
					let key = rawData[item].geo;
					if(barData.hasOwnProperty(key) ){
						barData[key] = {
							geo: key,
							country: rawData[item].category,
							country_items: barData[key].country_items + 1,
							leastsafe_abortions: barData[key].leastsafe_abortions += rawData[item].leastsafe_abortions,
							lesssafe_abortions: barData[key].lesssafe_abortions += rawData[item].lesssafe_abortions,
							safe_abortions: barData[key].safe_abortions += rawData[item].safe_abortions,
							value: barData[key].value += rawData[item].value,

							pct_matdeaths_abortions: barData[key].pct_matdeaths_abortions += rawData[item].pct_matdeaths_abortions,
							pct_matdeaths_safeabs: barData[key].pct_matdeaths_safeabs += rawData[item].pct_matdeaths_safeabs,
							pct_matdeaths_unsafeabs: barData[key].pct_matdeaths_unsafeabs += rawData[item].pct_matdeaths_unsafeabs,

							all_abortion_costs_service: barData[key].all_abortion_costs_service += rawData[item].all_abortion_costs_service,
							all_abortion_costs_safe: barData[key].all_abortion_costs_safe += rawData[item].all_abortion_costs_safe,
							all_abortion_costs_lesssafe: barData[key].all_abortion_costs_lesssafe += rawData[item].all_abortion_costs_lesssafe,

							all_pac_costs: barData[key].all_pac_costs += rawData[item].all_pac_costs,
							all_pac_costs_safe_abortion: barData[key].all_pac_costs_safe_abortion += rawData[item].all_pac_costs_safe_abortion,
							all_pac_costs_unsafe_ab: barData[key].all_pac_costs_unsafe_ab += rawData[item].all_pac_costs_unsafe_ab,
						};
					} else{
						barData[key] = {
							geo: key,
							country: rawData[item].category,
							country_items: 1,
							leastsafe_abortions: rawData[item].leastsafe_abortions,
							lesssafe_abortions: rawData[item].lesssafe_abortions,
							safe_abortions: rawData[item].safe_abortions,
							value: rawData[item].value,

							pct_matdeaths_abortions: rawData[item].pct_matdeaths_abortions,
							pct_matdeaths_safeabs: rawData[item].pct_matdeaths_safeabs,
							pct_matdeaths_unsafeabs: rawData[item].pct_matdeaths_unsafeabs,

							all_abortion_costs_service: rawData[item].all_abortion_costs_service,
							all_abortion_costs_safe: rawData[item].all_abortion_costs_service,
							all_abortion_costs_lesssafe: rawData[item].all_abortion_costs_service,

							all_pac_costs: rawData[item].all_pac_costs,
							all_pac_costs_safe_abortion: rawData[item].all_pac_costs_safe_abortion,
							all_pac_costs_unsafe_ab: rawData[item].all_pac_costs_unsafe_ab,
						};
					}

					let w_item = {
						name: rawData[item].country,
						value: rawData[item].pct_matdeaths_abortions
					};

					worldValues.push(w_item);
					barData[key].average_all_abortion_costs_service = barData[key].all_abortion_costs_service / barData[key].country_items
					barData[key].average_all_abortion_costs_safe = barData[key].all_abortion_costs_safe / barData[key].country_items
					barData[key].average_all_abortion_costs_lesssafe = barData[key].all_abortion_costs_lesssafe / barData[key].country_items
			
					barData[key].average_all_pac_costs = barData[key].all_pac_costs / barData[key].country_items
					barData[key].average_all_pac_costs_safe_abortion = barData[key].all_pac_costs_safe_abortion / barData[key].country_items
					barData[key].average_all_pac_costs_unsafe_ab = barData[key].all_pac_costs_unsafe_ab / barData[key].country_items
		
				}
	  		}
		
			let worldData = [];
			for( key in w_cols ){
				let total_value = 0;
				for( item in barData ){
					total_value += barData[item][w_cols[key]];
				}
				worldData[key] = {
					label: w_cols_labels[key],
					value: total_value,
					col: w_cols[key]
				}
			}

			const xScale = d3.scaleBand()
				.domain(worldData.map(d => d.label))
				.range([50, 300])
				.padding(0.2);

			const yScale = d3.scaleLinear()
				.domain([0, d3.max(worldData, d => d.value)])
				.range([height - margins.bottom, margins.top]);

			const t = d3.transition().duration(1000);

			bar = bar
				.data(worldData, d => d.geo)
				.join(
					enter => enter.append('rect')
					.attr("class", 'bar_item')
					.attr("x", d => xScale(d.label))
					.attr("y", d => yScale(d.value))
					.attr("height", 0)
					.attr("width", 50)
					.attr("fill", d => colors(d.label))
					.call(enter => enter.transition(t)
					.attr("height", d => yScale(0) - yScale(d.value))),
					update => update.transition(t)
					.attr("x", d => xScale(d.label))
					.attr("y", d => yScale(d.value))
					.attr("height", d => yScale(0) - yScale(d.value))
					.attr("width", 50),
					exit => exit.transition(t)
					.attr("y", yScale(0))
					.attr("height", 0)
				.remove()
				);

			// Add the tooltip when hover on the bar
			bar.append('title').text(d => Math.round(d.value));
			bar.on("mouseover", function(d) {
				d3.select(this).style("fill", '#d6b312');
			});
	
			// Add the mouseout event listener
			bar.on("mouseout", function(d) {
				d3.select(this).style("fill", d.groupData);
			});

			const yAxis = d3.axisLeft(yScale)
			yGroup.transition(t)
				.call(yAxis)
				.selection()
				.call(g => g.select(".domain"));
		
    	}
  	});

  	const labelArc = d3.arc()
    	.outerRadius(radius + 40) // increase the distance of the label from the center
    	.innerRadius(radius + 50);

  	const total = d3.sum(groupData, d => d[1]);

	const labels = svg.selectAll('.label')
		.data(pie(groupData))
		.enter()
		.append('text')
		.attr('class', 'label')
		.attr('transform', d => `translate(${labelArc.centroid(d)})`)
		.attr('dy', -10)  // move the labels downward
		.style('text-anchor', 'middle')
    	.style('font-size', '16px')
    	.append("tspan")
    	.text(d => d.data[0])
    	.attr("x",-5)
    	.attr("dy","0em")
    	.append("tspan")
    	.text(d => d3.format('.1%')(d.data[1] / total))
    	.attr("x",-5)
    	.attr("dy","1.2em");

	const countries = Array.from(new Set(worldData.map(d => d.label))).sort();
  
	const colors = d3.scaleOrdinal()
		.domain(countries)
		.range(['#a5b783', '#619ee1', '#4451ba']);

	const barChart = d3.select('#bar-chart')
		.append("svg")
    	.attr("viewBox", [0, 0, width, height-20]);

	const xScale = d3.scaleBand()
		.domain(worldData.map(d => d.label))
		.range([50, 300])
		.padding(0.2);

	const yScale = d3.scaleLinear()
		.domain([0, d3.max(worldData, d => d.value)])
		.range([height - margins.bottom, margins.top]);

	let bar = barChart.append("g")
		.selectAll("rect")
		.data(worldData, d => d.geo)
		.join("rect")
		.attr("class", 'bar_item')
		.attr("x", d => xScale(d.label))
		.attr("y", d => yScale(d.value))
		.attr("height", d => yScale(0) - yScale(d.value))
		.attr("width", 50)
		.attr("fill", d => colors(d.label));

	// Add the tooltip when hover on the bar
	bar.append('title').text(d => Math.round(d.value));

	bar.on("mouseover", function(d) {
		d3.select(this).style("fill", '#d6b312');
	});

	// Add the mouseout event listener
	bar.on("mouseout", function(d) {
		d3.select(this).style("fill", d.groupData);
	});
  	// Create the x and y axes and append them to the chart
	const yAxis = d3.axisLeft(yScale);

	const yGroup = barChart.append("g")
		.attr("transform", `translate(45,0)`)
		.call(yAxis)
		.call(g => g.select(".domain"));

	const xAxis = d3.axisBottom(xScale);

	const xGroup = barChart.append("g")
		.attr("transform", `translate(${-5},${height - margins.bottom})`)
		.call(xAxis);

	xGroup.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-5")
    	.attr("dy", "25")
    	.attr("transform", "rotate(-45)").attr("y", -10);

  	///Create second bar chart
	let pct_cols = ['pct_matdeaths_abortions', 'pct_matdeaths_safeabs', 'pct_matdeaths_unsafeabs'];
	let pctData = [];
	
	for( item in barData ){
		for( key in pct_cols ){
			let pctItem = {
				region: barData[item].geo,
				column: pct_cols[key],
				value: barData[item][pct_cols[key]],
			};
			pctData.push(pctItem);
		}
	}
	
	const pctColor = d3.scaleOrdinal()
		.domain(['#4451ba', '#619ee1', '#a5b783'])
		.range(['#4451ba', '#619ee1', '#a5b783'])
	
	const groupBarChart = d3.select('#groupBar')
		.append("svg")
		.attr("viewBox", [0, 0, width+50, height]);
	
	const gxScale = d3.scaleBand()
		.domain(pctData.map(d => d.region))
		.range([margins.left, width - margins.right])
		.padding(0.09);
	
	const gxzScale = d3.scaleBand()
		.domain(pctData.map(d => d.column))
		.range([90, 160])
		.padding(0.1);
	
	const gyScale = d3.scaleLinear()
		.domain([0, d3.max(pctData, d => d.value)])
		.range([height - margins.bottom, margins.top]);
	
	let gbar = groupBarChart.append("g")
		.selectAll("rect")
		.data(pctData)
		.join("rect")
			.attr('class', d => d.region)
			.attr("x", d => gxScale(d.region)-50 + gxzScale(d.column)-10)
			.attr("y", d => gyScale(d.value))
			.attr("height", d => gyScale(0) - gyScale(d.value))
			.attr("width", 20)
			.attr('fill', (d, i) => pctColor(i));
		
	// Add the tooltip when hover on the bar
	gbar.append('title').text(d => d.value.toFixed(2));
	gbar.on("mouseover", function(d) {
		d3.select(this).style("fill", '#d6b312');
	});
	
	// Add the mouseout event listener
	gbar.on("mouseout", function(d) {
		d3.select(this).style("fill", d.groupData);
	});

	const gyAxis = d3.axisLeft(gyScale);
	
	const gyGroup = groupBarChart.append("g")
		.attr("transform", `translate(45,0)`)
		.call(gyAxis)
		.call(g => g.select(".domain"));
	
	const gxAxis = d3.axisBottom(gxScale);
	
	const gxGroup = groupBarChart.append("g")
		.attr("transform", `translate(${margins.left+5},${height - margins.bottom})`)
		.call(gxAxis);
	
	gxGroup.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "10")
		.attr("dy", "10");





	/*--------------- STACKED BAR CHART  ----------------*/

	// Creating stacked bar chart
	var svg1 = d3.select("#stackedGroupBar")
		.append("svg")
		.attr("width", 800)
		.attr("height", 600);

	var stack = d3.stack()
		.keys(["average_all_abortion_costs_service", "average_all_abortion_costs_safe", "average_all_abortion_costs_lesssafe"])
		.order(d3.stackOrderNone)
		.offset(d3.stackOffsetNone);

	var layers = stack(barData);

	var y = d3.scaleLinear()
		.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[1]; })])
		.range([500, 100]);

	var x = d3.scaleBand()
		.domain(barData.map(function(d) { return d.geo; }))
		.range([50, 750])
		.padding(0.1);

	var colors1 = d3.scaleOrdinal()
		.range(['#4451ba', '#619ee1', '#a5b783'])
		.domain(["average_all_abortion_costs_service", "average_all_abortion_costs_safe", "average_all_abortion_costs_lesssafe"]);

	var groups = svg1.selectAll("g")
		.data(layers)
		.enter()
		.append("g")
		.style("fill", colors1);

	var rects = groups.selectAll("rect")
		.data(function(d) { return d; })
		.enter()
		.append("rect")
		.attr("x", function(d) { return x(d.data.geo); })
		.attr("y", function(d) { return y(d[1]); })
		.attr("height", function(d) { return y(d[0]) - y(d[1]); })
		.attr("width", x.bandwidth());

	var xAxis1 = d3.axisBottom(x);
	svg1.append("g")
		.attr("transform", "translate(0,500)")
		.call(xAxis1);

	var yAxis1 = d3.axisLeft(y);
	// svg1.append("g")
	// 	.attr("transform", "translate(50,0)")
	// 	.call(yAxis1);

	const stackBar_yGroup = svg1.append("g")
		.attr("transform", `translate(45,0)`)
		.call(yAxis1)
		.call(g => g.select(".domain").remove());

	groups.append('title').text("HERE");

	groups.on("mouseover", function(d) {
		d3.select(this).style("fill", '#d6b312');
	});

	// Add the mouseout event listener
	groups.on("mouseout", function(d) {
		d3.select(this).style("fill", colors1);
	});

	// Select the first button and attach a click event listener
	d3.select("#button1").on("click", function() {
		updateStackedBarChart(barData, colors1, ["average_all_abortion_costs_service", "average_all_abortion_costs_safe", "average_all_abortion_costs_lesssafe"]);
	});

  	// Select the second button and attach a click event listener
  	d3.select("#button2").on("click", function() {
		updateStackedBarChart(barData, colors1, ["average_all_pac_costs", "average_all_pac_costs_safe_abortion", "average_all_pac_costs_unsafe_ab"]);
  	});

  	function updateStackedBarChart(data, colors1, keys) {
		var svg1 = d3.select("#stackedGroupBar").select("svg");

		var stack = d3.stack()
			.keys(keys)
			.order(d3.stackOrderNone)
			.offset(d3.stackOffsetNone);

		var layers = stack(data);

		var yScale = d3.scaleLinear()
			.domain([0, d3.max(layers[layers.length - 1], function(d) { return d[1]; })])
			.range([500, 100]);


		var xScale = d3.scaleBand()
			.domain(data.map(function(d) { return d.geo; }))
			.range([50, 750])
			.padding(0.1);

		var groups = svg1.selectAll("g")
			.data(layers)
			.style("fill", colors1);

		var rects = groups.selectAll("rect")
			.data(function(d) { return d; });

		const t = d3.transition().duration(700);

		rects.enter()
			.append("rect")
			.merge(rects)
			.transition(t)
			.attr("x", function(d) { return xScale(d.data.geo); })
			.attr("y", function(d) { return yScale(d[1]); })
			.attr("height", function(d) { return yScale(d[0]) - yScale(d[1]); })
			.attr("width", xScale.bandwidth());

		var xAxis1 = d3.axisBottom(xScale);
		svg1.append("g")
			.attr("transform", "translate(0,500)")
			.selection()
			.call(xAxis1);
			

		var yAxis1 = d3.axisLeft(yScale);
		// svg1.append("g")
		// 	.attr("transform", "translate(50,0)")
		// 	.selection()
		// 	.call(yAxis1);

		stackBar_yGroup.transition(t)
	    	.call(yAxis1)
	    	.selection()
	    	.call(g => g.select(".domain").remove());
		
		
		// groups.on("mouseover", function(d) {
		// 	d3.select(this).style("fill", '#d6b312');
		// });

		// // Add the mouseout event listener
		// groups.on("mouseout", function(d) {
		// 	d3.select(this).style("fill", colors1);
		// });
	}





	/*--------------- STACKED BAR CHART END  ----------------*/









	//Create map

	let mapCountries = {};
	let countrymesh = {};
	let hale = {};
	let world = {};

	let countryValues = {};
	let countryValuesLoaded = false;

	let cointriesLoaded = false;
	let countrymeshLoaded = false;
	let haleLoaded = false;
	let worldLoaded = false;

	d3.json("./data/countries.json", d => {
		console.log(d);
	}).then(data => {
		mapCountries = data;
		cointriesLoaded = true;
	});

	d3.json("./data/countrymesh.json", d => {
		console.log(d);
	}).then(data => {
		countrymesh = data;
		countrymeshLoaded = true;
	});

	d3.json("./data/country-values.json", d => {
		console.log(d);
	}).then(data => {
		countryValues = data;
		countryValuesLoaded = true;
	});

	d3.json("./data/world.json", d => {
		console.log(d);
	}).then(data => {
		world = data;
		worldLoaded = true;
	});


	getAllData();

	function exportToJsonFile(jsonData) {
		let dataStr = JSON.stringify(jsonData);
		let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

		let exportFileDefaultName = 'data.json';

		let linkElement = document.createElement('a');
		linkElement.setAttribute('href', dataUri);
		linkElement.setAttribute('download', exportFileDefaultName);
		linkElement.click();
	}

	function getAllData(){
		setTimeout(function(){
			if( cointriesLoaded && countrymeshLoaded && countryValuesLoaded && worldLoaded ){
				rename = new Map([
					["Antigua and Barbuda", "Antigua and Barb."],
					["Bolivia (Plurinational State of)", "Bolivia"],
					["Bosnia and Herzegovina", "Bosnia and Herz."],
					["Brunei Darussalam", "Brunei"],
					["Central African Republic", "Central African Rep."],
					["Cook Islands", "Cook Is."],
					["Democratic People's Republic of Korea", "North Korea"],
					["Democratic Republic of the Congo", "Dem. Rep. Congo"],
					["Dominican Republic", "Dominican Rep."],
					["Equatorial Guinea", "Eq. Guinea"],
					["Iran (Islamic Republic of)", "Iran"],
					["Lao People's Democratic Republic", "Laos"],
					["Marshall Islands", "Marshall Is."],
					["Micronesia (Federated States of)", "Micronesia"],
					["Republic of Korea", "South Korea"],
					["Republic of Moldova", "Moldova"],
					["Russian Federation", "Russia"],
					["Saint Kitts and Nevis", "St. Kitts and Nevis"],
					["Saint Vincent and the Grenadines", "St. Vin. and Gren."],
					["Sao Tome and Principe", "São Tomé and Principe"],
					["Solomon Islands", "Solomon Is."],
					["South Sudan", "S. Sudan"],
					["Swaziland", "eSwatini"],
					["Syrian Arab Republic", "Syria"],
					["The former Yugoslav Republic of Macedonia", "Macedonia"],
					["United Republic of Tanzania", "Tanzania"],
					["Venezuela (Bolivarian Republic of)", "Venezuela"],
					["Viet Nam", "Vietnam"]
				])


				chart = Choropleth(worldValues, {
					id: d => d.name, // country name, e.g. Zimbabwe
					value: d => d.value, // health-adjusted life expectancy
					range: d3.interpolateBlues,
					features: mapCountries,
					featureId: d => d.properties.name, // i.e., not ISO 3166-1 numeric
					borders: countrymesh,
					projection: d3.geoEqualEarth(),
					// width
				})

				function Choropleth(data, {
					id = d => d.id, // given d in data, returns the feature id
					value = () => undefined, // given d in data, returns the quantitative value
					title, // given a feature f and possibly a datum d, returns the hover text
					format, // optional format specifier for the title
					scale = d3.scaleSequential, // type of color scale
					domain, // [min, max] values; input of color scale
					range = d3.interpolateBlues, // output of color scale
					width = 640, // outer width, in pixels
					height, // outer height, in pixels
					projection, // a D3 projection; null for pre-projected geometry
					features, // a GeoJSON feature collection
					featureId = d => d.id, // given a feature, returns its id
					borders, // a GeoJSON object for stroking borders
					outline = projection && projection.rotate ? {type: "Sphere"} : null, // a GeoJSON object for the background
					unknown = "#ccc", // fill color for missing data
					fill = "white", // fill color for outline
					stroke = "white", // stroke color for borders
					strokeLinecap = "round", // stroke line cap for borders
					strokeLinejoin = "round", // stroke line join for borders
					strokeWidth, // stroke width for borders
					strokeOpacity, // stroke opacity for borders
				} = {}) {
				// Compute values.
				const N = d3.map(data, id);
				const V = d3.map(data, value).map(d => d == null ? NaN : +d);
				const Im = new d3.InternMap(N.map((id, i) => [id, i]));
				const If = d3.map(features.features, featureId);

				// Compute default domains.
				if (domain === undefined) domain = d3.extent(V);

				// Construct scales.
				const color = scale(domain, range);
				if (color.unknown && unknown !== undefined) color.unknown(unknown);

				// Compute titles.
				if (title === undefined) {
					format = color.tickFormat(100, format);
					title = (f, i) => `${f.properties.name}\n${format(V[i])}`;
				} else if (title !== null) {
					const T = title;
					const O = d3.map(data, d => d);
					title = (f, i) => T(f, O[i]);
				}

				// Compute the default height. If an outline object is specified, scale the projection to fit
				// the width, and then compute the corresponding height.
				if (height === undefined) {
					if (outline === undefined) {
						height = 400;
					} else {
						const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
						const dy = Math.ceil(y1 - y0), l = Math.min(Math.ceil(x1 - x0), dy);
						projection.scale(projection.scale() * (l - 1) / l).precision(0.2);
						height = dy;
					}
				}

				// Construct a path generator.
				const path = d3.geoPath(projection);

				const svg = d3.select('#map')
					.append('svg')
					.attr("width", width)
					.attr("height", height)
					.attr("viewBox", [0, 0, width, height])
					.attr("style", "width: 75%; height: auto; height: intrinsic;");

				if (outline != null) svg.append("path")
					.attr("fill", fill)
					.attr("stroke", "currentColor")
					.attr("d", path(outline));

				svg.append("g")
					.selectAll("path")
					.data(features.features)
					.join("path")
					.attr("fill", (d, i) => color(V[Im.get(If[i])]))
					.attr("d", path)
					.append("title")
					.text((d, i) => title(d, Im.get(If[i])));

				if (borders != null) svg.append("path")
					.attr("pointer-events", "none")
					.attr("fill", "none")
					.attr("stroke", stroke)
					.attr("stroke-linecap", strokeLinecap)
					.attr("stroke-linejoin", strokeLinejoin)
					.attr("stroke-width", strokeWidth)
					.attr("stroke-opacity", strokeOpacity)
					.attr("d", path(borders));

				return Object.assign(svg.node(), {scales: {color}});
				}

			} else{
				getAllData();
			}

		}, 1000);
	}

	//Create table
	var table = d3.select("#table-container").append("table"),
		thead = table.append("thead"),
		tbody = table.append("tbody");

	thead.append("tr")
		.selectAll("th")
		.data(["country", "all_abortion_costs_service","all_abortion_costs_safe","all_abortion_costs_lesssafe"])
		.enter()
		.append("th")
		.text(function(column) { return column; })

    var rows = tbody.selectAll("tr")
        .data(rawData)
        .enter()
        .append("tr");

    var cells = rows.selectAll("td")
        .data(function(row) {
            return ["country", "all_abortion_costs_service","all_abortion_costs_safe","all_abortion_costs_lesssafe"].map(function(column) {
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .text(function(d) { return d.value; });

	function updateTable() {
		var rows = tbody.selectAll("tr").data(rawData);
		rows.exit().remove();
		rows = rows.enter().append("tr").merge(rows);
		var cells = rows.selectAll("td").data(function(d) {
			return ["country", "all_abortion_costs_service","all_abortion_costs_safe","all_abortion_costs_lesssafe"].map(function(column) {
				return {column: column, value: d[column]};
			});
		});
		cells.exit().remove();
		cells = cells.enter().append("td").merge(cells);
		cells.text(function(d) { return d.value; });
	}

	var isAscending = true;
	function sortTable(column) {
		isAscending = !isAscending;
		// Sort the data
		rawData.sort(function(a, b) {
			return isAscending ? d3.ascending(a[column], b[column]) : d3.descending(a[column], b[column]);
		});
		// Update the table with the sorted data
		updateTable();
	}

	d3.select("#sort-button1").on("click", function() {
		sortTable("country");
	});
	d3.select("#sort-button2").on("click", function() {
		sortTable("all_abortion_costs_service");
	});
	d3.select("#sort-button3").on("click", function() {
		sortTable("all_abortion_costs_safe");
	});
	d3.select("#sort-button4").on("click", function() {
		sortTable("all_abortion_costs_lesssafe");
	});

	// Add the arrow icons to the buttons
	let sortButton1 = d3.select("#sort-button1"),
	sortButton2 = d3.select("#sort-button2"),
	sortButton3 = d3.select("#sort-button3"),
	sortButton4 = d3.select("#sort-button4");

	// Add the arrow icon to the button
	sortButton1.append("span")
		.attr("class", "arrow")
		.html("&#9650;");
	sortButton2.append("span")
		.attr("class", "arrow")
		.html("&#9650;");
	sortButton3.append("span")
		.attr("class", "arrow")
		.html("&#9650;");
	sortButton4.append("span")
		.attr("class", "arrow")
		.html("&#9650;");

	// Add the descending class to the button when it is clicked
	sortButton1.on("click", function() {
		sortTable("country");
		toggleArrow(sortButton1);
	});
	sortButton2.on("click", function() {
		sortTable("all_abortion_costs_service");
		toggleArrow(sortButton2);
	});
	sortButton3.on("click", function() {
		sortTable("all_abortion_costs_safe");
		toggleArrow(sortButton3);
	});
	sortButton4.on("click", function() {
		sortTable("all_abortion_costs_lesssafe");
		toggleArrow(sortButton4);
	});

	// Function to toggle the arrow icon
	function toggleArrow(button) {
		let arrow = button.select(".arrow");
		if (isAscending) {
			arrow.html("&#9650;");
		} else {
			arrow.html("&#9660;");
		}
	}

});