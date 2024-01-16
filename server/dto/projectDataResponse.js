import { getProjectByProjectId } from "../db/projectsDb.js"

export async function dataForProjectPage(projectId){

    const result = await getProjectByProjectId(projectId);
    
    const projectData = {
        kanban: transformKanban(result.kanban),
        users: result.users
    }
    return projectData;
}

function transformKanban(kanban) {
    const transformedKanban = kanban.map((list) => {
      return {
        name: list.name,
        taskCount: list.tasks.length // Count of tasks in the array
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