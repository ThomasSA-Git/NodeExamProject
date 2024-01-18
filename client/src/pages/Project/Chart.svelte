<script>
  import * as d3 from "d3";

  export let taskSum;

  export let kanban = [];

  // format function for labels, using d3's format method
  // function for formatting numerical labels with commas as thousand separators and zero decimal places
  const formatLabel = d3.format(",.0f");

  const margin = {
    top: 30,
    right: 100,
    bottom: 0,
    left: 110,
  };

  let width = 500;
  let height = 150;

  // reactive statement to adjust width
  $: innerWidth = width - margin.left - margin.right;
  let innerHeight = height - margin.top - margin.bottom;
  //  used to scale data for the chart
  let xScale, yScale;

  $: if (kanban.length > 0) {
    // create linear xScale based on taskCount
    xScale = d3
      .scaleLinear()
      .domain([0, d3.max(kanban, (list) => list.taskCount)])
      .range([0, innerWidth]);
    // create band yScale based on the names in the kanban array
    yScale = d3
      .scaleBand()
      .domain(kanban.map((list) => list.name))
      .range([0, innerHeight])
      .padding(0.25);
  }
</script>

<h2>Chart overview for kanban</h2>
<h3>Sum of all tasks on project: {taskSum}</h3>
{#if kanban.length > 0}
  <div class="wrapper" bind:clientWidth={width}>
    <svg {width} {height}>
      <g transform={`translate(${margin.left}, ${margin.top})`}>
        {#each kanban as list}
          <!-- list names on the left side of the chart -->
          <text
            text-anchor="end"
            x={-10}
            y={yScale(list.name) + yScale.bandwidth() / 2}
            dy=".35em"
          >
            {list.name}
          </text>
          <!-- rectangles representing task counts for each list -->
          <rect
            x={0}
            y={yScale(list.name)}
            width={xScale(list.taskCount)}
            height={yScale.bandwidth()}
          />
          <!-- task count labels on the right side of the chart  -->
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
{:else}
  <p></p>
{/if}

<!-- style set here for rect to override the background color of diagram -->
<style>
  rect {
    fill: blue;
  }
</style>
