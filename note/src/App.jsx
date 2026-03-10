import { useState, useEffect } from "react";
import "./App.css";
import { ToastContainer, toast, Slide, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function NoteApp() {
  const [notes, setNotes] = useState(() =>
    JSON.parse(localStorage.getItem("notes") || "[]")
  );
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(() =>
    JSON.parse(localStorage.getItem("darkMode") || "false")
  );
  const [editId, setEditId] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fadeState, setFadeState] = useState("");

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const addOrUpdateNote = () => {
    if (!title.trim() || !desc.trim()) return;

    if (editId) {
      setNotes(notes.map((n) => (n.id === editId ? { ...n, title, desc } : n)));
      const element = document.getElementById(`note-${editId}`);
      if (element) {
        element.classList.add("updated");
        setTimeout(() => {
          const el = document.getElementById(`note-${editId}`);
          if (el) el.classList.remove("updated");
        }, 1000);
      }
      toast.info(`Updated "${title}"`, {
        transition: Zoom,
        theme: "dark",
        className: "toast-info",
      });
      setEditId(null);
    } else {
      const newNote = { id: Date.now(), title, desc };
      setNotes((prev) => [...prev, newNote]);
      setTimeout(() => {
        const element = document.getElementById(`note-${newNote.id}`);
        if (element) {
          element.classList.add("adding");
          setTimeout(() => {
            const el = document.getElementById(`note-${newNote.id}`);
            if (el) el.classList.remove("adding");
          }, 400);
        }
      }, 50);
      toast.success(`Added "${title}"`, {
        transition: Bounce,
        theme: "dark",
        className: "toast-success",
      });
    }

    setTitle("");
    setDesc("");
  };

  const editNote = (note) => {
    setEditId(note.id);
    setTitle(note.title);
    setDesc(note.desc);
    const element = document.getElementById(`note-${note.id}`);
    if (element) {
      element.classList.add("updated");
      setTimeout(() => {
        const el = document.getElementById(`note-${note.id}`);
        if (el) el.classList.remove("updated");
      }, 1000);
    }
  };

  // When delete button is clicked -> open modal
  const handleDeleteClick = (note) => {
    setNoteToDelete(note);
    setFadeState("show");
    setConfirmOpen(true);
  };

  // Close modal (with fade-out)
  const handleClose = () => {
    setFadeState("hide");
    setTimeout(() => {
      setConfirmOpen(false);
      setFadeState("");
    }, 300);
  };

  // Cancel delete
  const cancelDelete = () => {
    setNoteToDelete(null);
    handleClose();
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!noteToDelete) return;

    const element = document.getElementById(`note-${noteToDelete.id}`);

    if (element) {
      element.classList.add("removing");

      setTimeout(() => {
        setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));

        toast.error(`Deleted "${noteToDelete.title}"`, {
          transition: Slide,
          theme: "dark",
          className: "toast-error",
        });

        setNoteToDelete(null);
        handleClose();
      }, 400);
    } else {
      // fallback (if element not found)
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
      setNoteToDelete(null);
      handleClose();
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.desc.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addOrUpdateNote();
    }
  };

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <header className="app-header">
        <h1>
          <i className="fa-solid fa-note-sticky"></i> Note App
        </h1>
        <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? (
            <i className="fa-solid fa-sun"></i>
          ) : (
            <i className="fa-solid fa-moon"></i>
          )}
        </button>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="note-input">
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <textarea
          placeholder="Note Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={handleKeyDown}
        ></textarea>

        <button onClick={addOrUpdateNote}>
          {editId ? (
            <>
              <i className="fa-solid fa-check"></i> Update Note
            </>
          ) : (
            <>
              <i className="fa-solid fa-plus"></i> Add Note
            </>
          )}
        </button>

        {editId && (
          <button
            className="cancel-btn"
            onClick={() => {
              setEditId(null);
              setTitle("");
              setDesc("");
            }}
          >
            <i className="fa-solid fa-xmark"></i> Cancel
          </button>
        )}
      </div>

      <div className="notes-container">
        {filteredNotes.map((note) => (
          <div key={note.id} id={`note-${note.id}`} className="note-card">
            <h3>{note.title}</h3>
            <p>{note.desc}</p>
            <button className="edit-btn" onClick={() => editNote(note)}>
              <i className="fa-solid fa-pen"></i> Edit
            </button>
            <button
              className="delete-btn"
              onClick={() => handleDeleteClick(note)}
            >
              <i className="fa-solid fa-trash"></i> Delete
            </button>
          </div>
        ))}
      </div>

      {confirmOpen && (
        <div
          className={`modal-overlay ${fadeState}`}
          onClick={(e) => {
            if (e.target.classList.contains("modal-overlay")) cancelDelete();
          }}
        >
          <div className={`modal ${fadeState}`}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{noteToDelete?.title}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="confirm"
                onClick={(e) => {
                  e.currentTarget.classList.add("pulse");
                  setTimeout(() => {
                    if (e.currentTarget) {
                      e.currentTarget.classList.remove("pulse");
                    }
                    confirmDelete();
                  }, 400);
                }}
              >
                <i className="fa-solid fa-check"></i> Yes
              </button>
              <button
                className="cancel"
                onClick={() => {
                  const modal = document.querySelector(".modal");
                  if (modal) {
                    modal.classList.add("shake");
                    setTimeout(() => {
                      const m = document.querySelector(".modal");
                      if (m) m.classList.remove("shake");
                      cancelDelete();
                    }, 400);
                  }
                }}
              >
                <i className="fa-solid fa-xmark"></i> No
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        theme="dark"
      />
    </div>
  );
}

export default NoteApp;
