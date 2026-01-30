        const noteForm = document.getElementById('noteForm');
        const notesContainer = document.getElementById('notesContainer');
        const refreshNotesBtn = document.getElementById('refreshNotesBtn');
        const clearFormBtn = document.getElementById('clearFormBtn');
        const saveNoteBtn = document.getElementById('saveNoteBtn');
        const noteCount = document.getElementById('noteCount');
        const statusContainer = document.getElementById('statusContainer');

        function showStatus(message, type = 'info') {
            const statusDiv = document.createElement('div');
            statusDiv.className = `status-message status-${type}`;
            statusDiv.innerHTML = `
                <i class="fa ${type === 'success' ? 'fa-check' : 'fa-times'}"></i>
                ${message}
            `;
            
            statusContainer.appendChild(statusDiv);
            
            setTimeout(() => {
                statusDiv.style.opacity = '0';
                statusDiv.style.transition = 'opacity 0.3s ease';
                setTimeout(() => statusDiv.remove(), 300);
            }, 5000);
        }

        function showLoading(button) {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<span class="loader"></span> Processing...';
            button.disabled = true;
            return originalHTML;
        }

        function hideLoading(button, originalHTML) {
            button.innerHTML = originalHTML;
            button.disabled = false;
        }

        async function loadNotes() {
            const originalHTML = showLoading(refreshNotesBtn);
            
            try {
                const response = await fetch('/api/available-notes');
                const notes = await response.json();
                
                if (notes.status === 'error') {
                    notesContainer.innerHTML = `
                        <div class="empty-state">
                            <i class="fa fa-times"></i>
                            <h3>No Notes Found</h3>
                            <p>${notes.message}</p>
                        </div>
                    `;
                    noteCount.textContent = '0';
                } else {
                    displayNotes(notes);
                    noteCount.textContent = notes.length.toString();
                }
            } catch (error) {                
                showStatus('Error loading notes. Please try again.', 'error');
                notesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fa fa-times"></i>
                        <h3>Connection Error</h3>
                        <p>Could not load notes. Check your connection.</p>
                    </div>
                `;
                noteCount.textContent = '0';
            } finally {
                hideLoading(refreshNotesBtn, originalHTML);
            }
        }
        function displayNotes(notes) {
            if (!notes || notes.length === 0) {
                notesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fa fa-sticky-note"></i>
                        <h3>No Notes Yet</h3>
                        <p>Create your first note to see it here!</p>
                    </div>
                `;
                return;
            }

            notesContainer.innerHTML = '';
            
            notes.forEach(note => {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-item';
                noteElement.innerHTML = `
                    <div class="note-content">${escapeHtml(note.note)}</div>
                    <div class="note-meta">
                        <div>
                            <i class="fa fa-user"></i>
                            <span class="note-author">${escapeHtml(note.author)}</span>
                        </div>
                        <div>
                            <i class="fa fa-clock"></i>
                            <span class="note-date">${note.created_at}</span>
                        </div>
                        <button class="delete-note" data-id="${note.id}">
                            <i class="fa fa-trash"></i> Delete
                        </button>
                    </div>
                `;
                notesContainer.appendChild(noteElement);
            });

            document.querySelectorAll('.delete-note').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const noteId = e.currentTarget.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this note?')) {
                        await deleteNote(noteId);
                    }
                });
            });
        }

        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Create New Note
        async function createNote(noteData) {
            const originalHTML = showLoading(saveNoteBtn);
            
            try {
                const response = await fetch('/api/create-note', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(noteData)
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    showStatus('Note saved successfully!', 'success');
                    noteForm.reset();
                    await loadNotes();
                } else {
                    showStatus(result.message, 'error');
                }
            } catch (error) {
                showStatus('Error saving note. Please try again.', 'error');
            } finally {
                hideLoading(saveNoteBtn, originalHTML);
            }
        }

        // Delete Note
        async function deleteNote(noteId) {
            const originalHTML = showLoading(refreshNotesBtn);
            
            try {
                const response = await fetch(`/api/${noteId}/delete`);
                const result = await response.json();
                
                if (result.status === 'success') {
                    showStatus(result.message, 'success');
                    await loadNotes();
                } else {
                    showStatus(result.message, 'error');
                }
            } catch (error) {
                showStatus('Error deleting note. Please try again.', 'error');
            } finally {
                hideLoading(refreshNotesBtn, originalHTML);
            }
        }

        noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const author = document.getElementById('author').value.trim();
            const note = document.getElementById('note').value.trim();
            
            if (!author || !note) {
                showStatus('Please fill in both author and note fields.', 'error');
                return;
            }
            
            if (author.length > 30) {
                showStatus('Author name must be 30 characters or less.', 'error');
                return;
            }
            
            await createNote({ author, note });

        });

        refreshNotesBtn.addEventListener('click', loadNotes);
        
        clearFormBtn.addEventListener('click', () => {
            noteForm.reset();
            showStatus('Form cleared.', 'info');
        });

        document.addEventListener('DOMContentLoaded', () => {
            loadNotes();
            showStatus('Welcome to LyxScript Note Taker v0.07!', 'info');
        });

        setInterval(loadNotes, 30000);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl + Enter to save note
            if (e.ctrlKey && e.key === 'Enter') {
                e.allowDefault();
            }
            
            // F5 to refresh notes
            if (e.key === 'F5') {
                e.preventDefault();
                loadNotes();
            }
            
            // Escape to clear form
            if (e.key === 'Escape') {
                noteForm.reset();
            }
        });