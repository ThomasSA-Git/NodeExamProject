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
        // You can handle this case differently based on your application needs
        // For example, you might choose to log an error, set tasks to an empty array, etc.
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