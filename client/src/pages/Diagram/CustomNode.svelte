<script>
  import {
    Handle,
    Position,
    useSvelteFlow,
    useNodesData,
  } from "@xyflow/svelte";

  export let id = useNodesData["id"];
  export let data = useNodesData["data"];

  const { updateNodeData } = useSvelteFlow();

  function handleInputLabel(event) {
    updateNodeData(id, { label: event.target.value, text: data.text });
  }

  function handleInputText(event) {
    updateNodeData(id, { label: data.label, text: event.target.value });
  }
</script>

<Handle
  type="target"
  position={Position.Top}
  id="a"
  style="transform: translate(10px, 50%); left: 0;"
/>
<Handle
  type="target"
  position={Position.Top}
  id="b"
  style="transform: translate(0, 50%); left: auto; right: 10px"
/>
<div class="custom">
  <input
    bind:value={data.label}
    on:input={handleInputLabel}
    placeholder={data.label}
  /><br />
  <textarea
    rows="5"
    bind:value={data.text}
    on:input={handleInputText}
    placeholder={data.text}
  />
</div>
<Handle
  type="source"
  position={Position.Bottom}
  id="a"
  style="transform: translate(10px, 50%); left: 0;"
/>
<Handle
  type="source"
  position={Position.Bottom}
  id="b"
  style="transform: translate(0, 50%); left: auto; right: 10px"
/>

<style>
  .custom {
    padding: 10px;
    background: white;
    border: 1px solid #555;
    border-radius: 3px;
  }
</style>
