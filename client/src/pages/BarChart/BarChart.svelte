<!-- <script>
  import * as d3 from 'd3';
  //import kanban from '../Project/Project.svelte';

  const kanban = [
    { name: 'To do', taskCount: 5 },
    { name: 'test', taskCount: 6 },
    { name: 'Completed', taskCount: 10 },
    { name: 'Discarded', taskCount: 8 },
    { name: 'New List', taskCount: 9 },
    // Additional lists...
  ];

  const formatLabel = d3.format(',.0f');

  const margin = {
    top: 30,
    right: 100,
    bottom: 0,
    left: 110,
  };

  let width = 500;
  let height = 150;

  $: innerWidth = width - margin.left - margin.right;
  let innerHeight = height - margin.top - margin.bottom;

  $: xScale = d3
    .scaleLinear()
    .domain([0, d3.max(kanban, (list) => list.taskCount)])
    .range([0, innerWidth]);

  const yScale = d3
    .scaleBand()
    .domain(kanban.map((list) => list.name))
    .range([innerHeight, 0])
    .padding(0.25);
</script>

<div class="wrapper" bind:clientWidth={width}>
  <svg {width} {height}>
    <g transform={`translate(${margin.left}, ${margin.top})`}>
     
      {#each kanban as list}
        <text
          text-anchor="end"
          x={-10}
          y={yScale(list.name) + yScale.bandwidth() / 2}
          dy=".35em"
        >
          {list.name}
        </text>
        <rect
          x={0}
          y={yScale(list.name)}
          width={xScale(list.taskCount)}
          height={yScale.bandwidth()}
        />
        <text
          text-anchor="start"
          x={xScale(list.taskCount)}
          dx="10"
          y={yScale(list.name) + yScale.bandwidth() / 2}
          dy=".35em"
        >
          {formatLabel(list.taskCount)}
        </text>
      {/each}
    </g>
  </svg>
</div>

<style>
  .wrapper {
    position:relative;
    width: 100%;
    max-width: 500px;
  }

  rect {
    fill: #2748ca;
  }
</style> -->