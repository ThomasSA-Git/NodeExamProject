
export function projectResponse(project){
    const projectResponse = {
        kanban: transformKanban(project.kanban),
        users: project.users
    }
    return projectResponse;
}

function transformKanban(kanban) {
    const transformedKanban = kanban.map((list) => {
      return {
        name: list.name,
        taskCount: list.tasks.length
      };
    });
  
    return transformedKanban;
  }

  export function convertTimestampToDate(project) {
    return {
      ...project,
      createdAt: new Date(project.createdAt).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
    };
  }