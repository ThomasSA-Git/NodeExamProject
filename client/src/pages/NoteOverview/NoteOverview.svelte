<script>
  import { paginate, LightPaginationNav } from "svelte-paginate";

  // needs to be named items to be used in paginate
  let items = [];

  let currentPage = 1;
  let pageSize = 4;
  $: paginatedItems = paginate({ items, pageSize, currentPage });

  let sortColumn = null;
  let sortDirection = 'asc';

  function sortBy(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }

    // Sort the items array
    items = [...items].sort((a, b) => {
      const aValue = column === 'projectName' ? a.projectName : a.createdAt;
      const bValue = column === 'projectName' ? b.projectName : b.createdAt;

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }
</script>

<hr />

{#if items.length > 0}
<table class="items">
  <thead>
    <tr>
      <th on:click={() => sortBy('projectName')}>Project Name</th>
      <th on:click={() => sortBy('createdAt')}>Created at</th>
    </tr>
  </thead>
  <tbody>
    {#each paginatedItems as item}
      <tr
        class="item"
        on:click={() => handleNavigate(item.projectName, item._id)}
      >
        <td>{item.projectName}</td>
        <!-- Add more columns as needed -->
        <td style="max-width: 100px;">{item.createdAt}</td>
      </tr>
    {/each}
  </tbody>
</table>
{:else}
<p>You're not involved in any projects yet. Create one to see list.</p>

{/if}
<LightPaginationNav
  totalItems={items.length}
  {pageSize}
  {currentPage}
  limit={1}
  showStepOptions={true}
  on:setPage={(e) => (currentPage = e.detail.page)}
/>