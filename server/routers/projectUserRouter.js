import { Router } from "express";
const router = Router();

import { findAllUsers } from "../db/usersDb.js";
import { findProjectByProjectId, addUserToProject, deleteUserFromProject } from "../db/projectsDb.js";
import { mapResponse } from "../dto/userResponse.js";

function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.send({ message: "Unauthorized" });
  }
}

// would probably not include all users to add in a "real" project, only those that are added as "friends" or collaborators.
router.get("/api/projectUsers", async (req, res) => {
  try {
    const allUsers = await findAllUsers();
    const allUsersResponse = mapResponse(allUsers);
    console.log(allUsersResponse)
    const project = await findProjectByProjectId(req.session.projectId);
    const projectUsers = project.users;
    console.log(projectUsers)
    const filtersUsersResponse = allUsersResponse.filter(
      (user) => !projectUsers.include(user)
    );
    console.log(filtersUsersResponse)
    res.send({ usersToAdd: filtersUsersResponse });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/api/projectUsers", async (req, res) => {
  try {
   // Map each user to a promise
   
   const promises = usersToAdd.map(async (user) => {
      const result = await addUserToProject(req.session.projectId, user);
      return result;

  });

  // Wait for all promises to resolve
  const results = await Promise.all(promises);

  // check if they passed and send result?
  console.log('All users processed:', results);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
