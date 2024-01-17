import DOMPurify from 'isomorphic-dompurify';


export function purify(input){
const clean = DOMPurify.sanitize(input);
return clean;
}

export function purifyKanbanList(kanbanList) {
    const purifiedList = {
        name: purify(kanbanList.name),
        tasks: [],
    };

    if (kanbanList.tasks && Array.isArray(kanbanList.tasks)) {
        purifiedList.tasks = kanbanList.tasks.map(purifyTask);
    } else {
        console.error("Invalid kanbanList or tasks array.");
    }

    return purifiedList;
}

function purifyTask(task) {
    const purifiedTask = {
        name: purify(task.name),
    };

    if (task.description) {
        purifiedTask.description = purify(task.description);
    }

    if (task.url) {
        purifiedTask.url = purify(task.url);
    }

    purifiedTask.startDate = task.startDate;
    purifiedTask.endDate = task.endDate;

    return purifiedTask;
}

export function purifyNote(savedNoteData){
    savedNoteData.noteName = purify(savedNoteData.noteName);
    if (savedNoteData.note && savedNoteData.note.blocks) {
        savedNoteData.note.blocks = savedNoteData.note.blocks.map((block) => {
            if (block.data) {
                block.data = purifyNoteData(block.data);
            }
            return block;
        });
    }
    return savedNoteData;
  }

export function purifyNoteData(data) {
    switch (data.type) {
      case "header":
      case "paragraph":
        data.text = purify(data.text);
        break;
      case "quote":
        data.text = purify(data.text);
        data.caption = purify(data.caption);
        break;
      case "list":
        data.items = data.items.map((item) => purify(item));
        break;
    }
  
    return data;
  }

  export function purifyDiagram(diagramData) {
    if (diagramData.nodes) {
        diagramData.nodes = diagramData.nodes.map(node => purifyNode(node));
    }

    return diagramData;
}

export function purifyNode(node) {
    if (node.data) {
        node.data.label = purify(node.data.label);
        node.data.text = purify(node.data.text);
    }

    return node;
}

  