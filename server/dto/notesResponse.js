export function notesResponse(notes) {
  const notesResponse = notes.map(transformNote);
  return notesResponse;
}

function transformNote(note) {
  const transformedNote = { ...note }; // Create a shallow copy of the note object

  if (note.note && note.note.time) {
    transformedNote.note = {
      ...note.note,
      time: handleDate(note.note.time),
    };
  }

  return transformedNote;
}

function handleDate(date) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
