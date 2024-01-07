<script>
  import { Handle, Position, useSvelteFlow } from '@xyflow/svelte';
  import { onMount } from 'svelte';
  
  export let node = { data: { label: "", text: "" } };

  export let id;

  const { updateNodeData } = useSvelteFlow();

  function handleInputLabel(event) {
  if (typeof updateNodeData === 'function') {
    updateNodeData(id, { label: event.target.value });
  }
  }
  function handleInputText(event) {
  if (typeof updateNodeData === 'function') {
    updateNodeData(id, { text: event.target.value });
  }
  }

</script>

<div class="custom">
  <input value={node.data.label} on:input={handleInputLabel} /><br>
  <textarea rows="5" value={node.data.text} on:input={handleInputText} />
</div>
<Handle type="target" position={Position.Top} />
<Handle type="target" position={Position.Right} />
<Handle type="target" position={Position.Left} />
<Handle type="source" position={Position.Bottom}/>

<style>
.custom {
  padding: 10px;
  background: white;
  border: 1px solid #555;
  border-radius: 3px;
}

</style>